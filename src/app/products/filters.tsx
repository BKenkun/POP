
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
  searchParams: { [key: string]: string | string[] | undefined };
}

const internalTagMap: { [key: string]: string } = {
    'novedad': 'Novedades',
    'oferta': 'Ofertas',
    'mas-vendido': 'Más Vendidos',
    'pack': 'Packs',
    'accesorio': 'Accesorios',
};

export default function ProductFilters({ 
    products, 
    uniqueBrands, 
    uniqueSizes, 
    uniqueCompositions,
    searchParams
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.search as string || '');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedCompositions, setSelectedCompositions] = useState<string[]>([]);
  const [selectedInternalTags, setSelectedInternalTags] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState('name-asc');
  
  useEffect(() => {
    const newBrands = Array.isArray(searchParams.brand) ? searchParams.brand : (searchParams.brand ? [searchParams.brand] : []);
    const newSizes = Array.isArray(searchParams.size) ? searchParams.size : (searchParams.size ? [searchParams.size] : []);
    const newCompositions = Array.isArray(searchParams.composition) ? searchParams.composition : (searchParams.composition ? [searchParams.composition] : []);
    const newInternalTags = Array.isArray(searchParams.internal_tag) ? searchParams.internal_tag : (searchParams.internal_tag ? [searchParams.internal_tag] : []);
    
    setSelectedBrands(newBrands);
    setSelectedSizes(newSizes);
    setSelectedCompositions(newCompositions);
    setSelectedInternalTags(newInternalTags);
    setSearchQuery(searchParams.search as string || '');

  }, [searchParams]);

  const updateURLParams = (key: string, values: string[]) => {
      const params = new URLSearchParams(currentParams.toString());
      params.delete(key);
      values.forEach(value => params.append(key, value));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
  
  const createToggleHandler = (selectedValues: string[], key: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => (value: string) => {
    const newValues = selectedValues.includes(value) ? selectedValues.filter(v => v !== value) : [...selectedValues, value];
    setter(newValues);
    updateURLParams(key, newValues);
  };
  
  const handleBrandChange = createToggleHandler(selectedBrands, 'brand', setSelectedBrands);
  const handleSizeChange = createToggleHandler(selectedSizes, 'size', setSelectedSizes);
  const handleCompositionChange = createToggleHandler(selectedCompositions, 'composition', setSelectedCompositions);
  const handleInternalTagChange = createToggleHandler(selectedInternalTags, 'internal_tag', setSelectedInternalTags);

  const clearFilters = () => {
    setSelectedBrands([]);
    setSelectedSizes([]);
    setSelectedCompositions([]);
    setSelectedInternalTags([]);
    setSearchQuery('');
    router.replace(pathname, { scroll: false });
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(lowercasedQuery));
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
  
  const hasActiveSpecificFilters = useMemo(() => {
    return selectedBrands.length > 0 || selectedSizes.length > 0 || selectedCompositions.length > 0 || !!searchQuery;
  }, [selectedBrands, selectedSizes, selectedCompositions, searchQuery]);


  const showCreatePackCard = useMemo(() => {
      // If any specific filter (brand, size, composition, search) is active, hide the card.
      if (hasActiveSpecificFilters) {
        return false;
      }

      // If no category filters are selected, show the card.
      if (selectedInternalTags.length === 0) {
        return true;
      }
      
      // If category filters are selected, show the card only if 'pack' or 'oferta' is among them.
      return selectedInternalTags.includes('pack') || selectedInternalTags.includes('oferta');

  }, [hasActiveSpecificFilters, selectedInternalTags]);
  
  const FilterCheckboxGroup = ({ title, values, selectedValues, onValueChange, paramKey }: {
    title: string;
    values: string[];
    selectedValues: string[];
    onValueChange: (value: string) => void;
    paramKey: string;
  }) => (
    values.length > 0 && (
      <AccordionItem value={paramKey}>
        <AccordionTrigger className="text-base font-semibold">{title}</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            {values.map(value => (
              <div key={value} className="flex items-center space-x-2">
                <Checkbox 
                  id={`${paramKey}-${value}`}
                  checked={selectedValues.includes(value)}
                  onCheckedChange={() => onValueChange(value)}
                />
                <Label htmlFor={`${paramKey}-${value}`} className="font-normal cursor-pointer">{value}</Label>
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
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const params = new URLSearchParams(currentParams.toString());
                                    if(searchQuery) {
                                        params.set('search', searchQuery);
                                    } else {
                                        params.delete('search');
                                    }
                                    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
                                }
                            }}
                            className="pl-9"
                        />
                    </div>
                </div>

                <Separator />
                
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Filtros</h3>
                    {(hasActiveSpecificFilters || selectedInternalTags.length > 0) && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                            <X className="mr-1 h-3 w-3" />
                            Limpiar
                        </Button>
                    )}
                </div>

                <Accordion type="multiple" defaultValue={['sort', 'categories', 'brands', 'size', 'composition']} className="w-full">
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
                        paramKey="brand"
                    />
                    
                    <FilterCheckboxGroup 
                        title="Tamaño"
                        values={uniqueSizes}
                        selectedValues={selectedSizes}
                        onValueChange={handleSizeChange}
                        paramKey="size"
                    />
                    
                    <FilterCheckboxGroup 
                        title="Composición"
                        values={uniqueCompositions}
                        selectedValues={selectedCompositions}
                        onValueChange={handleCompositionChange}
                        paramKey="composition"
                    />
                </Accordion>
            </CardContent>
        </Card>
      </aside>

      <main className="lg:col-span-3">
        <ProductGrid products={filteredAndSortedProducts} showCreatePackCard={showCreatePackCard} />
      </main>
    </div>
  );
}
