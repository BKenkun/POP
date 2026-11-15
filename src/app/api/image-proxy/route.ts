import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ALLOWED_IMAGE_HOSTS = new Set([
  'firebasestorage.googleapis.com',
  'storage.googleapis.com',
  'picsum.photos',
  'placehold.co',
  'www.poppers-espana.es',
  'files.stripe.com',
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
]);

export async function GET(request: NextRequest) {
  const imageUrl = request.nextUrl.searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('URL de imagen no proporcionada', { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return new NextResponse('URL de imagen inválida', { status: 400 });
  }

  if (parsedUrl.protocol !== 'https:' || !ALLOWED_IMAGE_HOSTS.has(parsedUrl.hostname)) {
    return new NextResponse('Dominio o protocolo de imagen no permitido', { status: 403 });
  }

  try {
    const response = await fetch(parsedUrl.toString(), {
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return new NextResponse('No se pudo obtener la imagen', { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'image/webp';
    if (!contentType.startsWith('image/') && contentType !== 'application/octet-stream') {
      return new NextResponse('El recurso solicitado no es una imagen válida', { status: 415 });
    }

    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=604800, immutable',
      },
    });
  } catch (error) {
    console.error('Error en el proxy de imágenes:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}
