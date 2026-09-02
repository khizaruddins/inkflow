import { NextRequest, NextResponse } from 'next/server';
import { searchUnsplash } from '@/lib/unsplash-search';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || searchParams.get('query') || '';
  const page = searchParams.get('page') || '1';
  const perPage = searchParams.get('per_page') || searchParams.get('perPage') || '24';
  const accessKey = process.env.UNSPLASH_ACCESS_KEY || process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

  if (accessKey && q.trim()) {
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q.trim())}&page=${page}&per_page=${perPage}&client_id=${accessKey}`,
        { headers: { 'Accept-Version': 'v1' } }
      );
      if (res.ok) {
        const data = await res.json();
        const results = (data.results || []).map((p: any) => ({
          id: p.id,
          title: p.description || p.alt_description || `${q} photo`,
          url: p.urls?.regular || p.urls?.small,
          thumbUrl: p.urls?.thumb || p.urls?.small,
          downloadUrl: p.links?.download_location,
          photographer: p.user?.name || 'Unsplash Contributor',
          photographerUsername: p.user?.username,
          photographerUrl: p.user?.links?.html || 'https://unsplash.com',
          width: p.width,
          height: p.height,
        }));
        return NextResponse.json({
          total: data.total || results.length,
          totalPages: data.total_pages || 1,
          results,
        });
      }
    } catch (_) {
      // Fallback to local semantic search
    }
  }

  try {
    const photos = await searchUnsplash(q);
    return NextResponse.json({ results: photos, total: photos.length, totalPages: 1 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to search photos' }, { status: 500 });
  }
}
