import type { MetadataRoute } from 'next';
import { posts } from '@/lib/posts';
import { getActiveProductsServer, getSiteUrl } from '@/lib/seo';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
    priority: number;
  }> = [
    { path: '/', changeFrequency: 'daily', priority: 1.0 },
    { path: '/products', changeFrequency: 'daily', priority: 0.9 },
    { path: '/create-pack', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/subscription', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/tienda-popper', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/venta-popper', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/popper-info', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/leather-cleaners-info', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/blog', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/shipping', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/pagos-seguros', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/contacto', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/informacion-legal', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/terminos-y-condiciones', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/privacidad', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/politica-cookies', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/resolucion-litigios', changeFrequency: 'yearly', priority: 0.3 },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: route.path === '/' ? siteUrl : `${siteUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const activeProducts = await getActiveProductsServer();
    productEntries = activeProducts.map((product) => ({
      url: `${siteUrl}/product/${product.id}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    }));
  } catch {
    productEntries = [];
  }

  return [...staticEntries, ...productEntries, ...blogEntries];
}
