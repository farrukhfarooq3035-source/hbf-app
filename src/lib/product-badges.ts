/** Premium badge config - Chef's Pick, Most Loved, HBF Signature */
export type BadgeType = 'chefs-pick' | 'most-loved' | 'signature';

export const PRODUCT_BADGES: Record<string, BadgeType> = {
  'Zinger Burger': 'most-loved',
  'Chicken Tikka Pizza': 'chefs-pick',
  'Broast Quarter': 'signature',
  'HBF Special Pizza': 'signature',
  'Zinger Burger Meal': 'most-loved',
  'Chicken Fajita Pizza': 'chefs-pick',
  'Malai Shawarma': 'signature',
  'Super Duper Grilled Chicken Burger': 'chefs-pick',
  'HBF Zinger': 'most-loved',
  'BBQ Grilled Burger': 'chefs-pick',
};

export function getProductBadge(productName: string): BadgeType | null {
  return PRODUCT_BADGES[productName] ?? null;
}
