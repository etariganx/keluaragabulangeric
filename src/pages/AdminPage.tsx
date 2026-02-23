// ============================================
// ADMIN PAGE - USER MANAGEMENT
// ============================================

import { useState, useEffect } from 'react';
import { useRequireRole } from '@/context/AuthContext';
import type { User } from '@/types';
import { UserRole } from '@/types';
import { userService } from '@/services/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Shield,
  Users,
  Search,
  Loader2,
  Edit2,
  UserCog,
  Activity,
  Crown,
  User as UserIcon,
  UserCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const roleOptions = [
  { value: UserRole.SUPER_ADMIN, label: 'Super Admin', icon: Crown, color: 'text-purple-600 bg-purple-100' },
  { value: UserRole.ADMIN, label: 'Admin', icon: Shield, color: 'text-blue-600 bg-blue-100' },
  { value: UserRole.PARENT, label: 'Orang Tua', icon: UserCircle, color: 'text-green-600 bg-green-100' },
  { value: UserRole.MEMBER, label: 'Anggota', icon: UserIcon, color: 'text-gray-600 bg-gray-100' },
];

export function AdminPage() {
  const { hasAccess, isLoading: isCheckingRole } = useRequireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]);
  
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<string>(UserRole.MEMBER);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch users
  useEffect(() => {
    if (hasAccess) {
      fetchUsers();
    }
  }, [hasAccess]);

  const fetchUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter((user) =>
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get role badge
  const getRoleBadge = (role: string) => {
    const roleOption = roleOptions.find((r) => r.value === role);
    if (!roleOption) return null;

    return (
      <Badge className={cn('font-medium', roleOption.color)}>
        <roleOption.icon className="w-3 h-3 mr-1" />
        {roleOption.label}
      </Badge>
    );
  };

  // Handle role change
  const handleRoleChange = async () => {
    if (!selectedUser) return;

    setIsUpdating(true);
    try {
      await userService.updateRole(selectedUser.id, newRole);
      await fetchUsers();
      setIsRoleDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Open role dialog
  const openRoleDialog = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsRoleDialogOpen(true);
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

  if (isCheckingRole || !hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Panel Admin
          </h1>
          <p className="text-gray-500">
            Kelola pengguna dan pengaturan sistem
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{users.length}</p>
                  <p className="text-sm text-gray-500">Total Pengguna</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {users.filter((u) => u.role === UserRole.SUPER_ADMIN).length}
                  </p>
                  <p className="text-sm text-gray-500">Super Admin</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {users.filter((u) => u.role === UserRole.ADMIN).length}
                  </p>
                  <p className="text-sm text-gray-500">Admin</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {users.filter((u) => {
                      const lastSignIn = u.last_sign_in_at ? new Date(u.last_sign_in_at) : null;
                      const thirtyDaysAgo = new Date();
                      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                      return lastSignIn && lastSignIn > thirtyDaysAgo;
                    }).length}
                  </p>
                  <p className="text-sm text-gray-500">Aktif 30 Hari</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Pengguna
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <UserCog className="w-4 h-4" />
              Pengaturan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle>Daftar Pengguna</CardTitle>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Cari pengguna..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pengguna</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Bergabung</TableHead>
                          <TableHead>Login Terakhir</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={user.avatar_url || undefined} />
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {getInitials(user.full_name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{user.full_name}</p>
                                  <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                            <TableCell>{formatDate(user.created_at)}</TableCell>
                            <TableCell>{formatDate(user.last_sign_in_at)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openRoleDialog(user)}
                              >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit Role
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Sistem</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Pengaturan sistem akan segera hadir.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Role Change Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ubah Role Pengguna</DialogTitle>
            <DialogDescription>
              Ubah role untuk <strong>{selectedUser?.full_name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex items-center gap-2">
                      <role.icon className={cn('w-4 h-4', role.color.split(' ')[0])} />
                      {role.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
              <p className="font-medium mb-2">Hak Akses:</p>
              <ul className="space-y-1 list-disc list-inside">
                {newRole === UserRole.SUPER_ADMIN && (
                  <>
                    <li>Akses penuh ke semua fitur</li>
                    <li>Mengelola pengguna dan role</li>
                    <li>Mengelola semua data keluarga</li>
                  </>
                )}
                {newRole === UserRole.ADMIN && (
                  <>
                    <li>Mengelola data keluarga</li>
                    <li>Melihat semua anggota</li>
                    <li>Tidak bisa mengelola role</li>
                  </>
                )}
                {newRole === UserRole.PARENT && (
                  <>
                    <li>Menambah keturunan langsung</li>
                    <li>Mengedit data anak dan cucu</li>
                    <li>Melihat pohon keluarga</li>
                  </>
                )}
                {newRole === UserRole.MEMBER && (
                  <>
                    <li>Melihat pohon keluarga</li>
                    <li>Melihat profil anggota</li>
                    <li>Tidak bisa mengedit data</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleRoleChange} disabled={isUpdating}>
              {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminPage;
