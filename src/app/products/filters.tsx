
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { X, Search } from 'lucide-react';
import ProductGrid from './product-grid';
import { Input } from '@/components/ui/input';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ProductFiltersProps {
  products: Product[];
  uniqueTags: string[];
  initialSearchQuery?: string;
}

const internalTagMap: { [key: string]: string } = {
    'novedad': 'Novedades',
    'oferta': 'Ofertas',
    'mas-vendido': 'Más Vendidos',
};

export default function ProductFilters({ products, uniqueTags, initialSearchQuery = '' }: ProductFiltersProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedInternalTags, setSelectedInternalTags] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState('name-asc');
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    const params = new URLSearchParams(searchParams.toString());
    if (newQuery) {
        params.set('search', newQuery);
    } else {
        params.delete('search');
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const handleTagChange = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleInternalTagChange = (tag: string) => {
    setSelectedInternalTags(prev =>
        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSelectedInternalTags([]);
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(lowercasedQuery) ||
            p.description?.toLowerCase().includes(lowercasedQuery)
        );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(p =>
        selectedTags.every(tag => p.tags?.includes(tag))
      );
    }
    
    if (selectedInternalTags.length > 0) {
        filtered = filtered.filter(p =>
            selectedInternalTags.every(tag => p.internalTags?.includes(tag))
        );
    }

    return [...filtered].sort((a, b) => {
      switch (sortOrder) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  }, [products, searchQuery, selectedTags, selectedInternalTags, sortOrder]);
  
  const hasActiveFilters = selectedTags.length > 0 || selectedInternalTags.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <aside className="lg:col-span-1">
        <Card>
            <CardContent className="p-4 space-y-6">
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Búsqueda</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            type="search"
                            placeholder="Buscar productos..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="pl-9"
                        />
                    </div>
                </div>

                <Separator />
                
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Filtros</h3>
                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                            <X className="mr-1 h-3 w-3" />
                            Limpiar
                        </Button>
                    )}
                </div>

                <Accordion type="multiple" defaultValue={['sort', 'categories', 'brands']} className="w-full">
                    <AccordionItem value="sort">
                        <AccordionTrigger className="text-base font-semibold">Ordenar por</AccordionTrigger>
                        <AccordionContent>
                             <Select value={sortOrder} onValueChange={setSortOrder}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar orden" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name-asc">Nombre (A-Z)</SelectItem>
                                    <SelectItem value="name-desc">Nombre (Z-A)</SelectItem>
                                    <SelectItem value="price-asc">Precio (Menor a Mayor)</SelectItem>
                                    <SelectItem value="price-desc">Precio (Mayor a Menor)</SelectItem>
                                </SelectContent>
                            </Select>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="categories">
                        <AccordionTrigger className="text-base font-semibold">Categorías</AccordionTrigger>
                        <AccordionContent>
                             <div className="space-y-2">
                                {Object.entries(internalTagMap).map(([tag, label]) => (
                                    <div key={tag} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`internal-${tag}`} 
                                        checked={selectedInternalTags.includes(tag)}
                                        onCheckedChange={() => handleInternalTagChange(tag)}
                                    />
                                    <Label htmlFor={`internal-${tag}`} className="font-normal cursor-pointer">{label}</Label>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="brands">
                        <AccordionTrigger className="text-base font-semibold">Marcas</AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2">
                            {uniqueTags.map(tag => (
                                <div key={tag} className="flex items-center space-x-2">
                                <Checkbox 
                                    id={tag} 
                                    checked={selectedTags.includes(tag)}
                                    onCheckedChange={() => handleTagChange(tag)}
                                />
                                <Label htmlFor={tag} className="font-normal cursor-pointer">{tag}</Label>
                                </div>
                            ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
      </aside>

      <main className="lg:col-span-3">
        <ProductGrid products={filteredAndSortedProducts} />
      </main>
    </div>
  );
}
