import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { useApp } from '../AppContext';
import { UI_STRINGS } from '../translations';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const { lang, addToCart, wishlist, toggleWishlist, cart, updateQuantity, removeFromCart } = useApp();
  
  const t = (key: string) => UI_STRINGS[key]?.[lang] || key;

  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const [showTick, setShowTick] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      const { data: currentProduct } = await supabase.from('products').select('*').eq('id', id).single();
      const { data: others } = await supabase.from('products').select('*');
      if (currentProduct) setProduct(currentProduct);
      if (others) setAllProducts(others);
      setLoading(false);
    };
    fetchProductData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const handleScroll = () => setShowSticky(window.scrollY > 700);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [id]);

  const cartItem = cart.find(item => item.id === product?.id);
  const isWishlisted = wishlist.some(item => item.id === product?.id);
  const isLowStock = product && product.stock > 0 && product.stock <= 3;

  const recommended = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter(p => p.category === product.category && p.id !== product.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
  }, [product, allProducts]);

  const handleAddAction = () => {
    if (!product || isProcessing || product.stock <= 0) return;
    setIsProcessing(true);
    if (!cartItem) {
      addToCart(product, 1);
      setIsSuccess(true);
      setTimeout(() => { setIsSuccess(false); setIsProcessing(false); }, 400);
    } else {
      if (cartItem.quantity < product.stock) {
        updateQuantity(product.id, 1);
        setShowTick(true);
        setTimeout(() => { setShowTick(false); setIsProcessing(false); }, 500);
      } else { setIsProcessing(false); }
    }
  };

  const handleDecrement = () => {
    if (!product) return;
    if (cartItem?.quantity === 1) { removeFromCart(product.id); } 
    else { updateQuantity(product.id, -1); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-purple-600 font-black">Loading...</div>;

  if (!product) return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-purple-950 flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-9xl font-black text-purple-100 dark:text-purple-900/30 relative">
          404
          <span className="absolute inset-0 flex items-center justify-center text-4xl text-gray-900 dark:text-white font-bold whitespace-nowrap">
            {lang === 'en' ? 'Lost in Style' : 'ضاع العطر'}
          </span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-8 mb-12 font-bold tracking-widest uppercase text-xs">
          {lang === 'en' ? 'The product you are looking for does not exist' : 'المنتج الذي تبحث عنه غير موجود'}
        </p>
        <Link to="/" className="bg-[#9333EA] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-[#7e22ce] transition-all inline-block">
          {lang === 'en' ? 'Return Home' : 'العودة للرئيسية'}
        </Link>
      </motion.div>
    </div>
  );

  const name = lang === 'en' ? product.nameEn : product.nameAr;
  const categoryLabel = lang === 'en' ? product.category : (product.category.toLowerCase() === 'perfume' ? 'عطر' : 'عطر');

  return (
    <div className="bg-white dark:bg-purple-950 min-h-screen transition-colors duration-300">
      <div className={`fixed bottom-6 left-6 z-50 flex items-center bg-white dark:bg-purple-900 rounded-2xl shadow-2xl border border-purple-100 dark:border-white/10 transition-all duration-500 transform ${showSticky ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
        {(!cartItem || isSuccess) ? (
          <button onClick={handleAddAction} disabled={isProcessing} className={`flex items-center gap-3 p-2 pr-6 active:scale-95 transition-all duration-300 rounded-2xl ${isSuccess ? 'bg-green-600 text-white' : ''}`}>
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 dark:bg-purple-950">
              <img src={product.image} alt="" className="w-full h-full object-cover" />
              <div className={`absolute inset-0 bg-green-500 flex items-center justify-center text-white transition-all duration-300 ${isSuccess ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>✓</div>
            </div>
            <div className="flex flex-col items-start">
              <span className={`text-[10px] font-black uppercase leading-none ${isSuccess ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`}>{isSuccess ? (lang === 'en' ? 'Added' : 'تم') : (lang === 'en' ? 'Add' : 'إضافة')}</span>
              <span className={`text-sm font-black leading-none mt-1 ${isSuccess ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{product.price} AED</span>
            </div>
          </button>
        ) : (
          <div className="flex items-center p-1 gap-4">
            <button onClick={handleDecrement} className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-white/5 rounded-xl text-gray-400 hover:text-red-500 transition-colors">
              {cartItem.quantity === 1 ? (
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              ) : <span className="text-xl font-bold text-purple-600 dark:text-purple-400">−</span>}
            </button>
            <div className="min-w-[1ch] flex justify-center items-center h-6">
              <span className={`font-black text-xl transition-all duration-300 transform ${showTick ? 'text-green-500 scale-125' : 'text-gray-900 dark:text-white scale-100'}`}>{showTick ? '✓' : cartItem.quantity}</span>
            </div>
            <button disabled={isProcessing} onClick={handleAddAction} className={`w-10 h-10 flex items-center justify-center rounded-xl text-white transition-all ${isProcessing ? 'bg-purple-300' : 'bg-purple-600 hover:bg-purple-700'}`}>
              <span className="text-xl font-bold">+</span>
            </button>
          </div>
        )}
      </div>

      <section className="container mx-auto px-4 pt-32 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24 items-start">
          <div className="relative group">
            <div className="aspect-square rounded-[3rem] overflow-hidden bg-gray-100 dark:bg-purple-900 shadow-2xl border border-purple-50 dark:border-white/5">
              <img src={product.image} alt={name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            </div>
            <button onClick={() => toggleWishlist(product)} className={`absolute top-6 right-6 p-4 rounded-2xl shadow-xl backdrop-blur-md transition-all active:scale-90 ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white/80 dark:bg-purple-900/80 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-purple-800'}`}>
              <svg className="w-6 h-6" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            </button>
          </div>

          <div>
            <nav className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-6">
              <Link to="/" className="hover:text-purple-600">Zari</Link>
              <span>/</span>
              <Link to={`/explore?category=${encodeURIComponent(product.category)}`} className="text-purple-600 dark:text-purple-400 hover:text-gray-400">{lang === 'en' ? product.category : t(product.category.toLowerCase())}</Link>
            </nav>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white leading-tight mb-4">{name}</h1>
            <div className="flex items-center gap-4 mb-2">
              <span className="text-3xl font-black text-purple-600 dark:text-purple-400">{product.price} AED</span>
              <div className="h-6 w-px bg-gray-200 dark:bg-white/10"></div>
              <span className="bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-green-100 dark:border-green-500/20">{lang === 'en' ? 'In Stock' : 'متوفر'}</span>
            </div>

            {isLowStock && (
              <p className="text-xs font-black uppercase text-orange-500 animate-pulse mb-8">
                {lang === 'en' ? `${product.stock} pieces left` : `بقي ${product.stock} قطع فقط`}
              </p>
            )}

            <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed mb-10 max-w-xl">
              {lang === 'en' ? `Experience the luxury of ${name}. A masterfully crafted ${product.category.toLowerCase()} designed for elegance.` : `استمتع بفخامة ${name}. عطر ${categoryLabel} مصنوع ببراعة للأناقة.`}
            </p>

            <div className="h-20 flex items-center mb-12">
             {product.stock <= 0 ? (
              <div className="w-full py-5 rounded-2xl font-black text-xl bg-gray-200 dark:bg-white/5 text-gray-400 dark:text-gray-600 flex items-center justify-center cursor-not-allowed">
                {lang === 'en' ? 'Out of Stock' : 'نفدت الكمية'}
              </div>
            ) : (!cartItem || isSuccess) ? (
              <button disabled={isProcessing} onClick={handleAddAction} className={`w-full py-5 rounded-2xl font-black text-xl transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-3 shadow-xl ${isSuccess ? 'bg-green-600 scale-105' : 'bg-purple-600 hover:bg-purple-700'} text-white`}>
                {isSuccess ? '✓' : (lang === 'en' ? 'Add to Cart' : 'أضف إلى السلة')}
              </button>
            ) : (
              <div className="w-full flex items-center justify-between bg-gray-50 dark:bg-white/5 rounded-2xl p-2 border border-purple-100 dark:border-white/10">
                <button onClick={handleDecrement} className="w-16 h-16 flex items-center justify-center bg-white dark:bg-purple-900 rounded-xl shadow-sm transition-all text-gray-400 hover:text-red-500">
                  {cartItem.quantity === 1 ? <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> : <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">−</span>}
                </button>
                <div className="flex flex-col items-center">
                  <span className="text-xs font-black text-purple-400 uppercase">{lang === 'en' ? 'In Cart' : 'في السلة'}</span>
                  <span className={`text-2xl font-black transition-all duration-300 ${showTick ? 'text-green-500 scale-125' : 'text-gray-900 dark:text-white scale-100'}`}>{showTick ? '✓' : cartItem.quantity}</span>
                </div>
                <button disabled={isProcessing || cartItem.quantity >= product.stock} onClick={handleAddAction} className={`w-16 h-16 flex items-center justify-center bg-white dark:bg-purple-900 rounded-xl shadow-sm hover:text-purple-600 dark:hover:text-purple-400 transition-all font-bold text-2xl ${cartItem.quantity >= product.stock ? 'opacity-30 cursor-not-allowed' : ''}`}>
                  +
                </button>
              </div>
            )}
            </div>
          </div>
        </div>
      </section>

      {recommended.length > 0 && (
        <section className="bg-gray-50/50 dark:bg-white/5 py-24 border-t border-gray-100 dark:border-white/5">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-12">{lang === 'en' ? 'Similar Scents' : 'عطور مشابهة'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {recommended.map(item => <ProductCard key={item.id} product={item} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;