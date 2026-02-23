# ============================================
# FAMILY TREE APP - DEPLOYMENT GUIDE
# ============================================

## Overview
Panduan lengkap untuk deploy Family Tree App ke Vercel menggunakan HP/Android saja.

## Prerequisites
- Akun GitHub (bisa daftar di HP)
- Akun Vercel (bisa login dengan GitHub)
- Akun Supabase (bisa daftar di HP)

---

## STEP 1: Setup Supabase Database (15 menit)

### 1.1 Daftar/Login Supabase
1. Buka browser HP: https://supabase.com
2. Klik "Start your project"
3. Login dengan GitHub atau buat akun baru
4. Verifikasi email jika diminta

### 1.2 Buat Project Baru
1. Klik "New Project"
2. Pilih organization (default)
3. Isi:
   - **Name**: `family-tree-db`
   - **Database Password**: Buat password kuat (simpan!)
   - **Region**: Pilih `Southeast Asia (Singapore)` untuk Indonesia
4. Klik "Create new project"
5. Tunggu ~2 menit sampai project ready

### 1.3 Jalankan SQL Schema
1. Di sidebar, klik **SQL Editor**
2. Klik **New query**
3. Copy-paste isi file `docs/database-schema.sql`
4. Klik **Run** (tombol play di pojok kanan bawah)
5. Pastikan tidak ada error

### 1.4 Dapatkan API Keys
1. Klik **Project Settings** (ikon gear di sidebar)
2. Pilih **API**
3. Copy nilai berikut:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`

### 1.5 Setup Authentication
1. Di sidebar, klik **Authentication**
2. Klik **Providers**
3. Enable **Email** (default sudah aktif)
4. Enable **Google**:
   - Klik Google provider
   - Toggle Enable
   - Client ID dan Secret bisa diisi nanti
   - Klik Save

### 1.6 Setup Storage (untuk foto)
1. Di sidebar, klik **Storage**
2. Klik **New bucket**
3. Nama: `family-tree`
4. Centang **Public bucket**
5. Klik **Create bucket**

---

## STEP 2: Upload ke GitHub (10 menit)

### 2.1 Install GitHub App (jika belum)
1. Install aplikasi GitHub dari Play Store/App Store
2. Login dengan akun GitHub

### 2.2 Buat Repository Baru
**Cara 1: Via GitHub Mobile App**
1. Buka GitHub app
2. Tap + (tombol hijau di pojok kanan bawah)
3. Pilih **Create repository**
4. Isi:
   - **Repository name**: `family-tree-app`
   - **Description**: `Family Tree web application`
   - Pilih **Public**
5. Tap **Create**

**Cara 2: Via Browser**
1. Buka https://github.com/new
2. Isi nama repository: `family-tree-app`
3. Pilih **Public**
4. Klik **Create repository**

### 2.3 Upload Files
**Cara 1: Via GitHub Web (Browser HP)**
1. Buka repository yang baru dibuat
2. Klik **uploading an existing file**
3. Tap **choose your files**
4. Pilih semua file project (zip dulu jika perlu)
5. Klik **Commit changes**

**Cara 2: Via GitHub Desktop (di komputer teman)**
1. Install GitHub Desktop
2. Clone repository
3. Copy semua file project
4. Commit dan push

---

## STEP 3: Deploy ke Vercel (10 menit)

### 3.1 Daftar/Login Vercel
1. Buka browser HP: https://vercel.com
2. Klik **Sign Up**
3. Pilih **Continue with GitHub**
4. Authorize Vercel untuk akses GitHub

### 3.2 Import Project
1. Di dashboard Vercel, klik **Add New Project**
2. Pilih repository `family-tree-app` dari GitHub
3. Klik **Import**

### 3.3 Konfigurasi Build
1. **Framework Preset**: Pilih `Vite`
2. **Build Command**: Biarkan default (`npm run build`)
3. **Output Directory**: Biarkan default (`dist`)

### 3.4 Environment Variables
1. Scroll ke bawah ke bagian **Environment Variables**
2. Tambahkan:
   ```
   VITE_SUPABASE_URL = https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY = your-anon-key
   ```
3. Klik **Add** untuk setiap variable

### 3.5 Deploy
1. Klik **Deploy**
2. Tunggu ~2-3 menit
3. Selesai! Copy URL hasil deploy

---

## STEP 4: Konfigurasi Google Login (Opsional, 10 menit)

### 4.1 Google Cloud Console
1. Buka https://console.cloud.google.com
2. Login dengan Google account
3. Buat project baru atau pilih existing

### 4.2 Enable Google+ API
1. Menu **APIs & Services** > **Library**
2. Cari "Google+ API"
3. Klik **Enable**

### 4.3 Buat OAuth Credentials
1. Menu **APIs & Services** > **Credentials**
2. Klik **Create Credentials** > **OAuth client ID**
3. Configure consent screen:
   - User Type: External
   - App name: Family Tree
   - User support email: your-email@gmail.com
   - Developer contact: your-email@gmail.com
   - Save
4. Create OAuth client ID:
   - Application type: Web application
   - Name: Family Tree Web
   - Authorized redirect URIs: 
     - `https://your-app.vercel.app/auth/callback`
     - `http://localhost:5173/auth/callback` (untuk development)
   - Create
5. Copy **Client ID** dan **Client Secret**

### 4.4 Update Supabase
1. Kembali ke Supabase > Authentication > Providers
2. Edit Google provider
3. Paste Client ID dan Client Secret
4. Save

---

## STEP 5: Update Custom Domain (Opsional)

### 5.1 Beli Domain
- Niagahoster, Namecheap, atau provider lain
- Bisa via HP browser

### 5.2 Add Domain di Vercel
1. Di project Vercel, klik **Settings**
2. Pilih **Domains**
3. Masukkan domain yang dibeli
4. Ikuti instruksi untuk setup DNS

---

## Troubleshooting

### Build Failed
- Cek environment variables sudah benar
- Pastikan semua dependencies ada di package.json
- Cek log error di Vercel dashboard

### Database Connection Error
- Pastikan Supabase URL dan anon key benar
- Cek RLS policies sudah di-setup
- Pastikan project Supabase sudah active

### Google Login Tidak Berfungsi
- Verifikasi redirect URI sudah benar
- Pastikan Google+ API sudah enabled
- Cek Client ID dan Secret benar

---

## Maintenance

### Update Aplikasi
1. Edit file di GitHub (via web atau app)
2. Vercel akan auto-deploy
3. Atau upload file baru ke GitHub

### Backup Database
1. Supabase dashboard
2. Database > Backups
3. Enable Point-in-Time Recovery

### Monitor
- Vercel Analytics: Built-in
- Supabase Logs: Dashboard > Logs

---

## Cost Estimation (Bulanan)

| Service | Free Tier | Paid (jika melebihi) |
|---------|-----------|---------------------|
| Vercel | 100GB bandwidth | $20/bulan |
| Supabase | 500MB DB, 2GB storage | $25/bulan |
| Domain | - | $10-15/tahun |

**Total awal: GRATIS**

---

## Support

Jika ada masalah:
1. Cek dokumentasi: https://supabase.com/docs
2. Vercel docs: https://vercel.com/docs
3. GitHub Issues di repository

---

**Selamat! Aplikasi Family Tree Anda sudah online! 🎉**
