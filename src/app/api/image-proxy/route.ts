
import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTNAMES = new Set([
  'firebasestorage.googleapis.com',
  'storage.googleapis.com',
  'picsum.photos',
  'placehold.co',
  'files.stripe.com',
  'www.poppers-espana.es',
  'www.euro-poppers.eu',
  'jointoyou.it',
  'mypoppers.eu',
  'www.abcparty.nl',
  'http2.mlstatic.com',
  'monpapier.fr',
  'www.mistersmoke.com',
  'poppers-discount.fr',
  'www.svgrepo.com',
  'images.unsplash.com',

  ...(process.env.NEXT_PUBLIC_APP_URL
    ? [new URL(process.env.NEXT_PUBLIC_APP_URL).hostname]
    : []),
]);

const ALLOWED_CONTENT_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml'
])

const MAX_SIZE_MB = Number(process.env.IMAGE_PROXY_MAX_SIZE_MB ?? '5');
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('URL de imagen no proporcionada', { status: 400 });
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return new NextResponse('URL inválida', { status: 400 });
  }

  if (parsedUrl.protocol !== 'https:') {
    return new NextResponse('Solo se permiten URLs HTTPS', { status: 400});
  }

  if (!ALLOWED_HOSTNAMES.has(parsedUrl.hostname)) {
    return new NextResponse('Dominio no permitido', { status: 403 });
  }

  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      return new NextResponse('No se pudo obtener la imagen', { status: response.status });
    }

    const contentType = response.headers.get('content-type')?.split(';')[0].trim() ?? '';

    if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
      return new NextResponse('Tipo de contenido no permitido', { status: 415 });
    }

    const contentLength = Number(response.headers.get('content-length') ?? 0);

    if (contentLength > MAX_SIZE_BYTES) {
      return new NextResponse('Imagen demasiado grande', { status: 413 });
    }

    const imageBuffer = await response.arrayBuffer();

    if (imageBuffer.byteLength > MAX_SIZE_BYTES) {
      return new NextResponse('Imagen demasiado grande', { status: 413 });
    }

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=604800, immutable', // Cache por una semana
        'X-Content-Type-Options': 'nosniff',
      },
    });

  } catch (error) {
    console.error('Error en el proxy de imágenes:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}
