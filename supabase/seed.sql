-- ============================================================================
-- UMKM HUB - SEED DATA (REALISTIC INDONESIAN UMKM MARKETPLACE DATA)
-- Categories, Demo Profiles, Approved UMKM Stores, Products, Images & Reviews
-- ============================================================================

-- 1. Seed Categories
INSERT INTO public.categories (id, name, slug, description, icon_name, image_url, is_active, sort_order)
VALUES
  ('11111111-1111-4111-8111-111111111101', 'Kuliner & Kemasan', 'kuliner-kemasan', 'Kopi Nusantara, sambal rumahan, keripik, dan camilan khas daerah.', 'UtensilsCrossed', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80', true, 1),
  ('11111111-1111-4111-8111-111111111102', 'Batik & Wastra', 'batik-wastra', 'Batik tulis, batik cap, tenun ikat, dan busana etnik modern karya pengrajin lokal.', 'Shirt', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80', true, 2),
  ('11111111-1111-4111-8111-111111111103', 'Kriya & Anyaman', 'kriya-anyaman', 'Kerajinan rotan, bambu, kayu jati, dan dekorasi rumah buatan tangan.', 'Sparkles', 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80', true, 3),
  ('11111111-1111-4111-8111-111111111104', 'Herbal & Kesehatan', 'herbal-kesehatan', 'Jamu tradisional, madu hutan murni, minyak atsiri, dan perawatan organik.', 'Leaf', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80', true, 4),
  ('11111111-1111-4111-8111-111111111105', 'Aksesoris & Kulit', 'aksesoris-kulit', 'Tas kulit asli Garut, sepatu handmade Bandung, dan perhiasan perak Bali.', 'ShoppingBag', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80', true, 5),
  ('11111111-1111-4111-8111-111111111106', 'Pertanian & Rempah', 'pertanian-rempah', 'Beras organik, lada putih Muntok, kayu manis Kerinci, dan hasil bumi pilihan.', 'Sprout', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80', true, 6)
ON CONFLICT (slug) DO NOTHING;

-- Note: When running against a fresh Supabase instance, you can also seed demo auth.users
-- below so that stores and products are immediately live in the database.
DO $$
DECLARE
  v_admin_id UUID := '00000000-0000-4000-8000-000000000001';
  v_seller1_id UUID := '00000000-0000-4000-8000-000000000002';
  v_seller2_id UUID := '00000000-0000-4000-8000-000000000003';
  v_seller3_id UUID := '00000000-0000-4000-8000-000000000004';
  v_customer_id UUID := '00000000-0000-4000-8000-000000000005';
  v_store1_id UUID := '22222222-2222-4222-8222-222222222201';
  v_store2_id UUID := '22222222-2222-4222-8222-222222222202';
  v_store3_id UUID := '22222222-2222-4222-8222-222222222203';
BEGIN
  -- Insert demo users in auth.users if not present
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
  VALUES
    (v_admin_id, '00000000-0000-0000-0000-000000000000', 'admin@umkmhub.id', crypt('AdminUMKM123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Admin Utama UMKM Hub","role":"customer"}', now(), now(), 'authenticated', 'authenticated'),
    (v_seller1_id, '00000000-0000-0000-0000-000000000000', 'kopigayo@umkmhub.id', crypt('SellerUMKM123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Hendra Syahputra","role":"seller"}', now(), now(), 'authenticated', 'authenticated'),
    (v_seller2_id, '00000000-0000-4000-8000-000000000000', 'batiklasem@umkmhub.id', crypt('SellerUMKM123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Siti Nurhaliza","role":"seller"}', now(), now(), 'authenticated', 'authenticated'),
    (v_seller3_id, '00000000-0000-4000-8000-000000000000', 'kriyalombok@umkmhub.id', crypt('SellerUMKM123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"I Wayan Sudarma","role":"seller"}', now(), now(), 'authenticated', 'authenticated'),
    (v_customer_id, '00000000-0000-4000-8000-000000000000', 'pembeli@umkmhub.id', crypt('CustomerUMKM123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Budi Santoso","role":"customer"}', now(), now(), 'authenticated', 'authenticated')
  ON CONFLICT (id) DO NOTHING;

  -- Promote admin user explicitly
  UPDATE public.profiles SET role = 'admin', phone = '08111000111' WHERE id = v_admin_id;
  UPDATE public.profiles SET role = 'seller', phone = '08126000221' WHERE id = v_seller1_id;
  UPDATE public.profiles SET role = 'seller', phone = '08132500332' WHERE id = v_seller2_id;
  UPDATE public.profiles SET role = 'seller', phone = '08180300443' WHERE id = v_seller3_id;
  UPDATE public.profiles SET role = 'customer', phone = '081299887766' WHERE id = v_customer_id;

  -- Seed UMKM Stores
  INSERT INTO public.stores (id, owner_id, name, slug, description, logo_url, banner_url, city, province, address_detail, phone, whatsapp, nib_number, verification_status, is_featured, rating_avg, total_reviews)
  VALUES
    (
      v_store1_id,
      v_seller1_id,
      'Roastery Kopi Gayo Lestari',
      'roastery-kopi-gayo-lestari',
      'Koperasi petani dan penyangrai kopi Arabika Gayo organik langsung dari dataran tinggi Takengon, Aceh Tengah. Dipetik merah sempurna dan disangrai segar setiap minggu.',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1400&q=80',
      'Takengon',
      'Aceh',
      'Jl. Lebe Kader No. 45, Kec. Bebesen, Kabupaten Aceh Tengah',
      '08126000221',
      '628126000221',
      '9120301847291',
      'approved',
      true,
      4.92,
      128
    ),
    (
      v_store2_id,
      v_seller2_id,
      'Galeri Batik Tulis Sekar Lasem',
      'galeri-batik-tulis-sekar-lasem',
      'Pengrajin batik tulis dan cap asli Lasem dengan pewarna alami dan motif akulturasi klasik Tiga Negeri. Memberdayakan lebih dari 35 pembatik perempuan di Rembang.',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1400&q=80',
      'Rembang',
      'Jawa Tengah',
      'Desa Babagan RT 03/RW 01, Kec. Lasem, Kabupaten Rembang',
      '08132500332',
      '628132500332',
      '9120409928114',
      'approved',
      true,
      4.88,
      94
    ),
    (
      v_store3_id,
      v_seller3_id,
      'Kriya Ketak & Rotan Mandalika',
      'kriya-ketak-rotan-mandalika',
      'Sentra kerajinan anyaman tanaman ketak dan rotan alami berkualitas ekspor dari Lombok Tengah. Cocok untuk dekorasi rumah modern, hotel, dan hampers ramah lingkungan.',
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=80',
      'Praya',
      'Nusa Tenggara Barat',
      'Jl. Raya Bypass Bandara BIL Km. 5, Kec. Praya, Lombok Tengah',
      '08180300443',
      '628180300443',
      '9120507731902',
      'approved',
      true,
      4.85,
      67
    )
  ON CONFLICT (slug) DO NOTHING;

  -- Seed Products
  INSERT INTO public.products (id, store_id, category_id, name, slug, description, price, compare_at_price, stock, sku, weight_grams, status, is_featured, sold_count, rating_avg, review_count)
  VALUES
    (
      '33333333-3333-4333-8333-333333333301',
      v_store1_id,
      '11111111-1111-4111-8111-111111111101',
      'Kopi Arabika Aceh Gayo Wine Process 250g (Biji / Bubuk)',
      'kopi-arabika-aceh-gayo-wine-process-250g',
      'Kopi spesialti Arabika Aceh Gayo yang diolah melalui proses fermentasi Wine selama 30 hari dari buah ceri merah pilihan di ketinggian 1.600 mdpl. Menghasilkan aroma fruity yang kuat, body tebal, dan aftertaste cokelat manis yang panjang.',
      95000,
      115000,
      48,
      'KGL-WINE-250',
      280,
      'active',
      true,
      342,
      4.95,
      86
    ),
    (
      '33333333-3333-4333-8333-333333333302',
      v_store1_id,
      '11111111-1111-4111-8111-111111111101',
      'Kopi Arabika Gayo Semi-Wash Organik 500g',
      'kopi-arabika-gayo-semi-wash-organik-500g',
      'Kopi harian berkualitas kafe dengan profil sangrai Medium. Memiliki cita rasa khas rempah Nusantara, karamel, dan keasaman jeruk yang seimbang. Bersertifikat organik dan halal.',
      135000,
      150000,
      65,
      'KGL-SW-500',
      540,
      'active',
      true,
      215,
      4.90,
      54
    ),
    (
      '33333333-3333-4333-8333-333333333303',
      v_store2_id,
      '11111111-1111-4111-8111-111111111102',
      'Kain Batik Tulis Lasem Motif Sekar Jagad Merah Marun',
      'kain-batik-tulis-lasem-motif-sekar-jagad-merah-marun',
      'Kain batik tulis asli Lasem 100% dikerjakan menggunakan canting tangan di atas kain katun Primisima Kereta Kencana (ukuran 240 x 115 cm). Pewarnaan khas Abang Getih Pithik (Merah Lasem) yang elegan dan tahan puluhan tahun.',
      485000,
      550000,
      12,
      'BTL-SJ-001',
      350,
      'active',
      true,
      78,
      4.92,
      39
    ),
    (
      '33333333-3333-4333-8333-333333333304',
      v_store2_id,
      '11111111-1111-4111-8111-111111111102',
      'Outer Tenun & Batik Cap Kombinasi Modern Unisex',
      'outer-tenun-batik-cap-kombinasi-modern-unisex',
      'Outer kasual rapi yang memadukan batik cap motif Kawung dan tenun lurik Klaten. Dilengkapi furing katun adem yang nyaman untuk acara formal maupun kerja sehari-hari.',
      265000,
      310000,
      24,
      'BTL-OUT-004',
      400,
      'active',
      false,
      119,
      4.85,
      41
    ),
    (
      '33333333-3333-4333-8333-333333333305',
      v_store3_id,
      '11111111-1111-4111-8111-111111111103',
      'Set Nampan & Keranjang Anyaman Ketak Lombok (Isi 3 Pcs)',
      'set-nampan-keranjang-anyaman-ketak-lombok-3pcs',
      'Satu set isi 3 keranjang serbaguna yang dianyam rapat dari serat tanaman ketak liar Lombok. Sudah melalui proses pengovenan anti-jamur dan finishing food-grade.',
      189000,
      225000,
      30,
      'KKM-SET-03',
      850,
      'active',
      true,
      164,
      4.88,
      47
    ),
    (
      '33333333-3333-4333-8333-333333333306',
      v_store3_id,
      '11111111-1111-4111-8111-111111111104',
      'Madu Hutan Sumbawa Murni Raw Honey 500ml',
      'madu-hutan-sumbawa-murni-raw-honey-500ml',
      'Madu hutan liar Apis dorsata asli Sumbawa tanpa pemanasan dan tanpa campuran gula. Kaya enzim alami, propolis, dan antioksidan untuk menjaga daya tahan tubuh keluarga.',
      145000,
      165000,
      40,
      'KKM-MADU-500',
      750,
      'active',
      true,
      290,
      4.94,
      62
    ),
    (
      '33333333-3333-4333-8333-333333333307',
      v_store1_id,
      '11111111-1111-4111-8111-111111111106',
      'Kopi Drip Bag Spesialti Nusantara (Box Isi 10 Sachet)',
      'kopi-drip-bag-spesialti-nusantara-box-10-sachet',
      'Praktis menyeduh kopi Arabika Gayo asli di mana saja tanpa alat seduh rumit. Cukup sobek filter drip bag, gantung di cangkir, dan tuang air panas 90 derajat Celcius.',
      85000,
      99000,
      80,
      'KGL-DRIP-10',
      220,
      'active',
      false,
      410,
      4.91,
      95
    ),
    (
      '33333333-3333-4333-8333-333333333308',
      v_store3_id,
      '11111111-1111-4111-8111-111111111105',
      'Tas Selempang Bulat Rotan Ate Bali Kombinasi Kulit Asli',
      'tas-selempang-bulat-rotan-ate-bali-kulit-asli',
      'Tas selempang bulat berdiameter 20 cm dari anyaman rotan ate yang diasapi tradisional dengan tali kulit sapi asli dan kancing klip kuningan.',
      175000,
      210000,
      18,
      'KKM-BAG-20',
      450,
      'active',
      true,
      132,
      4.86,
      38
    )
  ON CONFLICT (slug) DO NOTHING;

  -- Seed Product Images
  INSERT INTO public.product_images (product_id, image_url, alt_text, is_primary, sort_order)
  VALUES
    ('33333333-3333-4333-8333-333333333301', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80', 'Kopi Arabika Aceh Gayo Wine Process 250g', true, 1),
    ('33333333-3333-4333-8333-333333333302', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80', 'Kopi Arabika Gayo Semi-Wash Organik 500g', true, 1),
    ('33333333-3333-4333-8333-333333333303', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80', 'Kain Batik Tulis Lasem Motif Sekar Jagad', true, 1),
    ('33333333-3333-4333-8333-333333333304', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80', 'Outer Tenun & Batik Cap Kombinasi Modern', true, 1),
    ('33333333-3333-4333-8333-333333333305', 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80', 'Set Nampan & Keranjang Anyaman Ketak Lombok', true, 1),
    ('33333333-3333-4333-8333-333333333306', 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=800&q=80', 'Madu Hutan Sumbawa Murni Raw Honey 500ml', true, 1),
    ('33333333-3333-4333-8333-333333333307', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80', 'Kopi Drip Bag Spesialti Nusantara', true, 1),
    ('33333333-3333-4333-8333-333333333308', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80', 'Tas Selempang Bulat Rotan Ate Bali', true, 1)
  ON CONFLICT DO NOTHING;

  -- Seed Demo Customer Address
  INSERT INTO public.addresses (id, user_id, label, recipient_name, phone, province, city, district, postal_code, full_address, notes, is_default)
  VALUES (
    '44444444-4444-4444-8444-444444444401',
    v_customer_id,
    'Rumah Utama',
    'Budi Santoso',
    '081299887766',
    'DKI Jakarta',
    'Jakarta Selatan',
    'Kebayoran Baru',
    '12160',
    'Jl. Senopati Dalam No. 18B, Kel. Senayan, Kec. Kebayoran Baru',
    'Pagar warna hijau tua di sebelah apotek',
    true
  )
  ON CONFLICT (id) DO NOTHING;
END $$;
