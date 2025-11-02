
'use client';

import { useState } from 'react';
import { posts as initialPosts, type Comment } from '@/lib/posts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, MessageSquare } from 'lucide-react';
import { useTranslation } from '@/context/language-context';

interface CommentsSectionProps {
  postId: string;
}

export default function CommentsSection({ postId }: CommentsSectionProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [newComment, setNewComment] = useState({ author: '', content: '' });
  const { t } = useTranslation();

  const post = posts.find((p) => p.id === postId);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewComment((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.author && newComment.content) {
      const comment: Comment = {
        id: `comment-${Date.now()}`,
        author: newComment.author,
        content: newComment.content,
        date: new Date().toISOString(),
      };
      
      const updatedPosts = posts.map(p => 
        p.id === postId 
          ? { ...p, comments: [...p.comments, comment] }
          : p
      );
      setPosts(updatedPosts);
      setNewComment({ author: '', content: '' });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-headline mb-6 flex items-center gap-2">
        <MessageSquare className="h-6 w-6 text-primary"/>
        {t('blog_page.comments_title')}
      </h2>

      <div className="space-y-6 mb-8">
        {post?.comments.length === 0 ? (
          <p className="text-muted-foreground">{t('blog_page.no_comments')}</p>
        ) : (
          post?.comments.map((comment) => (
            <Card key={comment.id} className="p-4">
              <div className="flex items-start gap-4">
                 <Avatar>
                    <AvatarFallback>{comment.author.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{comment.author}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(comment.date).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-foreground/80">{comment.content}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Card className="bg-muted/30">
        <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t('blog_page.leave_comment_title')}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                type="text"
                name="author"
                placeholder={t('blog_page.form_name_placeholder')}
                value={newComment.author}
                onChange={handleInputChange}
                required
                />
                <Textarea
                name="content"
                placeholder={t('blog_page.form_comment_placeholder')}
                value={newComment.content}
                onChange={handleInputChange}
                required
                rows={4}
                />
                <Button type="submit">
                <Send className="mr-2 h-4 w-4" />
                {t('blog_page.form_submit_button')}
                </Button>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}

    