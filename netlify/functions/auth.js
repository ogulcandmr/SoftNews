const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../src/lib/database');

// JWT secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'softnews-secret-key-2024';

// Generate unique user ID (UUID v4)
function generateUserId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
function isValidPassword(password) {
  // En az 6 karakter, büyük harf, küçük harf, rakam ve özel karakter
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  return passwordRegex.test(password);
}

// Generate JWT token
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

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

exports.handler = async function (event) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    console.log('Auth function called:', event.queryStringParameters, event.body);
    const { action } = event.queryStringParameters || {};
    const body = JSON.parse(event.body || '{}');
    console.log('Action:', action, 'Body:', body);

    switch (action) {
      case 'register':
        return await handleRegister(body, headers);
      
      case 'login':
        return await handleLogin(body, headers);
      
      case 'verify':
        return await handleVerify(event, headers);
      
      case 'profile':
        return await handleProfile(event, headers);
      
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }
  } catch (error) {
    console.error('Auth error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

// Handle user registration
async function handleRegister(body, headers) {
  const { email, password, name } = body;

  // Validation
  if (!email || !password || !name) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Email, password and name are required' })
    };
  }

  if (!isValidEmail(email)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid email format' })
    };
  }

  if (!isValidPassword(password)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Password must be at least 6 characters' })
    };
  }

  try {
    // Check if user already exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({ error: 'User already exists' })
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
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

    // Save user to database
    const savedUser = await db.createUser(newUser);

    // Generate token
    const token = generateToken(savedUser);

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = savedUser;
    
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        user: userWithoutPassword,
        token
      })
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Registration failed' })
    };
  }
}

// Handle user login
async function handleLogin(body, headers) {
  const { email, password } = body;

  // Validation
  if (!email || !password) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Email and password are required' })
    };
  }

  try {
    // Find user in database
    const user = await db.getUserByEmail(email);
    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }

    // Generate token
    const token = generateToken(user);

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user: userWithoutPassword,
        token
      })
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Login failed' })
    };
  }
}

// Handle token verification
async function handleVerify(event, headers) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'No token provided' })
    };
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Invalid token' })
    };
  }

  try {
    // Find user in database
    const user = await db.getUserById(decoded.userId);

    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user: userWithoutPassword
      })
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Token verification failed' })
    };
  }
}

// Handle profile update
async function handleProfile(event, headers) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'No token provided' })
    };
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Invalid token' })
    };
  }

  const body = JSON.parse(event.body || '{}');
  const { name, preferences } = body;

  try {
    // Prepare updates
    const updates = {};
    
    if (name) {
      updates.name = name.trim();
      updates.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=200`;
    }

    if (preferences) {
      // Get current user to merge preferences
      const currentUser = await db.getUserById(decoded.userId);
      updates.preferences = { ...currentUser.preferences, ...preferences };
    }

    // Update user in database
    const updatedUser = await db.updateUser(decoded.userId, updates);

    // Return updated user data (without password)
    const { password: _, ...userWithoutPassword } = updatedUser;
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user: userWithoutPassword
      })
    };
  } catch (error) {
    console.error('Profile update error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to update profile' })
    };
  }
}