import { NextRequest, NextResponse } from 'next/server';

/** GET /api/qr?url=... - Proxy QR code image (avoids CORS for download) */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'url required' }, { status: 400 });
  }
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}`;
  try {
    const res = await fetch(qrApiUrl);
    if (!res.ok) throw new Error('QR fetch failed');
    const blob = await res.blob();
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="hbf-app-qr.png"',
      },
    });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to generate QR' }, { status: 500 });
  }
}
