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

  // ===== Forum: Topics =====
  async listTopics({ limit = 50 } = {}) {
    if (!this.isAvailable()) throw new Error('Database not available');
    const { data, error } = await this.supabase
      .from('topics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw new Error(`Database error: ${error.message}`);
    return data || [];
  }

  async getTopicById(id) {
    if (!this.isAvailable()) throw new Error('Database not available');
    const { data, error } = await this.supabase
      .from('topics')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(`Database error: ${error.message}`);
    return data;
  }

  async createTopic({ title, category, content, author }) {
    if (!this.isAvailable()) throw new Error('Database not available');
    const row = {
      title,
      category,
      content: content || '',
      author: author || 'guest',
      created_at: new Date().toISOString(),
      last_reply_at: null,
      replies_count: 0,
      has_ai_reply: false,
    };
    const { data, error } = await this.supabase
      .from('topics')
      .insert([row])
      .select()
      .single();
    if (error) throw new Error(`Database error: ${error.message}`);
    return data;
  }

  async markTopicUpdatedOnReply(topicId, { hasAI = false } = {}) {
    if (!this.isAvailable()) throw new Error('Database not available');
    const { data, error } = await this.supabase.rpc('increment_replies_and_touch', {
      p_topic_id: topicId,
      p_has_ai: hasAI,
    });
    if (error) {
      // Fallback if RPC not present
      const topic = await this.getTopicById(topicId);
      const { data: updated, error: updErr } = await this.supabase
        .from('topics')
        .update({
          replies_count: (topic?.replies_count || 0) + 1,
          last_reply_at: new Date().toISOString(),
          has_ai_reply: topic?.has_ai_reply || hasAI,
        })
        .eq('id', topicId)
        .select()
        .single();
      if (updErr) throw new Error(`Database error: ${updErr.message}`);
      return updated;
    }
    return data;
  }

  // ===== Forum: Replies =====
  async listReplies(topicId, { limit = 100 } = {}) {
    if (!this.isAvailable()) throw new Error('Database not available');
    const { data, error } = await this.supabase
      .from('replies')
      .select('*')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true })
      .limit(limit);
    if (error) throw new Error(`Database error: ${error.message}`);
    return data || [];
  }

  async createReply({ topic_id, content, author, ai_generated = false }) {
    if (!this.isAvailable()) throw new Error('Database not available');
    const row = {
      topic_id,
      content,
      author: author || 'guest',
      ai_generated,
      created_at: new Date().toISOString(),
    };
    const { data, error } = await this.supabase
      .from('replies')
      .insert([row])
      .select()
      .single();
    if (error) throw new Error(`Database error: ${error.message}`);
    await this.markTopicUpdatedOnReply(topic_id, { hasAI: ai_generated });
    return data;
  }
}

// Singleton instance
const db = new DatabaseService();

module.exports = db;
