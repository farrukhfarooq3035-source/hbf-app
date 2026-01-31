/**
 * Script to update HBF Pizzas in Supabase with complete details
 * Run: node scripts/update-pizzas.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// All pizza data with complete details from menu image
const PIZZAS_DATA = [
  {
    name: 'Chicken Tikka Pizza',
    price: 650,
    description: 'Tikka Boti, Tomatoes, Black Olives, Cheese',
    size_options: [
      { name: 'S-7"', price: 650 },
      { name: 'M-10"', price: 1080 },
      { name: 'L-14"', price: 1390 }
    ]
  },
  {
    name: 'Chicken Fajita Pizza',
    price: 650,
    description: 'Fajita Chicken, Tomatoes, Capsicum, Cheese',
    size_options: [
      { name: 'S-7"', price: 650 },
      { name: 'M-10"', price: 1080 },
      { name: 'L-14"', price: 1390 }
    ]
  },
  {
    name: 'Midway Supreme Pizza',
    price: 650,
    description: 'Smokey Chicken, Black Olives, Capsicum, Sweet Corns, Cheese',
    size_options: [
      { name: 'S-7"', price: 650 },
      { name: 'M-10"', price: 1080 },
      { name: 'L-14"', price: 1390 }
    ]
  },
  {
    name: 'Pickle Acahri Pizza',
    price: 650,
    description: 'Chicken Achari, Tomatoes, Black Olives, Cheese',
    size_options: [
      { name: 'S-7"', price: 650 },
      { name: 'M-10"', price: 1080 },
      { name: 'L-14"', price: 1390 }
    ]
  },
  {
    name: 'Shahi Pizza',
    price: 750,
    description: 'Chicken, Almonds, Cashew Nuts, Mushrooms, Black Olives, Sausages, Tomatoes, Cheese',
    size_options: [
      { name: 'S-7"', price: 750 },
      { name: 'M-10"', price: 1180 },
      { name: 'L-14"', price: 1590 }
    ]
  },
  {
    name: 'Pepperoni Pizza',
    price: 750,
    description: 'Pepperoni, Tomatoes, Bell Pepper',
    size_options: [
      { name: 'S-7"', price: 750 },
      { name: 'M-10"', price: 1180 },
      { name: 'L-14"', price: 1590 }
    ]
  },
  {
    name: 'HBF Special Pizza',
    price: 750,
    description: 'Minced Chicken, Lazzania Sauce, Black Olives, Sausages, Tomatoes, Capsicum, Jalapeno',
    size_options: [
      { name: 'S-7"', price: 750 },
      { name: 'M-10"', price: 1180 },
      { name: 'L-14"', price: 1590 }
    ]
  },
  {
    name: 'Peri Peri Pizza',
    price: 750,
    description: 'Chicken, Cheese, Jalapeno & Peri Peri Sauce',
    size_options: [
      { name: 'S-7"', price: 750 },
      { name: 'M-10"', price: 1180 },
      { name: 'L-14"', price: 1590 }
    ]
  },
  {
    name: 'Lasagna Pizza',
    price: 750,
    description: 'Minced Chicken, Lasagna Sauce, Black Olives, Tomatoes, Capsicum',
    size_options: [
      { name: 'S-7"', price: 750 },
      { name: 'M-10"', price: 1180 },
      { name: 'L-14"', price: 1590 }
    ]
  },
  {
    name: 'Malai Boti Pizza',
    price: 750,
    description: 'Chicken Malai Boti, Capsicum, Cheese, Mushrooms',
    size_options: [
      { name: 'S-7"', price: 750 },
      { name: 'M-10"', price: 1180 },
      { name: 'L-14"', price: 1590 }
    ]
  },
  {
    name: 'Seekh Kebab Pizza',
    price: 750,
    description: 'Chicken Seekh Kebab, HBF Special Topping',
    size_options: [
      { name: 'S-7"', price: 750 },
      { name: 'M-10"', price: 1180 },
      { name: 'L-14"', price: 1590 }
    ]
  },
  {
    name: 'Veggie Duluxe Pizza',
    price: 600,
    description: 'Combination of Fresh Vegetables, Spring Onions, Tomatoes, Black Olives, Mushrooms, Sweet Corns, Bell Pepper, Jalapeno',
    size_options: [
      { name: 'S-7"', price: 600 },
      { name: 'M-10"', price: 990 },
      { name: 'L-14"', price: 1200 }
    ]
  },
  {
    name: 'Cheese Lovers Pizza',
    price: 600,
    description: 'Loads of Cheddar & Mozzarella Cheese',
    size_options: [
      { name: 'S-7"', price: 600 },
      { name: 'M-10"', price: 990 },
      { name: 'L-14"', price: 1200 }
    ]
  },
  {
    name: 'Crown Crust Pizza',
    price: 1350,
    description: 'Chicken, Black Olives, Mushrooms, Cheese, Kabab',
    size_options: [
      { name: 'M-10"', price: 1350 },
      { name: 'L-14"', price: 1700 }
    ]
  },
  {
    name: 'Stuffed Crust Pizza',
    price: 800,
    description: 'Crust Filled With Seekh Kebabs, Malai Boti on Top & HBF Special Topping',
    size_options: [
      { name: 'S-7"', price: 800 },
      { name: 'M-10"', price: 1350 },
      { name: 'L-14"', price: 1700 }
    ]
  }
];

async function main() {
  console.log('🍕 Starting HBF Pizzas update...\n');

  // Get HBF Pizzas category ID (pick first one if multiple exist)
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, name')
    .eq('name', 'HBF Pizzas')
    .limit(1);

  if (catError) {
    console.error('❌ Error fetching category:', catError.message);
    process.exit(1);
  }

  let category;
  if (!categories || categories.length === 0) {
    console.log('❌ HBF Pizzas category not found. Creating it...');
    const { data: newCat, error: createError } = await supabase
      .from('categories')
      .insert({ name: 'HBF Pizzas', sort_order: 10 })
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Error creating category:', createError.message);
      process.exit(1);
    }
    category = newCat;
  } else {
    category = categories[0];
  }

  console.log(`✅ Using category: ${category.name} (ID: ${category.id})\n`);

  let updated = 0;
  let created = 0;

  for (const pizza of PIZZAS_DATA) {
    // Check if pizza exists (check by name only, not category_id to catch all)
    const { data: existingList } = await supabase
      .from('products')
      .select('id, name, category_id')
      .eq('name', pizza.name);

    // Update ALL matching pizzas (in case there are duplicates)
    if (existingList && existingList.length > 0) {
      for (const existing of existingList) {
        const { error } = await supabase
          .from('products')
          .update({
            description: pizza.description,
            size_options: pizza.size_options,
            price: pizza.price,
            category_id: category.id,
            is_active: true
          })
          .eq('id', existing.id);

        if (error) {
          console.error(`❌ Error updating ${pizza.name} (ID: ${existing.id}):`, error.message);
        } else {
          console.log(`✅ Updated: ${pizza.name} (ID: ${existing.id})`);
          updated++;
        }
      }
    } else {
      // Create new pizza if not exists
      const { error } = await supabase
        .from('products')
        .insert({
          name: pizza.name,
          price: pizza.price,
          description: pizza.description,
          size_options: pizza.size_options,
          category_id: category.id,
          is_active: true
        });

      if (error) {
        console.error(`❌ Error creating ${pizza.name}:`, error.message);
      } else {
        console.log(`✨ Created: ${pizza.name}`);
        created++;
      }
    }
  }

  console.log(`\n🎉 Done! Updated: ${updated}, Created: ${created}`);
  console.log('✅ All pizzas now have complete details (ingredients & size options)');
}

main().catch(console.error);
