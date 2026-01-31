/**
 * HBF Menu Seed Dataset - Extracted from provided menu images
 * Categories: Burgers, Shawarma, Broast, Grilled Burgers, BBQ & Fish, Fries & Nuggets,
 * Pizza Burgers, Wings/Sandwiches/Pasta, Drinks & Extras, Deals, Pizzas
 */

export interface SeedCategory {
  name: string;
  sort_order: number;
}

export interface SeedProduct {
  name: string;
  price: number;
  description?: string;
  size_options?: { name: string; price: number }[];
}

export interface SeedDeal {
  title: string;
  price: number;
  items: { product_name: string; qty?: number }[];
}

export const SEED_CATEGORIES: SeedCategory[] = [
  { name: 'HBF Burgers', sort_order: 1 },
  { name: 'HBF Shawarma', sort_order: 2 },
  { name: 'HBF Injected Broast', sort_order: 3 },
  { name: 'GRILLED Burgers', sort_order: 4 },
  { name: 'BBQ & Fish', sort_order: 5 },
  { name: 'FRIES & Nuggets', sort_order: 6 },
  { name: 'PIZZA Burgers', sort_order: 7 },
  { name: 'WINGS | Sandwiches | PASTA', sort_order: 8 },
  { name: 'DRINKS & Extras', sort_order: 9 },
  { name: 'HBF Pizzas', sort_order: 10 },
  { name: 'HBF Deals', sort_order: 11 },
];

export const SEED_PRODUCTS: (SeedProduct & { category: string })[] = [
  // HBF Burgers
  { category: 'HBF Burgers', name: 'Zinger Burger', price: 400 },
  { category: 'HBF Burgers', name: 'Zinger Burger Meal', price: 450 },
  { category: 'HBF Burgers', name: 'Zinger Burger Combo', price: 520 },
  { category: 'HBF Burgers', name: 'Zinger Burger Cheese', price: 460 },
  { category: 'HBF Burgers', name: 'Zinger Mighty Burger', price: 560 },
  { category: 'HBF Burgers', name: 'Zinger Mighty Burger Combo', price: 670 },
  { category: 'HBF Burgers', name: 'Fish Zinger Burger', price: 600 },
  { category: 'HBF Burgers', name: 'Fish Zinger Burger Meal', price: 650 },
  { category: 'HBF Burgers', name: 'Chicken Patty Burger', price: 300 },
  { category: 'HBF Burgers', name: 'Chicken Patty Burger Meal', price: 350 },
  { category: 'HBF Burgers', name: 'Crispy Chicken Cheese Burger', price: 360 },
  { category: 'HBF Burgers', name: 'Tower Patty Burger Combo', price: 610 },
  { category: 'HBF Burgers', name: 'Chicken Cheese Jalapeno Burger', price: 380 },
  { category: 'HBF Burgers', name: 'Chicken Fillet Burger', price: 550 },
  // HBF Shawarma
  { category: 'HBF Shawarma', name: 'Shawarma', price: 200 },
  { category: 'HBF Shawarma', name: 'Special Shawarma', price: 250 },
  { category: 'HBF Shawarma', name: 'Cheese Shawarma', price: 270 },
  { category: 'HBF Shawarma', name: 'Platter Shawarma', price: 420 },
  { category: 'HBF Shawarma', name: 'Cheese Platter Shawarma', price: 480 },
  { category: 'HBF Shawarma', name: 'Grill Shawarma', price: 360 },
  { category: 'HBF Shawarma', name: 'Malai Shawarma', price: 410 },
  { category: 'HBF Shawarma', name: 'Malai Pratha', price: 430 },
  { category: 'HBF Shawarma', name: 'Zinger Paratha Roll', price: 400 },
  { category: 'HBF Shawarma', name: 'Zinger Shawarma Roll', price: 380 },
  { category: 'HBF Shawarma', name: 'Tikka Pratha', price: 380 },
  { category: 'HBF Shawarma', name: 'Tikka Shawarma', price: 360 },
  { category: 'HBF Shawarma', name: 'Kebab Paratha', price: 410 },
  // HBF Injected Broast
  { category: 'HBF Injected Broast', name: 'Broast Quarter', price: 650, description: '2 Pieces - 1 Thai & 1 Leg Piece - 1 Burger Bun - 2 Dip Sauce - Fries' },
  { category: 'HBF Injected Broast', name: 'Broast Half', price: 1200, description: '4 Pieces - 2 Thai & 2 Leg Pieces - 1 Burger Bun - 2 Dip Sauces - Fries' },
  { category: 'HBF Injected Broast', name: 'Broast Full', price: 2400, description: '8 Piece - 4 Thai & 4 Leg Pieces - 2 Burger Buns - 4 Dip Sauces - Fries' },
  { category: 'HBF Injected Broast', name: 'Broast Family', price: 3400, description: '12 Pieces - 6 Thai & 6 Leg Pieces - 3 Burger Buns - 6 Dip Sauces - Fries' },
  // GRILLED Burgers
  { category: 'GRILLED Burgers', name: 'Yum Pum Chicken Grilled Burger', price: 410 },
  { category: 'GRILLED Burgers', name: 'Jalapeno Grilled Chicken Burger', price: 450 },
  { category: 'GRILLED Burgers', name: 'Cocktail Grilled Chicken Burger', price: 510 },
  { category: 'GRILLED Burgers', name: 'Spicy Grilled Chicken Burger', price: 450 },
  { category: 'GRILLED Burgers', name: 'Mushroom Grilled Chicken Burger', price: 450 },
  { category: 'GRILLED Burgers', name: 'B.B.Q Grilled Chicken Burger', price: 450 },
  { category: 'GRILLED Burgers', name: 'Creamy Grilled Chicken Burger', price: 450 },
  { category: 'GRILLED Burgers', name: 'Super Duper Grilled Chicken Burger', price: 610 },
  { category: 'GRILLED Burgers', name: 'Classic Beef Grilled Burger', price: 510 },
  { category: 'GRILLED Burgers', name: 'Jalapeno Beef Grilled Burger', price: 510 },
  { category: 'GRILLED Burgers', name: 'Mushroom Beef Grilled Burger', price: 510 },
  { category: 'GRILLED Burgers', name: 'Double Masti Beef Grilled Burger', price: 700 },
  // BBQ & Fish
  { category: 'BBQ & Fish', name: 'Chicken Kabab', price: 1400, description: 'Per Kg' },
  { category: 'BBQ & Fish', name: 'Rashmi Chicken Kabab', price: 1600, description: 'Per Kg' },
  { category: 'BBQ & Fish', name: 'Chicken Tikka', price: 1200, description: 'Per Kg' },
  { category: 'BBQ & Fish', name: 'Beef Kabab', price: 1600, description: 'Per Kg' },
  { category: 'BBQ & Fish', name: 'Malai Boti', price: 1600, description: 'Per Kg' },
  { category: 'BBQ & Fish', name: 'Cheese Keabab', price: 1800, description: 'Per Kg' },
  { category: 'BBQ & Fish', name: 'Chicken Chest Piece', price: 390 },
  { category: 'BBQ & Fish', name: 'Chicken Leg Piece', price: 370 },
  { category: 'BBQ & Fish', name: 'Grill Fish', price: 1800, description: 'Per Kg' },
  // FRIES & Nuggets
  { category: 'FRIES & Nuggets', name: 'Loaded Fries', price: 400, size_options: [{ name: 'Small', price: 400 }, { name: 'Large', price: 750 }] },
  { category: 'FRIES & Nuggets', name: 'Half Fries', price: 200 },
  { category: 'FRIES & Nuggets', name: 'Full Fries', price: 350 },
  { category: 'FRIES & Nuggets', name: 'Masala Fries', price: 240 },
  { category: 'FRIES & Nuggets', name: 'Chicken Nuggets (4 Pcs)', price: 280 },
  // PIZZA Burgers
  { category: 'PIZZA Burgers', name: 'Pizza Zinger Burger', price: 590 },
  { category: 'PIZZA Burgers', name: 'Pizza Zinger Burger Meal', price: 640 },
  { category: 'PIZZA Burgers', name: 'Pizza Patty Burger', price: 480 },
  { category: 'PIZZA Burgers', name: 'Pizza Patty Burger Meal', price: 530 },
  { category: 'PIZZA Burgers', name: 'Shami Burger', price: 180 },
  // WINGS | Sandwiches | PASTA
  { category: 'WINGS | Sandwiches | PASTA', name: 'Chicken Sandwich', price: 410 },
  { category: 'WINGS | Sandwiches | PASTA', name: 'Grilled Sandwich', price: 530 },
  { category: 'WINGS | Sandwiches | PASTA', name: 'Club Sandwich', price: 460 },
  { category: 'WINGS | Sandwiches | PASTA', name: '8 Hot Wings Piece', price: 540 },
  { category: 'WINGS | Sandwiches | PASTA', name: 'Penne Pasta', price: 480, size_options: [{ name: 'Small', price: 480 }, { name: 'Large', price: 800 }] },
  { category: 'WINGS | Sandwiches | PASTA', name: 'HBF Special Crunchy Pasta', price: 480, size_options: [{ name: 'Small', price: 480 }, { name: 'Large', price: 800 }] },
  // DRINKS & Extras
  { category: 'DRINKS & Extras', name: 'Regular Drink (345ml)', price: 80 },
  { category: 'DRINKS & Extras', name: '500ml Drink', price: 120 },
  { category: 'DRINKS & Extras', name: '1.5 Ltr. Drink', price: 220 },
  { category: 'DRINKS & Extras', name: '2.25 Ltr. Drink', price: 300 },
  { category: 'DRINKS & Extras', name: 'Sting 500ml', price: 150 },
  { category: 'DRINKS & Extras', name: 'Mineral Water / L (Large)', price: 100 },
  { category: 'DRINKS & Extras', name: 'Mineral Water / S (Small)', price: 60 },
  { category: 'DRINKS & Extras', name: 'Disposable Cup', price: 10 },
  { category: 'DRINKS & Extras', name: 'Mayonnaise', price: 50 },
  { category: 'DRINKS & Extras', name: 'Cheese Slice', price: 70 },
  { category: 'DRINKS & Extras', name: 'Coleslaw Salad', price: 50 },
  // Kids Deals
  { category: 'DRINKS & Extras', name: 'KIDS DEAL 1', price: 410, description: 'Chicken Burger, Fries, Drink 250 ML' },
  { category: 'DRINKS & Extras', name: 'KIDS DEAL 2', price: 390, description: '5 Nuggets, Drink 250 ML' },
];

// HBF Pizzas - with size options S/M/L
export const SEED_PIZZAS: (SeedProduct & { category: string })[] = [
  { category: 'HBF Pizzas', name: 'Chicken Tikka Pizza', price: 650, description: 'Tikka Boti, Tomatoes, Black Olives, Cheese', size_options: [{ name: 'S-7"', price: 650 }, { name: 'M-10"', price: 1080 }, { name: 'L-14"', price: 1390 }] },
  { category: 'HBF Pizzas', name: 'Chicken Fajita Pizza', price: 650, description: 'Fajita Chicken, Tomatoes, Capsicum, Cheese', size_options: [{ name: 'S-7"', price: 650 }, { name: 'M-10"', price: 1080 }, { name: 'L-14"', price: 1390 }] },
  { category: 'HBF Pizzas', name: 'Midway Supreme Pizza', price: 650, description: 'Smokey Chicken, Black Olives, Capsicum, Sweet Corns, Cheese', size_options: [{ name: 'S-7"', price: 650 }, { name: 'M-10"', price: 1080 }, { name: 'L-14"', price: 1390 }] },
  { category: 'HBF Pizzas', name: 'Pickle Acahri Pizza', price: 650, description: 'Chicken Achari, Tomatoes, Black Olives, Cheese', size_options: [{ name: 'S-7"', price: 650 }, { name: 'M-10"', price: 1080 }, { name: 'L-14"', price: 1390 }] },
  { category: 'HBF Pizzas', name: 'Shahi Pizza', price: 750, description: 'Chicken, Almonds, Cashew Nuts, Mushrooms, Black Olives, Sausages, Tomatoes, Cheese', size_options: [{ name: 'S-7"', price: 750 }, { name: 'M-10"', price: 1180 }, { name: 'L-14"', price: 1590 }] },
  { category: 'HBF Pizzas', name: 'Pepperoni Pizza', price: 750, description: 'Pepperoni, Tomatoes, Bell Pepper', size_options: [{ name: 'S-7"', price: 750 }, { name: 'M-10"', price: 1180 }, { name: 'L-14"', price: 1590 }] },
  { category: 'HBF Pizzas', name: 'HBF Special Pizza', price: 750, description: 'Minced Chicken, Lasagna Sauce, Black Olives, Sausages, Tomatoes, Capsicum, Jalapeno', size_options: [{ name: 'S-7"', price: 750 }, { name: 'M-10"', price: 1180 }, { name: 'L-14"', price: 1590 }] },
  { category: 'HBF Pizzas', name: 'Peri Peri Pizza', price: 750, description: 'Chicken, Cheese, Jalapeno & Peri Peri Sauce', size_options: [{ name: 'S-7"', price: 750 }, { name: 'M-10"', price: 1180 }, { name: 'L-14"', price: 1590 }] },
  { category: 'HBF Pizzas', name: 'Lasagna Pizza', price: 750, description: 'Minced Chicken, Lasagna Sauce, Black Olives, Tomatoes, Capsicum', size_options: [{ name: 'S-7"', price: 750 }, { name: 'M-10"', price: 1180 }, { name: 'L-14"', price: 1590 }] },
  { category: 'HBF Pizzas', name: 'Malai Boti Pizza', price: 750, description: 'Chicken Malai Boti, Capsicum, Cheese, Mushrooms', size_options: [{ name: 'S-7"', price: 750 }, { name: 'M-10"', price: 1180 }, { name: 'L-14"', price: 1590 }] },
  { category: 'HBF Pizzas', name: 'Seekh Kebab Pizza', price: 750, description: 'Chicken Seekh Kebab, HBF Special Topping', size_options: [{ name: 'S-7"', price: 750 }, { name: 'M-10"', price: 1180 }, { name: 'L-14"', price: 1590 }] },
  { category: 'HBF Pizzas', name: 'Veggie Deluxe Pizza', price: 600, description: 'Combination of Fresh Vegetables, Spring Onions, Tomatoes, Black Olives, Mushrooms, Sweet Corns, Bell Pepper, Jalapeno', size_options: [{ name: 'S-7"', price: 600 }, { name: 'M-10"', price: 990 }, { name: 'L-14"', price: 1200 }] },
  { category: 'HBF Pizzas', name: 'Cheese Lovers Pizza', price: 600, description: 'Loads of Cheddar & Mozzarella Cheese', size_options: [{ name: 'S-7"', price: 600 }, { name: 'M-10"', price: 990 }, { name: 'L-14"', price: 1200 }] },
  { category: 'HBF Pizzas', name: 'Crown Crust Pizza', price: 1350, description: 'Chicken, Black Olives, Mushrooms, Cheese, Kabab', size_options: [{ name: 'M-10"', price: 1350 }, { name: 'L-14"', price: 1700 }] },
  { category: 'HBF Pizzas', name: 'Stuffed Crust Pizza', price: 800, description: 'Crust Filled With Seekh Kebabs, Malai Boti on Top & HBF Special Topping', size_options: [{ name: 'S-7"', price: 800 }, { name: 'M-10"', price: 1350 }, { name: 'L-14"', price: 1700 }] },
  { category: 'HBF Pizzas', name: 'Extra Topping', price: 150, description: 'Add extra topping to your pizza', size_options: [{ name: 'S-7"', price: 150 }, { name: 'M-10"', price: 200 }, { name: 'L-14"', price: 250 }] },
];

// HBF Deals - combo deals
export const SEED_DEALS: SeedDeal[] = [
  { title: '1 Large Pizza', price: 1099, items: [{ product_name: '1 Large Pizza (Tikka & Fajita)' }] },
  { title: 'STUDENT DEAL', price: 1120, items: [{ product_name: '1 Zinger Burger' }, { product_name: '1 Small Pizza' }, { product_name: 'Drink 500ML' }] },
  { title: 'DOUBLE DEAL', price: 1330, items: [{ product_name: '2 Zinger Burgers' }, { product_name: '4 Nuggets' }, { product_name: 'Drink 500ML' }, { product_name: 'Small Fries' }] },
  { title: 'DEAL 1', price: 1720, items: [{ product_name: '1 Zinger Burger' }, { product_name: '2 Small Pizzas' }, { product_name: 'Drink 500ML' }] },
  { title: 'TRIPLE DEAL', price: 2100, items: [{ product_name: '3 Zinger Burgers' }, { product_name: '1 Zinger Shawarma' }, { product_name: '4 Nuggets' }, { product_name: 'Drink 1.5 LTR' }, { product_name: 'Small Fries' }] },
  { title: 'DEAL TWO', price: 2930, items: [{ product_name: '1 Medium Pizza' }, { product_name: '1 Small Pizza' }, { product_name: '3 Zinger Burgers' }, { product_name: 'Drink 1.5 LTR' }] },
  { title: 'FOURTH DEAL', price: 2670, items: [{ product_name: '5 Zinger Burgers' }, { product_name: '1 Pratha Roll' }, { product_name: 'Drink 2 LTR' }, { product_name: 'Small Fries' }] },
  { title: 'DEAL THREE', price: 2180, items: [{ product_name: '2 Medium Pizzas' }, { product_name: 'Drink 1.5 LTR' }] },
  { title: 'NINTH DEAL', price: 2480, items: [{ product_name: '1 Large Pizza' }, { product_name: '1 Medium Pizza' }, { product_name: 'Drink 1.5 LTR' }] },
  { title: 'SINGLE DEAL', price: 770, items: [{ product_name: '1 Zinger Burger Meal' }, { product_name: '4 Nuggets' }, { product_name: 'Regular Drink' }] },
  { title: 'TENTH DEAL', price: 3450, items: [{ product_name: '2 Large Pizzas' }, { product_name: '1 Small Pizza' }, { product_name: 'Drink 2 LTR' }] },
];
