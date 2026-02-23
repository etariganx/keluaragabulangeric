// ============================================
// SUPABASE CLIENT & API SERVICES
// ============================================

import { createClient } from '@supabase/supabase-js';
import type { 
  User, 
  FamilyMember, 
  CreateFamilyMemberRequest, 
  UpdateFamilyMemberRequest,
  LoginRequest,
  RegisterRequest,
  SocialMediaLinks,
  FamilyTreeData,
  TreeNodeData
} from '@/types';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// AUTH SERVICES
// ============================================

export const authService = {
  // Sign up with email
  async signUp({ email, password, full_name }: RegisterRequest) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    if (authData.user) {
      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          full_name,
          role: 'member',
        });

      if (profileError) throw profileError;
    }

    return authData;
  },

  // Sign in with email
  async signIn({ email, password }: LoginRequest) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // Sign in with Google
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Get current user with profile
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Upload avatar
  async uploadAvatar(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('family-tree')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('family-tree')
      .getPublicUrl(filePath);

    // Update user profile with avatar URL
    await this.updateProfile(userId, { avatar_url: publicUrl });

    return publicUrl;
  },
};

// ============================================
// FAMILY MEMBER SERVICES
// ============================================

export const familyMemberService = {
  // Get all family members
  async getAll(): Promise<FamilyMember[]> {
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .order('birth_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get member by ID
  async getById(id: string): Promise<FamilyMember | null> {
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get member with relations
  async getWithRelations(id: string): Promise<{
    member: FamilyMember;
    father: FamilyMember | null;
    mother: FamilyMember | null;
    spouse: FamilyMember | null;
    children: FamilyMember[];
  } | null> {
    const { data: member, error: memberError } = await supabase
      .from('family_members')
      .select('*')
      .eq('id', id)
      .single();

    if (memberError || !member) return null;

    // Get relations in parallel
    const [father, mother, spouse, children] = await Promise.all([
      member.father_id ? this.getById(member.father_id) : null,
      member.mother_id ? this.getById(member.mother_id) : null,
      member.spouse_id ? this.getById(member.spouse_id) : null,
      this.getChildren(id),
    ]);

    return { member, father, mother, spouse, children };
  },

  // Get children of a member
  async getChildren(parentId: string): Promise<FamilyMember[]> {
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .or(`father_id.eq.${parentId},mother_id.eq.${parentId}`);

    if (error) throw error;
    return data || [];
  },

  // Create new member
  async create(member: CreateFamilyMemberRequest, userId: string): Promise<FamilyMember> {
    const { data, error } = await supabase
      .from('family_members')
      .insert({
        ...member,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update member
  async update(id: string, updates: UpdateFamilyMemberRequest): Promise<FamilyMember> {
    const { data, error } = await supabase
      .from('family_members')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete member
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Search members
  async search(query: string): Promise<FamilyMember[]> {
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .ilike('full_name', `%${query}%`)
      .limit(20);

    if (error) throw error;
    return data || [];
  },

  // Upload member photo
  async uploadPhoto(memberId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${memberId}-${Date.now()}.${fileExt}`;
    const filePath = `photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('family-tree')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('family-tree')
      .getPublicUrl(filePath);

    // Update member with photo URL
    await this.update(memberId, { photo_url: publicUrl });

    return publicUrl;
  },
};

// ============================================
// SOCIAL MEDIA SERVICES
// ============================================

export const socialMediaService = {
  // Get social media links for a member
  async getByMemberId(memberId: string): Promise<SocialMediaLinks> {
    const { data, error } = await supabase
      .from('social_media_links')
      .select('*')
      .eq('member_id', memberId);

    if (error) throw error;

    const links: SocialMediaLinks = {};
    data?.forEach((item) => {
      links[item.platform as keyof SocialMediaLinks] = item.url;
    });

    return links;
  },

  // Update social media links
  async update(memberId: string, links: SocialMediaLinks): Promise<void> {
    // Delete existing links
    await supabase
      .from('social_media_links')
      .delete()
      .eq('member_id', memberId);

    // Insert new links
    const entries = Object.entries(links).filter(([, url]) => url);
    
    if (entries.length > 0) {
      const { error } = await supabase
        .from('social_media_links')
        .insert(
          entries.map(([platform, url]) => ({
            member_id: memberId,
            platform,
            url,
          }))
        );

      if (error) throw error;
    }
  },
};

// ============================================
// FAMILY TREE SERVICES
// ============================================

export const familyTreeService = {
  // Build family tree data structure
  async buildTree(): Promise<FamilyTreeData> {
    const members = await familyMemberService.getAll();
    
    const nodes: Record<string, TreeNodeData> = {};
    const rootIds: string[] = [];

    // Initialize nodes
    members.forEach((member) => {
      nodes[member.id] = {
        ...member,
        children: [],
        spouses: [],
        level: 0,
      };
    });

    // Build relationships
    members.forEach((member) => {
      const node = nodes[member.id];

      // Add to parent's children
      if (member.father_id && nodes[member.father_id]) {
        nodes[member.father_id].children.push(member.id);
      }
      if (member.mother_id && nodes[member.mother_id]) {
        nodes[member.mother_id].children.push(member.id);
      }

      // Add spouse
      if (member.spouse_id && nodes[member.spouse_id]) {
        node.spouses.push(member.spouse_id);
      }

      // Identify root nodes (no parents)
      if (!member.father_id && !member.mother_id) {
        rootIds.push(member.id);
      }
    });

    // Calculate levels using BFS
    const calculateLevels = (startId: string, level: number) => {
      const queue = [{ id: startId, level }];
      const visited = new Set<string>();

      while (queue.length > 0) {
        const { id, level: currentLevel } = queue.shift()!;
        
        if (visited.has(id)) continue;
        visited.add(id);

        nodes[id].level = Math.max(nodes[id].level, currentLevel);

        // Add children to queue
        nodes[id].children.forEach((childId) => {
          if (!visited.has(childId)) {
            queue.push({ id: childId, level: currentLevel + 1 });
          }
        });
      }
    };

    // Calculate levels from each root
    rootIds.forEach((rootId) => calculateLevels(rootId, 0));

    return { nodes, rootIds };
  },

  // Get tree starting from specific member
  async getSubTree(memberId: string): Promise<FamilyTreeData> {
    const { data, error } = await supabase
      .rpc('get_family_tree', { root_member_id: memberId });

    if (error) throw error;

    // Transform to TreeNodeData format
    const nodes: Record<string, TreeNodeData> = {};
    const rootIds: string[] = [memberId];

    data?.forEach((member: any) => {
      nodes[member.id] = {
        ...member,
        children: [],
        spouses: [],
        level: member.level,
      };
    });

    // Build children relationships
    Object.values(nodes).forEach((node) => {
      if (node.father_id && nodes[node.father_id]) {
        nodes[node.father_id].children.push(node.id);
      }
      if (node.mother_id && nodes[node.mother_id]) {
        nodes[node.mother_id].children.push(node.id);
      }
    });

    return { nodes, rootIds };
  },
};

// ============================================
// USER SERVICES
// ============================================

export const userService = {
  // Get all users
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get user by ID
  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Update user role (super admin only)
  async updateRole(userId: string, role: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Link user to family member
  async linkToFamilyMember(userId: string, familyMemberId: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({ family_member_id: familyMemberId })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ============================================
// ACTIVITY LOG SERVICES
// ============================================

export const activityLogService = {
  // Log activity
  async log(
    action: string,
    entityType: string,
    entityId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
      });

    if (error) console.error('Failed to log activity:', error);
  },

  // Get recent activities
  async getRecent(limit: number = 50): Promise<any[]> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },
};
