const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase configuration missing');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Database helper functions
class DatabaseService {
  constructor() {
    this.supabase = supabase;
  }

  // Check if database is available
  isAvailable() {
    return this.supabase !== null;
  }

  // Create user
  async createUser(userData) {
    if (!this.isAvailable()) {
      throw new Error('Database not available');
    }

    const { data, error } = await this.supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  // Get user by email
  async getUserByEmail(email) {
    if (!this.isAvailable()) {
      throw new Error('Database not available');
    }

    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  // Get user by ID
  async getUserById(id) {
    if (!this.isAvailable()) {
      throw new Error('Database not available');
    }

    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  // Update user
  async updateUser(id, updates) {
    if (!this.isAvailable()) {
      throw new Error('Database not available');
    }

    const { data, error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  // Create password reset token
  async createPasswordResetToken(email, token, expiresAt) {
    if (!this.isAvailable()) {
      throw new Error('Database not available');
    }

    const { data, error } = await this.supabase
      .from('password_reset_tokens')
      .insert([{
        email: email.toLowerCase(),
        token,
        expires_at: expiresAt,
        used: false
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  // Get password reset token
  async getPasswordResetToken(token) {
    if (!this.isAvailable()) {
      throw new Error('Database not available');
    }

    const { data, error } = await this.supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  // Mark password reset token as used
  async markPasswordResetTokenAsUsed(token) {
    if (!this.isAvailable()) {
      throw new Error('Database not available');
    }

    const { data, error } = await this.supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('token', token)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  // Clean expired tokens
  async cleanExpiredTokens() {
    if (!this.isAvailable()) {
      return;
    }

    await this.supabase
      .from('password_reset_tokens')
      .delete()
      .lt('expires_at', new Date().toISOString());
  }
}

// Singleton instance
const db = new DatabaseService();

module.exports = db;
