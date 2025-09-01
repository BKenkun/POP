
'use client';

import { useState, useMemo } from 'react';
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
import { X } from 'lucide-react';
import ProductGrid from './product-grid';

interface ProductFiltersProps {
  products: Product[];
  uniqueTags: string[];
}

const internalTagMap: { [key: string]: string } = {
    'novedad': 'Novedades',
    'oferta': 'Ofertas',
    'mas-vendido': 'Más Vendidos',
};

export default function ProductFilters({ products, uniqueTags }: ProductFiltersProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedInternalTags, setSelectedInternalTags] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState('name-asc');

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
  }, [products, selectedTags, selectedInternalTags, sortOrder]);
  
  const hasActiveFilters = selectedTags.length > 0 || selectedInternalTags.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <aside className="lg:col-span-1">
        <Card>
            <CardContent className="p-4 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Filtros</h3>
                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                            <X className="mr-1 h-3 w-3" />
                            Limpiar
                        </Button>
                    )}
                </div>
                
                <div>
                    <h4 className="font-semibold mb-3">Ordenar por</h4>
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
                </div>

                <Separator />

                 <div>
                    <h4 className="font-semibold mb-3">Categorías</h4>
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
                </div>

                <Separator />
                
                <div>
                    <h4 className="font-semibold mb-3">Marcas</h4>
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
                </div>
            </CardContent>
        </Card>
      </aside>

      <main className="lg:col-span-3">
        <ProductGrid products={filteredAndSortedProducts} />
      </main>
    </div>
  );
}
