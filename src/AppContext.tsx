import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, CartItem, Product } from './types';

interface AppContextType {
  lang: Language;
  setLang: (l: Language) => void;
  cart: CartItem[];
  wishlist: Product[];
  recentlyViewed: Product[];
  addToCart: (p: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  toggleWishlist: (product: Product) => void;
  addToRecentlyViewed: (product: Product) => void;
  clearRecentlyViewed: () => void;
  clearCart: () => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (b: boolean) => void;
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  setWishlist: React.Dispatch<React.SetStateAction<Product[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    const savedLang = localStorage.getItem('zari_lang');
    return (savedLang as Language) || 'en';
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('zari_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const savedWishlist = localStorage.getItem('zari_wishlist');
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>(() => {
    const saved = localStorage.getItem('zari_recent');
    return saved ? JSON.parse(saved) : [];
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('zari_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('zari_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('zari_recent', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  useEffect(() => {
    localStorage.setItem('zari_lang', lang);
  }, [lang]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    setWishlist(prev => prev.filter(item => item.id !== product.id));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const isFav = prev.find(item => item.id === product.id);
      if (isFav) return prev.filter(item => item.id !== product.id);
      return [...prev, product];
    });
  };

  const addToRecentlyViewed = (product: Product) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      return [product, ...filtered].slice(0, 8);
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
    localStorage.removeItem('zari_recent');
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('zari_cart');
  };

  return (
    <AppContext.Provider value={{
      lang, setLang, cart, wishlist, recentlyViewed, addToCart, removeFromCart, 
      updateQuantity, toggleWishlist, addToRecentlyViewed, clearRecentlyViewed, 
      clearCart, setWishlist, isSearchOpen, setIsSearchOpen, searchQuery, setSearchQuery
    }}>
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={lang === 'ar' ? 'font-arabic' : ''}>
        {children}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};