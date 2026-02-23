// ============================================
// HELPER UTILITIES
// ============================================

import type { FamilyMember } from '@/types';

/**
 * Format date to Indonesian locale
 */
export const formatDate = (dateString?: string | null, options?: Intl.DateTimeFormatOptions): string => {
  if (!dateString) return '-';
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  };
  
  return new Date(dateString).toLocaleDateString('id-ID', defaultOptions);
};

/**
 * Format date to short format (DD MMM YYYY)
 */
export const formatDateShort = (dateString?: string | null): string => {
  if (!dateString) return '-';
  
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Calculate age from birth date
 */
export const calculateAge = (birthDate?: string | null, deathDate?: string | null): number | null => {
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

/**
 * Get age with label (e.g., "25 tahun")
 */
export const getAgeLabel = (birthDate?: string | null, deathDate?: string | null): string => {
  const age = calculateAge(birthDate, deathDate);
  if (age === null) return '-';
  return `${age} tahun`;
};

/**
 * Get initials from name
 */
export const getInitials = (name: string, maxLength: number = 2): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, maxLength);
};

/**
 * Get gender label in Indonesian
 */
export const getGenderLabel = (gender: string): string => {
  switch (gender) {
    case 'male':
      return 'Laki-laki';
    case 'female':
      return 'Perempuan';
    default:
      return '-';
  }
};

/**
 * Get status label in Indonesian
 */
export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'alive':
      return 'Masih Hidup';
    case 'deceased':
      return 'Meninggal';
    default:
      return '-';
  }
};

/**
 * Get relationship label
 */
export const getRelationshipLabel = (relationship: string): string => {
  const labels: Record<string, string> = {
    father: 'Ayah',
    mother: 'Ibu',
    spouse: 'Pasangan',
    child: 'Anak',
    sibling: 'Saudara',
    grandfather: 'Kakek',
    grandmother: 'Nenek',
    grandson: 'Cucu Laki-laki',
    granddaughter: 'Cucu Perempuan',
    uncle: 'Paman',
    aunt: 'Bibi',
    cousin: 'Sepupu',
  };
  
  return labels[relationship] || relationship;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Indonesian format)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
  return phoneRegex.test(phone);
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Generate random ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Debounce function
 */
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  wait: number
): ((...args: Parameters<F>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<F>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function
 */
export const throttle = <F extends (...args: any[]) => any>(
  func: F,
  limit: number
): ((...args: Parameters<F>) => void) => {
  let inThrottle = false;
  
  return (...args: Parameters<F>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Group array by key
 */
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

/**
 * Sort array by date
 */
export const sortByDate = <T extends { [key: string]: any }>(
  array: T[],
  key: keyof T,
  direction: 'asc' | 'desc' = 'desc'
): T[] => {
  return [...array].sort((a, b) => {
    const dateA = new Date(a[key]).getTime();
    const dateB = new Date(b[key]).getTime();
    return direction === 'asc' ? dateA - dateB : dateB - dateA;
  });
};

/**
 * Build family tree hierarchy
 */
export const buildFamilyTree = (members: FamilyMember[]) => {
  const memberMap = new Map(members.map((m) => [m.id, { ...m, children: [] as string[] }]));
  const roots: string[] = [];
  
  members.forEach((member) => {
    const node = memberMap.get(member.id);
    if (node) {
      if (member.father_id && memberMap.has(member.father_id)) {
        memberMap.get(member.father_id)?.children.push(member.id);
      }
      if (member.mother_id && memberMap.has(member.mother_id)) {
        memberMap.get(member.mother_id)?.children.push(member.id);
      }
      if (!member.father_id && !member.mother_id) {
        roots.push(member.id);
      }
    }
  });
  
  return { nodes: Object.fromEntries(memberMap), roots };
};

/**
 * Get generation level of a member
 */
export const getGenerationLevel = (
  memberId: string,
  members: FamilyMember[],
  visited: Set<string> = new Set()
): number => {
  if (visited.has(memberId)) return 0;
  visited.add(memberId);
  
  const member = members.find((m) => m.id === memberId);
  if (!member) return 0;
  
  if (!member.father_id && !member.mother_id) return 1;
  
  const fatherGen = member.father_id
    ? getGenerationLevel(member.father_id, members, visited)
    : 0;
  const motherGen = member.mother_id
    ? getGenerationLevel(member.mother_id, members, visited)
    : 0;
  
  return Math.max(fatherGen, motherGen) + 1;
};

/**
 * Download data as JSON file
 */
export const downloadJSON = (data: any, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Parse CSV to array
 */
export const parseCSV = (csv: string): Record<string, string>[] => {
  const lines = csv.split('\n');
  const headers = lines[0].split(',').map((h) => h.trim());
  
  return lines.slice(1).map((line) => {
    const values = line.split(',');
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index]?.trim() || '';
      return obj;
    }, {} as Record<string, string>);
  });
};

/**
 * Convert array to CSV
 */
export const convertToCSV = (data: Record<string, any>[]): string => {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(',')
    ),
  ];
  
  return csvRows.join('\n');
};

/**
 * Local storage helpers
 */
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
  
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};
