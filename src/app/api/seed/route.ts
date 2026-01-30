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
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: 'SUPABASE_SERVICE_ROLE_KEY (or anon key) is not set. Add it in Netlify Environment variables.' },
        { status: 500 }
      );
    }

    const categoryMap: Record<string, string> = {};

    for (const cat of SEED_CATEGORIES) {
      const existing = await supabaseAdmin
        .from('categories')
        .select('id')
        .eq('name', cat.name)
        .maybeSingle();
      if (existing.error) {
        return NextResponse.json(
          { error: `Categories: ${existing.error.message}` },
          { status: 500 }
        );
      }
      if (existing.data?.id) {
        categoryMap[cat.name] = existing.data.id;
      } else {
        const { data, error } = await supabaseAdmin
          .from('categories')
          .insert({ name: cat.name, sort_order: cat.sort_order })
          .select('id')
          .single();
        if (error) {
          return NextResponse.json(
            { error: `Insert category "${cat.name}": ${error.message}` },
            { status: 500 }
          );
        }
        if (data) categoryMap[cat.name] = data.id;
      }
    }

    const allProducts = [...SEED_PRODUCTS, ...SEED_PIZZAS];
    for (const p of allProducts) {
      const catId = categoryMap[p.category];
      const { error } = await supabaseAdmin.from('products').insert({
        name: p.name,
        price: p.price,
        description: p.description ?? null,
        category_id: catId ?? null,
        is_active: true,
        size_options: p.size_options ?? [],
      });
      if (error) {
        return NextResponse.json(
          { error: `Insert product "${p.name}": ${error.message}` },
          { status: 500 }
        );
      }
    }

    for (const deal of SEED_DEALS) {
      const { error } = await supabaseAdmin.from('deals').insert({
        title: deal.title,
        price: deal.price,
        is_active: true,
      });
      if (error) {
        return NextResponse.json(
          { error: `Insert deal "${deal.title}": ${error.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
