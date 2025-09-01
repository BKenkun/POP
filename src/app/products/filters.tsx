
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
  uniqueBrands: string[];
  uniqueSizes: string[];
  uniqueCompositions: string[];
  initialSearchQuery?: string;
}

const internalTagMap: { [key: string]: string } = {
    'novedad': 'Novedades',
    'oferta': 'Ofertas',
    'mas-vendido': 'Más Vendidos',
};

export default function ProductFilters({ 
    products, 
    uniqueBrands, 
    uniqueSizes, 
    uniqueCompositions,
    initialSearchQuery = '' 
}: ProductFiltersProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedCompositions, setSelectedCompositions] = useState<string[]>([]);
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
  
  const createToggleHandler = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (value: string) => {
    setter(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const handleBrandChange = createToggleHandler(setSelectedBrands);
  const handleSizeChange = createToggleHandler(setSelectedSizes);
  const handleCompositionChange = createToggleHandler(setSelectedCompositions);
  const handleInternalTagChange = createToggleHandler(setSelectedInternalTags);


  const clearFilters = () => {
    setSelectedBrands([]);
    setSelectedSizes([]);
    setSelectedCompositions([]);
    setSelectedInternalTags([]);
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        
        // Find which internal tags match the search query (e.g., searching "Novedades" should match "novedad" tag)
        const matchingInternalTags = Object.entries(internalTagMap)
            .filter(([, label]) => label.toLowerCase().includes(lowercasedQuery))
            .map(([tag]) => tag);
            
        filtered = filtered.filter(p => {
            const inName = p.name.toLowerCase().includes(lowercasedQuery);
            const inDescription = p.description?.toLowerCase().includes(lowercasedQuery);
            const inBrand = p.brand?.toLowerCase().includes(lowercasedQuery);
            const inSize = p.size?.toLowerCase().includes(lowercasedQuery);
            const inComposition = p.composition?.toLowerCase().includes(lowercasedQuery);
            const inTags = p.tags?.some(tag => tag.toLowerCase().includes(lowercasedQuery));
            
            // Check if any of the product's internal tags are in our list of tags that match the search query.
            const inInternalTagsByLabel = p.internalTags?.some(tag => matchingInternalTags.includes(tag));
            // Also check for direct match, e.g. searching for "oferta"
            const inInternalTagsDirect = p.internalTags?.some(tag => tag.toLowerCase().includes(lowercasedQuery));

            return inName || inDescription || inBrand || inSize || inComposition || inTags || inInternalTagsByLabel || inInternalTagsDirect;
        });
    }

    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => p.brand && selectedBrands.includes(p.brand));
    }
    
    if (selectedSizes.length > 0) {
        filtered = filtered.filter(p => p.size && selectedSizes.includes(p.size));
    }

    if (selectedCompositions.length > 0) {
        filtered = filtered.filter(p => p.composition && selectedCompositions.includes(p.composition));
    }
    
    if (selectedInternalTags.length > 0) {
        filtered = filtered.filter(p =>
            p.internalTags?.some(tag => selectedInternalTags.includes(tag))
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
  }, [products, searchQuery, selectedBrands, selectedSizes, selectedCompositions, selectedInternalTags, sortOrder]);
  
  const hasActiveFilters = selectedBrands.length > 0 || selectedSizes.length > 0 || selectedCompositions.length > 0 || selectedInternalTags.length > 0;
  
  const FilterCheckboxGroup = ({ title, values, selectedValues, onValueChange }: {
    title: string;
    values: string[];
    selectedValues: string[];
    onValueChange: (value: string) => void;
  }) => (
    values.length > 0 && (
      <AccordionItem value={title.toLowerCase()}>
        <AccordionTrigger className="text-base font-semibold">{title}</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            {values.map(value => (
              <div key={value} className="flex items-center space-x-2">
                <Checkbox 
                  id={`${title}-${value}`}
                  checked={selectedValues.includes(value)}
                  onCheckedChange={() => onValueChange(value)}
                />
                <Label htmlFor={`${title}-${value}`} className="font-normal cursor-pointer">{value}</Label>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    )
  );

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

                    <FilterCheckboxGroup 
                        title="Marcas"
                        values={uniqueBrands}
                        selectedValues={selectedBrands}
                        onValueChange={handleBrandChange}
                    />
                    
                    <FilterCheckboxGroup 
                        title="Tamaño"
                        values={uniqueSizes}
                        selectedValues={selectedSizes}
                        onValueChange={handleSizeChange}
                    />
                    
                    <FilterCheckboxGroup 
                        title="Composición"
                        values={uniqueCompositions}
                        selectedValues={selectedCompositions}
                        onValueChange={handleCompositionChange}
                    />
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
