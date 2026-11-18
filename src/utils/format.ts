import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format angka menjadi mata uang Rupiah (IDR)
 */
export function formatRupiah(amount: number | string | null | undefined): string {
  const num = Number(amount ?? 0);
  if (Number.isNaN(num)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Format tanggal dan waktu ke zona waktu Asia/Jakarta (WIB)
 */
export function formatDateWIB(
  dateInput: string | Date | null | undefined,
  includeTime = false
): string {
  if (!dateInput) return '-';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return '-';

  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Jakarta',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(includeTime
      ? {
          hour: '2-digit',
          minute: '2-digit',
        }
      : {}),
  };

  const formatted = new Intl.DateTimeFormat('id-ID', options).format(date);
  return includeTime ? `${formatted} WIB` : formatted;
}

/**
 * Buat URL-friendly slug dari nama produk/toko/kategori
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Hitung persentase diskon jika compare_at_price tersedia
 */
export function calculateDiscountPercentage(
  price: number,
  compareAtPrice?: number | null
): number | null {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}
