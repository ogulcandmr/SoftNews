// Vercel Serverless - Auth API (Netlify'den tam kopya, Supabase ile)
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const JWT_SECRET = process.env.JWT_SECRET || 'softnews-secret-key-2024';

// Database helper
const db = {
  async getUserByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },
  
  async getUserById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },
  
  async createUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  
  async updateUser(id, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

function generateUserId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function generateToken(user) {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      name: user.name 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

async function handleRegister(body) {
  const { email, password, name } = body;

  if (!email || !password || !name) {
    return { status: 400, data: { error: 'Email, password and name are required' } };
  }

  if (!isValidEmail(email)) {
    return { status: 400, data: { error: 'Invalid email format' } };
  }

  try {
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return { status: 409, data: { error: 'User already exists' } };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: generateUserId(),
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=200`,
      created_at: new Date().toISOString(),
      preferences: {
        theme: 'light',
        notifications: true,
        language: 'tr'
      }
    };

    const savedUser = await db.createUser(newUser);
    const token = generateToken(savedUser);

    const { password: _, ...userWithoutPassword } = savedUser;
    
    return {
      status: 201,
      data: {
        success: true,
        user: userWithoutPassword,
        token
      }
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { status: 500, data: { error: 'Registration failed' } };
  }
}

async function handleLogin(body) {
  const { email, password } = body;

  if (!email || !password) {
    return { status: 400, data: { error: 'Email and password are required' } };
  }

  try {
    const user = await db.getUserByEmail(email);
    if (!user) {
      return { status: 401, data: { error: 'Invalid credentials' } };
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return { status: 401, data: { error: 'Invalid credentials' } };
    }

    const token = generateToken(user);

    const { password: _, ...userWithoutPassword } = user;
    
    return {
      status: 200,
      data: {
        success: true,
        user: userWithoutPassword,
        token
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    return { status: 500, data: { error: 'Login failed' } };
  }
}

async function handleVerify(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { status: 401, data: { error: 'No token provided' } };
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return { status: 401, data: { error: 'Invalid token' } };
  }

  try {
    const user = await db.getUserById(decoded.userId);

    if (!user) {
      return { status: 401, data: { error: 'User not found' } };
    }

    const { password: _, ...userWithoutPassword } = user;
    
    return {
      status: 200,
      data: {
        success: true,
        user: userWithoutPassword
      }
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return { status: 500, data: { error: 'Token verification failed' } };
  }
}

async function handleProfile(authHeader, body) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { status: 401, data: { error: 'No token provided' } };
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return { status: 401, data: { error: 'Invalid token' } };
  }

  const { name, preferences } = body;

  try {
    const updates = {};
    
    if (name) {
      updates.name = name.trim();
      updates.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=200`;
    }

    if (preferences) {
      const currentUser = await db.getUserById(decoded.userId);
      updates.preferences = { ...currentUser.preferences, ...preferences };
    }

    const updatedUser = await db.updateUser(decoded.userId, updates);

    const { password: _, ...userWithoutPassword } = updatedUser;
    
    return {
      status: 200,
      data: {
        success: true,
        user: userWithoutPassword
      }
    };
  } catch (error) {
    console.error('Profile update error:', error);
    return { status: 500, data: { error: 'Failed to update profile' } };
  }
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('Auth function called:', req.query, req.body);
    const { action } = req.query || {};
    
    // Parse body if it's a string
    let body = req.body || {};
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.error('Failed to parse body:', body);
      }
    }
    
    console.log('Action:', action, 'Body:', body);

    let result;
    switch (action) {
      case 'register':
        result = await handleRegister(body);
        break;
      
      case 'login':
        result = await handleLogin(body);
        break;
      
      case 'verify':
        result = await handleVerify(req.headers.authorization || req.headers.Authorization);
        break;
      
      case 'profile':
        result = await handleProfile(req.headers.authorization || req.headers.Authorization, body);
        break;
      
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
