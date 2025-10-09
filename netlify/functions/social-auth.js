const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'softnews_secret_key_2024';

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// In-memory user storage (production'da veritabanı kullanılmalı)
let users = [
  {
    id: 1,
    email: 'ogulcandmr96@gmail.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    name: 'Öğülcan Demir',
    provider: 'local',
    providerId: null,
    createdAt: new Date().toISOString()
  }
];

// Helper functions
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      name: user.name 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const findOrCreateUser = (profile, provider) => {
  // Check if user exists by email
  let user = users.find(u => u.email === profile.email);
  
  if (user) {
    // Update provider info if not set
    if (!user.provider || user.provider === 'local') {
      user.provider = provider;
      user.providerId = profile.id;
    }
    return user;
  }

  // Create new user
  const newUser = {
    id: users.length + 1,
    email: profile.email,
    name: profile.name,
    provider: provider,
    providerId: profile.id,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  return newUser;
};

exports.handler = async (event, context) => {
  // CORS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body: ''
    };
  }

  const { httpMethod, path } = event;
  const body = event.body ? JSON.parse(event.body) : {};

  try {
    // Google OAuth endpoint
    if (httpMethod === 'POST' && path.endsWith('/google')) {
      const { token } = body;

      if (!token) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: false,
            message: 'Google token gereklidir.'
          })
        };
      }

      try {
        // Verify Google token
        const ticket = await googleClient.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        
        if (!payload) {
          return {
            statusCode: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              success: false,
              message: 'Geçersiz Google token.'
            })
          };
        }

        // Find or create user
        const user = findOrCreateUser(payload, 'google');
        
        // Generate JWT token
        const jwtToken = generateToken(user);

        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: true,
            message: 'Google ile giriş başarılı!',
            data: {
              user: {
                id: user.id,
                email: user.email,
                name: user.name,
                provider: user.provider,
                createdAt: user.createdAt
              },
              token: jwtToken
            }
          })
        };

      } catch (error) {
        console.error('Google OAuth error:', error);
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: false,
            message: 'Google token doğrulanamadı.'
          })
        };
      }
    }

    // GitHub OAuth endpoint (simplified - in production you'd use GitHub's OAuth flow)
    if (httpMethod === 'POST' && path.endsWith('/github')) {
      const { code } = body;

      if (!code) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: false,
            message: 'GitHub authorization code gereklidir.'
          })
        };
      }

      try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code: code
          })
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
          return {
            statusCode: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              success: false,
              message: 'GitHub authorization failed.'
            })
          };
        }

        // Get user info from GitHub
        const userResponse = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `token ${tokenData.access_token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        const githubUser = await userResponse.json();

        if (!githubUser.email) {
          // Get user's public email
          const emailResponse = await fetch('https://api.github.com/user/emails', {
            headers: {
              'Authorization': `token ${tokenData.access_token}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          });
          const emails = await emailResponse.json();
          const primaryEmail = emails.find(email => email.primary);
          githubUser.email = primaryEmail ? primaryEmail.email : `${githubUser.login}@users.noreply.github.com`;
        }

        // Find or create user
        const user = findOrCreateUser(githubUser, 'github');
        
        // Generate JWT token
        const jwtToken = generateToken(user);

        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: true,
            message: 'GitHub ile giriş başarılı!',
            data: {
              user: {
                id: user.id,
                email: user.email,
                name: user.name,
                provider: user.provider,
                createdAt: user.createdAt
              },
              token: jwtToken
            }
          })
        };

      } catch (error) {
        console.error('GitHub OAuth error:', error);
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: false,
            message: 'GitHub authorization failed.'
          })
        };
      }
    }

    // Default response
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        message: 'Endpoint bulunamadı.'
      })
    };

  } catch (error) {
    console.error('Social Auth API Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        message: 'Sunucu hatası oluştu.'
      })
    };
  }
};
