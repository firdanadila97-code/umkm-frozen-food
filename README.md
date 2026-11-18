# UMKM Hub — Platform Marketplace Digital UMKM Indonesia

**UMKM Hub** adalah aplikasi web marketplace full-stack kelas produksi yang dirancang khusus untuk menghubungkan **Pelanggan**, **Penjual UMKM (Usaha Mikro, Kecil, dan Menengah)**, serta **Administrator** di seluruh Indonesia.

---

## 1. Arsitektur & Teknologi Utama

- **Frontend Framework:** Next.js 14 (App Router, Server Components & Server Actions)
- **Bahasa Pemrograman:** TypeScript (Strict Mode)
- **Styling & Design System:** Tailwind CSS + Lucide React Icons (`#166534` Brand Green, `#22C55E` Secondary, `#F8FAFC` Surface, `#0F172A` Ink)
- **Validasi Input:** Zod (Server & Form Validation)
- **Database & Backend:** Supabase PostgreSQL, Supabase Auth, Supabase Storage, Row Level Security (RLS), serta PostgreSQL Transactional RPC (`create_checkout_order`)
- **Payment Gateway:** Arsitektur Server-Side Midtrans Snap (Sandbox Mode) + Verifikasi Signature SHA-512 pada Webhook `/api/webhooks/midtrans`
- **Lokalisasi:** Bahasa Indonesia (`id-ID`), Mata Uang Rupiah (`IDR`), Zona Waktu `Asia/Jakarta` (`WIB`)

---

## 2. Struktur Folder Proyek

```text
src/
  app/
    api/webhooks/midtrans/route.ts   # Webhook resmi Midtrans (verifikasi SHA-512)
    admin/                           # Portal Administrator (Dashboard, Users, Stores, Categories, Products, Orders, Payments)
    seller/                          # Portal Penjual UMKM (Dashboard, Store Settings, Products CRUD, Orders, Sales Reports)
    customer/                        # Portal Pembeli (Dashboard, Orders, Order Detail & Review, Addresses, Profile)
    marketplace/                     # Katalog Produk (Search, Filter Kategori, Filter Harga, Sorting, Pagination)
    products/[slug]/                 # Halaman Detail Produk & Ulasan Terverifikasi
    stores/[slug]/                   # Halaman Profil & Etalase Toko UMKM
    cart/                            # Keranjang Belanja Multi-Toko
    checkout/                        # Checkout Transaksional & Kalkulasi Ongkir
    login/ | register/ | forgot-password/ | reset-password/
  components/
    layout/                          # Navbar & Footer
    marketplace/                     # ProductCard
    ui/                              # Toast, ConfirmDialog, Skeleton, EmptyState, Badge
  features/
    auth/ | cart/ | checkout/ | products/ | seller/ | admin/
  lib/
    supabase/                        # client.ts (Browser), server.ts (SSR), admin.ts (Server-Only Service Role)
  services/
    marketplace.ts                   # Query produk, toko, kategori, ulasan
    shipping.ts                      # Kalkulasi ongkir JNE, SiCepat, J&T, Pos Indonesia
    midtrans.ts                      # Pembuatan Snap Token & verifikasi SHA-512
  schemas/                           # Skema validasi Zod
  types/                             # Definisi tipe database PostgreSQL
  utils/                             # Formatter Rupiah (IDR), Tanggal WIB, Slugify
supabase/
  migrations/
    00001_initial_schema.sql         # 12 Tabel, Relasi FK, Index, Trigger, & Fungsi RPC Checkout Transaksional
    00002_rls_policies.sql           # Kebijakan Row Level Security (RLS) & Bucket Storage
  seed.sql                           # Data awal Kategori, Akun Demo, Toko UMKM, Produk, & Alamat
```

---

## 3. Panduan Instalasi & Konfigurasi Lokal

### Langkah 1: Instal Dependensi
Pastikan Node.js (versi 18.17+ atau 20+) sudah terinstal di komputer Anda, lalu jalankan:
```bash
npm install
```

### Langkah 2: Konfigurasi Environment Variables
Salin berkas `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Isi kredensial berikut pada `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`: URL proyek Supabase Anda
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon Public Key dari Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Service Role Key (Hanya dieksekusi di server untuk Webhook pembayaran, tidak pernah diekspos ke client)
- `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` & `MIDTRANS_SERVER_KEY`: Kredensial Midtrans Sandbox Anda

### Langkah 3: Jalankan Migrasi Database & Seed Data di Supabase
Buka **SQL Editor** pada Dashboard Supabase Anda, lalu jalankan ketiga file SQL berikut secara berurutan:
1. `supabase/migrations/00001_initial_schema.sql`
2. `supabase/migrations/00002_rls_policies.sql`
3. `supabase/seed.sql`

### Langkah 4: Jalankan Server Pengembangan
```bash
npm run dev
```
Buka `http://localhost:3000` di browser Anda.

---

## 4. Akun Demo (`supabase/seed.sql`)

| Peran | Email | Kata Sandi | Akses |
| :--- | :--- | :--- | :--- |
| **Customer (Pembeli)** | `pembeli@umkmhub.id` | `CustomerUMKM123!` | Belanja, Keranjang, Checkout, Alamat, Ulasan |
| **Seller (Penjual UMKM)** | `kopigayo@umkmhub.id` | `SellerUMKM123!` | Kelola Toko, Produk CRUD, Stok, Pesanan, Laporan |
| **Administrator** | `admin@umkmhub.id` | `AdminUMKM123!` | Kelola User, Verifikasi UMKM, Kategori, Monitoring |

---

## 5. Panduan Deployment ke Vercel

1. Unggah repositori ini ke GitHub / GitLab / Bitbucket.
2. Buka [Vercel Dashboard](https://vercel.com/new) dan impor proyek **UMKM Hub**.
3. Tambahkan seluruh variabel dari `.env.example` ke bagian **Environment Variables** di Vercel.
4. Pada dashboard **Midtrans Sandbox -> Settings -> Payment Notification URL**, arahkan URL Webhook ke:
   `https://domain-anda.vercel.app/api/webhooks/midtrans`
5. Klik **Deploy**.
