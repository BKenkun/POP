
import Link from 'next/link';
import { posts } from '@/lib/posts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

import { buildPageMetadata, getSiteUrl } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Blog | Guías y Noticias sobre Aromas',
  description:
    'Descubre artículos, guías comparativas, diferencias entre fórmulas y consejos de uso seguro y conservación de aromas en nuestro blog.',
  path: '/blog',
});

export default function BlogPage() {
  const siteUrl = getSiteUrl();
  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Blog de PuroRush',
    url: `${siteUrl}/blog`,
    description:
      'Artículos, guías comparativas y consejos sobre aromas y limpiadores de cuero.',
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      url: `${siteUrl}/blog/${post.slug}`,
      datePublished: post.date,
      author: {
        '@type': 'Person',
        name: post.author,
      },
      image: post.imageUrl,
    })),
  };

  return (
    <div className="max-w-4xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight font-bold">Nuestro Blog</h1>
        <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
          Descubre artículos, guías y noticias del mundo de Popper Online.
        </p>
      </div>

      <div className="grid gap-8">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden transition-shadow hover:shadow-lg">
             <Link href={`/blog/${post.slug}`} className="block">
                <div className="relative h-60 w-full">
                    <Image 
                        src={post.imageUrl}
                        alt={post.title}
                        fill
                        className="object-cover"
                        data-ai-hint="blog post"
                    />
                </div>
            </Link>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">
                 <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                    {post.title}
                 </Link>
              </CardTitle>
              <CardDescription>
                Por {post.author} el {new Date(post.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{post.excerpt}</p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="link" className="px-0">
                <Link href={`/blog/${post.slug}`}>
                  Leer más <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
