import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/base44Client'; // Importação corrigida
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeroSection from '@/components/store/HeroSection';
import ProductCard from '@/components/store/ProductCard';
import CategoryCard from '@/components/store/CategoryCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { data: featured = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      // Busca todos os produtos e filtra apenas os ativos e em destaque (limite de 8)
      const allProducts = await apiClient.products.getAll();
      return allProducts
        .filter(p => p.is_active && p.is_featured)
        .slice(0, 8);
    },
  });

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      // Busca todas as categorias e filtra apenas as ativas
      const allCategories = await apiClient.categories.getAll();
      return allCategories.filter(c => c.is_active);
    },
  });

  return (
    <div>
      <HeroSection />

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold font-space">Categorias</h2>
              <p className="text-muted-foreground text-sm mt-1">Explore nossas coleções</p>
            </div>
            <Link to="/categorias">
              <Button variant="ghost" className="text-primary hover:text-primary">
                Ver Todas <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingCategories
              ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)
              : categories.slice(0, 4).map((cat, i) => (
                  <CategoryCard key={cat.id} category={cat} index={i} />
                ))
            }
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold font-space">Produtos em Destaque</h2>
            <p className="text-muted-foreground text-sm mt-1">Os mais procurados</p>
          </div>
          <Link to="/produtos">
            <Button variant="ghost" className="text-primary hover:text-primary">
              Ver Todos <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {loadingProducts ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="aspect-square rounded-2xl" />)}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>Nenhum produto em destaque ainda.</p>
            <Link to="/produtos">
              <Button variant="link" className="mt-2 text-primary">Ver todos os produtos</Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}