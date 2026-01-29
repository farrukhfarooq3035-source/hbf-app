import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import {
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  SEED_PIZZAS,
  SEED_DEALS,
} from '@/data/menu-seed';

export async function POST() {
  try {
    const categoryMap: Record<string, string> = {};

    for (const cat of SEED_CATEGORIES) {
      const existing = await supabaseAdmin
        .from('categories')
        .select('id')
        .eq('name', cat.name)
        .maybeSingle();
      if (existing.data?.id) {
        categoryMap[cat.name] = existing.data.id;
      } else {
        const { data, error } = await supabaseAdmin
          .from('categories')
          .insert({ name: cat.name, sort_order: cat.sort_order })
          .select('id')
          .single();
        if (!error && data) categoryMap[cat.name] = data.id;
      }
    }

    const allProducts = [...SEED_PRODUCTS, ...SEED_PIZZAS];
    for (const p of allProducts) {
      const catId = categoryMap[p.category];
      await supabaseAdmin.from('products').insert({
        name: p.name,
        price: p.price,
        description: p.description,
        category_id: catId,
        is_active: true,
        size_options: p.size_options || [],
      });
    }

    for (const deal of SEED_DEALS) {
      await supabaseAdmin.from('deals').insert({
        title: deal.title,
        price: deal.price,
        is_active: true,
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: String(e) },
      { status: 500 }
    );
  }
}
