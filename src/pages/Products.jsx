import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/store/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function Products() {
  const params = new URLSearchParams(window.location.search);
  const categorySlug = params.get('categoria');

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recent');
  const [selectedCategory, setSelectedCategory] = useState(categorySlug || 'all');
  const [materialFilter, setMaterialFilter] = useState('all');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.filter({ is_active: true }, '-created_date', 200),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.filter({ is_active: true }, 'order', 50),
  });

  const filtered = useMemo(() => {
    let result = [...products];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      const cat = categories.find(c => c.slug === selectedCategory);
      if (cat) result = result.filter(p => p.category_id === cat.id);
    }

    if (materialFilter && materialFilter !== 'all') {
      result = result.filter(p => p.material === materialFilter);
    }

    if (sort === 'price_asc') result.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sort === 'price_desc') result.sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (sort === 'name') result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    return result;
  }, [products, search, selectedCategory, materialFilter, sort, categories]);

  const activeFilters = [selectedCategory !== 'all' && selectedCategory, materialFilter !== 'all' && materialFilter].filter(Boolean);

  const clearFilters = () => {
    setSelectedCategory('all');
    setMaterialFilter('all');
    setSearch('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-space">Produtos</h1>
        <p className="text-muted-foreground mt-1">Encontre a peça perfeita para seu projeto</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Categorias</SelectItem>
            {categories.map(c => (
              <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={materialFilter} onValueChange={setMaterialFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Material" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="PLA">PLA</SelectItem>
            <SelectItem value="ABS">ABS</SelectItem>
            <SelectItem value="PETG">PETG</SelectItem>
            <SelectItem value="TPU">TPU</SelectItem>
            <SelectItem value="Resina">Resina</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full md:w-44">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Mais Recentes</SelectItem>
            <SelectItem value="price_asc">Menor Preço</SelectItem>
            <SelectItem value="price_desc">Maior Preço</SelectItem>
            <SelectItem value="name">Nome A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="text-sm text-muted-foreground">Filtros:</span>
          {activeFilters.map(f => (
            <Badge key={f} variant="secondary" className="gap-1">
              {f}
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-6">
            <X className="w-3 h-3 mr-1" /> Limpar
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="aspect-square rounded-2xl" />)}
        </div>
      ) : filtered.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">{filtered.length} produto(s) encontrado(s)</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Nenhum produto encontrado.</p>
          <Button variant="link" onClick={clearFilters} className="text-primary mt-2">
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
}