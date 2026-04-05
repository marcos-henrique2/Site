import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/base44Client';
import { Link, useParams } from 'react-router-dom';
import {
  ShoppingCart, Minus, Plus, ArrowLeft, Package,
  Ruler, Clock, Layers, Weight, ZoomIn, CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '@/components/store/ProductCard';

/** Simple image zoom component */
function ZoomableImage({ src, alt }) {
  const [zoomed, setZoomed] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x, y });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden cursor-zoom-in"
      onMouseEnter={() => setZoomed(true)}
      onMouseLeave={() => setZoomed(false)}
      onMouseMove={handleMouseMove}
    >
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-transform duration-200 ${
          zoomed ? 'scale-[2]' : 'scale-100'
        }`}
        style={
          zoomed
            ? { transformOrigin: `${pos.x}% ${pos.y}%` }
            : {}
        }
        draggable={false}
      />
      {!zoomed && (
        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm pointer-events-none">
          <ZoomIn className="w-3 h-3" /> Zoom
        </div>
      )}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const { addItem } = useCart();
  const { toast } = useToast();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const allProducts = await apiClient.products.getAll();
      return allProducts.find((p) => p.id === id);
    },
    enabled: !!id,
  });

  const { data: related = [] } = useQuery({
    queryKey: ['related', product?.category_id],
    queryFn: async () => {
      const allProducts = await apiClient.products.getAll();
      return allProducts.filter((p) => p.category_id === product.category_id && p.is_active);
    },
    enabled: !!product?.category_id,
  });

  const { data: category } = useQuery({
    queryKey: ['category', product?.category_id],
    queryFn: async () => {
      const allCategories = await apiClient.categories.getAll();
      return allCategories.find((c) => c.id === product.category_id);
    },
    enabled: !!product?.category_id,
  });

  const handleAddToCart = () => {
    if (!product || outOfStock) return;
    addItem(product, quantity);
    setJustAdded(true);
    toast({ title: '✅ Adicionado ao carrinho!', description: `${quantity}x ${product.name}` });
    setTimeout(() => setJustAdded(false), 2000);
  };

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
        <Link to="/produtos">
          <Button variant="link" className="text-primary mt-2">
            Ver todos os produtos
          </Button>
        </Link>
      </div>
    );
  }

  const outOfStock = (product.stock_quantity || 0) <= 0;
  const images = product.images?.length > 0 ? product.images : [];
  const hasDiscount = product.compare_price && product.compare_price > product.price;
  const discount = hasDiscount
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;
  const relatedFiltered = related.filter((r) => r.id !== product.id).slice(0, 4);

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
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/produtos" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Produtos
        </Link>
        {category && (
          <>
            <span>/</span>
            <Link
              to={`/produtos?categoria=${category.slug}`}
              className="hover:text-foreground transition-colors"
            >
              {category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-foreground line-clamp-1">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-14">
        {/* Images */}
        <div>
          {/* Main image with zoom */}
          <div className="aspect-square rounded-2xl bg-muted overflow-hidden border border-border">
            {images[selectedImage] ? (
              <ZoomableImage src={images[selectedImage]} alt={product.name} />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-16 h-16 text-muted-foreground/20" />
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all duration-200 ${
                    i === selectedImage
                      ? 'border-primary shadow-md shadow-primary/20 scale-105'
                      : 'border-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {category && (
              <Link to={`/produtos?categoria=${category.slug}`}>
                <Badge variant="secondary" className="text-xs">
                  {category.name}
                </Badge>
              </Link>
            )}
            {product.material && (
              <Badge variant="outline" className="text-xs">
                {product.material}
              </Badge>
            )}
            {hasDiscount && (
              <Badge className="bg-red-500 text-white text-xs">-{discount}%</Badge>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold font-space leading-tight">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mt-5">
            <span className="text-4xl font-bold text-primary font-space">
              R$ {product.price?.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-lg text-muted-foreground line-through">
                R$ {product.compare_price?.toFixed(2)}
              </span>
            )}
          </div>

          {product.short_description && (
            <p className="mt-4 text-muted-foreground leading-relaxed text-sm">
              {product.short_description}
            </p>
          )}

          <Separator className="my-6" />

          {/* Stock */}
          <div className="flex items-center gap-2 mb-4">
            <div
              className={`w-2 h-2 rounded-full ${outOfStock ? 'bg-red-500' : 'bg-green-500'}`}
            />
            <span className={`text-sm font-medium ${outOfStock ? 'text-destructive' : 'text-green-600'}`}>
              {outOfStock
                ? 'Fora de Estoque'
                : `${product.stock_quantity} unidade(s) disponível`}
            </span>
          </div>

          {/* Quantity + Add */}
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-border rounded-xl overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-none"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={outOfStock}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-12 text-center font-bold text-base">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-none"
                onClick={() => setQuantity(Math.min(product.stock_quantity || 99, quantity + 1))}
                disabled={outOfStock}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <Button
              size="lg"
              className={`flex-1 font-semibold h-11 transition-all duration-200 ${
                justAdded
                  ? 'bg-green-500 hover:bg-green-500 text-white'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
              disabled={outOfStock}
              onClick={handleAddToCart}
            >
              <AnimatePresence mode="wait">
                {justAdded ? (
                  <motion.span
                    key="added"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> Adicionado!
                  </motion.span>
                ) : (
                  <motion.span
                    key="cart"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" /> Adicionar ao Carrinho
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>

          {/* WhatsApp custom order */}
          <a
            href={`https://wa.me/5562992882262?text=${encodeURIComponent(`Olá! Tenho interesse no produto: ${product.name}. Pode me ajudar?`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-green-200 bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors"
          >
            💬 Tirar dúvida no WhatsApp
          </a>

          {/* Specs */}
          {specs.length > 0 && (
            <>
              <Separator className="my-6" />
              <h3 className="font-bold text-xs mb-3 uppercase tracking-widest text-muted-foreground">
                Especificações Técnicas
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {specs.map((spec, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/60 border border-border/50"
                  >
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <spec.icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        {spec.label}
                      </p>
                      <p className="text-xs font-semibold">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Description */}
          {product.description && (
            <>
              <Separator className="my-6" />
              <h3 className="font-bold text-xs mb-3 uppercase tracking-widest text-muted-foreground">
                Descrição
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </>
          )}
        </motion.div>
      </div>

      {/* Related products */}
      {relatedFiltered.length > 0 && (
        <section className="mt-20">
          <h2 className="text-xl font-bold font-space mb-6">Produtos Relacionados</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedFiltered.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
