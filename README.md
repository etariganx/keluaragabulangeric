# 🌳 Family Tree App

Aplikasi web modern untuk menyimpan dan menvisualisasikan silsilah keluarga dengan fitur lengkap dan antarmuka yang intuitif.

![Family Tree Preview](https://via.placeholder.com/800x400?text=Family+Tree+App)

## ✨ Fitur Utama

### 👥 Manajemen Anggota Keluarga
- ✅ Tambah, edit, dan hapus anggota keluarga
- ✅ Upload foto profil
- ✅ Informasi lengkap: nama, gender, tanggal lahir, status, bio
- ✅ Link sosial media (Facebook, Instagram, Twitter, LinkedIn, WhatsApp)

### 🌲 Visualisasi Pohon Keluarga
- ✅ Tampilan pohon keluarga horizontal interaktif
- ✅ Zoom dan pan untuk navigasi
- ✅ Klik anggota untuk lihat detail
- ✅ Mode compact untuk tampilan ringkas
- ✅ Responsive design untuk mobile

### 🔐 Sistem Autentikasi & Role
- ✅ Login dengan email/password
- ✅ Login dengan Google OAuth
- ✅ 4 level role:
  - **Super Admin**: Akses penuh ke sistem
  - **Admin**: Kelola data keluarga
  - **Parent**: Tambah keturunan langsung
  - **Member**: View only

### 📱 User Experience
- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Dark mode support
- ✅ Pencarian anggota
- ✅ Filter dan sorting
- ✅ Real-time updates

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React + TypeScript + Vite |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Backend** | Supabase (PostgreSQL + Auth) |
| **Storage** | Supabase Storage |
| **Deployment** | Vercel |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm atau yarn
- Akun Supabase

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/family-tree-app.git
cd family-tree-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
cp .env.example .env
```

Edit `.env` dengan konfigurasi Supabase Anda:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Setup Database
1. Buka Supabase Dashboard
2. Buka SQL Editor
3. Jalankan query dari file `docs/database-schema.sql`

### 5. Run Development Server
```bash
npm run dev
```

Buka http://localhost:5173 di browser.

## 📁 Project Structure

```
family-tree-app/
├── docs/                      # Dokumentasi
│   ├── database-schema.sql   # Skema database
│   ├── DEPLOYMENT.md         # Panduan deploy
│   └── API_DOCUMENTATION.md  # Dokumentasi API
├── public/                    # Static assets
├── src/
│   ├── components/           # React components
│   │   ├── family-tree/     # Komponen pohon keluarga
│   │   ├── forms/           # Form components
│   │   ├── layout/          # Layout components
│   │   └── ui/              # UI components (shadcn)
│   ├── context/             # React Context
│   │   ├── AuthContext.tsx  # Autentikasi state
│   │   └── FamilyContext.tsx # Keluarga state
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utility functions
│   ├── pages/               # Page components
│   │   ├── HomePage.tsx
│   │   ├── TreePage.tsx
│   │   ├── MembersPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── AdminPage.tsx
│   ├── services/            # API services
│   │   └── supabase.ts      # Supabase client
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── .env.example             # Environment template
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🗄️ Database Schema

### Tables

#### `users`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (from auth.users) |
| email | VARCHAR | User email |
| full_name | VARCHAR | User full name |
| role | ENUM | super_admin, admin, parent, member |
| family_member_id | UUID | Link to family_members |
| avatar_url | TEXT | Profile photo URL |

#### `family_members`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| full_name | VARCHAR | Member name |
| gender | ENUM | male, female |
| birth_date | DATE | Date of birth |
| death_date | DATE | Date of death (if deceased) |
| status | ENUM | alive, deceased |
| bio | TEXT | Biography |
| photo_url | TEXT | Photo URL |
| father_id | UUID | Reference to father |
| mother_id | UUID | Reference to mother |
| spouse_id | UUID | Reference to spouse |
| created_by | UUID | Who created this record |

#### `social_media_links`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| member_id | UUID | Reference to family_members |
| platform | VARCHAR | facebook, instagram, etc |
| url | TEXT | Social media URL |

## 🔐 Role-Based Access Control

| Permission | Super Admin | Admin | Parent | Member |
|------------|-------------|-------|--------|--------|
| View tree | ✅ | ✅ | ✅ | ✅ |
| Create member | ✅ | ✅ | ✅ | ❌ |
| Edit any member | ✅ | ✅ | ❌ | ❌ |
| Edit own/descendants | ✅ | ✅ | ✅ | ❌ |
| Delete member | ✅ | ✅ | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ | ❌ |

## 🚀 Deployment

### Deploy ke Vercel (Gratis)

#### Cara 1: Via GitHub (Recommended)
1. Push code ke GitHub
2. Buka https://vercel.com
3. Login dengan GitHub
4. Click "New Project"
5. Import repository
6. Add environment variables
7. Deploy!

#### Cara 2: Via Vercel CLI
```bash
npm i -g vercel
vercel
```

📖 [Panduan Deploy Lengkap](docs/DEPLOYMENT.md)

## 📱 Mobile-First Design

Aplikasi ini didesain dengan pendekatan mobile-first:
- ✅ Touch-friendly interface
- ✅ Responsive breakpoints
- ✅ Optimized images
- ✅ Fast loading on mobile networks

## 🔧 Customization

### Theming
Edit `tailwind.config.js` untuk mengubah warna:
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#your-color',
        dark: '#your-dark-color',
      }
    }
  }
}
```

### Adding New Fields
1. Update database schema
2. Update types in `src/types/index.ts`
3. Update form in `src/components/forms/MemberForm.tsx`
4. Update display components

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e
```

## 📈 Performance

- Lighthouse Score: 95+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Bundle size: < 200KB (gzipped)

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/nama-fitur`
3. Commit changes: `git commit -m 'Add: nama fitur'`
4. Push to branch: `git push origin feature/nama-fitur`
5. Submit Pull Request

## 📝 License

MIT License - lihat [LICENSE](LICENSE) untuk detail.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com) - UI Components
- [Supabase](https://supabase.com) - Backend & Database
- [Vercel](https://vercel.com) - Hosting
- [Tailwind CSS](https://tailwindcss.com) - Styling

## 📞 Support

Jika ada pertanyaan atau masalah:
1. Buka [GitHub Issues](https://github.com/yourusername/family-tree-app/issues)
2. Email: support@familytree.app
3. Discord: [Join Server](https://discord.gg/familytree)

---

<p align="center">
  Made with ❤️ for families everywhere
</p>
