// ============================================
// FAMILY NODE COMPONENT
// ============================================

import type { FamilyMember } from '@/types';
import { Gender, Status } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  UserCircle, 
  Heart, 
  Calendar, 
  Edit2, 
  Trash2, 
  Plus,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface FamilyNodeProps {
  member: FamilyMember;
  isSelected?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAddChild?: () => void;
  onAddSpouse?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function FamilyNode({
  member,
  isSelected = false,
  onClick,
  onEdit,
  onDelete,
  onAddChild,
  onAddSpouse,
  className,
  style,
}: FamilyNodeProps) {
  const { checkPermission } = useAuth();
  const permissions = checkPermission(member.id);

  const getGenderIcon = () => {
    return member.gender === Gender.MALE ? (
      <User className="w-4 h-4 text-blue-500" />
    ) : (
      <UserCircle className="w-4 h-4 text-pink-500" />
    );
  };

  const getStatusBadge = () => {
    if (member.status === Status.DECEASED) {
      return (
        <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-600">
          Alm
        </Badge>
      );
    }
    return null;
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
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const calculateAge = (birthDate?: string | null, deathDate?: string | null) => {
    if (!birthDate) return null;
    
    const end = deathDate ? new Date(deathDate) : new Date();
    const birth = new Date(birthDate);
    let age = end.getFullYear() - birth.getFullYear();
    const monthDiff = end.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const age = calculateAge(member.birth_date, member.death_date);

  return (
    <Card
      onClick={onClick}
      className={cn(
        'relative w-56 p-4 cursor-pointer transition-all duration-200 hover:shadow-lg',
        'border-2',
        isSelected 
          ? 'border-primary shadow-lg ring-2 ring-primary/20' 
          : 'border-transparent hover:border-primary/30',
        member.status === Status.DECEASED && 'opacity-75',
        className
      )}
      style={style}
    >
      {/* Actions Menu */}
      {permissions.canEdit && (
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {onEdit && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {onAddChild && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAddChild(); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Anak
                </DropdownMenuItem>
              )}
              {onAddSpouse && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAddSpouse(); }}>
                  <Heart className="w-4 h-4 mr-2" />
                  Tambah Pasangan
                </DropdownMenuItem>
              )}
              {permissions.canDelete && onDelete && (
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="w-14 h-14 border-2 border-white shadow-md">
          <AvatarImage src={member.photo_url || undefined} alt={member.full_name} />
          <AvatarFallback className={cn(
            'text-sm font-semibold',
            member.gender === Gender.MALE ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
          )}>
            {getInitials(member.full_name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-center gap-1 mb-1">
            {getGenderIcon()}
            {getStatusBadge()}
          </div>
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">
            {member.full_name}
          </h3>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1.5 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span>
            {formatDate(member.birth_date)}
            {age !== null && (
              <span className="text-gray-400 ml-1">
                ({age} th)
              </span>
            )}
          </span>
        </div>
        
        {member.death_date && (
          <div className="flex items-center gap-2 text-gray-500">
            <Heart className="w-3.5 h-3.5" />
            <span>{formatDate(member.death_date)}</span>
          </div>
        )}
      </div>

      {/* Bio Preview */}
      {member.bio && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 line-clamp-2">
            {member.bio}
          </p>
        </div>
      )}
    </Card>
  );
}

// Compact version for tree view
interface FamilyNodeCompactProps {
  member: FamilyMember;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function FamilyNodeCompact({
  member,
  isSelected = false,
  onClick,
  className,
  style,
}: FamilyNodeCompactProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 p-2 rounded-lg cursor-pointer transition-all',
        'hover:bg-gray-50',
        isSelected && 'bg-primary/5 ring-2 ring-primary',
        className
      )}
      style={style}
    >
      <Avatar className={cn(
        'w-16 h-16 border-3 shadow-md transition-transform hover:scale-105',
        isSelected ? 'border-primary' : 'border-white',
        member.status === Status.DECEASED && 'grayscale'
      )}>
        <AvatarImage src={member.photo_url || undefined} alt={member.full_name} />
        <AvatarFallback className={cn(
          'text-sm font-bold',
          member.gender === Gender.MALE ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
        )}>
          {getInitials(member.full_name)}
        </AvatarFallback>
      </Avatar>
      
      <div className="text-center">
        <p className={cn(
          'text-xs font-medium max-w-[100px] truncate',
          isSelected ? 'text-primary' : 'text-gray-700'
        )}>
          {member.full_name}
        </p>
        {member.birth_date && (
          <p className="text-[10px] text-gray-400">
            {new Date(member.birth_date).getFullYear()}
          </p>
        )}
      </div>
    </div>
  );
}

export default FamilyNode;
