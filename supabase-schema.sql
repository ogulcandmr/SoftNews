-- Supabase Database Schema for SoftNews
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar TEXT,
    provider VARCHAR(50) DEFAULT 'local',
    provider_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    preferences JSONB DEFAULT '{
        "theme": "light",
        "notifications": true,
        "language": "tr"
    }'::jsonb
);

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table (for future use)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User favorites table (for news articles)
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    article_id VARCHAR(255) NOT NULL,
    article_title TEXT NOT NULL,
    article_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, article_id)
);

-- User forum topics table
CREATE TABLE IF NOT EXISTS user_forum_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User forum replies table
CREATE TABLE IF NOT EXISTS user_forum_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES user_forum_topics(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI interaction stats table
CREATE TABLE IF NOT EXISTS user_ai_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    weekly_summaries_generated INTEGER DEFAULT 0,
    ai_chat_messages INTEGER DEFAULT 0,
    forum_replies INTEGER DEFAULT 0,
    total_ai_interactions INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_forum_topics_user_id ON user_forum_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_forum_replies_user_id ON user_forum_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_forum_replies_topic_id ON user_forum_replies(topic_id);
CREATE INDEX IF NOT EXISTS idx_user_ai_stats_user_id ON user_ai_stats(user_id);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ai_stats ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Password reset tokens are accessible by email (for reset functionality)
CREATE POLICY "Password reset tokens accessible by email" ON password_reset_tokens
    FOR ALL USING (true);

-- User sessions are accessible by user
CREATE POLICY "User sessions accessible by user" ON user_sessions
    FOR ALL USING (auth.uid()::text = user_id::text);

-- User favorites are accessible by user
CREATE POLICY "User favorites accessible by user" ON user_favorites
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Forum topics are public for reading, users can manage their own
CREATE POLICY "Forum topics public read" ON user_forum_topics
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own forum topics" ON user_forum_topics
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Forum replies are public for reading, users can manage their own
CREATE POLICY "Forum replies public read" ON user_forum_replies
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own forum replies" ON user_forum_replies
    FOR ALL USING (auth.uid()::text = user_id::text);

-- AI stats are accessible by user
CREATE POLICY "AI stats accessible by user" ON user_ai_stats
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_forum_topics_updated_at BEFORE UPDATE ON user_forum_topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_forum_replies_updated_at BEFORE UPDATE ON user_forum_replies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean expired tokens (can be called periodically)
CREATE OR REPLACE FUNCTION clean_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM password_reset_tokens 
    WHERE expires_at < NOW() OR used = true;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Insert a test user (optional - remove in production)
-- Password: 1714Olci. (hashed with bcrypt)
INSERT INTO users (id, email, password, name, avatar, provider, created_at) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'ogulcandmr96@gmail.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Öğülcan Demir',
    'https://ui-avatars.com/api/?name=Öğülcan+Demir&background=random&color=fff&size=200',
    'local',
    NOW()
) ON CONFLICT (email) DO NOTHING;
