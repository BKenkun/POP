export interface Post {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    imageUrl: string;
    author: string;
    date: string;
    comments: Comment[];
}

export default Post