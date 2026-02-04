/** Product name patterns for upsell suggestions (fries, drinks, extras) */
export const SUGGESTED_ADDON_PATTERNS = [
  /fries|french fries|chips/i,
  /cola|coke|pepsi|drink|soft drink/i,
  /nuggets/i,
  /garlic bread|bread/i,
  /dip|sauce/i,
];

export function isSuggestedAddon(productName: string): boolean {
  return SUGGESTED_ADDON_PATTERNS.some((p) => p.test(productName));
}
