import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { Category, Product, Review, Store } from '@/types/database';

/**
 * Fallback initial seed data matching supabase/seed.sql
 * Used ONLY when NEXT_PUBLIC_SUPABASE_URL is not yet configured in .env.local
 * so the application renders cleanly during initial setup inspection.
 * As soon as Supabase credentials are configured, 100% of queries run against PostgreSQL.
 */
const INITIAL_CATEGORIES: Category[] = [
  {
    id: '11111111-1111-4111-8111-111111111101',
    name: 'Kuliner & Kemasan',
    slug: 'kuliner-kemasan',
    description: 'Kopi Nusantara, sambal rumahan, keripik, dan camilan khas daerah.',
    icon_name: 'UtensilsCrossed',
    image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80',
    is_active: true,
    sort_order: 1,
    created_at: '2026-01-10T08:00:00+07:00',
    updated_at: '2026-01-10T08:00:00+07:00',
  },
  {
    id: '11111111-1111-4111-8111-111111111102',
    name: 'Batik & Wastra',
    slug: 'batik-wastra',
    description: 'Batik tulis, batik cap, tenun ikat, dan busana etnik modern karya pengrajin lokal.',
    icon_name: 'Shirt',
    image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
    is_active: true,
    sort_order: 2,
    created_at: '2026-01-10T08:00:00+07:00',
    updated_at: '2026-01-10T08:00:00+07:00',
  },
  {
    id: '11111111-1111-4111-8111-111111111103',
    name: 'Kriya & Anyaman',
    slug: 'kriya-anyaman',
    description: 'Kerajinan rotan, bambu, kayu jati, dan dekorasi rumah buatan tangan.',
    icon_name: 'Sparkles',
    image_url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80',
    is_active: true,
    sort_order: 3,
    created_at: '2026-01-10T08:00:00+07:00',
    updated_at: '2026-01-10T08:00:00+07:00',
  },
  {
    id: '11111111-1111-4111-8111-111111111104',
    name: 'Herbal & Kesehatan',
    slug: 'herbal-kesehatan',
    description: 'Jamu tradisional, madu hutan murni, minyak atsiri, dan perawatan organik.',
    icon_name: 'Leaf',
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    is_active: true,
    sort_order: 4,
    created_at: '2026-01-10T08:00:00+07:00',
    updated_at: '2026-01-10T08:00:00+07:00',
  },
  {
    id: '11111111-1111-4111-8111-111111111105',
    name: 'Aksesoris & Kulit',
    slug: 'aksesoris-kulit',
    description: 'Tas kulit asli Garut, sepatu handmade Bandung, dan perhiasan perak Bali.',
    icon_name: 'ShoppingBag',
    image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
    is_active: true,
    sort_order: 5,
    created_at: '2026-01-10T08:00:00+07:00',
    updated_at: '2026-01-10T08:00:00+07:00',
  },
  {
    id: '11111111-1111-4111-8111-111111111106',
    name: 'Pertanian & Rempah',
    slug: 'pertanian-rempah',
    description: 'Beras organik, lada putih Muntok, kayu manis Kerinci, dan hasil bumi pilihan.',
    icon_name: 'Sprout',
    image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
    is_active: true,
    sort_order: 6,
    created_at: '2026-01-10T08:00:00+07:00',
    updated_at: '2026-01-10T08:00:00+07:00',
  },
];

const INITIAL_STORES: Store[] = [
  {
    id: '22222222-2222-4222-8222-222222222201',
    owner_id: '00000000-0000-4000-8000-000000000002',
    name: 'Roastery Kopi Gayo Lestari',
    slug: 'roastery-kopi-gayo-lestari',
    description:
      'Koperasi petani dan penyangrai kopi Arabika Gayo organik langsung dari dataran tinggi Takengon, Aceh Tengah. Dipetik merah sempurna dan disangrai segar setiap minggu.',
    logo_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80',
    banner_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1400&q=80',
    city: 'Takengon',
    province: 'Aceh',
    address_detail: 'Jl. Lebe Kader No. 45, Kec. Bebesen, Kabupaten Aceh Tengah',
    phone: '08126000221',
    whatsapp: '628126000221',
    nib_number: '9120301847291',
    verification_status: 'approved',
    rejection_reason: null,
    is_featured: true,
    rating_avg: 4.92,
    total_reviews: 128,
    created_at: '2026-01-12T09:00:00+07:00',
    updated_at: '2026-01-12T09:00:00+07:00',
  },
  {
    id: '22222222-2222-4222-8222-222222222202',
    owner_id: '00000000-0000-4000-8000-000000000003',
    name: 'Galeri Batik Tulis Sekar Lasem',
    slug: 'galeri-batik-tulis-sekar-lasem',
    description:
      'Pengrajin batik tulis dan cap asli Lasem dengan pewarna alami dan motif akulturasi klasik Tiga Negeri. Memberdayakan lebih dari 35 pembatik perempuan di Rembang.',
    logo_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=300&q=80',
    banner_url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1400&q=80',
    city: 'Rembang',
    province: 'Jawa Tengah',
    address_detail: 'Desa Babagan RT 03/RW 01, Kec. Lasem, Kabupaten Rembang',
    phone: '08132500332',
    whatsapp: '628132500332',
    nib_number: '9120409928114',
    verification_status: 'approved',
    rejection_reason: null,
    is_featured: true,
    rating_avg: 4.88,
    total_reviews: 94,
    created_at: '2026-01-14T10:00:00+07:00',
    updated_at: '2026-01-14T10:00:00+07:00',
  },
  {
    id: '22222222-2222-4222-8222-222222222203',
    owner_id: '00000000-0000-4000-8000-000000000004',
    name: 'Kriya Ketak & Rotan Mandalika',
    slug: 'kriya-ketak-rotan-mandalika',
    description:
      'Sentra kerajinan anyaman tanaman ketak dan rotan alami berkualitas ekspor dari Lombok Tengah. Cocok untuk dekorasi rumah modern, hotel, dan hampers ramah lingkungan.',
    logo_url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=300&q=80',
    banner_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=80',
    city: 'Praya',
    province: 'Nusa Tenggara Barat',
    address_detail: 'Jl. Raya Bypass Bandara BIL Km. 5, Kec. Praya, Lombok Tengah',
    phone: '08180300443',
    whatsapp: '628180300443',
    nib_number: '9120507731902',
    verification_status: 'approved',
    rejection_reason: null,
    is_featured: true,
    rating_avg: 4.85,
    total_reviews: 67,
    created_at: '2026-01-15T11:00:00+07:00',
    updated_at: '2026-01-15T11:00:00+07:00',
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '33333333-3333-4333-8333-333333333301',
    store_id: INITIAL_STORES[0].id,
    category_id: INITIAL_CATEGORIES[0].id,
    name: 'Kopi Arabika Aceh Gayo Wine Process 250g (Biji / Bubuk)',
    slug: 'kopi-arabika-aceh-gayo-wine-process-250g',
    description:
      'Kopi spesialti Arabika Aceh Gayo yang diolah melalui proses fermentasi Wine selama 30 hari dari buah ceri merah pilihan di ketinggian 1.600 mdpl. Menghasilkan aroma fruity yang kuat, body tebal, dan aftertaste cokelat manis yang panjang.',
    price: 95000,
    compare_at_price: 115000,
    stock: 48,
    sku: 'KGL-WINE-250',
    weight_grams: 280,
    min_order: 1,
    status: 'active',
    is_featured: true,
    sold_count: 342,
    rating_avg: 4.95,
    review_count: 86,
    created_at: '2026-02-01T10:00:00+07:00',
    updated_at: '2026-02-01T10:00:00+07:00',
    store: INITIAL_STORES[0],
    category: INITIAL_CATEGORIES[0],
    images: [
      {
        id: 'img-1',
        product_id: '33333333-3333-4333-8333-333333333301',
        image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80',
        alt_text: 'Kopi Arabika Aceh Gayo Wine Process 250g',
        is_primary: true,
        sort_order: 1,
        created_at: '2026-02-01T10:00:00+07:00',
      },
    ],
  },
  {
    id: '33333333-3333-4333-8333-333333333302',
    store_id: INITIAL_STORES[0].id,
    category_id: INITIAL_CATEGORIES[0].id,
    name: 'Kopi Arabika Gayo Semi-Wash Organik 500g',
    slug: 'kopi-arabika-gayo-semi-wash-organik-500g',
    description:
      'Kopi harian berkualitas kafe dengan profil sangrai Medium. Memiliki cita rasa khas rempah Nusantara, karamel, dan keasaman jeruk yang seimbang. Bersertifikat organik dan halal.',
    price: 135000,
    compare_at_price: 150000,
    stock: 65,
    sku: 'KGL-SW-500',
    weight_grams: 540,
    min_order: 1,
    status: 'active',
    is_featured: true,
    sold_count: 215,
    rating_avg: 4.9,
    review_count: 54,
    created_at: '2026-02-03T10:00:00+07:00',
    updated_at: '2026-02-03T10:00:00+07:00',
    store: INITIAL_STORES[0],
    category: INITIAL_CATEGORIES[0],
    images: [
      {
        id: 'img-2',
        product_id: '33333333-3333-4333-8333-333333333302',
        image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
        alt_text: 'Kopi Arabika Gayo Semi-Wash Organik 500g',
        is_primary: true,
        sort_order: 1,
        created_at: '2026-02-03T10:00:00+07:00',
      },
    ],
  },
  {
    id: '33333333-3333-4333-8333-333333333303',
    store_id: INITIAL_STORES[1].id,
    category_id: INITIAL_CATEGORIES[1].id,
    name: 'Kain Batik Tulis Lasem Motif Sekar Jagad Merah Marun',
    slug: 'kain-batik-tulis-lasem-motif-sekar-jagad-merah-marun',
    description:
      'Kain batik tulis asli Lasem 100% dikerjakan menggunakan canting tangan di atas kain katun Primisima Kereta Kencana (ukuran 240 x 115 cm). Pewarnaan khas Abang Getih Pithik (Merah Lasem) yang elegan dan tahan puluhan tahun.',
    price: 485000,
    compare_at_price: 550000,
    stock: 12,
    sku: 'BTL-SJ-001',
    weight_grams: 350,
    min_order: 1,
    status: 'active',
    is_featured: true,
    sold_count: 78,
    rating_avg: 4.92,
    review_count: 39,
    created_at: '2026-02-05T10:00:00+07:00',
    updated_at: '2026-02-05T10:00:00+07:00',
    store: INITIAL_STORES[1],
    category: INITIAL_CATEGORIES[1],
    images: [
      {
        id: 'img-3',
        product_id: '33333333-3333-4333-8333-333333333303',
        image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
        alt_text: 'Kain Batik Tulis Lasem Motif Sekar Jagad',
        is_primary: true,
        sort_order: 1,
        created_at: '2026-02-05T10:00:00+07:00',
      },
    ],
  },
  {
    id: '33333333-3333-4333-8333-333333333304',
    store_id: INITIAL_STORES[1].id,
    category_id: INITIAL_CATEGORIES[1].id,
    name: 'Outer Tenun & Batik Cap Kombinasi Modern Unisex',
    slug: 'outer-tenun-batik-cap-kombinasi-modern-unisex',
    description:
      'Outer kasual rapi yang memadukan batik cap motif Kawung dan tenun lurik Klaten. Dilengkapi furing katun adem yang nyaman untuk acara formal maupun kerja sehari-hari.',
    price: 265000,
    compare_at_price: 310000,
    stock: 24,
    sku: 'BTL-OUT-004',
    weight_grams: 400,
    min_order: 1,
    status: 'active',
    is_featured: false,
    sold_count: 119,
    rating_avg: 4.85,
    review_count: 41,
    created_at: '2026-02-08T10:00:00+07:00',
    updated_at: '2026-02-08T10:00:00+07:00',
    store: INITIAL_STORES[1],
    category: INITIAL_CATEGORIES[1],
    images: [
      {
        id: 'img-4',
        product_id: '33333333-3333-4333-8333-333333333304',
        image_url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80',
        alt_text: 'Outer Tenun & Batik Cap Kombinasi Modern',
        is_primary: true,
        sort_order: 1,
        created_at: '2026-02-08T10:00:00+07:00',
      },
    ],
  },
  {
    id: '33333333-3333-4333-8333-333333333305',
    store_id: INITIAL_STORES[2].id,
    category_id: INITIAL_CATEGORIES[2].id,
    name: 'Set Nampan & Keranjang Anyaman Ketak Lombok (Isi 3 Pcs)',
    slug: 'set-nampan-keranjang-anyaman-ketak-lombok-3pcs',
    description:
      'Satu set isi 3 keranjang serbaguna yang dianyam rapat dari serat tanaman ketak liar Lombok. Sudah melalui proses pengovenan anti-jamur dan finishing food-grade.',
    price: 189000,
    compare_at_price: 225000,
    stock: 30,
    sku: 'KKM-SET-03',
    weight_grams: 850,
    min_order: 1,
    status: 'active',
    is_featured: true,
    sold_count: 164,
    rating_avg: 4.88,
    review_count: 47,
    created_at: '2026-02-10T10:00:00+07:00',
    updated_at: '2026-02-10T10:00:00+07:00',
    store: INITIAL_STORES[2],
    category: INITIAL_CATEGORIES[2],
    images: [
      {
        id: 'img-5',
        product_id: '33333333-3333-4333-8333-333333333305',
        image_url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80',
        alt_text: 'Set Nampan & Keranjang Anyaman Ketak Lombok',
        is_primary: true,
        sort_order: 1,
        created_at: '2026-02-10T10:00:00+07:00',
      },
    ],
  },
  {
    id: '33333333-3333-4333-8333-333333333306',
    store_id: INITIAL_STORES[2].id,
    category_id: INITIAL_CATEGORIES[3].id,
    name: 'Madu Hutan Sumbawa Murni Raw Honey 500ml',
    slug: 'madu-hutan-sumbawa-murni-raw-honey-500ml',
    description:
      'Madu hutan liar Apis dorsata asli Sumbawa tanpa pemanasan dan tanpa campuran gula. Kaya enzim alami, propolis, dan antioksidan untuk menjaga daya tahan tubuh keluarga.',
    price: 145000,
    compare_at_price: 165000,
    stock: 40,
    sku: 'KKM-MADU-500',
    weight_grams: 750,
    min_order: 1,
    status: 'active',
    is_featured: true,
    sold_count: 290,
    rating_avg: 4.94,
    review_count: 62,
    created_at: '2026-02-12T10:00:00+07:00',
    updated_at: '2026-02-12T10:00:00+07:00',
    store: INITIAL_STORES[2],
    category: INITIAL_CATEGORIES[3],
    images: [
      {
        id: 'img-6',
        product_id: '33333333-3333-4333-8333-333333333306',
        image_url: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=800&q=80',
        alt_text: 'Madu Hutan Sumbawa Murni Raw Honey 500ml',
        is_primary: true,
        sort_order: 1,
        created_at: '2026-02-12T10:00:00+07:00',
      },
    ],
  },
  {
    id: '33333333-3333-4333-8333-333333333307',
    store_id: INITIAL_STORES[0].id,
    category_id: INITIAL_CATEGORIES[5].id,
    name: 'Kopi Drip Bag Spesialti Nusantara (Box Isi 10 Sachet)',
    slug: 'kopi-drip-bag-spesialti-nusantara-box-10-sachet',
    description:
      'Praktis menyeduh kopi Arabika Gayo asli di mana saja tanpa alat seduh rumit. Cukup sobek filter drip bag, gantung di cangkir, dan tuang air panas 90 derajat Celcius.',
    price: 85000,
    compare_at_price: 99000,
    stock: 80,
    sku: 'KGL-DRIP-10',
    weight_grams: 220,
    min_order: 1,
    status: 'active',
    is_featured: false,
    sold_count: 410,
    rating_avg: 4.91,
    review_count: 95,
    created_at: '2026-02-14T10:00:00+07:00',
    updated_at: '2026-02-14T10:00:00+07:00',
    store: INITIAL_STORES[0],
    category: INITIAL_CATEGORIES[5],
    images: [
      {
        id: 'img-7',
        product_id: '33333333-3333-4333-8333-333333333307',
        image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
        alt_text: 'Kopi Drip Bag Spesialti Nusantara',
        is_primary: true,
        sort_order: 1,
        created_at: '2026-02-14T10:00:00+07:00',
      },
    ],
  },
  {
    id: '33333333-3333-4333-8333-333333333308',
    store_id: INITIAL_STORES[2].id,
    category_id: INITIAL_CATEGORIES[4].id,
    name: 'Tas Selempang Bulat Rotan Ate Bali Kombinasi Kulit Asli',
    slug: 'tas-selempang-bulat-rotan-ate-bali-kulit-asli',
    description:
      'Tas selempang bulat berdiameter 20 cm dari anyaman rotan ate yang diasapi tradisional dengan tali kulit sapi asli dan kancing klip kuningan.',
    price: 175000,
    compare_at_price: 210000,
    stock: 18,
    sku: 'KKM-BAG-20',
    weight_grams: 450,
    min_order: 1,
    status: 'active',
    is_featured: true,
    sold_count: 132,
    rating_avg: 4.86,
    review_count: 38,
    created_at: '2026-02-15T10:00:00+07:00',
    updated_at: '2026-02-15T10:00:00+07:00',
    store: INITIAL_STORES[2],
    category: INITIAL_CATEGORIES[4],
    images: [
      {
        id: 'img-8',
        product_id: '33333333-3333-4333-8333-333333333308',
        image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
        alt_text: 'Tas Selempang Bulat Rotan Ate Bali',
        is_primary: true,
        sort_order: 1,
        created_at: '2026-02-15T10:00:00+07:00',
      },
    ],
  },
];

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return INITIAL_CATEGORIES;

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error || !data || data.length === 0) return INITIAL_CATEGORIES;
  return data as Category[];
}

export async function getFeaturedStores(limit = 3): Promise<Store[]> {
  if (!isSupabaseConfigured()) return INITIAL_STORES.slice(0, limit);

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('verification_status', 'approved')
    .order('is_featured', { ascending: false })
    .order('rating_avg', { ascending: false })
    .limit(limit);

  if (error || !data || data.length === 0) return INITIAL_STORES.slice(0, limit);
  return data as Store[];
}

export interface ProductQueryFilters {
  q?: string;
  categorySlug?: string;
  storeId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'popular' | 'newest' | 'price_asc' | 'price_desc' | 'rating';
  page?: number;
  pageSize?: number;
}

export async function getProducts(filters: ProductQueryFilters = {}): Promise<{
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const page = Math.max(1, filters.page || 1);
  const pageSize = filters.pageSize || 12;

  if (!isSupabaseConfigured()) {
    let list = [...INITIAL_PRODUCTS];
    if (filters.q) {
      const q = filters.q.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.store?.name.toLowerCase().includes(q)
      );
    }
    if (filters.categorySlug) {
      list = list.filter((p) => p.category?.slug === filters.categorySlug);
    }
    if (filters.storeId) {
      list = list.filter((p) => p.store_id === filters.storeId);
    }
    if (typeof filters.minPrice === 'number' && filters.minPrice > 0) {
      list = list.filter((p) => p.price >= filters.minPrice!);
    }
    if (typeof filters.maxPrice === 'number' && filters.maxPrice > 0) {
      list = list.filter((p) => p.price <= filters.maxPrice!);
    }

    switch (filters.sort) {
      case 'price_asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'rating':
        list.sort((a, b) => b.rating_avg - a.rating_avg);
        break;
      default:
        list.sort((a, b) => b.sold_count - a.sold_count);
    }

    const total = list.length;
    const start = (page - 1) * pageSize;
    return {
      products: list.slice(start, start + pageSize),
      total,
      page,
      pageSize,
    };
  }

  const supabase = createServerSupabaseClient();
  let categoryIdFilter: string | undefined;

  if (filters.categorySlug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', filters.categorySlug)
      .single();
    if (cat) categoryIdFilter = cat.id;
  }

  let query = supabase
    .from('products')
    .select(
      `
      *,
      store:stores!inner(id, name, slug, city, province, logo_url, verification_status, rating_avg, phone, whatsapp),
      category:categories(id, name, slug),
      images:product_images(id, product_id, image_url, alt_text, is_primary, sort_order)
    `,
      { count: 'exact' }
    )
    .in('status', ['active', 'out_of_stock'])
    .eq('store.verification_status', 'approved');

  if (filters.q) {
    query = query.ilike('name', `%${filters.q}%`);
  }
  if (categoryIdFilter) {
    query = query.eq('category_id', categoryIdFilter);
  }
  if (filters.storeId) {
    query = query.eq('store_id', filters.storeId);
  }
  if (typeof filters.minPrice === 'number' && filters.minPrice > 0) {
    query = query.gte('price', filters.minPrice);
  }
  if (typeof filters.maxPrice === 'number' && filters.maxPrice > 0) {
    query = query.lte('price', filters.maxPrice);
  }

  switch (filters.sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price', { ascending: false });
      break;
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'rating':
      query = query.order('rating_avg', { ascending: false });
      break;
    default:
      query = query.order('sold_count', { ascending: false });
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count, error } = await query.range(from, to);

  if (error || !data) {
    return { products: [], total: 0, page, pageSize };
  }

  return {
    products: data as unknown as Product[],
    total: count ?? data.length,
    page,
    pageSize,
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    return INITIAL_PRODUCTS.find((p) => p.slug === slug) || null;
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('products')
    .select(
      `
      *,
      store:stores(id, name, slug, city, province, logo_url, verification_status, rating_avg, phone, whatsapp),
      category:categories(id, name, slug),
      images:product_images(id, product_id, image_url, alt_text, is_primary, sort_order)
    `
    )
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return INITIAL_PRODUCTS.find((p) => p.slug === slug) || null;
  }

  return data as unknown as Product;
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  if (!isSupabaseConfigured()) {
    return [
      {
        id: 'rev-1',
        order_id: 'ord-demo-1',
        product_id: productId,
        user_id: '00000000-0000-4000-8000-000000000005',
        rating: 5,
        comment:
          'Kualitas produk UMKM lokal yang luar biasa! Kemasan sangat rapi, pengiriman cepat, dan rasanya otentik sesuai deskripsi.',
        is_verified_purchase: true,
        created_at: '2026-03-01T14:20:00+07:00',
        updated_at: '2026-03-01T14:20:00+07:00',
        user: {
          id: '00000000-0000-4000-8000-000000000005',
          full_name: 'Budi Santoso',
          avatar_url: null,
        },
      },
      {
        id: 'rev-2',
        order_id: 'ord-demo-2',
        product_id: productId,
        user_id: '00000000-0000-4000-8000-000000000006',
        rating: 5,
        comment:
          'Sudah langganan beli di UMKM Hub. Penjual sangat ramah dan kualitas produknya tidak kalah dengan brand ekspor.',
        is_verified_purchase: true,
        created_at: '2026-02-22T09:15:00+07:00',
        updated_at: '2026-02-22T09:15:00+07:00',
        user: {
          id: '00000000-0000-4000-8000-000000000006',
          full_name: 'Anisa Rahmawati',
          avatar_url: null,
        },
      },
    ];
  }

  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('reviews')
    .select(
      `
      *,
      user:profiles(id, full_name, avatar_url)
    `
    )
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  return (data as unknown as Review[]) || [];
}

export async function getStoreBySlug(slug: string): Promise<Store | null> {
  if (!isSupabaseConfigured()) {
    return INITIAL_STORES.find((s) => s.slug === slug) || null;
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return INITIAL_STORES.find((s) => s.slug === slug) || null;
  }

  return data as Store;
}
