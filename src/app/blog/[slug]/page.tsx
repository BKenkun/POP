import { posts } from '@/lib/posts';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import CommentsSection from './comments-section';

import type { Metadata } from 'next';
import { buildPageMetadata, getSiteUrl } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = posts.find((p) => p.slug === params.slug);
  if (!post) {
    return {
      title: 'Post no encontrado',
      robots: { index: false, follow: false },
    };
  }
  return buildPageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    type: 'article',
    images: post.imageUrl ? [{ url: post.imageUrl, alt: post.title }] : undefined,
  });
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = posts.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  const siteUrl = getSiteUrl();
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.imageUrl,
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${post.slug}`,
    },
  };

  return (
    <article className="max-w-3xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <header className="mb-8">
        <h1 className="text-4xl md:text-5xl font-headline text-primary mb-3 font-bold">{post.title}</h1>
        <p className="text-muted-foreground">
          Por {post.author} el {new Date(post.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </header>

      <div className="relative h-80 w-full mb-8 rounded-lg overflow-hidden">
        <Image src={post.imageUrl} alt={post.title} fill className="object-cover" data-ai-hint="blog post header"/>
      </div>
      
      <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/90 text-lg"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      
      <Separator className="my-12" />

      <CommentsSection postId={post.id} />
    </article>
  );
}
