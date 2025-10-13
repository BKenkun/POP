
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
  onFilterChange?: (filteredProducts: Product[]) => void; // Optional callback
  showSort?: boolean;
  showCategories?: boolean;
  showSearch?: boolean;
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
    onFilterChange,
    showSort = true,
    showCategories = true,
    showSearch = true,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getInitialState = <T extends string>(paramName: string, defaultValue: T[] = []): T[] => {
    const paramValues = searchParams.getAll(paramName);
    return paramValues.length > 0 ? (paramValues as T[]) : defaultValue;
  }

  // Component-local state for filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedBrands, setSelectedBrands] = useState<string[]>(getInitialState('brand'));
  const [selectedSizes, setSelectedSizes] = useState<string[]>(getInitialState('size'));
  const [selectedCompositions, setSelectedCompositions] = useState<string[]>(getInitialState('composition'));
  const [selectedInternalTags, setSelectedInternalTags] = useState<string[]>(getInitialState('internal_tag'));
  const [sortOrder, setSortOrder] = useState('name-asc');
  
  // Logic to update URL params when a filter changes
  const updateURLParams = (key: string, values: string[]) => {
      if (!searchParams) return; // Only update URL if used on a page with searchParams
      const params = new URLSearchParams(searchParams.toString());
      params.delete(key);
      values.forEach(value => params.append(key, value));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
  
  const createToggleHandler = (selectedValues: string[], key: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => (value: string) => {
    const newValues = selectedValues.includes(value) ? selectedValues.filter(v => v !== value) : [...selectedValues, value];
    setter(newValues);
    if(searchParams) updateURLParams(key, newValues);
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
    if(searchParams) router.replace(pathname, { scroll: false });
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
  
  // Effect to call the onFilterChange callback when filters change
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filteredAndSortedProducts);
    }
  }, [filteredAndSortedProducts, onFilterChange]);


  const hasActiveFilters = useMemo(() => {
    return selectedBrands.length > 0 || selectedSizes.length > 0 || selectedCompositions.length > 0 || selectedInternalTags.length > 0 || !!searchQuery;
  }, [selectedBrands, selectedSizes, selectedCompositions, selectedInternalTags, searchQuery]);
  
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

  // Common filter components
  const SearchFilter = () => (
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
                    if (e.key === 'Enter' && searchParams) {
                        const params = new URLSearchParams(searchParams.toString());
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
  );

  const FiltersList = () => (
    <>
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Filtros</h3>
            {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                    <X className="mr-1 h-3 w-3" />
                    Limpiar
                </Button>
            )}
        </div>
        <Accordion type="multiple" defaultValue={['sort', 'categories', 'brand', 'size', 'composition']} className="w-full">
            {showSort && (
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
            )}
            
            {showCategories && (
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
            )}

            <FilterCheckboxGroup title="Marcas" values={uniqueBrands} selectedValues={selectedBrands} onValueChange={handleBrandChange} paramKey="brand" />
            <FilterCheckboxGroup title="Tamaño" values={uniqueSizes} selectedValues={selectedSizes} onValueChange={handleSizeChange} paramKey="size" />
            <FilterCheckboxGroup title="Composición" values={uniqueCompositions} selectedValues={selectedCompositions} onValueChange={handleCompositionChange} paramKey="composition" />
        </Accordion>
    </>
  );

  // If this is used outside a page context, render the grid directly
  if (!onFilterChange) {
      const showCreatePackCard = useMemo(() => {
        const hasActiveSpecificFilters = selectedBrands.length > 0 || selectedSizes.length > 0 || selectedCompositions.length > 0 || !!searchQuery;
        if (hasActiveSpecificFilters) return false;
        if (selectedInternalTags.length === 0) return true;
        return selectedInternalTags.includes('pack') || selectedInternalTags.includes('oferta');
    }, [selectedBrands, selectedSizes, selectedCompositions, searchQuery, selectedInternalTags]);

     return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1">
                <Card>
                    <CardContent className="p-4 space-y-6">
                        {showSearch && <SearchFilter />}
                        <Separator />
                        <FiltersList />
                    </CardContent>
                </Card>
            </aside>
            <main className="lg:col-span-3">
                <ProductGrid products={filteredAndSortedProducts} showCreatePackCard={showCreatePackCard} />
            </main>
        </div>
     );
  }

  // If used with a callback, render only the filter UI
  return (
    <Card>
        <CardContent className="p-4 space-y-6">
            {showSearch && <SearchFilter />}
            {(showSearch && (showCategories || showSort || uniqueBrands.length > 0)) && <Separator />}
            <FiltersList />
        </CardContent>
    </Card>
  );
}
