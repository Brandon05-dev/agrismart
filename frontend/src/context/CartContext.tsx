import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Cart, CartItem } from '../types';
import api from '../utils/api';
import { useAuth } from './AuthContext';

// Cart expiration time in milliseconds (24 hours)
const CART_EXPIRATION_TIME = 24 * 60 * 60 * 1000;

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateCartItem: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  getCartItemCount: () => number;
  cartExpired: boolean;
  clearCartExpiredFlag: () => void;
  getCartExpirationTime: () => number | null;
}

interface StoredCart extends Cart {
  expiresAt?: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [cartExpired, setCartExpired] = useState<boolean>(false);
  const { user } = useAuth();

  // Clear the cart expired flag
  const clearCartExpiredFlag = (): void => {
    setCartExpired(false);
  };

  // Load cart from localStorage for guest users
  const loadLocalCart = (): Cart => {
    const localCartString = localStorage.getItem('agrismart_cart');
    if (localCartString) {
      try {
        const storedCart: StoredCart = JSON.parse(localCartString);
        
        // Check if cart has expired
        if (storedCart.expiresAt && Date.now() > storedCart.expiresAt) {
          // Cart has expired, clear it
          console.log('Guest cart has expired');
          localStorage.removeItem('agrismart_cart');
          setCartExpired(true);
          return {
            userId: 'guest',
            items: [],
            totalItems: 0,
            totalAmount: 0
          };
        }
        
        // Remove expiration field before returning
        const { expiresAt, ...cart } = storedCart;
        return cart;
      } catch (error) {
        console.error('Error parsing stored cart:', error);
        localStorage.removeItem('agrismart_cart');
      }
    }
    return {
      userId: 'guest',
      items: [],
      totalItems: 0,
      totalAmount: 0
    };
  };

  // Save cart to localStorage for guest users with expiration
  const saveLocalCart = (cartData: Cart): void => {
    const storedCart: StoredCart = {
      ...cartData,
      expiresAt: Date.now() + CART_EXPIRATION_TIME
    };
    localStorage.setItem('agrismart_cart', JSON.stringify(storedCart));
  };

  // Calculate totals
  const calculateTotals = (items: CartItem[]): { totalItems: number; totalAmount: number } => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    return { totalItems, totalAmount };
  };

  // Fetch cart from server (for logged-in users)
  const refreshCart = async (): Promise<void> => {
    if (!user) {
      // Load from localStorage for guest users
      const localCart = loadLocalCart();
      setCart(localCart);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get<{ data: Cart }>('/cart');
      setCart(response.data.data);
    } catch (error: any) {
      console.error('Error fetching cart:', error);
      // If error, initialize empty cart
      setCart({
        userId: user._id,
        items: [],
        totalItems: 0,
        totalAmount: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (productId: string, quantity: number): Promise<void> => {
    if (!user) {
      // Guest user - use localStorage
      const localCart = loadLocalCart();
      const existingItemIndex = localCart.items.findIndex(
        (item) => typeof item.productId === 'string' && item.productId === productId
      );

      if (existingItemIndex > -1) {
        localCart.items[existingItemIndex].quantity += quantity;
        localCart.items[existingItemIndex].subtotal =
          localCart.items[existingItemIndex].quantity * localCart.items[existingItemIndex].unitPrice;
      } else {
        // Fetch product details to add to cart
        try {
          const response = await api.get(`/products/${productId}`);
          const product = response.data.data;
          localCart.items.push({
            productId: product._id,
            name: product.name,
            quantity: quantity,
            unitPrice: product.unitPrice,
            unit: product.unit,
            imageUrl: product.imageUrl,
            farmerId: product.farmerId,
            subtotal: quantity * product.unitPrice
          });
        } catch (error) {
          throw new Error('Failed to fetch product details');
        }
      }

      const totals = calculateTotals(localCart.items);
      localCart.totalItems = totals.totalItems;
      localCart.totalAmount = totals.totalAmount;

      saveLocalCart(localCart);
      setCart(localCart);
      return;
    }

    // Logged-in user - use API
    try {
      setLoading(true);
      const response = await api.post<{ data: Cart }>('/cart/add', {
        productId,
        quantity
      });
      setCart(response.data.data);
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      throw new Error(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  // Update cart item quantity
  const updateCartItem = async (productId: string, quantity: number): Promise<void> => {
    if (!user) {
      // Guest user - use localStorage
      const localCart = loadLocalCart();
      const itemIndex = localCart.items.findIndex(
        (item) => typeof item.productId === 'string' && item.productId === productId
      );

      if (itemIndex === -1) {
        throw new Error('Item not found in cart');
      }

      if (quantity === 0) {
        localCart.items.splice(itemIndex, 1);
      } else {
        localCart.items[itemIndex].quantity = quantity;
        localCart.items[itemIndex].subtotal =
          quantity * localCart.items[itemIndex].unitPrice;
      }

      const totals = calculateTotals(localCart.items);
      localCart.totalItems = totals.totalItems;
      localCart.totalAmount = totals.totalAmount;

      saveLocalCart(localCart);
      setCart(localCart);
      return;
    }

    // Logged-in user - use API
    try {
      setLoading(true);
      const response = await api.put<{ data: Cart }>('/cart/update', {
        productId,
        quantity
      });
      setCart(response.data.data);
    } catch (error: any) {
      console.error('Error updating cart:', error);
      throw new Error(error.response?.data?.message || 'Failed to update cart');
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId: string): Promise<void> => {
    if (!user) {
      // Guest user - use localStorage
      const localCart = loadLocalCart();
      localCart.items = localCart.items.filter(
        (item) => typeof item.productId === 'string' && item.productId !== productId
      );

      const totals = calculateTotals(localCart.items);
      localCart.totalItems = totals.totalItems;
      localCart.totalAmount = totals.totalAmount;

      saveLocalCart(localCart);
      setCart(localCart);
      return;
    }

    // Logged-in user - use API
    try {
      setLoading(true);
      const response = await api.delete<{ data: Cart }>(`/cart/remove/${productId}`);
      setCart(response.data.data);
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      throw new Error(error.response?.data?.message || 'Failed to remove from cart');
    } finally {
      setLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async (): Promise<void> => {
    if (!user) {
      // Guest user - clear localStorage
      localStorage.removeItem('agrismart_cart');
      setCart({
        userId: 'guest',
        items: [],
        totalItems: 0,
        totalAmount: 0
      });
      return;
    }

    // Logged-in user - use API
    try {
      setLoading(true);
      const response = await api.delete<{ data: Cart }>('/cart/clear');
      setCart(response.data.data);
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      throw new Error(error.response?.data?.message || 'Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  // Get total item count
  const getCartItemCount = (): number => {
    return cart?.totalItems || 0;
  };

  // Get cart expiration time (for guest users only)
  const getCartExpirationTime = (): number | null => {
    if (user) return null; // Logged-in users don't have expiration
    
    const localCartString = localStorage.getItem('agrismart_cart');
    if (localCartString) {
      try {
        const storedCart: StoredCart = JSON.parse(localCartString);
        return storedCart.expiresAt || null;
      } catch (error) {
        return null;
      }
    }
    return null;
  };

  // Load cart on mount and when user changes
  useEffect(() => {
    refreshCart();
  }, [user]);

  // Set up periodic check for cart expiration (check every minute)
  useEffect(() => {
    if (!user) {
      const intervalId = setInterval(() => {
        const localCartString = localStorage.getItem('agrismart_cart');
        if (localCartString) {
          try {
            const storedCart: StoredCart = JSON.parse(localCartString);
            if (storedCart.expiresAt && Date.now() > storedCart.expiresAt) {
              // Cart has expired
              localStorage.removeItem('agrismart_cart');
              setCartExpired(true);
              setCart({
                userId: 'guest',
                items: [],
                totalItems: 0,
                totalAmount: 0
              });
            }
          } catch (error) {
            console.error('Error checking cart expiration:', error);
          }
        }
      }, 60000); // Check every minute

      return () => clearInterval(intervalId);
    }
  }, [user]);

  const value: CartContextType = {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
    getCartItemCount,
    cartExpired,
    clearCartExpiredFlag,
    getCartExpirationTime
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
