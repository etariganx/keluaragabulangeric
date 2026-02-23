// ============================================
// MEMBER DETAIL COMPONENT
// ============================================

import type { FamilyMember } from '@/types';
import { Gender, Status } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  User,
  UserCircle,
  Calendar,
  Heart,
  MapPin,
  Edit2,
  Trash2,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  MessageCircle,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MemberDetailProps {
  member: FamilyMember | null;
  relations?: {
    father: FamilyMember | null;
    mother: FamilyMember | null;
    spouse: FamilyMember | null;
    children: FamilyMember[];
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewRelation?: (member: FamilyMember) => void;
}

export function MemberDetail({
  member,
  relations,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onViewRelation,
}: MemberDetailProps) {
  const { checkPermission } = useAuth();
  
  if (!member) return null;

  const permissions = checkPermission(member.id);

  const getGenderIcon = () => {
    return member.gender === Gender.MALE ? (
      <User className="w-5 h-5 text-blue-500" />
    ) : (
      <UserCircle className="w-5 h-5 text-pink-500" />
    );
  };

  const getGenderLabel = () => {
    return member.gender === Gender.MALE ? 'Laki-laki' : 'Perempuan';
  };

  const getStatusBadge = () => {
    if (member.status === Status.DECEASED) {
      return (
        <Badge variant="secondary" className="bg-gray-200 text-gray-700">
          <Heart className="w-3 h-3 mr-1" />
          Alm/Almh
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="bg-green-100 text-green-700">
        <Heart className="w-3 h-3 mr-1 fill-current" />
        Masih Hidup
      </Badge>
    );
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
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const calculateAge = () => {
    if (!member.birth_date) return null;
    
    const end = member.death_date ? new Date(member.death_date) : new Date();
    const birth = new Date(member.birth_date);
    let age = end.getFullYear() - birth.getFullYear();
    const monthDiff = end.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const age = calculateAge();

  const socialLinks = [
    { key: 'facebook', icon: Facebook, label: 'Facebook', color: 'text-blue-600' },
    { key: 'instagram', icon: Instagram, label: 'Instagram', color: 'text-pink-600' },
    { key: 'twitter', icon: Twitter, label: 'Twitter', color: 'text-sky-500' },
    { key: 'linkedin', icon: Linkedin, label: 'LinkedIn', color: 'text-blue-700' },
    { key: 'whatsapp', icon: MessageCircle, label: 'WhatsApp', color: 'text-green-500' },
  ];

  interface RelationCardProps {
    title: string;
    member: FamilyMember | null;
    icon: React.ElementType;
  }

  const RelationCard = ({ title, member: relationMember, icon: Icon }: RelationCardProps) => {
    if (!relationMember) return null;

    return (
      <div 
        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
        onClick={() => onViewRelation?.(relationMember)}
      >
        <Avatar className="w-10 h-10">
          <AvatarImage src={relationMember.photo_url || undefined} />
          <AvatarFallback className={cn(
            'text-xs',
            relationMember.gender === Gender.MALE ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
          )}>
            {getInitials(relationMember.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {relationMember.full_name}
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Icon className="w-3 h-3" />
            {title}
          </p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start gap-4">
            <Avatar className={cn(
              'w-20 h-20 border-4 border-white shadow-lg',
              member.status === Status.DECEASED && 'grayscale'
            )}>
              <AvatarImage src={member.photo_url || undefined} alt={member.full_name} />
              <AvatarFallback className={cn(
                'text-xl font-bold',
                member.gender === Gender.MALE ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
              )}>
                {getInitials(member.full_name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-bold leading-tight mb-1">
                {member.full_name}
              </DialogTitle>
              <div className="flex items-center gap-2 mb-2">
                {getGenderIcon()}
                <span className="text-sm text-gray-600">{getGenderLabel()}</span>
              </div>
              {getStatusBadge()}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <div className="p-6 space-y-6">
            {/* Birth Info */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                Informasi Lahir
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Tanggal Lahir</p>
                  <p className="font-medium">{formatDate(member.birth_date)}</p>
                </div>
                {age !== null && (
                  <div>
                    <p className="text-gray-500 mb-1">
                      {member.status === Status.DECEASED ? 'Usia Saat Meninggal' : 'Usia'}
                    </p>
                    <p className="font-medium">{age} tahun</p>
                  </div>
                )}
              </div>
            </div>

            {/* Death Info */}
            {member.death_date && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-gray-500" />
                    Informasi Meninggal
                  </h4>
                  <div className="text-sm">
                    <p className="text-gray-500 mb-1">Tanggal Meninggal</p>
                    <p className="font-medium">{formatDate(member.death_date)}</p>
                  </div>
                </div>
              </>
            )}

            {/* Bio */}
            {member.bio && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    Biografi
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </>
            )}

            {/* Relations */}
            {relations && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    Hubungan Keluarga
                  </h4>
                  <div className="space-y-2">
                    {relations.father && (
                      <RelationCard 
                        title="Ayah" 
                        member={relations.father} 
                        icon={User}
                      />
                    )}
                    {relations.mother && (
                      <RelationCard 
                        title="Ibu" 
                        member={relations.mother} 
                        icon={UserCircle}
                      />
                    )}
                    {relations.spouse && (
                      <RelationCard 
                        title={relations.spouse.gender === Gender.MALE ? 'Suami' : 'Istri'} 
                        member={relations.spouse} 
                        icon={Heart}
                      />
                    )}
                    {relations.children.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-2">
                          Anak ({relations.children.length})
                        </p>
                        <div className="space-y-2">
                          {relations.children.map((child) => (
                            <RelationCard
                              key={child.id}
                              title={child.gender === Gender.MALE ? 'Anak Laki-laki' : 'Anak Perempuan'}
                              member={child}
                              icon={child.gender === Gender.MALE ? User : UserCircle}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Social Media */}
            {member.social_media && Object.values(member.social_media).some(Boolean) && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900">
                    Media Sosial
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {socialLinks.map(({ key, icon: Icon, label, color }) => {
                      const url = member.social_media?.[key as keyof typeof member.social_media];
                      if (!url) return null;
                      
                      return (
                        <a
                          key={key}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors',
                            color
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-sm">{label}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <DialogFooter className="p-6 pt-0 gap-2">
          {permissions.canEdit && onEdit && (
            <Button variant="outline" onClick={onEdit} className="flex-1">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
          {permissions.canDelete && onDelete && (
            <Button variant="destructive" onClick={onDelete} className="flex-1">
              <Trash2 className="w-4 h-4 mr-2" />
              Hapus
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MemberDetail;
