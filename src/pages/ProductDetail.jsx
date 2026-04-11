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

// ── Zoom helper ───────────────────────────────────────────────────────────────
function ZoomableImage({ src, alt }) {
  const [zoomed, setZoomed] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
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
        src={src} alt={alt} draggable={false}
        className={`w-full h-full object-cover transition-transform duration-200 ${zoomed ? 'scale-[2]' : 'scale-100'}`}
        style={zoomed ? { transformOrigin: `${pos.x}% ${pos.y}%` } : {}}
      />
      {!zoomed && (
        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm pointer-events-none">
          <ZoomIn className="w-3 h-3" /> Zoom
        </div>
      )}
    </div>
  );
}

// ── Parse size_variants ───────────────────────────────────────────────────────
function parseSizeVariants(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProductDetail() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null); // { size, price }
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

  const sizeVariants = parseSizeVariants(product.size_variants);
  const hasSizes = sizeVariants.length > 0;

  // Price to display: selected size → base price
  const displayPrice = selectedSize ? selectedSize.price : product.price;

  // Price range for badge display in header when sizes exist
  const minPrice = hasSizes ? Math.min(...sizeVariants.map(sv => sv.price)) : product.price;
  const maxPrice = hasSizes ? Math.max(...sizeVariants.map(sv => sv.price)) : product.price;
  const priceRangeLabel = hasSizes && minPrice !== maxPrice
    ? `R$ ${minPrice.toFixed(2)} – R$ ${maxPrice.toFixed(2)}`
    : `R$ ${displayPrice?.toFixed(2)}`;

  const outOfStock = (product.stock_quantity || 0) <= 0;
  const images = product.images?.length > 0 ? product.images : [];
  const hasDiscount = product.compare_price && product.compare_price > (selectedSize ? selectedSize.price : product.price);
  const discount = hasDiscount
    ? Math.round(((product.compare_price - displayPrice) / product.compare_price) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!product || outOfStock) return;
    // If sizes exist, one must be chosen
    if (hasSizes && !selectedSize) {
      toast({ title: '⚠️ Escolha um tamanho antes de adicionar!' });
      return;
    }
    // Pass a modified product with the chosen price & size info
    const productToAdd = selectedSize
      ? { ...product, price: selectedSize.price, name: `${product.name} – ${selectedSize.size}` }
      : product;
    addItem(productToAdd, quantity);
    setJustAdded(true);
    toast({ title: '✅ Adicionado ao carrinho!', description: `${quantity}x ${productToAdd.name}` });
    setTimeout(() => setJustAdded(false), 2000);
  };

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
            <Link to={`/produtos?categoria=${category.slug}`} className="hover:text-foreground transition-colors">{category.name}</Link>
          </>
        )}
        <span>/</span>
        <span className="text-foreground line-clamp-1">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-14">
        {/* ── Images ── */}
        <div>
          <div className="aspect-square rounded-2xl bg-muted overflow-hidden border border-border">
            {images[selectedImage] ? (
              <ZoomableImage src={images[selectedImage]} alt={product.name} />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-16 h-16 text-muted-foreground/20" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i} onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all duration-200 ${i === selectedImage ? 'border-primary shadow-md shadow-primary/20 scale-105' : 'border-border opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {category && (
              <Link to={`/produtos?categoria=${category.slug}`}>
                <Badge variant="secondary" className="text-xs">{category.name}</Badge>
              </Link>
            )}
            {product.material && <Badge variant="outline" className="text-xs">{product.material}</Badge>}
            {hasDiscount && <Badge className="bg-red-500 text-white text-xs">-{discount}%</Badge>}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold font-space leading-tight">{product.name}</h1>

          {/* ── Price ── */}
          <div className="flex items-baseline gap-3 mt-5">
            <span className="text-4xl font-bold text-primary font-space">
              {hasSizes && !selectedSize ? priceRangeLabel : `R$ ${displayPrice?.toFixed(2)}`}
            </span>
            {hasDiscount && selectedSize && (
              <span className="text-lg text-muted-foreground line-through">R$ {product.compare_price?.toFixed(2)}</span>
            )}
          </div>
          {hasSizes && !selectedSize && (
            <p className="text-xs text-muted-foreground mt-1">Selecione um tamanho para ver o preço exato</p>
          )}

          {product.short_description && (
            <p className="mt-4 text-muted-foreground leading-relaxed text-sm">{product.short_description}</p>
          )}

          <Separator className="my-5" />

          {/* ── Size selector ── */}
          {hasSizes && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">
                  Tamanho
                  {selectedSize && <span className="ml-2 text-primary font-space">— {selectedSize.size}</span>}
                </span>
                {selectedSize && (
                  <button
                    onClick={() => setSelectedSize(null)}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    Limpar
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {sizeVariants.map((sv) => {
                  const active = selectedSize?.size === sv.size;
                  return (
                    <button
                      key={sv.size}
                      type="button"
                      onClick={() => setSelectedSize(sv)}
                      className={`flex flex-col items-center justify-center px-4 py-2.5 rounded-xl border-2 transition-all duration-150 min-w-[72px] ${
                        active
                          ? 'border-primary bg-primary/10 shadow-md shadow-primary/20 scale-105'
                          : 'border-border bg-card hover:border-primary/50 hover:bg-muted'
                      }`}
                    >
                      <span className={`text-sm font-semibold ${active ? 'text-primary' : 'text-foreground'}`}>{sv.size}</span>
                      <span className={`text-xs font-space font-bold mt-0.5 ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                        R$ {Number(sv.price).toFixed(2)}
                      </span>
                    </button>
                  );
                })}
              </div>
              {hasSizes && !selectedSize && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  ⚠️ Escolha um tamanho para adicionar ao carrinho
                </p>
              )}
            </div>
          )}

          {/* Stock */}
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-2 h-2 rounded-full ${outOfStock ? 'bg-red-500' : 'bg-green-500'}`} />
            <span className={`text-sm font-medium ${outOfStock ? 'text-destructive' : 'text-green-600'}`}>
              {outOfStock ? 'Fora de Estoque' : `${product.stock_quantity} unidade(s) disponível`}
            </span>
          </div>

          {/* Quantity + Add */}
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-border rounded-xl overflow-hidden">
              <Button variant="ghost" size="icon" className="h-11 w-11 rounded-none" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={outOfStock}>
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-12 text-center font-bold text-base">{quantity}</span>
              <Button variant="ghost" size="icon" className="h-11 w-11 rounded-none" onClick={() => setQuantity(Math.min(product.stock_quantity || 99, quantity + 1))} disabled={outOfStock}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <Button
              size="lg"
              className={`flex-1 font-semibold h-11 transition-all duration-200 ${
                justAdded ? 'bg-green-500 hover:bg-green-500 text-white' : 'bg-primary text-primary-foreground hover:bg-primary/90'
              } ${hasSizes && !selectedSize ? 'opacity-60' : ''}`}
              disabled={outOfStock}
              onClick={handleAddToCart}
            >
              <AnimatePresence mode="wait">
                {justAdded ? (
                  <motion.span key="added" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Adicionado!
                  </motion.span>
                ) : (
                  <motion.span key="cart" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    {hasSizes && !selectedSize ? 'Selecione um tamanho' : 'Adicionar ao Carrinho'}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>

          {/* WhatsApp CTA */}
          <a
            href={`https://wa.me/5562992882262?text=${encodeURIComponent(`Olá! Tenho interesse no produto: ${product.name}${selectedSize ? ` (${selectedSize.size})` : ''}. Pode me ajudar?`)}`}
            target="_blank" rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-green-200 bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors"
          >
            💬 Tirar dúvida no WhatsApp
          </a>

          {/* Specs */}
          {specs.length > 0 && (
            <>
              <Separator className="my-6" />
              <h3 className="font-bold text-xs mb-3 uppercase tracking-widest text-muted-foreground">Especificações Técnicas</h3>
              <div className="grid grid-cols-2 gap-2">
                {specs.map((spec, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/60 border border-border/50">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <spec.icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{spec.label}</p>
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
              <h3 className="font-bold text-xs mb-3 uppercase tracking-widest text-muted-foreground">Descrição</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{product.description}</p>
            </>
          )}
        </motion.div>
      </div>

      {/* Related */}
      {relatedFiltered.length > 0 && (
        <section className="mt-20">
          <h2 className="text-xl font-bold font-space mb-6">Produtos Relacionados</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedFiltered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}
