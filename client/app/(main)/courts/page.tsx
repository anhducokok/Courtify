import type { ApiCourt, PaginatedResponse, QueryCourtsParams } from '@/types/court';
import { CourtsPageClient, type CourtsPageQuery } from './CourtsPageClient';

function pickFirst(v: string | string[] | undefined) {
  if (!v) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

function toNumber(v: string | undefined) {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function buildParams(sp: { [key: string]: string | string[] | undefined }): QueryCourtsParams & { page?: number; limit?: number } {
  const location = pickFirst(sp.location);
  const date = pickFirst(sp.date);
  const minPrice = toNumber(pickFirst(sp.minPrice));
  const maxPrice = toNumber(pickFirst(sp.maxPrice));
  const minRating = toNumber(pickFirst(sp.minRating));
  const hasLEDRaw = pickFirst(sp.hasLED);
  const hasLED = hasLEDRaw === 'true' ? true : hasLEDRaw === 'false' ? false : undefined;
  const page = toNumber(pickFirst(sp.page));
  const limit = toNumber(pickFirst(sp.limit));

  return {
    ...(location ? { location } : {}),
    ...(date ? { date } : {}),
    ...(minPrice !== undefined ? { minPrice } : {}),
    ...(maxPrice !== undefined ? { maxPrice } : {}),
    ...(minRating !== undefined ? { minRating } : {}),
    ...(hasLED !== undefined ? { hasLED } : {}),
    ...(page !== undefined ? { page } : {}),
    ...(limit !== undefined ? { limit } : {}),
  };
}

export default async function CourtsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const sp = await searchParams;
  const params = buildParams(sp);

  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined) return;
    qs.set(k, String(v));
  });

  const res = await fetch(`${baseURL}/courts?${qs.toString()}`, { next: { revalidate: 10 } });
  if (!res.ok) {
    return <CourtsPageClient courts={[]} total={0} query={sp as CourtsPageQuery} />;
  }

  const json = (await res.json()) as PaginatedResponse<ApiCourt>;
  return <CourtsPageClient courts={json.data} total={json.total} query={sp as CourtsPageQuery} />;
}
