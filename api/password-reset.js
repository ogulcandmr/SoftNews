// Vercel Serverless - Password Reset (Netlify'den tam kopya, Supabase ile)
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const JWT_SECRET = process.env.JWT_SECRET || 'softnews_secret_key_2024';

const db = {
  async getUserByEmail(email) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();
    return data;
  },
  
  async createPasswordResetToken(email, token, expiresAt) {
    const { data } = await supabase
      .from('password_reset_tokens')
      .insert([{ email, token, expires_at: expiresAt, used: false }])
      .select()
      .single();
    return data;
  },
  
  async getPasswordResetToken(token) {
    const { data } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single();
    return data;
  },
  
  async markPasswordResetTokenAsUsed(token) {
    await supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('token', token);
  },
  
  async updateUser(userId, updates) {
    const { data } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return data;
  }
};

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

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const path = req.url || '';
  const body = req.body || {};

  try {
    // Request password reset
    if (req.method === 'POST' && path.endsWith('/request-reset')) {
      const { email } = body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email adresi gereklidir.'
        });
      }

      try {
        const user = await db.getUserByEmail(email);
        if (!user) {
          // Don't reveal if user exists
          return res.status(200).json({
            success: true,
            message: 'Şifre sıfırlama bağlantısı email adresinize gönderildi.'
          });
        }

        const resetToken = generateResetToken(email);
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        
        await db.createPasswordResetToken(email, resetToken, expiresAt);

        console.log(`Password reset token for ${email}: ${resetToken}`);

        return res.status(200).json({
          success: true,
          message: 'Şifre sıfırlama bağlantısı email adresinize gönderildi.',
          resetToken: resetToken // Only for demo
        });
      } catch (error) {
        console.error('Password reset request error:', error);
        return res.status(500).json({
          success: false,
          message: 'Sunucu hatası oluştu.'
        });
      }
    }

    // Verify reset token
    if (req.method === 'GET' && path.includes('/verify-reset-token/')) {
      const token = path.split('/verify-reset-token/')[1];

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token bulunamadı.'
        });
      }

      try {
        const decoded = verifyResetToken(token);
        const tokenData = await db.getPasswordResetToken(token);
        
        if (!tokenData) {
          return res.status(400).json({
            success: false,
            message: 'Geçersiz veya kullanılmış token.'
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Token geçerli.',
          data: {
            email: decoded.email
          }
        });
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
    }

    // Reset password
    if (req.method === 'POST' && path.endsWith('/reset-password')) {
      const { token, newPassword } = body;

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Token ve yeni şifre gereklidir.'
        });
      }

      try {
        const decoded = verifyResetToken(token);
        const tokenData = await db.getPasswordResetToken(token);
        
        if (!tokenData) {
          return res.status(400).json({
            success: false,
            message: 'Geçersiz veya kullanılmış token.'
          });
        }

        await db.markPasswordResetTokenAsUsed(token);

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.updateUser(tokenData.user_id, { password: hashedPassword });

        console.log(`Password reset for ${decoded.email} completed`);

        return res.status(200).json({
          success: true,
          message: 'Şifre başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz.'
        });
      } catch (error) {
        console.error('Password reset error:', error);
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
    }

    return res.status(404).json({
      success: false,
      message: 'Endpoint bulunamadı.'
    });

  } catch (error) {
    console.error('Password Reset API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası oluştu.'
    });
  }
}
