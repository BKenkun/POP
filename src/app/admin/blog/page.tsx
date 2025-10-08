
'use client';

import Link from 'next/link';
import { posts as initialPosts } from '@/lib/posts';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export default function AdminBlogPage() {
  const [posts, setPosts] = useState(initialPosts);
  const { toast } = useToast();

  const handleDelete = (postId: string) => {
    // This is a simulation. In a real app, you'd call an API.
    setPosts(posts.filter((post) => post.id !== postId));
    toast({
      title: 'Post Deleted!',
      description: 'The blog post has been removed (simulation).',
      variant: 'destructive',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold">Gestionar Blog</h1>
            <p className="text-muted-foreground">Crea, edita y elimina las entradas del blog.</p>
        </div>
        <Link href="/admin/new-post" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Entrada
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
              <CardDescription>
                Publicado el{' '}
                {new Date(post.date).toLocaleDateString('es-ES')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {post.excerpt}
              </p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/edit-post/${post.slug}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminará permanentemente la entrada del blog.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(post.id)}>
                      Continuar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
        {posts.length === 0 && (
            <Card className="text-center p-8">
                <p className="text-muted-foreground">Aún no hay entradas en el blog.</p>
            </Card>
        )}
      </div>
    </div>
  );
}
