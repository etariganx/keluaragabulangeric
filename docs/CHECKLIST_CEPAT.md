# ✅ CHECKLIST CEPAT - Deploy Family Tree App

## 📝 Catat di Notepad HP Anda:

```
SUPABASE PROJECT URL: _________________________________
SUPABASE ANON KEY: ____________________________________
GITHUB USERNAME: ______________________________________
VERCEL WEBSITE URL: ___________________________________
ADMIN EMAIL: __________________________________________
ADMIN PASSWORD: _______________________________________
```

---

## BAGIAN 1: SUPABASE (Database)

### Step 1.1 - Daftar
- [ ] Buka https://supabase.com
- [ ] Klik "Start your project"
- [ ] Login dengan GitHub

### Step 1.2 - Buat Project
- [ ] Klik "New Project"
- [ ] Name: `family-tree-db`
- [ ] Password: (buat sendiri, simpan!)
- [ ] Region: `Southeast Asia (Singapore)`
- [ ] Klik "Create new project"
- [ ] Tunggu 2 menit

### Step 1.3 - Jalankan SQL
- [ ] Klik menu "SQL Editor" (kiri)
- [ ] Klik "New query"
- [ ] Copy kode dari file `database-schema.sql`
- [ ] Paste ke SQL Editor
- [ ] Klik "Run" (ikon play)

### Step 1.4 - Simpan Kunci
- [ ] Klik "Project Settings" → "API"
- [ ] Catat "Project URL"
- [ ] Catat "anon public"

### Step 1.5 - Buat Storage
- [ ] Klik "Storage" (menu kiri)
- [ ] Klik "New bucket"
- [ ] Name: `family-tree`
- [ ] ✅ Centang "Public bucket"
- [ ] Klik "Create bucket"

---

## BAGIAN 2: GITHUB (Upload Kode)

### Step 2.1 - Daftar GitHub
- [ ] Buka https://github.com
- [ ] Klik "Sign up"
- [ ] Isi email, password, username
- [ ] Verifikasi email

### Step 2.2 - Buat Repository
- [ ] Login GitHub
- [ ] Klik "+" (kanan atas)
- [ ] Pilih "New repository"
- [ ] Name: `family-tree-app`
- [ ] Pilih "Public"
- [ ] Klik "Create repository"

### Step 2.3 - Upload File
**Via Browser:**
- [ ] Klik "uploading an existing file"
- [ ] Pilih semua file project
- [ ] Klik "Commit changes"

**Via GitHub App:**
- [ ] Install GitHub app dari Play Store
- [ ] Login
- [ ] Buka repository
- [ ] Klik "+" → "Upload files"
- [ ] Pilih file
- [ ] Klik "Commit"

---

## BAGIAN 3: VERCEL (Deploy Website)

### Step 3.1 - Daftar Vercel
- [ ] Buka https://vercel.com
- [ ] Klik "Sign Up"
- [ ] Pilih "Continue with GitHub"

### Step 3.2 - Import Project
- [ ] Klik "Add New Project"
- [ ] Pilih repository `family-tree-app`
- [ ] Klik "Import"

### Step 3.3 - Konfigurasi
- [ ] Framework Preset: Pilih `Vite`
- [ ] Build Command: biarkan default
- [ ] Output Directory: biarkan default

### Step 3.4 - Environment Variables
**Variable 1:**
- [ ] Name: `VITE_SUPABASE_URL`
- [ ] Value: (paste dari catatan)
- [ ] Klik "Add"

**Variable 2:**
- [ ] Name: `VITE_SUPABASE_ANON_KEY`
- [ ] Value: (paste dari catatan)
- [ ] Klik "Add"

### Step 3.5 - Deploy
- [ ] Klik "Deploy"
- [ ] Tunggu 2-3 menit
- [ ] Catat website URL
- [ ] Klik link untuk cek website

---

## BAGIAN 4: SETUP ADMIN

### Step 4.1 - Daftar Akun
- [ ] Buka website Anda (URL dari Vercel)
- [ ] Klik "Daftar" / "Register"
- [ ] Isi nama, email, password
- [ ] Klik "Daftar"

### Step 4.2 - Jadikan Admin
- [ ] Buka Supabase dashboard
- [ ] Klik "Table Editor"
- [ ] Pilih tabel "users"
- [ ] Cari email Anda
- [ ] Klik baris Anda
- [ ] Ganti role: `member` → `super_admin`
- [ ] Klik "Save"

### Step 4.3 - Login
- [ ] Buka website Anda
- [ ] Klik "Masuk"
- [ ] Login dengan email & password
- [ ] ✅ Selesai! Anda sudah jadi Admin!

---

## 🎯 CARA PAKAI

### Tambah Anggota:
1. Klik "Pohon Keluarga"
2. Klik "Tambah Anggota"
3. Isi data
4. Klik "Tambah"

### Lihat Pohon:
1. Klik "Pohon Keluarga"
2. Zoom: scroll/pinch
3. Pindah: drag layar
4. Detail: klik anggota

### Edit Data:
1. Klik anggota
2. Klik "Edit"
3. Ubah data
4. Klik "Simpan"

---

## 🆘 MASALAH & SOLUSI

| Masalah | Solusi |
|---------|--------|
| Build Failed | Cek Environment Variables di Vercel |
| Database error | Cek URL Supabase benar/tidak |
| Login gagal | Cek Auth Provider di Supabase |
| Foto gagal upload | Cek Storage bucket sudah dibuat |

---

## 📞 BUTUH BANTUAN?

1. Cek ulang setiap langkah
2. Pastikan data sudah benar
3. Refresh browser
4. Clear cache browser

---

**Selamat mencoba! 🎉**
