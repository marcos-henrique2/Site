import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { motion } from 'framer-motion';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const outOfStock = (product.stock_quantity || 0) <= 0;
  const hasDiscount = product.compare_price && product.compare_price > product.price;
  const discount = hasDiscount
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
    >
      <Link to={`/produto/${product.id}`} className="block" onClick={e => e.stopPropagation()}>
        <div className="relative aspect-square bg-muted overflow-hidden">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-12 h-12 text-muted-foreground/30" />
            </div>
          )}

          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {hasDiscount && (
              <Badge className="bg-destructive text-destructive-foreground text-xs font-bold">
                -{discount}%
              </Badge>
            )}
            {product.is_featured && (
              <Badge className="bg-primary text-primary-foreground text-xs">
                Destaque
              </Badge>
            )}
            {outOfStock && (
              <Badge variant="secondary" className="text-xs">
                Esgotado
              </Badge>
            )}
          </div>

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="secondary" className="shadow-lg">
                <Eye className="w-4 h-4 mr-1" /> Ver Detalhes
              </Button>
            </div>
          </div>
        </div>
      </Link>

      <div className="p-4">
        {product.material && (
          <span className="text-xs font-medium text-primary uppercase tracking-wider">
            {product.material}
          </span>
        )}
        <Link to={`/produto/${product.id}`}>
          <h3 className="font-semibold text-sm mt-1 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-lg font-space">
              R$ {product.price?.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                R$ {product.compare_price?.toFixed(2)}
              </span>
            )}
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
            onClick={(e) => {
              e.preventDefault();
              if (!outOfStock) addItem(product);
            }}
            disabled={outOfStock}
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}