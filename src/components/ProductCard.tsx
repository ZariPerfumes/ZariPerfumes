import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useApp } from '../AppContext';

interface Props {
  product: Product;
  isRecentlyViewed?: boolean;
}

const ProductCard: React.FC<Props> = ({ product, isRecentlyViewed }) => {
  const { 
    lang, 
    cart, 
    wishlist, 
    addToCart, 
    updateQuantity, 
    removeFromCart, 
    toggleWishlist,
    addToRecentlyViewed 
  } = useApp();
  
  const [showToast, setShowToast] = useState(false);
  const [showTick, setShowTick] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const cartItem = cart.find(item => item.id === product.id);
  const isWishlisted = wishlist.some(item => item.id === product.id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;

  const name = lang === 'en' ? product.nameEn : product.nameAr;

  const handleAddAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isProcessing) return;

    setIsProcessing(true);
    if (!cartItem) {
      addToCart(product);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsProcessing(false);
      }, 400);
    } else {
      if (cartItem.quantity < product.stock) {
        updateQuantity(product.id, 1);
        setShowTick(true);
        setTimeout(() => {
          setShowTick(false);
          setIsProcessing(false);
        }, 500);
      } else {
        setShowToast(true);
        setIsProcessing(false);
      }
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
      if (cartItem.quantity === 1) {
        removeFromCart(product.id);
      } else {
        updateQuantity(product.id, -1);
      }
    }
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <div className={`bg-white dark:bg-purple-900/40 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-purple-50 dark:border-white/5 flex flex-col h-full relative ${isOutOfStock ? 'grayscale-[0.5]' : ''}`}>
      
      <Link 
        to={`/product/${product.id}`} 
        className="grow flex flex-col"
        onClick={() => addToRecentlyViewed(product)}
      >
        <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-purple-950">
          <img 
            src={product.image} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
          
          <div className={`absolute inset-0 z-20 flex items-center justify-center p-6 transition-all duration-300 pointer-events-none ${showToast ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
            <div className="bg-red-600 text-white p-6 rounded-3xl text-center shadow-2xl border-4 border-white/20 font-black uppercase">
              {lang === 'en' ? 'Max Stock Reached' : 'وصلت للحد الأقصى'}
            </div>
          </div>
        </div>
        
        <div className="p-5 flex flex-col grow">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{name}</h3>
          <p className="text-purple-600 dark:text-purple-400 font-black text-xl mb-1">{product.price} <span className="text-sm font-medium">AED</span></p>
          
          {isLowStock && !isOutOfStock && (
            <p className="text-[10px] font-black uppercase text-orange-500 animate-pulse">
              {lang === 'en' ? `${product.stock} pieces left` : `بقي ${product.stock} قطع فقط`}
            </p>
          )}
        </div>
      </Link>
      
      <div className="px-5 pb-5 mt-auto">
        {isOutOfStock ? (
          <div className="w-full bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 py-3.5 rounded-2xl font-bold text-center border border-gray-200 dark:border-white/5">
            {lang === 'en' ? 'Out of Stock' : 'نفذت الكمية'}
          </div>
        ) : (!cartItem || isSuccess) ? (
          <div className="flex gap-2">
            <button 
              disabled={isProcessing}
              onClick={handleAddAction}
              className={`w-[75%] py-3.5 rounded-2xl font-bold transition-all duration-300 shadow-md active:scale-95 flex items-center justify-center gap-2 ${
                isSuccess ? 'bg-green-600 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {isSuccess ? '✓' : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/>
                  </svg>
                  {lang === 'en' ? 'Add' : 'أضف'}
                </>
              )}
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
              className={`w-[25%] py-3.5 rounded-2xl transition-all border flex items-center justify-center ${isWishlisted ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-500' : 'bg-purple-50 dark:bg-white/5 border-purple-100 dark:border-white/10 text-purple-600 dark:text-purple-400'}`}
            >
              <svg className="w-5 h-5" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-purple-50 dark:bg-white/5 rounded-2xl p-1.5 border border-purple-100 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={handleDecrement}
              className="p-2.5 rounded-xl transition-colors flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              {cartItem.quantity === 1 ? (
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              ) : <span className="text-purple-600 dark:text-purple-400 font-black text-lg">−</span>}
            </button>
            <div className="min-w-[1ch] flex justify-center items-center h-6">
              <span className={`font-black text-lg transition-all duration-300 transform ${showTick ? 'text-green-500 scale-125' : 'text-purple-900 dark:text-white scale-100'}`}>
                {showTick ? '✓' : cartItem.quantity}
              </span>
            </div>
            <button 
              disabled={isProcessing}
              onClick={handleAddAction}
              className={`p-2.5 rounded-xl transition-colors font-black text-lg ${cartItem.quantity >= product.stock || isProcessing ? 'text-gray-300 dark:text-gray-600' : 'text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-white/5'}`}
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;