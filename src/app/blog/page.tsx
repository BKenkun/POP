
import Link from 'next/link';
import { posts } from '@/lib/posts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

export const metadata = {
  title: 'Blog | Popper España',
  description: 'Artículos, noticias y consejos sobre nuestros productos.',
};

export default function BlogPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight">Nuestro Blog</h1>
        <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
          Descubre artículos, guías y noticias del mundo de Popper España.
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
