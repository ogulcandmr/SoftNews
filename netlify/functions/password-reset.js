const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./database');

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'softnews_secret_key_2024';

// Helper functions
const generateResetToken = (email) => {
  return jwt.sign({ email, type: 'password_reset' }, JWT_SECRET, { expiresIn: '1h' });
};

const verifyResetToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'password_reset') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  return passwordRegex.test(password);
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
    // Request password reset endpoint
    if (httpMethod === 'POST' && path.endsWith('/request-reset')) {
      const { email } = body;

      if (!email) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: false,
            message: 'Email adresi gereklidir.'
          })
        };
      }

      try {
        // Check if user exists
        const user = await db.getUserByEmail(email);
        if (!user) {
          // Don't reveal if user exists or not for security
          return {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              success: true,
              message: 'Şifre sıfırlama bağlantısı email adresinize gönderildi.'
            })
          };
        }

        // Generate reset token
        const resetToken = generateResetToken(email);
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
        
        // Store token in database
        await db.createPasswordResetToken(email, resetToken, expiresAt);

        // In a real application, you would send an email here
        // For demo purposes, we'll just return the token
        console.log(`Password reset token for ${email}: ${resetToken}`);

        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: true,
            message: 'Şifre sıfırlama bağlantısı email adresinize gönderildi.',
            // In production, don't return the token
            resetToken: resetToken // Only for demo purposes
          })
        };
      } catch (error) {
        console.error('Password reset request error:', error);
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
    }

    // Verify reset token endpoint
    if (httpMethod === 'GET' && path.includes('/verify-reset-token/')) {
      const token = path.split('/verify-reset-token/')[1];

      if (!token) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: false,
            message: 'Token bulunamadı.'
          })
        };
      }

      try {
        const decoded = verifyResetToken(token);
        
        // Check if token exists and is not used in database
        const tokenData = await db.getPasswordResetToken(token);
        if (!tokenData) {
          return {
            statusCode: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              success: false,
              message: 'Geçersiz veya kullanılmış token.'
            })
          };
        }

        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: true,
            message: 'Token geçerli.',
            data: {
              email: decoded.email
            }
          })
        };
      } catch (error) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: false,
            message: error.message
          })
        };
      }
    }

    // Reset password endpoint
    if (httpMethod === 'POST' && path.endsWith('/reset-password')) {
      const { token, newPassword } = body;

      if (!token || !newPassword) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: false,
            message: 'Token ve yeni şifre gereklidir.'
          })
        };
      }

      // Validate password strength
      if (!validatePassword(newPassword)) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: false,
            message: 'Şifre en az 6 karakter olmalı ve büyük harf, küçük harf, rakam ve özel karakter içermelidir.'
          })
        };
      }

      try {
        const decoded = verifyResetToken(token);
        
        // Check if token exists and is not used
        const tokenData = await db.getPasswordResetToken(token);
        if (!tokenData) {
          return {
            statusCode: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              success: false,
              message: 'Geçersiz veya kullanılmış token.'
            })
          };
        }

        // Mark token as used
        await db.markPasswordResetTokenAsUsed(token);

        // Update user's password in database
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.updateUser(tokenData.user_id, { password: hashedPassword });

        console.log(`Password reset for ${decoded.email} completed`);

        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: true,
            message: 'Şifre başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz.'
          })
        };
      } catch (error) {
        console.error('Password reset error:', error);
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: false,
            message: error.message
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
    console.error('Password Reset API Error:', error);
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
