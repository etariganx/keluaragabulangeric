// ============================================
// MEMBER FORM COMPONENT
// ============================================

import { useState, useEffect } from 'react';
import type { FamilyMember, CreateFamilyMemberRequest, UpdateFamilyMemberRequest } from '@/types';
import { useFamily } from '@/context/FamilyContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, User, UserCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MemberFormProps {
  member?: FamilyMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFamilyMemberRequest | UpdateFamilyMemberRequest) => Promise<void>;
  defaultParentId?: string;
  defaultSpouseId?: string;
}

interface FormData {
  full_name: string;
  gender: 'male' | 'female';
  birth_date: string;
  death_date: string;
  status: 'alive' | 'deceased';
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

const initialFormData: FormData = {
  full_name: '',
  gender: 'male',
  birth_date: '',
  death_date: '',
  status: 'alive',
  bio: '',
  father_id: '',
  mother_id: '',
  spouse_id: '',
  facebook: '',
  instagram: '',
  twitter: '',
  linkedin: '',
  whatsapp: '',
  photo: null,
};

export function MemberForm({
  member,
  isOpen,
  onClose,
  onSubmit,
  defaultParentId,
  defaultSpouseId,
}: MemberFormProps) {
  const { members } = useFamily();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const isEditing = !!member;

  // Reset form when opened/closed
  useEffect(() => {
    if (isOpen) {
      if (member) {
        setFormData({
          full_name: member.full_name,
          gender: member.gender,
          birth_date: member.birth_date || '',
          death_date: member.death_date || '',
          status: member.status,
          bio: member.bio || '',
          father_id: member.father_id || '',
          mother_id: member.mother_id || '',
          spouse_id: member.spouse_id || '',
          facebook: member.social_media?.facebook || '',
          instagram: member.social_media?.instagram || '',
          twitter: member.social_media?.twitter || '',
          linkedin: member.social_media?.linkedin || '',
          whatsapp: member.social_media?.whatsapp || '',
          photo: null,
        });
        setPhotoPreview(member.photo_url || null);
      } else {
        setFormData({
          ...initialFormData,
          father_id: defaultParentId || '',
          spouse_id: defaultSpouseId || '',
        });
        setPhotoPreview(null);
      }
    }
  }, [isOpen, member, defaultParentId, defaultSpouseId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData: CreateFamilyMemberRequest | UpdateFamilyMemberRequest = {
        full_name: formData.full_name,
        gender: formData.gender,
        birth_date: formData.birth_date || null,
        death_date: formData.status === 'deceased' ? formData.death_date || null : null,
        status: formData.status,
        bio: formData.bio || null,
        father_id: formData.father_id || null,
        mother_id: formData.mother_id || null,
        spouse_id: formData.spouse_id || null,
        social_media: {
          facebook: formData.facebook || null,
          instagram: formData.instagram || null,
          twitter: formData.twitter || null,
          linkedin: formData.linkedin || null,
          whatsapp: formData.whatsapp || null,
        },
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter potential parents (opposite gender, not self if editing)
  const potentialFathers = members.filter(
    (m) => m.gender === 'male' && (!isEditing || m.id !== member?.id)
  );
  const potentialMothers = members.filter(
    (m) => m.gender === 'female' && (!isEditing || m.id !== member?.id)
  );
  const potentialSpouses = members.filter(
    (m) => (!isEditing || m.id !== member?.id) && m.gender !== formData.gender
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>
            {isEditing ? 'Edit Anggota Keluarga' : 'Tambah Anggota Keluarga'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Dasar</TabsTrigger>
                <TabsTrigger value="relations">Keluarga</TabsTrigger>
                <TabsTrigger value="social">Sosial</TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="max-h-[calc(90vh-250px)]">
              <div className="p-6">
                <TabsContent value="basic" className="mt-0 space-y-4">
                  {/* Photo Upload */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                        <AvatarImage src={photoPreview || undefined} />
                        <AvatarFallback className={cn(
                          'text-2xl font-bold',
                          formData.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                        )}>
                          {formData.full_name ? getInitials(formData.full_name) : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <label className="absolute -bottom-1 -right-1 p-2 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-md">
                        <Camera className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoChange}
                        />
                      </label>
                    </div>
                    <p className="text-sm text-gray-500">Klik ikon kamera untuk upload foto</p>
                  </div>

                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="full_name">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <Label>Jenis Kelamin <span className="text-red-500">*</span></Label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleInputChange('gender', 'male')}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all',
                          formData.gender === 'male'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <User className="w-5 h-5" />
                        Laki-laki
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInputChange('gender', 'female')}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all',
                          formData.gender === 'female'
                            ? 'border-pink-500 bg-pink-50 text-pink-700'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <UserCircle className="w-5 h-5" />
                        Perempuan
                      </button>
                    </div>
                  </div>

                  {/* Birth Date */}
                  <div className="space-y-2">
                    <Label htmlFor="birth_date">Tanggal Lahir</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => handleInputChange('birth_date', e.target.value)}
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alive">Masih Hidup</SelectItem>
                        <SelectItem value="deceased">Meninggal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Death Date (if deceased) */}
                  {formData.status === 'deceased' && (
                    <div className="space-y-2">
                      <Label htmlFor="death_date">Tanggal Meninggal</Label>
                      <Input
                        id="death_date"
                        type="date"
                        value={formData.death_date}
                        onChange={(e) => handleInputChange('death_date', e.target.value)}
                      />
                    </div>
                  )}

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Biografi</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Ceritakan sedikit tentang orang ini..."
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="relations" className="mt-0 space-y-4">
                  {/* Father */}
                  <div className="space-y-2">
                    <Label htmlFor="father_id">Ayah</Label>
                    <Select
                      value={formData.father_id}
                      onValueChange={(value) => handleInputChange('father_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih ayah" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Tidak ada</SelectItem>
                        {potentialFathers.map((father) => (
                          <SelectItem key={father.id} value={father.id}>
                            {father.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Mother */}
                  <div className="space-y-2">
                    <Label htmlFor="mother_id">Ibu</Label>
                    <Select
                      value={formData.mother_id}
                      onValueChange={(value) => handleInputChange('mother_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih ibu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Tidak ada</SelectItem>
                        {potentialMothers.map((mother) => (
                          <SelectItem key={mother.id} value={mother.id}>
                            {mother.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Spouse */}
                  <div className="space-y-2">
                    <Label htmlFor="spouse_id">Pasangan</Label>
                    <Select
                      value={formData.spouse_id}
                      onValueChange={(value) => handleInputChange('spouse_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih pasangan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Tidak ada</SelectItem>
                        {potentialSpouses.map((spouse) => (
                          <SelectItem key={spouse.id} value={spouse.id}>
                            {spouse.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="social" className="mt-0 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={formData.facebook}
                      onChange={(e) => handleInputChange('facebook', e.target.value)}
                      placeholder="https://facebook.com/username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={formData.instagram}
                      onChange={(e) => handleInputChange('instagram', e.target.value)}
                      placeholder="https://instagram.com/username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      value={formData.twitter}
                      onChange={(e) => handleInputChange('twitter', e.target.value)}
                      placeholder="https://twitter.com/username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={formData.linkedin}
                      onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={formData.whatsapp}
                      onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                      placeholder="https://wa.me/6281234567890"
                    />
                  </div>
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>

          <DialogFooter className="p-6 pt-0 gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? 'Simpan Perubahan' : 'Tambah Anggota'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default MemberForm;
