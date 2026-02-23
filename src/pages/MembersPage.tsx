// ============================================
// MEMBERS LIST PAGE
// ============================================

import { useState, useMemo } from 'react';
import type { FamilyMember, CreateFamilyMemberRequest, UpdateFamilyMemberRequest } from '@/types';
import { Gender, Status } from '@/types';
import { useFamily } from '@/context/FamilyContext';
import { useAuth } from '@/context/AuthContext';
import { MemberForm } from '@/components/forms/MemberForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit2,
  Trash2,
  User,
  UserCircle,
  Filter,
  Loader2,
  AlertTriangle,
  Grid3X3,
  List,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function MembersPage() {
  const { members, isLoading, createMember, updateMember, deleteMember } = useFamily();
  const { checkPermission } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<FamilyMember | null>(null);

  const permissions = checkPermission();

  // Filter members
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch = member.full_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesGender = genderFilter === 'all' || member.gender === genderFilter;
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      
      return matchesSearch && matchesGender && matchesStatus;
    });
  }, [members, searchQuery, genderFilter, statusFilter]);

  // Handle create
  const handleCreate = async (data: CreateFamilyMemberRequest) => {
    await createMember(data);
    setIsFormOpen(false);
  };

  // Handle update
  const handleUpdate = async (data: UpdateFamilyMemberRequest) => {
    if (editingMember) {
      await updateMember(editingMember.id, data);
      setIsFormOpen(false);
      setEditingMember(null);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (deletingMember) {
      await deleteMember(deletingMember.id);
      setIsDeleteDialogOpen(false);
      setDeletingMember(null);
    }
  };

  // Open edit form
  const handleEdit = (member: FamilyMember) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  // Open delete dialog
  const handleDeleteClick = (member: FamilyMember) => {
    setDeletingMember(member);
    setIsDeleteDialogOpen(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const MemberCard = ({ member }: { member: FamilyMember }) => (
    <Card className="group hover:shadow-lg transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className={cn(
            'w-16 h-16 border-2 border-white shadow-md',
            member.status === Status.DECEASED && 'grayscale'
          )}>
            <AvatarImage src={member.photo_url || undefined} />
            <AvatarFallback className={cn(
              'text-lg font-bold',
              member.gender === Gender.MALE ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
            )}>
              {getInitials(member.full_name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-gray-900 truncate">
                  {member.full_name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {member.gender === Gender.MALE ? (
                    <User className="w-3.5 h-3.5 text-blue-500" />
                  ) : (
                    <UserCircle className="w-3.5 h-3.5 text-pink-500" />
                  )}
                  <span className="text-xs text-gray-500">
                    {formatDate(member.birth_date)}
                  </span>
                </div>
              </div>

              {(permissions.canEdit || permissions.canDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {permissions.canEdit && (
                      <DropdownMenuItem onClick={() => handleEdit(member)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {permissions.canDelete && (
                      <DropdownMenuItem 
                        onClick={() => handleDeleteClick(member)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Hapus
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="flex items-center gap-2 mt-3">
              <Badge 
                variant={member.status === Status.ALIVE ? 'default' : 'secondary'}
                className={cn(
                  'text-xs',
                  member.status === Status.ALIVE 
                    ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-100'
                )}
              >
                {member.status === Status.ALIVE ? 'Hidup' : 'Meninggal'}
              </Badge>
              
              {(member.father_id || member.mother_id) && (
                <Badge variant="outline" className="text-xs">
                  Punya Ortu
                </Badge>
              )}
              
              {member.spouse_id && (
                <Badge variant="outline" className="text-xs">
                  Menikah
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const MemberRow = ({ member }: { member: FamilyMember }) => (
    <tr className="border-b hover:bg-gray-50">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className={cn(
            'w-10 h-10',
            member.status === Status.DECEASED && 'grayscale'
          )}>
            <AvatarImage src={member.photo_url || undefined} />
            <AvatarFallback className={cn(
              'text-xs font-bold',
              member.gender === Gender.MALE ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
            )}>
              {getInitials(member.full_name)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{member.full_name}</span>
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          {member.gender === Gender.MALE ? (
            <>
              <User className="w-4 h-4 text-blue-500" />
              <span>Laki-laki</span>
            </>
          ) : (
            <>
              <UserCircle className="w-4 h-4 text-pink-500" />
              <span>Perempuan</span>
            </>
          )}
        </div>
      </td>
      <td className="p-4">{formatDate(member.birth_date)}</td>
      <td className="p-4">
        <Badge 
          variant={member.status === Status.ALIVE ? 'default' : 'secondary'}
          className={cn(
            member.status === Status.ALIVE 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-600'
          )}
        >
          {member.status === Status.ALIVE ? 'Hidup' : 'Meninggal'}
        </Badge>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          {permissions.canEdit && (
            <Button variant="ghost" size="icon" onClick={() => handleEdit(member)}>
              <Edit2 className="w-4 h-4" />
            </Button>
          )}
          {permissions.canDelete && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleDeleteClick(member)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daftar Anggota</h1>
            <p className="text-gray-500">
              {filteredMembers.length} dari {members.length} anggota keluarga
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari anggota..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value={Gender.MALE}>Laki-laki</SelectItem>
                  <SelectItem value={Gender.FEMALE}>Perempuan</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value={Status.ALIVE}>Hidup</SelectItem>
                  <SelectItem value={Status.DECEASED}>Meninggal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode */}
            <div className="flex items-center border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="rounded-none"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                className="rounded-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Add Button */}
            {permissions.canCreate && (
              <Button onClick={() => setIsFormOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Tambah
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tidak ada anggota ditemukan
            </h3>
            <p className="text-gray-500">
              Coba ubah filter atau tambahkan anggota baru
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMembers.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-700">Nama</th>
                  <th className="text-left p-4 font-medium text-gray-700">Gender</th>
                  <th className="text-left p-4 font-medium text-gray-700">Tanggal Lahir</th>
                  <th className="text-left p-4 font-medium text-gray-700">Status</th>
                  <th className="text-left p-4 font-medium text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <MemberRow key={member.id} member={member} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Member Form Modal */}
      <MemberForm
        member={editingMember}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingMember(null);
        }}
        onSubmit={async (data) => {
          if (editingMember) {
            await handleUpdate(data as UpdateFamilyMemberRequest);
          } else {
            await handleCreate(data as CreateFamilyMemberRequest);
          }
        }}
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
              Apakah Anda yakin ingin menghapus <strong>{deletingMember?.full_name}</strong>?
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

export default MembersPage;
