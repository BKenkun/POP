// Modificado por: Webmaster Freddy Poleo
import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTS = new Set([
  'firebasestorage.googleapis.com',
  'storage.googleapis.com',
]);
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get('url');
  if (!rawUrl || rawUrl.length > 4096) {
    return new NextResponse('URL de imagen no válida.', { status: 400 });
  }

  let imageUrl: URL;
  try {
    imageUrl = new URL(rawUrl);
  } catch {
    return new NextResponse('URL de imagen no válida.', { status: 400 });
  }

  // Only proxy images from Firebase Storage. This blocks arbitrary URL fetches/SSRF.
  if (
    imageUrl.protocol !== 'https:' ||
    !ALLOWED_HOSTS.has(imageUrl.hostname.toLowerCase()) ||
    imageUrl.username ||
    imageUrl.password ||
    imageUrl.port ||
    imageUrl.hash
  ) {
    return new NextResponse('Origen de imagen no permitido.', { status: 403 });
  }

  const validStoragePath =
    imageUrl.hostname === 'firebasestorage.googleapis.com'
      ? imageUrl.pathname.startsWith('/v0/b/') && imageUrl.pathname.includes('/o/')
      : imageUrl.pathname.split('/').filter(Boolean).length >= 2;

  if (!validStoragePath) {
    return new NextResponse('Ruta de almacenamiento no permitida.', { status: 403 });
  }

  try {
    const response = await fetch(imageUrl.toString(), {
      method: 'GET',
      redirect: 'error',
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return new NextResponse('No se pudo obtener la imagen.', { status: 404 });
    }

    const contentType = (response.headers.get('content-type') || '')
      .split(';')[0]
      .trim()
      .toLowerCase();
    const declaredLength = Number(response.headers.get('content-length') || 0);

    if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
      return new NextResponse('El recurso no es una imagen permitida.', { status: 415 });
    }
    if (declaredLength > MAX_IMAGE_BYTES) {
      return new NextResponse('La imagen supera el tamaño permitido.', { status: 413 });
    }

    const imageBuffer = await response.arrayBuffer();
    if (imageBuffer.byteLength === 0 || imageBuffer.byteLength > MAX_IMAGE_BYTES) {
      return new NextResponse('Tamaño de imagen no permitido.', { status: 413 });
    }

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(imageBuffer.byteLength),
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('[IMAGE PROXY] No se pudo recuperar la imagen:', error instanceof Error ? error.message : String(error));
    return new NextResponse('No se pudo obtener la imagen.', { status: 502 });
  }
}
