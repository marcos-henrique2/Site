import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Cart() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-bold font-space">Seu carrinho está vazio</h2>
        <p className="text-muted-foreground mt-2">Adicione produtos para começar!</p>
        <Link to="/produtos">
          <Button className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
            Ver Produtos
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Link to="/produtos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Continuar comprando
      </Link>

      <h1 className="text-3xl font-bold font-space mb-8">Carrinho</h1>

      <div className="space-y-4">
        <AnimatePresence>
          {items.map(item => (
            <motion.div
              key={item.product_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="flex gap-4 p-4 bg-card rounded-xl border border-border"
            >
              <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.product_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <Link to={`/produto/${item.product_id}`} className="font-semibold text-sm hover:text-primary transition-colors line-clamp-1 block">
                  {item.product_name}
                </Link>
                <p className="text-sm text-primary font-bold font-space mt-1">
                  R$ {item.unit_price?.toFixed(2)}
                </p>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border border-border rounded-md">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm font-space">
                      R$ {(item.unit_price * item.quantity).toFixed(2)}
                    </span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeItem(item.product_id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Separator className="my-6" />

      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm mb-4">
          <span className="text-muted-foreground">Frete</span>
          <span className="text-sm text-muted-foreground">A calcular</span>
        </div>
        <Separator className="mb-4" />
        <div className="flex justify-between">
          <span className="font-bold font-space text-lg">Total</span>
          <span className="font-bold font-space text-lg text-primary">R$ {subtotal.toFixed(2)}</span>
        </div>
        <Link to="/checkout">
          <Button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" size="lg">
            Finalizar Pedido <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}