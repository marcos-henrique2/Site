import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/base44Client';
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import ProductCard from '@/components/store/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';

export default function Products() {
  const params = new URLSearchParams(window.location.search);
  const categorySlug = params.get('categoria');

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recent');
  const [selectedCategory, setSelectedCategory] = useState(categorySlug || 'all');
  const [materialFilter, setMaterialFilter] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiClient.products.getAll(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.categories.getAll(),
  });

  // Compute max price from products
  const maxPrice = useMemo(() => {
    if (!products.length) return 1000;
    return Math.ceil(Math.max(...products.map((p) => p.price || 0)) / 10) * 10 || 1000;
  }, [products]);

  // Set initial price range once products load
  React.useEffect(() => {
    if (products.length) {
      setPriceRange([0, maxPrice]);
    }
  }, [maxPrice]);

  const filtered = useMemo(() => {
    let result = products.filter((p) => p.is_active !== false);

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      const cat = categories.find((c) => c.slug === selectedCategory);
      if (cat) result = result.filter((p) => p.category_id === cat.id);
    }

    if (materialFilter && materialFilter !== 'all') {
      result = result.filter((p) => p.material === materialFilter);
    }

    // Price filter
    result = result.filter(
      (p) => (p.price || 0) >= priceRange[0] && (p.price || 0) <= priceRange[1]
    );

    if (sort === 'price_asc') result.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sort === 'price_desc') result.sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (sort === 'name') result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    return result;
  }, [products, search, selectedCategory, materialFilter, sort, categories, priceRange]);

  const activeFilters = [
    selectedCategory !== 'all' && selectedCategory,
    materialFilter !== 'all' && materialFilter,
    (priceRange[0] > 0 || priceRange[1] < maxPrice) &&
      `R$ ${priceRange[0]}–R$ ${priceRange[1]}`,
  ].filter(Boolean);

  const clearFilters = () => {
    setSelectedCategory('all');
    setMaterialFilter('all');
    setPriceRange([0, maxPrice]);
    setSearch('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-space">Produtos</h1>
        <p className="text-muted-foreground mt-1">
          Encontre a peça perfeita para seu projeto
        </p>
      </div>

      {/* Search + Sort row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button
          variant="outline"
          onClick={() => setShowFilters((v) => !v)}
          className="flex items-center gap-2 sm:w-auto"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
          {activeFilters.length > 0 && (
            <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
              {activeFilters.length}
            </Badge>
          )}
          <ChevronDown
            className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`}
          />
        </Button>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full sm:w-48">
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

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="bg-card border border-border rounded-xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Categoria
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas Categorias</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.slug}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Material */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Material
                </label>
                <Select value={materialFilter} onValueChange={setMaterialFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Materiais</SelectItem>
                    <SelectItem value="PLA">PLA</SelectItem>
                    <SelectItem value="ABS">ABS</SelectItem>
                    <SelectItem value="PETG">PETG</SelectItem>
                    <SelectItem value="TPU">TPU</SelectItem>
                    <SelectItem value="Resina">Resina</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price range */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Faixa de Preço
                </label>
                <div className="px-1 pt-2">
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={0}
                    max={maxPrice}
                    step={10}
                    className="mb-3"
                  />
                  <div className="flex justify-between text-sm font-medium text-primary">
                    <span>R$ {priceRange[0]}</span>
                    <span>R$ {priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active filter tags */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <span className="text-sm text-muted-foreground">Filtros ativos:</span>
          {activeFilters.map((f) => (
            <Badge key={f} variant="secondary" className="gap-1 font-normal">
              {f}
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-6 text-destructive hover:text-destructive">
            <X className="w-3 h-3 mr-1" /> Limpar tudo
          </Button>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
        </div>
      ) : filtered.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground mb-5">
            <span className="font-semibold text-foreground">{filtered.length}</span> produto(s) encontrado(s)
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-muted-foreground/40" />
          </div>
          <p className="font-semibold text-foreground">Nenhum produto encontrado</p>
          <p className="text-sm text-muted-foreground mt-1">Tente ajustar os filtros</p>
          <Button variant="link" onClick={clearFilters} className="text-primary mt-3">
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
