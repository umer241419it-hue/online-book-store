import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const CART_STORAGE_KEY = 'online_book_store_cart_v1';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (err) {
      console.error('Failed to load cart from localStorage:', err);
      return [];
    }
  });

  // Save to localStorage whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
      console.error('Failed to save cart to localStorage:', err);
    }
  }, [cart]);

  /**
   * Add book to cart with stock validation
   * Returns { success: boolean, message: string }
   */
  const addToCart = (book, requestedQty = 1) => {
    if (!book || book.quantity <= 0) {
      return { success: false, message: 'This book is currently out of stock.' };
    }

    let result = { success: true, message: `Added "${book.title}" to cart.` };

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.book.bookId === book.bookId
      );

      if (existingItemIndex > -1) {
        const currentQty = prevCart[existingItemIndex].quantity;
        const newQty = currentQty + requestedQty;

        if (newQty > book.quantity) {
          result = {
            success: false,
            message: `Cannot add more. Maximum available stock is ${book.quantity}.`
          };
          return prevCart;
        }

        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: newQty,
          book: book // update with latest book details
        };
        result = { success: true, message: `Increased "${book.title}" quantity in cart.` };
        return updatedCart;
      } else {
        if (requestedQty > book.quantity) {
          result = {
            success: false,
            message: `Cannot add ${requestedQty} units. Only ${book.quantity} available in stock.`
          };
          return prevCart;
        }

        return [...prevCart, { book, quantity: requestedQty }];
      }
    });

    return result;
  };

  /**
   * Remove item completely from cart
   */
  const removeFromCart = (bookId) => {
    setCart((prevCart) => prevCart.filter((item) => item.book.bookId !== bookId));
  };

  /**
   * Update quantity of a book in cart by delta (+1 or -1) or explicit quantity
   */
  const updateQuantity = (bookId, newQuantity) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.book.bookId === bookId) {
            // Check lower bound
            if (newQuantity <= 0) {
              return null; // will be filtered out
            }
            // Check upper bound against available book stock
            const maxAvailable = item.book.quantity;
            const finalQty = Math.min(newQuantity, maxAvailable);
            return {
              ...item,
              quantity: finalQty
            };
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  /**
   * Increment quantity by 1 if within stock
   */
  const incrementQuantity = (bookId) => {
    const item = cart.find((i) => i.book.bookId === bookId);
    if (!item) return { success: false, message: 'Item not in cart' };

    if (item.quantity >= item.book.quantity) {
      return {
        success: false,
        message: `Maximum stock limit reached (${item.book.quantity} copies).`
      };
    }

    updateQuantity(bookId, item.quantity + 1);
    return { success: true, message: 'Quantity updated.' };
  };

  /**
   * Decrement quantity by 1 (removes if reaches 0)
   */
  const decrementQuantity = (bookId) => {
    const item = cart.find((i) => i.book.bookId === bookId);
    if (!item) return;

    if (item.quantity > 1) {
      updateQuantity(bookId, item.quantity - 1);
    } else {
      removeFromCart(bookId);
    }
  };

  /**
   * Clear the entire cart
   */
  const clearCart = () => {
    setCart([]);
  };

  /**
   * Calculate total price of all items in cart
   */
  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.book.price * item.quantity);
    }, 0);
  };

  /**
   * Get total number of book items in cart
   */
  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        incrementQuantity,
        decrementQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
