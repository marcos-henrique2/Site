import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CategoryCard from '@/components/store/CategoryCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function Categories() {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.filter({ is_active: true }, 'order', 50),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-space">Categorias</h1>
        <p className="text-muted-foreground mt-1">Explore nossas coleções de impressão 3D</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => <CategoryCard key={cat.id} category={cat} index={i} />)}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          Nenhuma categoria disponível.
        </div>
      )}
    </div>
  );
}