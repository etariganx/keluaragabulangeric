# 📖 PANDUAN LENGKAP UNTUK PEMULA
## Deploy Family Tree App dengan HP/Android

---

## 🎯 APA YANG AKAN KITA LAKUKAN?

Kita akan membuat website Family Tree (Pohon Keluarga) yang bisa diakses dari internet. Prosesnya ada 3 bagian besar:

1. **Setup Database** (tempat menyimpan data) → Supabase
2. **Upload Kode** → GitHub
3. **Deploy Website** → Vercel

**Estimasi waktu:** 30-45 menit

---

## 📋 PERSIAPAN SEBELUM MULAI

### Yang Perlu Disiapkan:
- [ ] HP/Android dengan koneksi internet
- [ ] Browser Chrome/Safari (disarankan Chrome)
- [ ] Email aktif (Gmail lebih baik)
- [ ] Semangat! 😊

### Catatan Penting:
> 📝 **Simpan semua data yang diberikan** di notepad/catatan HP Anda. Kita akan menggunakan banyak "kunci" dan "password" nanti.

---

## BAGIAN 1: SETUP DATABASE (SUPABASE)

### Langkah 1.1 - Daftar Akun Supabase

1. **Buka browser HP**, ketik: `https://supabase.com`
2. Klik tombol **"Start your project"** (biasanya warna hijau)
3. Pilih **"Continue with GitHub"**
   - Jika belum punya GitHub, pilih "Sign up" dulu
   - Ikuti proses pendaftaran GitHub (gratis)
4. Setelah login, Anda akan masuk ke dashboard Supabase

### Langkah 1.2 - Buat Project Baru

1. Di dashboard Supabase, klik tombol **"New Project"** (tombol hijau)
2. Isi form berikut:
   
   | Field | Isi dengan |
   |-------|-----------|
   | **Organization** | Pilih "Personal" (default) |
   | **Project name** | `family-tree-db` |
   | **Database password** | Buat password kuat, contoh: `FamilyTree2024!@#` |
   | **Region** | Pilih `Southeast Asia (Singapore)` |

3. ✅ Centang "I accept the Terms of Service"
4. Klik **"Create new project"**
5. Tunggu sekitar **2 menit** sampai project siap

> ⏳ **TIPS:** Jangan tutup browser saat menunggu!

### Langkah 1.3 - Jalankan Skema Database

1. Setelah project siap, lihat menu di **sebelah kiri**
2. Klik **"SQL Editor"** (ikon dokumen)
3. Klik tombol **"New query"** (tombol biru)
4. Anda akan melihat text area kosong
5. **Copy kode di bawah ini** (dari file `docs/database-schema.sql`):

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'parent', 'member');
CREATE TYPE gender_type AS ENUM ('male', 'female');
CREATE TYPE status_type AS ENUM ('alive', 'deceased');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'member',
    family_member_id UUID,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_sign_in_at TIMESTAMP WITH TIME ZONE
);

-- Family members table
CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    gender gender_type NOT NULL,
    birth_date DATE,
    death_date DATE,
    status status_type NOT NULL DEFAULT 'alive',
    bio TEXT,
    photo_url TEXT,
    father_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
    mother_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
    spouse_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social media links table
CREATE TABLE social_media_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(member_id, platform)
);

-- Activity logs table
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view family members" ON family_members FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create members" ON family_members FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Creator can update own members" ON family_members FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Anyone can view social media" ON social_media_links FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage social media" ON social_media_links FOR ALL USING (auth.uid() IS NOT NULL);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON family_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_media_links_updated_at BEFORE UPDATE ON social_media_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

6. **Paste kode di atas** ke text area SQL Editor
7. Klik tombol **"Run"** (ikon play ▶️ di pojok kanan bawah)
8. Tunggu sampai muncul pesan "Success" ✅

### Langkah 1.4 - Ambil Kunci API (PENTING!)

1. Di menu sebelah kiri, klik **"Project Settings"** (ikon gear ⚙️)
2. Klik **"API"**
3. Anda akan melihat beberapa informasi, **catat/salin** yang berikut:

   | Informasi | Contoh | Catat di |
   |-----------|--------|----------|
   | **Project URL** | `https://abc123.supabase.co` | Notepad HP |
   | **anon public** | `eyJhbGciOiJIUzI1NiIs...` | Notepad HP |

> ⚠️ **PENTING:** Jangan bagikan "anon public" ke siapapun! Ini seperti password.

### Langkah 1.5 - Setup Storage (Untuk Foto)

1. Di menu sebelah kiri, klik **"Storage"**
2. Klik **"New bucket"**
3. Isi:
   - **Name:** `family-tree`
   - ✅ Centang "Public bucket"
4. Klik **"Create bucket"**

---

## BAGIAN 2: UPLOAD KE GITHUB

### Langkah 2.1 - Daftar GitHub (Jika Belum Punya)

1. Buka browser, ketik: `https://github.com`
2. Klik **"Sign up"**
3. Isi:
   - Email: (email Anda)
   - Password: (buat password)
   - Username: (contoh: `familytree-admin`)
4. Verifikasi email
5. Selesaikan proses pendaftaran

### Langkah 2.2 - Buat Repository Baru

1. Login ke GitHub
2. Klik tombol **"+"** (pojok kanan atas)
3. Pilih **"New repository"**
4. Isi form:
   - **Repository name:** `family-tree-app`
   - **Description:** `Aplikasi Pohon Keluarga Digital`
   - ✅ Pilih **"Public"**
   - ☐ Jangan centang "Add a README file"
5. Klik **"Create repository"**

### Langkah 2.3 - Upload File Project

**Cara 1: Via GitHub Mobile App (Lebih Mudah)**

1. Install aplikasi **GitHub** dari Play Store
2. Login dengan akun GitHub Anda
3. Buka repository `family-tree-app`
4. Klik tombol **"+"** (pojok kanan bawah)
5. Pilih **"Upload files"**
6. Pilih semua file project yang sudah di-download
7. Klik **"Commit"**

**Cara 2: Via Browser HP**

1. Di halaman repository, klik **"uploading an existing file"**
2. Klik **"choose your files"**
3. Pilih file-file project (bisa pilih banyak file sekaligus)
4. Tunggu upload selesai
5. Scroll ke bawah, klik **"Commit changes"**

> 📁 **File yang perlu diupload:**
> - Semua file di folder `src/`
> - `package.json`
> - `vite.config.ts`
> - `tsconfig.json`
> - `tailwind.config.js`
> - `index.html`
> - `.env.example` (rename jadi `.env` dulu)

---

## BAGIAN 3: DEPLOY KE VERCEL

### Langkah 3.1 - Daftar Vercel

1. Buka browser, ketik: `https://vercel.com`
2. Klik **"Sign Up"**
3. Pilih **"Continue with GitHub"**
4. Izinkan Vercel mengakses GitHub Anda
5. Selesai pendaftaran

### Langkah 3.2 - Import Project

1. Di dashboard Vercel, klik **"Add New Project"**
2. Anda akan melihat daftar repository GitHub
3. Cari dan klik **"family-tree-app"**
4. Klik **"Import"**

### Langkah 3.3 - Konfigurasi Project

1. **Framework Preset:** Pilih `Vite`
2. **Build Command:** Biarkan default (`npm run build`)
3. **Output Directory:** Biarkan default (`dist`)

### Langkah 3.4 - Tambah Environment Variables (PENTING!)

1. Scroll ke bawah ke bagian **"Environment Variables"**
2. Klik **"Add"** untuk menambahkan variable:

   **Variable 1:**
   - **Name:** `VITE_SUPABASE_URL`
   - **Value:** (Paste Project URL dari Supabase, contoh: `https://abc123.supabase.co`)

   **Variable 2:**
   - **Name:** `VITE_SUPABASE_ANON_KEY`
   - **Value:** (Paste anon public key dari Supabase)

3. Klik **"Add"** untuk setiap variable

### Langkah 3.5 - Deploy!

1. Klik tombol **"Deploy"** (tombol besar berwarna biru)
2. Tunggu proses build (sekitar 2-3 menit)
3. Jika berhasil, Anda akan melihat:
   - ✅ "Congratulations! Your project has been deployed"
   - Link website Anda (contoh: `https://family-tree-app.vercel.app`)

4. **Klik link tersebut** untuk melihat website Anda! 🎉

---

## BAGIAN 4: SETUP ADMIN PERTAMA

### Langkah 4.1 - Buat Akun Admin

1. Buka website Anda (link dari Vercel)
2. Klik **"Daftar"** atau **"Register"**
3. Isi:
   - Nama: `Admin Utama`
   - Email: (email Anda)
   - Password: (password kuat)
4. Klik **"Daftar"**
5. Cek email Anda untuk verifikasi (jika diminta)

### Langkah 4.2 - Jadikan Super Admin (Lewat Supabase)

1. Buka Supabase dashboard
2. Klik **"Table Editor"** (di menu kiri)
3. Pilih tabel **"users"**
4. Cari email Anda di daftar
5. Klik baris Anda
6. Ganti kolom **"role"** dari `member` jadi `super_admin`
7. Klik **"Save"**

### Langkah 4.3 - Login dan Mulai Menggunakan

1. Kembali ke website Anda
2. Klik **"Masuk"**
3. Login dengan email dan password
4. Sekarang Anda adalah Super Admin! 🎉

---

## 🎯 CARA MENGGUNAKAN APLIKASI

### Menambah Anggota Keluarga:

1. Klik menu **"Pohon Keluarga"**
2. Klik tombol **"Tambah Anggota"**
3. Isi data:
   - Nama lengkap
   - Jenis kelamin
   - Tanggal lahir
   - Status (hidup/meninggal)
   - Foto (opsional)
   - Bio (opsional)
4. Klik **"Tambah Anggota"**

### Melihat Pohon Keluarga:

1. Klik menu **"Pohon Keluarga"**
2. Gunakan **scroll mouse** atau **pinch** untuk zoom
3. **Drag** layar untuk berpindah
4. **Klik** anggota untuk lihat detail

### Mengedit Data:

1. Klik anggota yang mau diedit
2. Klik tombol **"Edit"**
3. Ubah data yang diinginkan
4. Klik **"Simpan"**

---

## 🔧 TROUBLESHOOTING (MENGATASI MASALAH)

### Masalah 1: "Build Failed"

**Penyebab:** Environment variables belum diisi
**Solusi:**
1. Buka Vercel dashboard
2. Klik project Anda
3. Klik **"Settings"** → **"Environment Variables"**
4. Pastikan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` sudah ada
5. Klik **"Redeploy"**

### Masalah 2: "Cannot connect to database"

**Penyebab:** URL Supabase salah
**Solusi:**
1. Cek di Supabase → Settings → API
2. Pastikan URL lengkap dengan `https://`
3. Update di Vercel Environment Variables
4. Redeploy

### Masalah 3: "Login tidak berfungsi"

**Penyebab:** Belum setup Auth di Supabase
**Solusi:**
1. Di Supabase, klik **"Authentication"**
2. Klik **"Providers"**
3. Pastikan **Email** sudah enabled
4. Cek bagian "Email Templates" sudah terisi

### Masalah 4: Upload foto gagal

**Penyebab:** Storage bucket belum dibuat
**Solusi:**
1. Di Supabase, klik **"Storage"**
2. Buat bucket baru dengan nama `family-tree`
3. Centang "Public bucket"
4. Coba upload foto lagi

---

## 📱 MENGGUNAKAN GOOGLE LOGIN (Opsional)

Jika ingin login dengan Google:

1. Buka https://console.cloud.google.com
2. Buat project baru
3. Enable "Google+ API"
4. Buat OAuth credentials
5. Tambah redirect URI: `https://your-app.vercel.app/auth/callback`
6. Copy Client ID dan Client Secret
7. Paste di Supabase → Authentication → Providers → Google

---

## ✅ CHECKLIST SEBELUM SELESAI

- [ ] Supabase project sudah dibuat
- [ ] SQL schema sudah dijalankan
- [ ] Storage bucket sudah dibuat
- [ ] Environment variables sudah dicatat
- [ ] GitHub repository sudah dibuat
- [ ] File sudah diupload ke GitHub
- [ ] Vercel project sudah deploy
- [ ] Environment variables sudah diisi di Vercel
- [ ] Akun admin sudah dibuat
- [ ] Role sudah diubah jadi super_admin
- [ ] Bisa login ke website
- [ ] Bisa menambah anggota keluarga

---

## 🆘 BUTUH BANTUAN?

Jika mengalami masalah:

1. **Cek ulang setiap langkah** di panduan ini
2. **Pastikan semua data sudah benar** (URL, kunci API, dll)
3. **Coba refresh browser** atau clear cache
4. **Tanya di komunitas** atau forum terkait

---

## 🎉 SELAMAT!

Anda sudah berhasil membuat website Family Tree sendiri! Sekarang Anda bisa:

- ✅ Menyimpan data keluarga
- ✅ Melihat pohon keluarga visual
- ✅ Bagikan link ke keluarga
- ✅ Kelola dari mana saja

**Link website Anda bisa dibagikan ke seluruh keluarga!** 👨‍👩‍👧‍👦

---

**Dibuat dengan ❤️ untuk keluarga Indonesia**
