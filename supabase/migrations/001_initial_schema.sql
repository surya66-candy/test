-- ============================================
-- Club Forum Platform — Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Clubs Table
-- ============================================
CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  mission_statement TEXT,
  logo_url TEXT,
  banner_url TEXT,
  establishment_date DATE,
  contact_email VARCHAR(255),
  phone VARCHAR(50),
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clubs_slug ON clubs(slug);

-- ============================================
-- 2. Club History Table
-- ============================================
CREATE TABLE club_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE,
  event_type VARCHAR(50) DEFAULT 'milestone',
  images JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_club_history_club_id ON club_history(club_id);
CREATE INDEX idx_club_history_event_date ON club_history(event_date);

-- ============================================
-- 3. Members Table
-- ============================================
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  photo_url TEXT,
  role VARCHAR(100),
  position VARCHAR(100),
  biography TEXT,
  join_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(club_id, user_id)
);

CREATE INDEX idx_members_club_id ON members(club_id);
CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_status ON members(status);

-- ============================================
-- 4. User Roles Table
-- ============================================
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('org_admin', 'club_admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, club_id)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_club_id ON user_roles(club_id);

-- ============================================
-- 5. Forum Threads Table
-- ============================================
CREATE TABLE forum_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  is_organization_wide BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_forum_threads_club_id ON forum_threads(club_id);
CREATE INDEX idx_forum_threads_author_id ON forum_threads(author_id);
CREATE INDEX idx_forum_threads_category ON forum_threads(category);
CREATE INDEX idx_forum_threads_created_at ON forum_threads(created_at DESC);

-- ============================================
-- 6. Forum Replies Table
-- ============================================
CREATE TABLE forum_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id),
  parent_reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_forum_replies_thread_id ON forum_replies(thread_id);
CREATE INDEX idx_forum_replies_author_id ON forum_replies(author_id);
CREATE INDEX idx_forum_replies_parent ON forum_replies(parent_reply_id);

-- ============================================
-- 7. Notifications Table
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  message TEXT,
  link TEXT,
  related_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================
-- 8. Vote Tracking Table (prevent duplicates)
-- ============================================
CREATE TABLE reply_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(reply_id, user_id)
);

CREATE INDEX idx_reply_votes_reply_id ON reply_votes(reply_id);

-- ============================================
-- Auto-update updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON clubs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_club_history_updated_at BEFORE UPDATE ON club_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_threads_updated_at BEFORE UPDATE ON forum_threads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_replies_updated_at BEFORE UPDATE ON forum_replies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security Policies
-- ============================================

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reply_votes ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is org admin
CREATE OR REPLACE FUNCTION is_org_admin(uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = uid AND role = 'org_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: check if user is club admin
CREATE OR REPLACE FUNCTION is_club_admin(uid UUID, cid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = uid AND club_id = cid AND role IN ('club_admin', 'org_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: check if user is club member
CREATE OR REPLACE FUNCTION is_club_member(uid UUID, cid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = uid AND club_id = cid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clubs policies
CREATE POLICY "Public can view clubs" ON clubs FOR SELECT USING (true);
CREATE POLICY "Org admins can insert clubs" ON clubs FOR INSERT WITH CHECK (is_org_admin(auth.uid()));
CREATE POLICY "Club/org admins can update clubs" ON clubs FOR UPDATE USING (is_club_admin(auth.uid(), id));
CREATE POLICY "Org admins can delete clubs" ON clubs FOR DELETE USING (is_org_admin(auth.uid()));

-- Club history policies
CREATE POLICY "Anyone can view club history" ON club_history FOR SELECT USING (true);
CREATE POLICY "Club admins can insert history" ON club_history FOR INSERT WITH CHECK (is_club_admin(auth.uid(), club_id));
CREATE POLICY "Club admins can update history" ON club_history FOR UPDATE USING (is_club_admin(auth.uid(), club_id));
CREATE POLICY "Club admins can delete history" ON club_history FOR DELETE USING (is_club_admin(auth.uid(), club_id));

-- Members policies
CREATE POLICY "Club members can view own club members" ON members FOR SELECT USING (is_club_member(auth.uid(), club_id) OR is_org_admin(auth.uid()));
CREATE POLICY "Club admins can insert members" ON members FOR INSERT WITH CHECK (is_club_admin(auth.uid(), club_id));
CREATE POLICY "Club admins can update members" ON members FOR UPDATE USING (is_club_admin(auth.uid(), club_id) OR (user_id = auth.uid()));
CREATE POLICY "Club admins can delete members" ON members FOR DELETE USING (is_club_admin(auth.uid(), club_id));

-- User roles policies
CREATE POLICY "Users can view own roles" ON user_roles FOR SELECT USING (user_id = auth.uid() OR is_org_admin(auth.uid()));
CREATE POLICY "Org admins manage roles" ON user_roles FOR INSERT WITH CHECK (is_org_admin(auth.uid()));
CREATE POLICY "Org admins update roles" ON user_roles FOR UPDATE USING (is_org_admin(auth.uid()));
CREATE POLICY "Org admins delete roles" ON user_roles FOR DELETE USING (is_org_admin(auth.uid()));

-- Forum threads policies
CREATE POLICY "Members can view club threads" ON forum_threads FOR SELECT USING (is_organization_wide OR is_club_member(auth.uid(), club_id) OR is_org_admin(auth.uid()));
CREATE POLICY "Members can create threads" ON forum_threads FOR INSERT WITH CHECK (is_club_member(auth.uid(), club_id) OR is_org_admin(auth.uid()));
CREATE POLICY "Authors and admins can update threads" ON forum_threads FOR UPDATE USING (author_id = auth.uid() OR is_club_admin(auth.uid(), club_id));
CREATE POLICY "Authors and admins can delete threads" ON forum_threads FOR DELETE USING (author_id = auth.uid() OR is_club_admin(auth.uid(), club_id));

-- Forum replies policies
CREATE POLICY "Can view replies of visible threads" ON forum_replies FOR SELECT USING (
    EXISTS (SELECT 1 FROM forum_threads WHERE id = thread_id AND (is_organization_wide OR is_club_member(auth.uid(), club_id) OR is_org_admin(auth.uid())))
);
CREATE POLICY "Members can reply" ON forum_replies FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM forum_threads WHERE id = thread_id AND (is_club_member(auth.uid(), club_id) OR is_org_admin(auth.uid())) AND NOT is_locked)
);
CREATE POLICY "Authors can update replies" ON forum_replies FOR UPDATE USING (author_id = auth.uid());
CREATE POLICY "Authors and admins can delete replies" ON forum_replies FOR DELETE USING (
    author_id = auth.uid() OR EXISTS (SELECT 1 FROM forum_threads ft WHERE ft.id = thread_id AND is_club_admin(auth.uid(), ft.club_id))
);

-- Notifications policies
CREATE POLICY "Users view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System creates notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- Reply votes policies
CREATE POLICY "Users can view votes" ON reply_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote" ON reply_votes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can change vote" ON reply_votes FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can remove vote" ON reply_votes FOR DELETE USING (user_id = auth.uid());
