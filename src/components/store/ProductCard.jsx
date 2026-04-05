import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Package, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

/**
 * @param {Object} props
 * @param {any} props.product
 * @param {number} [props.index]
 */
export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const outOfStock = (product.stock_quantity || 0) <= 0;
  const hasDiscount = product.compare_price && product.compare_price > product.price;
  const discount = hasDiscount
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;

    addItem(product);
    setJustAdded(true);
    toast({
      title: '✅ Adicionado ao carrinho!',
      description: product.name,
    });
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted((prev) => !prev);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: 'easeOut' }}
      className="group relative bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
    >
      {/* Image area */}
      <Link to={`/produto/${product.id}`} className="block">
        <div className="relative aspect-square bg-muted overflow-hidden">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
              <Package className="w-12 h-12 text-muted-foreground/20" />
            </div>
          )}

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {hasDiscount && (
              <Badge className="bg-red-500 text-white text-xs font-bold shadow-lg">
                -{discount}%
              </Badge>
            )}
            {product.is_featured && (
              <Badge className="bg-primary text-primary-foreground text-xs shadow-lg">
                ⭐ Destaque
              </Badge>
            )}
            {outOfStock && (
              <Badge variant="secondary" className="text-xs opacity-90">
                Esgotado
              </Badge>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-500'
              }`}
            />
          </button>

          {/* Quick view button */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <span className="bg-white/95 backdrop-blur-sm text-xs font-semibold text-gray-800 px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
              <Eye className="w-3 h-3" /> Ver Detalhes
            </span>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        {product.material && (
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
            {product.material}
          </span>
        )}

        <Link to={`/produto/${product.id}`}>
          <h3 className="font-semibold text-sm mt-0.5 line-clamp-2 hover:text-primary transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Price + Add to cart */}
        <div className="flex items-center justify-between mt-3 gap-2">
          <div className="flex flex-col">
            <span className="font-bold text-lg font-space text-foreground leading-none">
              R$ {product.price?.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through mt-0.5">
                R$ {product.compare_price?.toFixed(2)}
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            {justAdded ? (
              <motion.div
                key="added"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center shrink-0"
              >
                <span className="text-white text-xs font-bold">✓</span>
              </motion.div>
            ) : (
              <motion.button
                key="cart"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleAddToCart}
                disabled={outOfStock}
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-sm ${
                  outOfStock
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
                aria-label="Adicionar ao carrinho"
              >
                <ShoppingCart className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
