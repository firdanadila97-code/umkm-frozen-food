-- ============================================================================
-- UMKM HUB - BUAT / PROMOSIKAN AKUN ADMINISTRATOR UTAMA
-- Jalankan di Supabase SQL Editor: https://supabase.com/dashboard/project/zbvqzufnprwzaxpakvtv/sql/new
-- Email Admin   : admin@umkmhub.id
-- Password Admin: AdminUMKM123!
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  v_admin_id UUID;
BEGIN
  -- 1. Cek apakah user admin@umkmhub.id sudah ada di auth.users
  SELECT id INTO v_admin_id
  FROM auth.users
  WHERE email = 'admin@umkmhub.id'
  LIMIT 1;

  -- 2. Jika belum ada, buat user baru di auth.users beserta auth.identities
  IF v_admin_id IS NULL THEN
    v_admin_id := '00000000-0000-4000-8000-000000000001';

    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    )
    VALUES (
      v_admin_id,
      '00000000-0000-0000-0000-000000000000',
      'admin@umkmhub.id',
      crypt('AdminUMKM123!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Admin Utama UMKM Hub","role":"admin"}',
      now(),
      now(),
      'authenticated',
      'authenticated',
      '',
      '',
      '',
      ''
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      v_admin_id,
      v_admin_id::text,
      format('{"sub":"%s","email":"admin@umkmhub.id","email_verified":true}', v_admin_id)::jsonb,
      'email',
      now(),
      now(),
      now()
    )
    ON CONFLICT DO NOTHING;
  ELSE
    -- Jika sudah ada, pastikan password & konfirmasi email aktif
    UPDATE auth.users
    SET
      encrypted_password = crypt('AdminUMKM123!', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      raw_user_meta_data = '{"full_name":"Admin Utama UMKM Hub","role":"admin"}'::jsonb,
      updated_at = now()
    WHERE id = v_admin_id;
  END IF;

  -- 3. Pastikan profil di public.profiles memiliki role = 'admin' dan status = 'active'
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    INSERT INTO public.profiles (id, email, full_name, phone, role, status)
    VALUES (
      v_admin_id,
      'admin@umkmhub.id',
      'Admin Utama UMKM Hub',
      '08111000111',
      'admin',
      'active'
    )
    ON CONFLICT (id) DO UPDATE
    SET
      role = 'admin',
      status = 'active',
      full_name = 'Admin Utama UMKM Hub',
      updated_at = now();
  END IF;
END $$;
