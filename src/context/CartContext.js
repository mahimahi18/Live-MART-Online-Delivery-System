import React, { createContext, useContext, useState } from 'react';


// 1. Create the Context
const CartContext = createContext();


// 2. Create a custom hook to use the context
export const useCart = () => {
  return useContext(CartContext);
};


// 3. Create the Provider component (this will wrap your whole app)
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);


  // --- Cart Functions ---


  const addToCart = (product) => {
    setCart((prevCart) => {
      // Check if product is already in cart
      const existingItem = prevCart.find(item => item.id === product.id);


      if (existingItem) {
        // If it is, just increase quantity
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // If it's not, add it to the cart with quantity 1
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };


  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter(item => item.id !== productId));
  };


  const updateQuantity = (productId, amount) => {
    setCart((prevCart) =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item
      )
    );
  };


  const clearCart = () => {
    setCart([]);
  };


  // --- Calculated Values ---
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);


  // 4. Pass all values and functions to the provider
  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalAmount,
  };


  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
