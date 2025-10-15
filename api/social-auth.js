// Vercel Serverless - Social Auth (Netlify'den tam kopya, Supabase ile)
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const JWT_SECRET = process.env.JWT_SECRET || 'softnews_secret_key_2024';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || process.env.VITE_GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || process.env.VITE_GITHUB_CLIENT_SECRET || '';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

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

const findOrCreateUser = async (profile, provider) => {
  // Check if user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('email', profile.email)
    .single();
  
  if (existingUser) {
    // Update provider if needed
    if (!existingUser.provider || existingUser.provider === 'local') {
      await supabase
        .from('users')
        .update({ provider, provider_id: profile.id })
        .eq('id', existingUser.id);
      existingUser.provider = provider;
      existingUser.provider_id = profile.id;
    }
    return existingUser;
  }

  // Create new user
  const { data: newUser } = await supabase
    .from('users')
    .insert([{
      email: profile.email,
      name: profile.name,
      provider: provider,
      provider_id: profile.id,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  return newUser;
};

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const body = req.body || {};
  const path = req.url || '';
  const routeStr = `${path}`;
  const isGoogleRoute = /\/social-auth\/google\b/.test(routeStr) || body.provider === 'google';
  const isGitHubRoute = /\/social-auth\/github\b/.test(routeStr) || body.provider === 'github';

  try {
    console.log('Social-auth route debug:', { path, isGoogleRoute, isGitHubRoute });

    // Google OAuth
    if (req.method === 'POST' && isGoogleRoute) {
      const { token } = body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Google token gereklidir.'
        });
      }

      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: token,
          audience: GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        
        if (!payload) {
          return res.status(400).json({
            success: false,
            message: 'Geçersiz Google token.'
          });
        }

        const user = await findOrCreateUser(payload, 'google');
        const jwtToken = generateToken(user);

        return res.status(200).json({
          success: true,
          message: 'Google ile giriş başarılı!',
          data: {
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              provider: user.provider,
              createdAt: user.created_at
            },
            token: jwtToken
          }
        });

      } catch (error) {
        console.error('Google OAuth error:', error);
        return res.status(400).json({
          success: false,
          message: 'Google token doğrulanamadı.'
        });
      }
    }

    // GitHub OAuth
    if (req.method === 'POST' && isGitHubRoute) {
      const { code } = body;

      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'GitHub authorization code gereklidir.'
        });
      }

      try {
        if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
          return res.status(400).json({ 
            success: false, 
            message: 'GitHub OAuth env eksik.' 
          });
        }

        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: GITHUB_CLIENT_ID,
            client_secret: GITHUB_CLIENT_SECRET,
            code: code
          })
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
          return res.status(400).json({
            success: false,
            message: 'GitHub authorization failed.'
          });
        }

        const userResponse = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `token ${tokenData.access_token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        const githubUser = await userResponse.json();

        if (!githubUser.email) {
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

        const user = await findOrCreateUser(githubUser, 'github');
        const jwtToken = generateToken(user);

        return res.status(200).json({
          success: true,
          message: 'GitHub ile giriş başarılı!',
          data: {
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              provider: user.provider,
              createdAt: user.created_at
            },
            token: jwtToken
          }
        });

      } catch (error) {
        console.error('GitHub OAuth error:', error);
        return res.status(400).json({
          success: false,
          message: 'GitHub authorization failed.'
        });
      }
    }

    return res.status(404).json({
      success: false,
      message: 'Endpoint bulunamadı.'
    });

  } catch (error) {
    console.error('Social Auth API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası oluştu.'
    });
  }
}
