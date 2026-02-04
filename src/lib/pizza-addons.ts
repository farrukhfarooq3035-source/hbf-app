/** Standard pizza addons - Extra Cheese Rs 50, Extra Toppings Rs 100 */
export const PIZZA_ADDONS = [
  { name: 'Extra Cheese', price: 50 },
  { name: 'Extra Toppings', price: 100 },
] as const;

/** Only HBF Pizzas category gets add-ons (not Pizza Burgers, etc.) */
export const PIZZA_CATEGORY_NAME = 'HBF Pizzas';

export function isPizzaProduct(product: { category_name?: string }): boolean {
  return (product.category_name ?? '').trim() === PIZZA_CATEGORY_NAME;
}
