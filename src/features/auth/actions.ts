'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/server';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '@/schemas';
import { Profile } from '@/types/database';

const DEMO_ACCOUNTS: Record<string, { password: string; profile: Profile }> = {
  'admin@umkmhub.id': {
    password: 'AdminUMKM123!',
    profile: {
      id: '00000000-0000-4000-8000-000000000001',
      email: 'admin@umkmhub.id',
      full_name: 'Admin Utama UMKM Hub',
      phone: '08111000111',
      avatar_url: null,
      role: 'admin',
      status: 'active',
      created_at: '2026-01-01T08:00:00+07:00',
      updated_at: '2026-01-01T08:00:00+07:00',
    },
  },
  'kopigayo@umkmhub.id': {
    password: 'SellerUMKM123!',
    profile: {
      id: '00000000-0000-4000-8000-000000000002',
      email: 'kopigayo@umkmhub.id',
      full_name: 'Hendra Syahputra (Roastery Kopi Gayo)',
      phone: '08126000221',
      avatar_url: null,
      role: 'seller',
      status: 'active',
      created_at: '2026-01-12T09:00:00+07:00',
      updated_at: '2026-01-12T09:00:00+07:00',
    },
  },
  'pembeli@umkmhub.id': {
    password: 'CustomerUMKM123!',
    profile: {
      id: '00000000-0000-4000-8000-000000000005',
      email: 'pembeli@umkmhub.id',
      full_name: 'Budi Santoso',
      phone: '081299887766',
      avatar_url: null,
      role: 'customer',
      status: 'active',
      created_at: '2026-01-20T11:00:00+07:00',
      updated_at: '2026-01-20T11:00:00+07:00',
    },
  },
};

export async function getCurrentUserProfile(): Promise<Profile | null> {
  const cookieStore = cookies();
  const demoEmail = cookieStore.get('umkm_demo_session')?.value;
  if (demoEmail && DEMO_ACCOUNTS[demoEmail]) {
    return DEMO_ACCOUNTS[demoEmail].profile;
  }

  if (!isSupabaseConfigured()) return null;

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profile) {
    return profile as Profile;
  }

  // Fallback if user exists in Supabase Auth before public.profiles table is migrated
  const metaRole =
    user.email === 'admin@umkmhub.id'
      ? 'admin'
      : (user.user_metadata?.role as 'customer' | 'seller' | 'admin') || 'customer';

  return {
    id: user.id,
    email: user.email || '',
    full_name:
      (user.user_metadata?.full_name as string) ||
      (user.email === 'admin@umkmhub.id' ? 'Admin Utama UMKM Hub' : 'Pengguna UMKM Hub'),
    phone: (user.user_metadata?.phone as string) || null,
    avatar_url: null,
    role: metaRole,
    status: 'active',
    created_at: user.created_at,
    updated_at: user.created_at,
  };
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const emailLower = parsed.data.email.trim().toLowerCase();

  if (isSupabaseConfigured()) {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailLower,
      password: parsed.data.password,
    });

    if (!error && data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', data.user.id)
        .single();

      if (profile?.status === 'suspended') {
        await supabase.auth.signOut();
        return { error: 'Akun Anda sedang ditangguhkan oleh Administrator UMKM Hub.' };
      }

      const effectiveRole =
        profile?.role ||
        (emailLower === 'admin@umkmhub.id'
          ? 'admin'
          : (data.user.user_metadata?.role as string) || 'customer');

      revalidatePath('/', 'layout');

      const destination =
        effectiveRole === 'admin'
          ? '/admin'
          : effectiveRole === 'seller'
            ? '/seller'
            : '/customer';

      return { success: true, redirectTo: destination };
    }
  }

  // Instant session support for seeded Admin / Seller / Customer accounts if SQL seed hasn't been run yet
  const demoMatch = DEMO_ACCOUNTS[emailLower];
  if (demoMatch && demoMatch.password === parsed.data.password) {
    cookies().set('umkm_demo_session', emailLower, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    revalidatePath('/', 'layout');

    const destination =
      demoMatch.profile.role === 'admin'
        ? '/admin'
        : demoMatch.profile.role === 'seller'
          ? '/seller'
          : '/customer';

    return { success: true, redirectTo: destination };
  }

  return { error: 'Email atau kata sandi salah. Silakan periksa kembali.' };
}

export async function registerAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    return {
      error:
        'Kredensial Supabase belum diatur pada .env.local. Silakan salin .env.example ke .env.local terlebih dahulu.',
    };
  }

  const parsed = registerSchema.safeParse({
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    role: formData.get('role') || 'customer',
    password: formData.get('password'),
    confirm_password: formData.get('confirm_password'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.full_name,
        phone: parsed.data.phone,
        role: parsed.data.role,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');

  if (data.session) {
    return {
      success: true,
      redirectTo: parsed.data.role === 'seller' ? '/seller/store' : '/customer',
    };
  }

  return {
    success: true,
    message:
      'Pendaftaran berhasil! Silakan cek kotak masuk email Anda untuk verifikasi akun sebelum masuk.',
  };
}

export async function forgotPasswordAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    return { error: 'Kredensial Supabase belum diatur pada .env.local.' };
  }

  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get('email'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = createServerSupabaseClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${appUrl}/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
    message: 'Tautan pemulihan kata sandi telah dikirim ke email Anda.',
  };
}

export async function resetPasswordAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    return { error: 'Kredensial Supabase belum diatur pada .env.local.' };
  }

  const parsed = resetPasswordSchema.safeParse({
    password: formData.get('password'),
    confirm_password: formData.get('confirm_password'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
    message: 'Kata sandi Anda berhasil diperbarui. Silakan masuk.',
  };
}

export async function logoutAction() {
  cookies().delete('umkm_demo_session');
  if (isSupabaseConfigured()) {
    const supabase = createServerSupabaseClient();
    await supabase.auth.signOut();
  }
  revalidatePath('/', 'layout');
  redirect('/login');
}
