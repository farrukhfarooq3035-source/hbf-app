/**
 * HBF store location: Near Pak Arab Society, Opp Awan Market, Lahore
 */
export const STORE_LAT = 31.5204;
export const STORE_LNG = 74.3587;

/** Distance in km using Haversine formula */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Delivery fee: ≤5 km free, beyond 5 km Rs 30 per km */
export function getDeliveryFeeFromDistance(km: number): number {
  if (km <= 5) return 0;
  return Math.ceil((km - 5) * 30);
}
