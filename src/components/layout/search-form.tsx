
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function SearchForm({ onSearch }: { onSearch?: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultSearch = searchParams.get('search') ?? '';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchQuery = formData.get('search') as string;
    if (searchQuery) {
        router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    } else {
        router.push('/products');
    }
    if (onSearch) {
        onSearch();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full md:w-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
            type="search"
            name="search"
            defaultValue={defaultSearch}
            placeholder="Buscar..."
            className="w-full md:w-40 lg:w-48 pl-9 h-9 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:w-full md:focus:w-48 lg:focus:w-64 transition-all duration-300"
        />
    </form>
  );
}
