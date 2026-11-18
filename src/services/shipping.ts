import { ShippingOption } from '@/types/database';

/**
 * Configurable Indonesian Courier Shipping Calculator
 * Supports JNE, SiCepat, J&T Express, and Pos Indonesia.
 * Calculates cost based on total weight (in grams) and origin/destination city zone.
 */
const PROVINCE_ZONE_MULTIPLIER: Record<string, number> = {
  'DKI Jakarta': 1.0,
  'Jawa Barat': 1.1,
  'Banten': 1.1,
  'Jawa Tengah': 1.35,
  'DI Yogyakarta': 1.35,
  'Jawa Timur': 1.5,
  'Bali': 1.85,
  'Sumatera Utara': 2.1,
  'Aceh': 2.4,
  'Sumatera Barat': 2.0,
  'Riau': 1.95,
  'Sumatera Selatan': 1.8,
  'Kalimantan Timur': 2.3,
  'Kalimantan Selatan': 2.1,
  'Sulawesi Selatan': 2.25,
  'Nusa Tenggara Barat': 2.15,
  'Nusa Tenggara Timur': 2.6,
  'Papua': 3.8,
};

export function calculateShippingOptions(
  originProvince: string,
  destinationProvince: string,
  totalWeightGrams: number
): ShippingOption[] {
  const baseRatePerKg = Number(process.env.SHIPPING_BASE_RATE_PER_KG || 12000);
  const billableKg = Math.max(1, Math.ceil(totalWeightGrams / 1000));

  const sameProvince =
    originProvince.trim().toLowerCase() === destinationProvince.trim().toLowerCase();

  const destMultiplier = sameProvince
    ? 0.9
    : PROVINCE_ZONE_MULTIPLIER[destinationProvince] ?? 1.75;

  const baseCost = Math.round((baseRatePerKg * billableKg * destMultiplier) / 500) * 500;

  return [
    {
      courierCode: 'jne',
      courierName: 'JNE Express',
      service: 'REG',
      description: 'Layanan Reguler Seluruh Nusantara',
      etdDays: sameProvince ? '1 - 2 Hari' : '2 - 4 Hari',
      cost: baseCost,
    },
    {
      courierCode: 'jne',
      courierName: 'JNE Express',
      service: 'YES',
      description: 'Yakin Esok Sampai (Prioritas)',
      etdDays: '1 Hari',
      cost: Math.round((baseCost * 1.65) / 500) * 500,
    },
    {
      courierCode: 'sicepat',
      courierName: 'SiCepat Ekspres',
      service: 'REG',
      description: 'SiCepat Reguler Terpercaya',
      etdDays: sameProvince ? '1 - 2 Hari' : '2 - 3 Hari',
      cost: Math.max(8000, baseCost - 1000),
    },
    {
      courierCode: 'sicepat',
      courierName: 'SiCepat Ekspres',
      service: 'BEST',
      description: 'Besok Sampai Tujuan',
      etdDays: '1 Hari',
      cost: Math.round((baseCost * 1.55) / 500) * 500,
    },
    {
      courierCode: 'jnt',
      courierName: 'J&T Express',
      service: 'EZ',
      description: 'Pengiriman Reguler Ekonomis',
      etdDays: sameProvince ? '1 - 2 Hari' : '2 - 4 Hari',
      cost: baseCost,
    },
    {
      courierCode: 'pos',
      courierName: 'Pos Indonesia',
      service: 'Pos Reguler',
      description: 'Jangkauan hingga pelosok kecamatan Indonesia',
      etdDays: sameProvince ? '2 - 3 Hari' : '3 - 6 Hari',
      cost: Math.max(7500, Math.round((baseCost * 0.85) / 500) * 500),
    },
  ];
}
