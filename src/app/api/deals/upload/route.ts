import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

const BUCKET = 'products';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const dealId = formData.get('dealId') as string | null;

    if (!file || !dealId) {
      return NextResponse.json(
        { error: 'file and dealId are required' },
        { status: 400 }
      );
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const path = `deals/${dealId}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(data.path);

    const publicUrl = urlData.publicUrl;

    await supabaseAdmin
      .from('deals')
      .update({ image_url: publicUrl })
      .eq('id', dealId);

    return NextResponse.json({ url: publicUrl });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
