import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/base44Client';
import { Link, useParams } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, ArrowLeft, Package, Ruler, Clock, Layers, Weight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/store/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem } = useCart();

  // 1. Corrigida a busca do Produto individual
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      // Como agora recebemos a lista toda no nosso mock, filtramos pelo ID localmente
      const allProducts = await apiClient.products.getAll();
      return allProducts.find(p => p.id === id);
    },
    enabled: !!id,
  });

  // 2. Corrigida a busca dos Produtos Relacionados
  const { data: related = [] } = useQuery({
    queryKey: ['related', product?.category_id],
    queryFn: async () => {
      const allProducts = await apiClient.products.getAll();
      return allProducts.filter(p => p.category_id === product.category_id && p.is_active);
    },
    enabled: !!product?.category_id,
  });

  // 3. Corrigida a busca da Categoria
  const { data: category } = useQuery({
    queryKey: ['category', product?.category_id],
    queryFn: async () => {
      const allCategories = await apiClient.categories.getAll();
      return allCategories.find(c => c.id === product.category_id);
    },
    enabled: !!product?.category_id,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-10">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Produto não encontrado.</p>
        <Link to="/produtos"><Button variant="link" className="text-primary mt-2">Ver todos os produtos</Button></Link>
      </div>
    );
  }

  const outOfStock = (product.stock_quantity || 0) <= 0;
  const images = product.images?.length > 0 ? product.images : [];
  const relatedFiltered = related.filter(r => r.id !== product.id).slice(0, 4);

  const specs = [
    product.material && { icon: Layers, label: 'Material', value: product.material },
    product.dimensions && { icon: Ruler, label: 'Dimensões', value: product.dimensions },
    product.weight && { icon: Weight, label: 'Peso', value: product.weight },
    product.print_time && { icon: Clock, label: 'Tempo de Impressão', value: product.print_time },
    product.infill && { icon: Package, label: 'Preenchimento', value: product.infill },
    product.color && { icon: Layers, label: 'Cor', value: product.color },
  ].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/produtos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Voltar aos produtos
      </Link>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-2xl bg-muted overflow-hidden border border-border">
            {images[selectedImage] ? (
              <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-16 h-16 text-muted-foreground/20" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-colors ${
                    i === selectedImage ? 'border-primary' : 'border-border'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            {category && (
              <Link to={`/produtos?categoria=${category.slug}`}>
                <Badge variant="secondary" className="text-xs">{category.name}</Badge>
              </Link>
            )}
            {product.material && (
              <Badge variant="outline" className="text-xs">{product.material}</Badge>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold font-space">{product.name}</h1>

          <div className="flex items-baseline gap-3 mt-4">
            <span className="text-3xl font-bold text-primary font-space">
              R$ {product.price?.toFixed(2)}
            </span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-lg text-muted-foreground line-through">
                R$ {product.compare_price?.toFixed(2)}
              </span>
            )}
          </div>

          {product.short_description && (
            <p className="mt-4 text-muted-foreground leading-relaxed">{product.short_description}</p>
          )}

          <Separator className="my-6" />

          <div className="flex items-center gap-2 mb-2 text-sm">
            <span className={outOfStock ? 'text-destructive' : 'text-green-600'}>
              {outOfStock ? 'Fora de Estoque' : `${product.stock_quantity} em estoque`}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center border border-border rounded-lg">
              <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQuantity(Math.min(product.stock_quantity || 99, quantity + 1))}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <Button
              size="lg"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              disabled={outOfStock}
              onClick={() => addItem(product, quantity)}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Adicionar ao Carrinho
            </Button>
          </div>

          {specs.length > 0 && (
            <>
              <Separator className="my-6" />
              <h3 className="font-semibold text-sm mb-3 uppercase tracking-wider text-muted-foreground">Especificações</h3>
              <div className="grid grid-cols-2 gap-3">
                {specs.map((spec, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <spec.icon className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">{spec.label}</p>
                      <p className="text-sm font-medium">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {product.description && (
            <>
              <Separator className="my-6" />
              <h3 className="font-semibold text-sm mb-3 uppercase tracking-wider text-muted-foreground">Descrição</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{product.description}</p>
            </>
          )}
        </div>
      </div>

      {relatedFiltered.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold font-space mb-6">Produtos Relacionados</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedFiltered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}