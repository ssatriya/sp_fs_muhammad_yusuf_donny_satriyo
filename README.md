# Task Management App

Aplikasi manajemen tugas kolaboratif / Collaborative task management application  
**Fitur**: Kanban board, invitation system, role-based permissions

## 📥 Instalasi | Installation

### Prasyarat | Prerequisites

- Node.js (v18+)
- PostgreSQL
- Git

### Langkah-langkah | Steps

```bash
# 1. Clone repository
git clone https://github.com/ssatriya/sp_fs_muhammad_yusuf_donny_satriyo.git
cd repo-name

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env

# 4. Setup database
npx prisma migrate dev --name init

# 5. Jalankan aplikasi
npm run dev

# 🚀 Panduan Penggunaan

## 1. Autentikasi

- **Daftar / Register**: `/register`
  Buat akun baru

- **Masuk / Login**: `/login`
  Akses sistem

---

## 2. Manajemen Proyek

### Buat Proyek Baru

1. Buka menu **Projects**
2. Klik **New Project**
3. Isi formulir

### Lihat Detail

Di tabel proyek


---

## 3. Undang Kolaborator

1. Buka **Project Settings**
2. Cari user
3. Klik **Send Invitation**

User akan menerima notifikasi
Ikon 🔔 (bell) pojok kanan
Bisa menerima / menolak

---

## 4. Manajemen Tugas

### Buat Tugas

Di halaman detail proyek:

Isi semua field :

- **Judul**
- **Deskripsi**
- **Status** (Todo / In Progress / Done)
- **Assignee** (user yang ditugaskan)

### Ubah Status | Update Status

- Cara: **Drag & drop** di **Kanban board**
- Hanya: **Owner** dan **assigned user** yang bisa mengubah | can update

---

## 🔐 Sistem Keamanan

| Fitur             | Akses            |
|------------------|----------------------------|
| Edit Task        | Owner + Assigned User      |
| Hapus Task       | Owner only                 |
| Undang Anggota   | Owner                      |
| Hapus Proyek     | Owner only                 |

---

## 🛠 Teknologi | Technologies

### Frontend:
- Next.js 14
- Shadcn/ui + Tailwind CSS
- Zustand (state management)

### Backend:
- Next.js API Routes
- PostgreSQL
- Prisma ORM
- Better Auth
```

Known Issue

- User can send invitation to their own account
- Drag n Drop flicker at previous position when dropped
