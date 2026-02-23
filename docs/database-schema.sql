-- ============================================
-- FAMILY TREE APP - DATABASE SCHEMA
-- Supabase PostgreSQL
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'parent', 'member');
CREATE TYPE gender_type AS ENUM ('male', 'female');
CREATE TYPE status_type AS ENUM ('alive', 'deceased');
CREATE TYPE relationship_type AS ENUM ('parent', 'child', 'spouse');

-- ============================================
-- TABLES
-- ============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'member',
    family_member_id UUID,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_sign_in_at TIMESTAMP WITH TIME ZONE
);

-- Family members table
CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    gender gender_type NOT NULL,
    birth_date DATE,
    death_date DATE,
    status status_type NOT NULL DEFAULT 'alive',
    bio TEXT,
    photo_url TEXT,
    father_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
    mother_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
    spouse_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_dates CHECK (
        death_date IS NULL OR 
        birth_date IS NULL OR 
        death_date >= birth_date
    ),
    CONSTRAINT no_self_parent CHECK (
        father_id IS NULL OR father_id != id
    ),
    CONSTRAINT no_self_mother CHECK (
        mother_id IS NULL OR mother_id != id
    ),
    CONSTRAINT no_self_spouse CHECK (
        spouse_id IS NULL OR spouse_id != id
    )
);

-- Social media links table (normalized)
CREATE TABLE social_media_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(member_id, platform)
);

-- Relationships table (for complex relationships)
CREATE TABLE relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    to_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    relationship_type relationship_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(from_member_id, to_member_id, relationship_type),
    CONSTRAINT no_self_relationship CHECK (from_member_id != to_member_id)
);

-- Activity logs table
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_family_member_id ON users(family_member_id);

-- Family members indexes
CREATE INDEX idx_family_members_father_id ON family_members(father_id);
CREATE INDEX idx_family_members_mother_id ON family_members(mother_id);
CREATE INDEX idx_family_members_spouse_id ON family_members(spouse_id);
CREATE INDEX idx_family_members_created_by ON family_members(created_by);
CREATE INDEX idx_family_members_full_name ON family_members(full_name);
CREATE INDEX idx_family_members_birth_date ON family_members(birth_date);

-- Relationships indexes
CREATE INDEX idx_relationships_from_member ON relationships(from_member_id);
CREATE INDEX idx_relationships_to_member ON relationships(to_member_id);

-- Activity logs indexes
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_members_updated_at
    BEFORE UPDATE ON family_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_media_links_updated_at
    BEFORE UPDATE ON social_media_links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-update last_sign_in_at
CREATE OR REPLACE FUNCTION update_last_sign_in()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users 
    SET last_sign_in_at = NEW.last_sign_in_at
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Super admin can manage all users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Family members policies
CREATE POLICY "Anyone can view family members" ON family_members
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create members" ON family_members
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Super admin can manage all members" ON family_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

CREATE POLICY "Admin can update members" ON family_members
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin')
        )
    );

CREATE POLICY "Creator can update own members" ON family_members
    FOR UPDATE USING (created_by = auth.uid());

-- Social media links policies
CREATE POLICY "Anyone can view social media" ON social_media_links
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage social media" ON social_media_links
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Relationships policies
CREATE POLICY "Anyone can view relationships" ON relationships
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage relationships" ON relationships
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Activity logs policies
CREATE POLICY "Super admin can view all logs" ON activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

CREATE POLICY "Users can view own logs" ON activity_logs
    FOR SELECT USING (user_id = auth.uid());

-- ============================================
-- FUNCTIONS
-- ============================================

-- Get family tree data recursively
CREATE OR REPLACE FUNCTION get_family_tree(root_member_id UUID)
RETURNS TABLE (
    id UUID,
    full_name VARCHAR(255),
    gender gender_type,
    birth_date DATE,
    death_date DATE,
    status status_type,
    bio TEXT,
    photo_url TEXT,
    father_id UUID,
    mother_id UUID,
    spouse_id UUID,
    level INTEGER,
    path UUID[]
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE family_tree AS (
        -- Base case: root member
        SELECT 
            fm.*,
            0 AS level,
            ARRAY[fm.id] AS path
        FROM family_members fm
        WHERE fm.id = root_member_id
        
        UNION ALL
        
        -- Recursive case: children
        SELECT 
            fm.*,
            ft.level + 1,
            ft.path || fm.id
        FROM family_members fm
        INNER JOIN family_tree ft ON 
            fm.father_id = ft.id OR 
            fm.mother_id = ft.id
        WHERE NOT fm.id = ANY(ft.path) -- Prevent cycles
    )
    SELECT * FROM family_tree;
END;
$$ LANGUAGE plpgsql;

-- Get descendants
CREATE OR REPLACE FUNCTION get_descendants(member_id UUID)
RETURNS TABLE (
    id UUID,
    full_name VARCHAR(255),
    generation INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE descendants AS (
        SELECT 
            fm.id,
            fm.full_name,
            1 AS generation
        FROM family_members fm
        WHERE fm.father_id = member_id OR fm.mother_id = member_id
        
        UNION ALL
        
        SELECT 
            fm.id,
            fm.full_name,
            d.generation + 1
        FROM family_members fm
        INNER JOIN descendants d ON 
            fm.father_id = d.id OR 
            fm.mother_id = d.id
    )
    SELECT * FROM descendants;
END;
$$ LANGUAGE plpgsql;

-- Get ancestors
CREATE OR REPLACE FUNCTION get_ancestors(member_id UUID)
RETURNS TABLE (
    id UUID,
    full_name VARCHAR(255),
    generation INTEGER,
    relationship VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE ancestors AS (
        SELECT 
            fm.id,
            fm.full_name,
            -1 AS generation,
            CASE 
                WHEN fm.gender = 'male' THEN 'father'
                ELSE 'mother'
            END::VARCHAR(50) AS relationship,
            fm.father_id,
            fm.mother_id
        FROM family_members fm
        WHERE fm.id = member_id
        
        UNION ALL
        
        SELECT 
            fm.id,
            fm.full_name,
            a.generation - 1,
            CASE 
                WHEN fm.gender = 'male' THEN 'grandfather'
                ELSE 'grandmother'
            END::VARCHAR(50),
            fm.father_id,
            fm.mother_id
        FROM family_members fm
        INNER JOIN ancestors a ON 
            fm.id = a.father_id OR 
            fm.id = a.mother_id
    )
    SELECT id, full_name, generation, relationship FROM ancestors
    WHERE id != member_id;
END;
$$ LANGUAGE plpgsql;

-- Check if user can edit member
CREATE OR REPLACE FUNCTION can_edit_member(check_member_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_role_val user_role;
    creator_id UUID;
BEGIN
    -- Get current user's role
    SELECT role INTO user_role_val
    FROM users
    WHERE id = auth.uid();
    
    -- Get member creator
    SELECT created_by INTO creator_id
    FROM family_members
    WHERE id = check_member_id;
    
    -- Super admin can edit all
    IF user_role_val = 'super_admin' THEN
        RETURN true;
    END IF;
    
    -- Admin can edit all
    IF user_role_val = 'admin' THEN
        RETURN true;
    END IF;
    
    -- Parent can edit their descendants
    IF user_role_val = 'parent' THEN
        RETURN EXISTS (
            SELECT 1 FROM get_descendants(auth.uid()) 
            WHERE id = check_member_id
        ) OR creator_id = auth.uid();
    END IF;
    
    -- Member can only edit own
    RETURN creator_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default super admin (run after creating auth user)
-- INSERT INTO users (id, email, full_name, role)
-- VALUES ('auth-user-uuid', 'admin@example.com', 'Super Admin', 'super_admin');
