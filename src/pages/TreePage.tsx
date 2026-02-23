// ============================================
// TREE PAGE - MAIN FAMILY TREE VIEW
// ============================================

import { useState, useCallback } from 'react';
import type { FamilyMember, CreateFamilyMemberRequest, UpdateFamilyMemberRequest } from '@/types';
import { useFamily } from '@/context/FamilyContext';
import { useAuth } from '@/context/AuthContext';
import { FamilyTreeCanvas } from '@/components/family-tree/FamilyTreeCanvas';
import { MemberDetail } from '@/components/family-tree/MemberDetail';
import { MemberForm } from '@/components/forms/MemberForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  Loader2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function TreePage() {
  const { 
    treeData, 
    selectedMember, 
    selectMember, 
    createMember, 
    updateMember, 
    deleteMember,
    isTreeLoading,
    refreshData,
    searchMembers,
    getMemberWithRelations
  } = useFamily();
  const { checkPermission } = useAuth();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | undefined>();
  const [defaultSpouseId, setDefaultSpouseId] = useState<string | undefined>();
  const [memberRelations, setMemberRelations] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FamilyMember[]>([]);

  const permissions = checkPermission();

  // Handle member selection
  const handleSelectMember = useCallback(async (member: FamilyMember) => {
    selectMember(member);
    const relations = await getMemberWithRelations(member.id);
    setMemberRelations(relations);
    setIsDetailOpen(true);
  }, [selectMember, getMemberWithRelations]);

  // Handle create member
  const handleCreate = async (data: CreateFamilyMemberRequest) => {
    await createMember(data);
    setIsFormOpen(false);
    setDefaultParentId(undefined);
    setDefaultSpouseId(undefined);
  };

  // Handle update member
  const handleUpdate = async (data: UpdateFamilyMemberRequest) => {
    if (editingMember) {
      await updateMember(editingMember.id, data);
      setIsFormOpen(false);
      setEditingMember(null);
      
      // Refresh detail if currently viewing this member
      if (selectedMember?.id === editingMember.id) {
        const relations = await getMemberWithRelations(editingMember.id);
        setMemberRelations(relations);
      }
    }
  };

  // Handle delete member
  const handleDelete = async () => {
    if (editingMember) {
      await deleteMember(editingMember.id);
      setIsDeleteDialogOpen(false);
      setEditingMember(null);
      setIsDetailOpen(false);
    }
  };

  // Open form for editing
  const handleEdit = useCallback(() => {
    if (selectedMember) {
      setEditingMember(selectedMember);
      setIsFormOpen(true);
      setIsDetailOpen(false);
    }
  }, [selectedMember]);

  // Open form for adding child
  const handleAddChild = useCallback((parentId: string) => {
    setDefaultParentId(parentId);
    setEditingMember(null);
    setIsFormOpen(true);
  }, []);

  // Open form for adding spouse
  const handleAddSpouse = useCallback((memberId: string) => {
    setDefaultSpouseId(memberId);
    setEditingMember(null);
    setIsFormOpen(true);
  }, []);

  // Open delete confirmation
  const handleDeleteClick = useCallback(() => {
    if (selectedMember) {
      setEditingMember(selectedMember);
      setIsDeleteDialogOpen(true);
      setIsDetailOpen(false);
    }
  }, [selectedMember]);

  // Handle search
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      const results = await searchMembers(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchMembers]);

  // Handle search result selection
  const handleSearchSelect = useCallback((member: FamilyMember) => {
    handleSelectMember(member);
    setSearchQuery('');
    setSearchResults([]);
  }, [handleSelectMember]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b px-4 py-3">
        <div className="container mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">Pohon Keluarga</h1>
            {isTreeLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari anggota..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 w-full sm:w-64"
              />
              
              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border z-50 max-h-60 overflow-auto">
                  {searchResults.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => handleSearchSelect(member)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {member.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm">{member.full_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={refreshData}
              disabled={isTreeLoading}
            >
              <RefreshCw className={cn("w-4 h-4", isTreeLoading && "animate-spin")} />
            </Button>

            {/* Add Member Button */}
            {permissions.canCreate && (
              <Button 
                onClick={() => {
                  setEditingMember(null);
                  setDefaultParentId(undefined);
                  setDefaultSpouseId(undefined);
                  setIsFormOpen(true);
                }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Tambah Anggota</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tree Canvas */}
      <div className="flex-1 overflow-hidden">
        <FamilyTreeCanvas
          treeData={treeData || { nodes: {}, rootIds: [] }}
          selectedMemberId={selectedMember?.id}
          onSelectMember={handleSelectMember}
          onEditMember={permissions.canEdit ? handleEdit : undefined}
          onDeleteMember={permissions.canDelete ? handleDeleteClick : undefined}
          onAddChild={permissions.canCreate ? handleAddChild : undefined}
          onAddSpouse={permissions.canCreate ? handleAddSpouse : undefined}
        />
      </div>

      {/* Member Detail Modal */}
      <MemberDetail
        member={selectedMember}
        relations={memberRelations}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          selectMember(null);
        }}
        onEdit={permissions.canEdit ? handleEdit : undefined}
        onDelete={permissions.canDelete ? handleDeleteClick : undefined}
        onViewRelation={handleSelectMember}
      />

      {/* Member Form Modal */}
      <MemberForm
        member={editingMember}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingMember(null);
          setDefaultParentId(undefined);
          setDefaultSpouseId(undefined);
        }}
        onSubmit={async (data) => {
          if (editingMember) {
            await handleUpdate(data as UpdateFamilyMemberRequest);
          } else {
            await handleCreate(data as CreateFamilyMemberRequest);
          }
        }}
        defaultParentId={defaultParentId}
        defaultSpouseId={defaultSpouseId}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Konfirmasi Hapus
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus <strong>{editingMember?.full_name}</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TreePage;
