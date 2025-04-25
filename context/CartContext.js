import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the Cart Context
export const CartContext = createContext();

// Create a custom hook to use the cart context
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart from AsyncStorage on initial load
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await AsyncStorage.getItem('cart');
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error('Failed to load cart from storage', error);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  // Save cart to AsyncStorage whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem('cart', JSON.stringify(cartItems));
      } catch (error) {
        console.error('Failed to save cart to storage', error);
      }
    };

    if (!loading) {
      saveCart();
    }
  }, [cartItems, loading]);

  // Add item to cart
  const addToCart = (product) => {
    setCartItems((prevCartItems) => {
      // Check if the product is already in the cart
      const existingItemIndex = prevCartItems.findIndex(
        (item) => item.productId === product.productId
      );

      if (existingItemIndex !== -1) {
        // Product exists, increment quantity
        const updatedItems = [...prevCartItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
        };
        return updatedItems;
      } else {
        // Product doesn't exist, add it with quantity 1
        return [...prevCartItems, { ...product, quantity: 1 }];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCartItems((prevCartItems) =>
      prevCartItems.filter((item) => item.productId !== productId)
    );
  };

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevCartItems) =>
      prevCartItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  // Clear the entire cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate the total price of items in the cart
  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  // Get the total number of items in the cart
  const getItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getItemsCount,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}; 