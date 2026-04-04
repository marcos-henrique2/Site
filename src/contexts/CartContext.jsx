import React, { createContext, useContext, useState, useEffect } from 'react';

// 👇 Dicionário no topo
/**
 * @typedef {Object} CartItem
 * @property {string} product_id
 * @property {string} product_name
 * @property {number} quantity
 * @property {number} unit_price
 * @property {string} [image]
 * @property {number} [stock]
 */

/**
 * @typedef {Object} CartContextType
 * @property {CartItem[]} items
 * @property {number} subtotal
 * @property {number} totalItems
 * @property {Function} clearCart
 * @property {Function} addItem
 * @property {Function} removeItem
 * @property {Function} updateQuantity
 */

// 👇 A CORREÇÃO FINAL: Colocamos a etiqueta diretamente no null
const CartContext = createContext(/** @type {CartContextType | null} */ (null));

/**
 * @param {{ children: React.ReactNode }} props
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState(/** @type {() => CartItem[]} */ () => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  /**
   * @param {any} product 
   * @param {number} [quantity] 
   */
  const addItem = (product, quantity = 1) => {
    setItems((/** @type {CartItem[]} */ prev) => {
      const existing = prev.find((/** @type {CartItem} */ i) => i.product_id === product.id);
      if (existing) {
        return prev.map((/** @type {CartItem} */ i) =>
          i.product_id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, {
        product_id: product.id,
        product_name: product.name,
        unit_price: product.price,
        quantity,
        image: product.images?.[0] || '',
        stock: product.stock_quantity || 0
      }];
    });
  };

  /**
   * @param {string} productId 
   */
  const removeItem = (productId) => {
    setItems((/** @type {CartItem[]} */ prev) => prev.filter((/** @type {CartItem} */ i) => i.product_id !== productId));
  };

  /**
   * @param {string} productId 
   * @param {number} quantity 
   */
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((/** @type {CartItem[]} */ prev) => prev.map((/** @type {CartItem} */ i) =>
      i.product_id === productId ? { ...i, quantity } : i
    ));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((/** @type {number} */ sum, /** @type {CartItem} */ i) => sum + i.quantity, 0);
  const subtotal = items.reduce((/** @type {number} */ sum, /** @type {CartItem} */ i) => sum + i.unit_price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal
    }}>
      {children}
    </CartContext.Provider>
  );
}

/**
 * @returns {CartContextType}
 */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de um CartProvider");
  }
  return context;
}