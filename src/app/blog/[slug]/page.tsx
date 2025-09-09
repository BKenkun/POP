import { posts } from '@/lib/posts';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import CommentsSection from './comments-section';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = posts.find((p) => p.slug === params.slug);
  if (!post) {
    return {
      title: 'Post no encontrado',
    };
  }
  return {
    title: `${post.title} | Blog de Popper España`,
    description: post.excerpt,
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = posts.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto">
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
