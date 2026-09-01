import { NextRequest, NextResponse } from 'next/server';
import { searchUnsplash } from '@/lib/unsplash-search';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || searchParams.get('query') || '';

  try {
    const photos = await searchUnsplash(q);
    return NextResponse.json({ results: photos, total: photos.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to search photos' }, { status: 500 });
  }
}
