import React from 'react';
import { MapPin, Trash2 } from 'lucide-react';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { Address } from '@/types/database';
import { deleteAddressAction, saveAddressAction } from '@/features/checkout/actions';

export default async function CustomerAddressesPage() {
  let addresses: Address[] = [];

  if (isSupabaseConfigured()) {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });
      addresses = (data as Address[]) || [];
    }
  }

  return (
    <div className="space-y-6">
      <div className="surface-card p-6">
        <h1 className="text-xl font-extrabold text-slate-900">Daftar Alamat Pengiriman</h1>
        <p className="mt-1 text-sm text-slate-600">
          Kelola alamat pengiriman rumah atau kantor untuk mempercepat proses checkout
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 p-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-800">
                    {addr.label} {addr.is_default ? '• Utama' : ''}
                  </span>
                  <form
                    action={async () => {
                      'use server';
                      await deleteAddressAction(addr.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      title="Hapus Alamat"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
                <p className="mt-2 text-sm font-bold text-slate-900">
                  {addr.recipient_name} ({addr.phone})
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {addr.full_address}, Kec. {addr.district}, {addr.city}, {addr.province}{' '}
                  {addr.postal_code}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Address Form */}
      <div className="surface-card p-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <MapPin className="h-5 w-5 text-brand-700" />
          <h2 className="text-base font-extrabold text-slate-900">Tambah Alamat Baru</h2>
        </div>

        <form
          action={async (fd) => {
            'use server';
            await saveAddressAction(fd);
          }}
          className="mt-5 space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-slate-700">Label Alamat</label>
              <input
                type="text"
                name="label"
                required
                defaultValue="Rumah"
                placeholder="Rumah / Kantor"
                className="input-field mt-1.5"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700">Nama Penerima</label>
              <input
                type="text"
                name="recipient_name"
                required
                placeholder="Nama lengkap penerima"
                className="input-field mt-1.5"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700">Nomor HP Penerima</label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="081234567890"
                className="input-field mt-1.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-xs font-bold text-slate-700">Provinsi</label>
              <select name="province" required className="input-field mt-1.5">
                <option value="DKI Jakarta">DKI Jakarta</option>
                <option value="Jawa Barat">Jawa Barat</option>
                <option value="Banten">Banten</option>
                <option value="Jawa Tengah">Jawa Tengah</option>
                <option value="DI Yogyakarta">DI Yogyakarta</option>
                <option value="Jawa Timur">Jawa Timur</option>
                <option value="Bali">Bali</option>
                <option value="Sumatera Utara">Sumatera Utara</option>
                <option value="Aceh">Aceh</option>
                <option value="Sulawesi Selatan">Sulawesi Selatan</option>
                <option value="Nusa Tenggara Barat">Nusa Tenggara Barat</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700">Kota / Kabupaten</label>
              <input
                type="text"
                name="city"
                required
                placeholder="Contoh: Jakarta Selatan"
                className="input-field mt-1.5"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700">Kecamatan</label>
              <input
                type="text"
                name="district"
                required
                placeholder="Contoh: Kebayoran Baru"
                className="input-field mt-1.5"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700">Kode Pos</label>
              <input
                type="text"
                name="postal_code"
                required
                placeholder="12160"
                className="input-field mt-1.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Alamat Lengkap</label>
            <textarea
              name="full_address"
              required
              rows={2}
              placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan..."
              className="input-field mt-1.5"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
              <input type="checkbox" name="is_default" value="true" defaultChecked />
              Jadikan alamat pengiriman utama
            </label>

            <button type="submit" className="btn-primary">
              Simpan Alamat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
