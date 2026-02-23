// ============================================
// FAMILY TREE APP - TYPE DEFINITIONS
// ============================================

// User Role Enum
export const UserRole = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  PARENT: 'parent',
  MEMBER: 'member',
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// Gender Enum
export const Gender = {
  MALE: 'male',
  FEMALE: 'female',
} as const;

export type GenderType = typeof Gender[keyof typeof Gender];

// Status Enum
export const Status = {
  ALIVE: 'alive',
  DECEASED: 'deceased',
} as const;

export type StatusType = typeof Status[keyof typeof Status];

// Relationship Type Enum
export const RelationshipType = {
  PARENT: 'parent',
  CHILD: 'child',
  SPOUSE: 'spouse',
} as const;

export type RelationshipTypeType = typeof RelationshipType[keyof typeof RelationshipType];

// ============================================
// DATABASE MODELS
// ============================================

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRoleType;
  family_member_id?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string | null;
}

export interface FamilyMember {
  id: string;
  full_name: string;
  gender: GenderType;
  birth_date?: string | null;
  death_date?: string | null;
  status: StatusType;
  bio?: string | null;
  photo_url?: string | null;
  father_id?: string | null;
  mother_id?: string | null;
  spouse_id?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  social_media?: SocialMediaLinks;
}

export interface SocialMediaLinks {
  facebook?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
  whatsapp?: string | null;
}

export interface Relationship {
  id: string;
  from_member_id: string;
  to_member_id: string;
  relationship_type: RelationshipTypeType;
  created_at: string;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface CreateFamilyMemberRequest {
  full_name: string;
  gender: GenderType;
  birth_date?: string | null;
  death_date?: string | null;
  status?: StatusType;
  bio?: string | null;
  photo_url?: string | null;
  father_id?: string | null;
  mother_id?: string | null;
  spouse_id?: string | null;
  social_media?: SocialMediaLinks;
}

export interface UpdateFamilyMemberRequest {
  full_name?: string;
  gender?: GenderType;
  birth_date?: string | null;
  death_date?: string | null;
  status?: StatusType;
  bio?: string | null;
  photo_url?: string | null;
  father_id?: string | null;
  mother_id?: string | null;
  spouse_id?: string | null;
  social_media?: SocialMediaLinks;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

// ============================================
// UI COMPONENT TYPES
// ============================================

export interface TreeNodePosition {
  x: number;
  y: number;
}

export interface TreeNodeData extends FamilyMember {
  children: string[];
  spouses: string[];
  level: number;
  position?: TreeNodePosition;
}

export interface TreeConnection {
  from: string;
  to: string;
  type: 'parent-child' | 'spouse';
}

export interface FamilyTreeData {
  nodes: Record<string, TreeNodeData>;
  rootIds: string[];
}

// ============================================
// PERMISSION TYPES
// ============================================

export interface PermissionCheck {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  checkPermission: (memberId?: string) => PermissionCheck;
}

// ============================================
// FORM TYPES
// ============================================

export interface FamilyMemberFormData {
  full_name: string;
  gender: GenderType;
  birth_date: string;
  death_date: string;
  status: StatusType;
  bio: string;
  father_id: string;
  mother_id: string;
  spouse_id: string;
  facebook: string;
  instagram: string;
  twitter: string;
  linkedin: string;
  whatsapp: string;
  photo: File | null;
}

// ============================================
// FILTER & SEARCH TYPES
// ============================================

export interface MemberFilters {
  search?: string;
  gender?: GenderType;
  status?: StatusType;
  generation?: number;
}

export interface SortOptions {
  field: 'full_name' | 'birth_date' | 'created_at';
  direction: 'asc' | 'desc';
}
