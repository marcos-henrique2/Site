import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Minus, Plus, Trash2, ArrowRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';

/**
 * @param {{ open: boolean, onClose: () => void }} props
 */
export default function CartDrawer({ open, onClose }) {
  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCart();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-96 bg-background shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="font-bold font-space text-lg">
                  Carrinho
                  {totalItems > 0 && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({totalItems} {totalItems === 1 ? 'item' : 'itens'})
                    </span>
                  )}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence initial={false}>
                {items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center h-full py-16 text-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                      <ShoppingBag className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                    <p className="font-semibold text-foreground">Carrinho vazio</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Adicione produtos para começar!
                    </p>
                    <Button
                      onClick={onClose}
                      variant="outline"
                      className="mt-6"
                      asChild
                    >
                      <Link to="/produtos">Ver Produtos</Link>
                    </Button>
                  </motion.div>
                ) : (
                  items.map((item) => (
                    <motion.div
                      key={item.product_id}
                      layout
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30, height: 0 }}
                      className="flex gap-3 p-3 bg-card rounded-xl border border-border"
                    >
                      {/* Image */}
                      <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/produto/${item.product_id}`}
                          onClick={onClose}
                          className="text-sm font-medium line-clamp-2 hover:text-primary transition-colors block leading-snug"
                        >
                          {item.product_name}
                        </Link>
                        <p className="text-primary font-bold text-sm font-space mt-1">
                          R$ {item.unit_price?.toFixed(2)}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          {/* Quantity */}
                          <div className="flex items-center gap-1 border border-border rounded-lg">
                            <button
                              className="w-6 h-6 flex items-center justify-center hover:bg-muted rounded-l-lg transition-colors"
                              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-medium">
                              {item.quantity}
                            </span>
                            <button
                              className="w-6 h-6 flex items-center justify-center hover:bg-muted rounded-r-lg transition-colors"
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Subtotal + Remove */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-space text-muted-foreground">
                              R$ {(item.unit_price * item.quantity).toFixed(2)}
                            </span>
                            <button
                              onClick={() => removeItem(item.product_id)}
                              className="text-destructive hover:text-destructive/80 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-4 border-t border-border bg-card/50 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="font-bold font-space text-lg text-primary">
                    R$ {subtotal.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Frete calculado no checkout
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    asChild
                  >
                    <Link to="/carrinho">Ver Carrinho</Link>
                  </Button>
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                    onClick={onClose}
                    asChild
                  >
                    <Link to="/checkout">
                      Finalizar <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
