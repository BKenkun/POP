'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import { posts } from '@/lib/posts';
import { notFound, useParams } from 'next/navigation';

const postSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long'),
  excerpt: z.string().min(10, 'Excerpt must be at least 10 characters long'),
  content: z.string().min(50, 'Content must be at least 50 characters long'),
  imageUrl: z.string().url('Please enter a valid image URL'),
});

type PostFormValues = z.infer<typeof postSchema>;

export default function EditPostPage() {
  const { toast } = useToast();
  const params = useParams();
  const slug = params.slug as string;

  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      imageUrl: post.imageUrl,
    },
  });

  const onSubmit = (data: PostFormValues) => {
    console.log(data);
    toast({
      title: 'Post "Updated"!',
      description: 'This is a simulation. The post has not been updated permanently.',
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Edit Post</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a catchy title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A short summary of the post"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content (HTML supported)</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={10}
                        placeholder="Write your post content here..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          <div className="flex justify-end gap-2">
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Update Post
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
