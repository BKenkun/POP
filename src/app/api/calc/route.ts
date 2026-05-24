import { calculatePackPrice } from "@/ai";
import { publicRatelimit } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  const { success } = await publicRatelimit.limit(ip);

  if (!success) {
    return NextResponse.json({ error: 'Demasiadas peticiones. Inténtalo más tarde.' }, { status: 429 });
  }

  const body = await req.json();
  const result = await calculatePackPrice(body);

  return NextResponse.json(result);
}