import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/** Server-side: categories for menu (HBF Deals & Top Sale excluded) */
export async function GET() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const exclude = (name: string) => {
    const n = (name ?? '').trim().toLowerCase();
    if (n.includes('top sale')) return true;
    if ((n.includes('hbf') && n.includes('deal')) || n === 'deals') return true;
    return false;
  };

  const filtered = (data ?? []).filter((c) => !exclude(c.name));

  return NextResponse.json(filtered, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
