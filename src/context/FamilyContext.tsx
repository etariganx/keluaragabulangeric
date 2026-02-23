// ============================================
// FAMILY TREE CONTEXT
// ============================================

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { FamilyMember, FamilyTreeData, CreateFamilyMemberRequest, UpdateFamilyMemberRequest } from '@/types';
import { familyMemberService, familyTreeService } from '@/services/supabase';
import { useAuth } from './AuthContext';

interface FamilyContextType {
  // Data
  members: FamilyMember[];
  treeData: FamilyTreeData | null;
  selectedMember: FamilyMember | null;
  
  // Loading states
  isLoading: boolean;
  isTreeLoading: boolean;
  
  // Actions
  fetchMembers: () => Promise<void>;
  fetchTree: (rootId?: string) => Promise<void>;
  selectMember: (member: FamilyMember | null) => void;
  createMember: (data: CreateFamilyMemberRequest) => Promise<FamilyMember>;
  updateMember: (id: string, data: UpdateFamilyMemberRequest) => Promise<FamilyMember>;
  deleteMember: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
  
  // Search
  searchMembers: (query: string) => Promise<FamilyMember[]>;
  
  // Relations
  getMemberWithRelations: (id: string) => Promise<{
    member: FamilyMember;
    father: FamilyMember | null;
    mother: FamilyMember | null;
    spouse: FamilyMember | null;
    children: FamilyMember[];
  } | null>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [treeData, setTreeData] = useState<FamilyTreeData | null>(null);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTreeLoading, setIsTreeLoading] = useState(false);

  // Fetch all members
  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await familyMemberService.getAll();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch family tree
  const fetchTree = useCallback(async (rootId?: string) => {
    setIsTreeLoading(true);
    try {
      const data = rootId 
        ? await familyTreeService.getSubTree(rootId)
        : await familyTreeService.buildTree();
      setTreeData(data);
    } catch (error) {
      console.error('Error fetching tree:', error);
    } finally {
      setIsTreeLoading(false);
    }
  }, []);

  // Select a member
  const selectMember = useCallback((member: FamilyMember | null) => {
    setSelectedMember(member);
  }, []);

  // Create new member
  const createMember = useCallback(async (data: CreateFamilyMemberRequest) => {
    if (!user) throw new Error('User not authenticated');
    
    const newMember = await familyMemberService.create(data, user.id);
    setMembers((prev) => [...prev, newMember]);
    
    // Refresh tree data
    await fetchTree();
    
    return newMember;
  }, [user, fetchTree]);

  // Update member
  const updateMember = useCallback(async (id: string, data: UpdateFamilyMemberRequest) => {
    const updatedMember = await familyMemberService.update(id, data);
    setMembers((prev) => 
      prev.map((m) => (m.id === id ? updatedMember : m))
    );
    
    if (selectedMember?.id === id) {
      setSelectedMember(updatedMember);
    }
    
    // Refresh tree data
    await fetchTree();
    
    return updatedMember;
  }, [selectedMember, fetchTree]);

  // Delete member
  const deleteMember = useCallback(async (id: string) => {
    await familyMemberService.delete(id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    
    if (selectedMember?.id === id) {
      setSelectedMember(null);
    }
    
    // Refresh tree data
    await fetchTree();
  }, [selectedMember, fetchTree]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([fetchMembers(), fetchTree()]);
  }, [fetchMembers, fetchTree]);

  // Search members
  const searchMembers = useCallback(async (query: string) => {
    return await familyMemberService.search(query);
  }, []);

  // Get member with relations
  const getMemberWithRelations = useCallback(async (id: string) => {
    return await familyMemberService.getWithRelations(id);
  }, []);

  // Initial load
  useEffect(() => {
    fetchMembers();
    fetchTree();
  }, [fetchMembers, fetchTree]);

  const value: FamilyContextType = {
    members,
    treeData,
    selectedMember,
    isLoading,
    isTreeLoading,
    fetchMembers,
    fetchTree,
    selectMember,
    createMember,
    updateMember,
    deleteMember,
    refreshData,
    searchMembers,
    getMemberWithRelations,
  };

  return (
    <FamilyContext.Provider value={value}>
      {children}
    </FamilyContext.Provider>
  );
}

// Custom hook to use family context
export function useFamily() {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
}
