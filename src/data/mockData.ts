// ============================================
// MOCK DATA FOR DEVELOPMENT
// ============================================

import type { FamilyMember, User } from '@/types';
import { Gender, Status, UserRole } from '@/types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@familytree.com',
    full_name: 'Super Admin',
    role: UserRole.SUPER_ADMIN,
    avatar_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    last_sign_in_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    email: 'budi@familytree.com',
    full_name: 'Budi Santoso',
    role: UserRole.ADMIN,
    family_member_id: 'm1',
    avatar_url: null,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    last_sign_in_at: '2024-01-14T08:30:00Z',
  },
];

// Mock Family Members - Sample Family Tree
export const mockFamilyMembers: FamilyMember[] = [
  // Generation 1 (Grandparents)
  {
    id: 'g1',
    full_name: 'Haji Ahmad Sudirman',
    gender: Gender.MALE,
    birth_date: '1940-05-15',
    death_date: '2010-03-20',
    status: Status.DECEASED,
    bio: 'Pendiri keluarga Sudirman. Dulu bekerja sebagai guru honorer.',
    photo_url: null,
    father_id: null,
    mother_id: null,
    spouse_id: 'g2',
    created_by: '1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    social_media: {},
  },
  {
    id: 'g2',
    full_name: 'Hajah Siti Aminah',
    gender: Gender.FEMALE,
    birth_date: '1945-08-22',
    death_date: null,
    status: Status.ALIVE,
    bio: 'Ibu dari 5 anak. Sekarang tinggal di Jakarta.',
    photo_url: null,
    father_id: null,
    mother_id: null,
    spouse_id: 'g1',
    created_by: '1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    social_media: {},
  },

  // Generation 2 (Parents)
  {
    id: 'p1',
    full_name: 'Budi Santoso',
    gender: Gender.MALE,
    birth_date: '1965-03-10',
    death_date: null,
    status: Status.ALIVE,
    bio: 'PNS di Departemen Pendidikan. Hobi memancing.',
    photo_url: null,
    father_id: 'g1',
    mother_id: 'g2',
    spouse_id: 'p2',
    created_by: '1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    social_media: {
      facebook: 'https://facebook.com/budi.santoso',
    },
  },
  {
    id: 'p2',
    full_name: 'Dewi Kusuma',
    gender: Gender.FEMALE,
    birth_date: '1968-07-25',
    death_date: null,
    status: Status.ALIVE,
    bio: 'Ibu rumah tangga. Jago masak rendang.',
    photo_url: null,
    father_id: null,
    mother_id: null,
    spouse_id: 'p1',
    created_by: '1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    social_media: {
      instagram: 'https://instagram.com/dewikusuma',
    },
  },
  {
    id: 'p3',
    full_name: 'Ani Wijaya',
    gender: Gender.FEMALE,
    birth_date: '1970-11-12',
    death_date: null,
    status: Status.ALIVE,
    bio: 'Dokter spesialis anak. Praktek di RS Medika.',
    photo_url: null,
    father_id: 'g1',
    mother_id: 'g2',
    spouse_id: 'p4',
    created_by: '1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    social_media: {},
  },
  {
    id: 'p4',
    full_name: 'Dedi Wijaya',
    gender: Gender.MALE,
    birth_date: '1967-09-05',
    death_date: null,
    status: Status.ALIVE,
    bio: 'Pengusaha property.',
    photo_url: null,
    father_id: null,
    mother_id: null,
    spouse_id: 'p3',
    created_by: '1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    social_media: {
      linkedin: 'https://linkedin.com/in/dediwijaya',
    },
  },

  // Generation 3 (Children)
  {
    id: 'c1',
    full_name: 'Rina Santoso',
    gender: Gender.FEMALE,
    birth_date: '1990-04-18',
    death_date: null,
    status: Status.ALIVE,
    bio: 'Software engineer di Jakarta. Suka traveling.',
    photo_url: null,
    father_id: 'p1',
    mother_id: 'p2',
    spouse_id: 'c2',
    created_by: '1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    social_media: {
      instagram: 'https://instagram.com/rinas',
      linkedin: 'https://linkedin.com/in/rinas',
    },
  },
  {
    id: 'c2',
    full_name: 'Agus Pratama',
    gender: Gender.MALE,
    birth_date: '1988-12-03',
    death_date: null,
    status: Status.ALIVE,
    bio: 'Marketing manager. Hobi fotografi.',
    photo_url: null,
    father_id: null,
    mother_id: null,
    spouse_id: 'c1',
    created_by: '1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    social_media: {
      instagram: 'https://instagram.com/aguspratama',
    },
  },
  {
    id: 'c3',
    full_name: 'Dian Santoso',
    gender: Gender.FEMALE,
    birth_date: '1993-09-22',
    death_date: null,
    status: Status.ALIVE,
    bio: 'Mahasiswa S2 di Australia.',
    photo_url: null,
    father_id: 'p1',
    mother_id: 'p2',
    spouse_id: null,
    created_by: '1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    social_media: {},
  },
  {
    id: 'c4',
    full_name: 'Bayu Wijaya',
    gender: Gender.MALE,
    birth_date: '1995-06-30',
    death_date: null,
    status: Status.ALIVE,
    bio: 'Atlet badminton. pernah juara provinsi.',
    photo_url: null,
    father_id: 'p4',
    mother_id: 'p3',
    spouse_id: null,
    created_by: '1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    social_media: {
      instagram: 'https://instagram.com/bayuw',
    },
  },
  {
    id: 'c5',
    full_name: 'Citra Wijaya',
    gender: Gender.FEMALE,
    birth_date: '1998-02-14',
    death_date: null,
    status: Status.ALIVE,
    bio: 'Desainer grafis. Freelancer.',
    photo_url: null,
    father_id: 'p4',
    mother_id: 'p3',
    spouse_id: null,
    created_by: '1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    social_media: {
      instagram: 'https://instagram.com/citraw',
      twitter: 'https://twitter.com/citraw',
    },
  },

  // Generation 4 (Grandchildren)
  {
    id: 'gc1',
    full_name: 'Alya Pratama',
    gender: Gender.FEMALE,
    birth_date: '2015-08-08',
    death_date: null,
    status: Status.ALIVE,
    bio: 'Anak pertama Rina dan Agus. Sekolah SD. Suka menari.',
    photo_url: null,
    father_id: 'c2',
    mother_id: 'c1',
    spouse_id: null,
    created_by: '1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    social_media: {},
  },
  {
    id: 'gc2',
    full_name: 'Reza Pratama',
    gender: Gender.MALE,
    birth_date: '2018-11-20',
    death_date: null,
    status: Status.ALIVE,
    bio: 'Anak kedua. Masih TK. Suka main mobil-mobilan.',
    photo_url: null,
    father_id: 'c2',
    mother_id: 'c1',
    spouse_id: null,
    created_by: '1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    social_media: {},
  },
];

// Helper function to get member by ID
export const getMemberById = (id: string): FamilyMember | undefined => {
  return mockFamilyMembers.find((m) => m.id === id);
};

// Helper function to get children of a member
export const getChildren = (parentId: string): FamilyMember[] => {
  return mockFamilyMembers.filter(
    (m) => m.father_id === parentId || m.mother_id === parentId
  );
};

// Helper function to get spouse
export const getSpouse = (memberId: string): FamilyMember | undefined => {
  const member = getMemberById(memberId);
  if (member?.spouse_id) {
    return getMemberById(member.spouse_id);
  }
  return undefined;
};

// Helper function to get siblings
export const getSiblings = (memberId: string): FamilyMember[] => {
  const member = getMemberById(memberId);
  if (!member) return [];
  
  return mockFamilyMembers.filter(
    (m) =>
      m.id !== memberId &&
      ((m.father_id && m.father_id === member.father_id) ||
        (m.mother_id && m.mother_id === member.mother_id))
  );
};

// Helper function to calculate generation level
export const calculateGeneration = (memberId: string): number => {
  let generation = 1;
  let member = getMemberById(memberId);
  
  while (member) {
    const parent = mockFamilyMembers.find(
      (m) => m.id === member?.father_id || m.id === member?.mother_id
    );
    if (parent) {
      generation++;
      member = parent;
    } else {
      break;
    }
  }
  
  return generation;
};

// Export for development use
export const useMockData = () => {
  return {
    members: mockFamilyMembers,
    users: mockUsers,
    getMemberById,
    getChildren,
    getSpouse,
    getSiblings,
    calculateGeneration,
  };
};
