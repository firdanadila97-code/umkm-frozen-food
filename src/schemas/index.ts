import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter'),
});

export const registerSchema = z
  .object({
    full_name: z.string().min(2, 'Nama lengkap minimal 2 karakter').max(100),
    email: z.string().email('Format email tidak valid'),
    phone: z
      .string()
      .regex(/^(\+62|62|0)8[1-9][0-9]{6,11}$/, 'Nomor WhatsApp/HP Indonesia tidak valid (contoh: 081234567890)'),
    role: z.enum(['customer', 'seller']),
    password: z.string().min(8, 'Kata sandi minimal 8 karakter'),
    confirm_password: z.string().min(8, 'Konfirmasi kata sandi minimal 8 karakter'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Konfirmasi kata sandi tidak cocok',
    path: ['confirm_password'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Masukkan alamat email terdaftar yang valid'),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Kata sandi baru minimal 8 karakter'),
    confirm_password: z.string().min(8, 'Konfirmasi kata sandi minimal 8 karakter'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Konfirmasi kata sandi tidak cocok',
    path: ['confirm_password'],
  });

export const storeSchema = z.object({
  name: z.string().min(3, 'Nama toko UMKM minimal 3 karakter').max(80),
  description: z.string().min(20, 'Deskripsi toko minimal 20 karakter').max(1500),
  city: z.string().min(2, 'Kota/Kabupaten wajib diisi'),
  province: z.string().min(2, 'Provinsi wajib diisi'),
  address_detail: z.string().min(10, 'Alamat lengkap toko minimal 10 karakter'),
  phone: z.string().min(9, 'Nomor telepon toko wajib diisi'),
  whatsapp: z.string().optional().nullable(),
  nib_number: z.string().optional().nullable(),
  logo_url: z.string().url('URL logo tidak valid').optional().or(z.literal('')),
  banner_url: z.string().url('URL banner tidak valid').optional().or(z.literal('')),
});

export const productSchema = z.object({
  name: z.string().min(3, 'Nama produk minimal 3 karakter').max(140),
  category_id: z.string().uuid('Pilih kategori produk yang valid'),
  description: z.string().min(20, 'Deskripsi produk minimal 20 karakter'),
  price: z.coerce.number().int().min(1000, 'Harga produk minimal Rp 1.000'),
  compare_at_price: z.coerce
    .number()
    .int()
    .optional()
    .nullable()
    .transform((v) => (v && v > 0 ? v : null)),
  stock: z.coerce.number().int().min(0, 'Stok tidak boleh negatif'),
  sku: z.string().max(50).optional().nullable(),
  weight_grams: z.coerce.number().int().min(10, 'Berat produk minimal 10 gram'),
  min_order: z.coerce.number().int().min(1, 'Minimal pembelian 1 pcs').default(1),
  status: z.enum(['draft', 'active', 'out_of_stock', 'archived']).default('active'),
  image_urls: z
    .array(z.string().url('URL gambar produk harus valid'))
    .min(1, 'Minimal 1 foto produk wajib diunggah'),
});

export const addressSchema = z.object({
  label: z.string().min(2, 'Label alamat wajib diisi (contoh: Rumah, Kantor)'),
  recipient_name: z.string().min(2, 'Nama penerima wajib diisi'),
  phone: z.string().min(9, 'Nomor HP penerima wajib diisi'),
  province: z.string().min(2, 'Provinsi wajib diisi'),
  city: z.string().min(2, 'Kota/Kabupaten wajib diisi'),
  district: z.string().min(2, 'Kecamatan wajib diisi'),
  postal_code: z.string().min(5, 'Kode pos 5 digit').max(10),
  full_address: z.string().min(10, 'Detail alamat lengkap minimal 10 karakter'),
  notes: z.string().optional().nullable(),
  is_default: z.boolean().default(false),
});

export const checkoutSchema = z.object({
  store_id: z.string().uuid('Toko tidak valid'),
  address_id: z.string().uuid('Pilih alamat pengiriman terlebih dahulu'),
  courier_code: z.enum(['jne', 'sicepat', 'jnt', 'pos']),
  courier_service: z.string().min(2, 'Pilih layanan pengiriman'),
  notes: z.string().max(300).optional().nullable(),
});

export const reviewSchema = z.object({
  order_id: z.string().uuid(),
  product_id: z.string().uuid(),
  rating: z.coerce.number().int().min(1, 'Pilih bintang 1 - 5').max(5),
  comment: z.string().min(5, 'Ulasan minimal 5 karakter').max(1000),
});

export const categorySchema = z.object({
  name: z.string().min(3, 'Nama kategori minimal 3 karakter').max(60),
  description: z.string().min(5, 'Deskripsi singkat kategori wajib diisi'),
  icon_name: z.string().min(2).default('Package'),
  image_url: z.string().url('URL gambar tidak valid').optional().or(z.literal('')),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().int().default(0),
});
