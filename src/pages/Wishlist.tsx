import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../AppContext';
import { PRODUCTS } from '../data';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Wishlist: React.FC = () => {
  const { wishlist, setWishlist, addToCart, lang } = useApp();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSharedBanner, setShowSharedBanner] = useState(false);
  const [sharedName, setSharedName] = useState('');
  const [listName, setListName] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    document.title = lang === 'en' ? 'Zari Perfumes | Wishlist' : 'عطور زاري | المفضلة';
  }, [lang]);

  useEffect(() => {
    const itemIds = searchParams.get('items');
    const nameParam = searchParams.get('name');
    if (itemIds) {
      const idsArray = itemIds.split(',');
      const sharedProducts = PRODUCTS.filter(p => idsArray.includes(p.id));
      
      if (sharedProducts.length > 0) {
        setWishlist(prev => {
          const newItems = sharedProducts.filter(sp => !prev.some(p => p.id === sp.id));
          return [...prev, ...newItems];
        });
        if (nameParam) setSharedName(decodeURIComponent(nameParam));
        setShowSharedBanner(true);
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [searchParams, setWishlist]);

  const handleAddAllToCart = () => {
    if (wishlist.length === 0) return;
    wishlist.forEach((p) => addToCart(p));
    toast.success(lang === 'en' ? 'MOVED TO BAG' : 'تم النقل للسلة', {
      style: { background: '#1a1a1a', color: '#fff', border: '1px solid #9333EA' }
    });
  };

  const handleShare = () => {
    const ids = wishlist.map(p => p.id).join(',');
    const namePart = listName ? `&name=${encodeURIComponent(listName)}` : '';
    const shareUrl = `${window.location.origin}/#/wishlist?items=${ids}${namePart}`;
    
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);

    toast.success(lang === 'en' ? 'Link Copied' : 'تم نسخ الرابط', {
      style: { background: '#9333EA', color: '#fff', fontSize: '11px', fontWeight: 'bold' }
    });
  };

  return (
    <div className="bg-[#FAFAFA] dark:bg-purple-950 min-h-screen py-12 px-4 sm:px-6 lg:px-8 pt-28 transition-colors duration-300">
      <AnimatePresence>
        {showSharedBanner && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-[#9333EA] text-white text-center py-4 mb-8 rounded-2xl flex items-center justify-center gap-4 shadow-xl px-6">
            <span className="text-xs font-black uppercase tracking-widest">
              {lang === 'en' 
                ? `✨ ${sharedName ? `${sharedName}'s` : 'A friend\'s'} collection shared with you!` 
                : `✨ ${sharedName ? `مجموعة ${sharedName}` : 'قام صديق'} بمشاركة اختياراته معك!`}
            </span>
            <button onClick={() => setShowSharedBanner(false)} className="bg-white/20 p-1 rounded-full"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3"/></svg></button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto">
        <header className="text-center mb-16">
          <input 
            type="text"
            placeholder={lang === 'en' ? "Name your wishlist..." : "اسمّ القائمة..."}
            className="bg-transparent text-center text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight outline-none placeholder:text-gray-200 dark:placeholder:text-white/10 w-full"
            value={listName}
            onChange={(e) => setListName(e.target.value.slice(0, 15))}
          />
          <div className="w-16 h-1 bg-[#9333EA] mx-auto mb-8 rounded-full"></div>
          
          <AnimatePresence>
            {wishlist.length > 0 && (
              <motion.div exit={{ opacity: 0 }} className="flex flex-col items-center gap-6">
                <button onClick={handleAddAllToCart} className="bg-[#9333EA] text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-purple-100 dark:shadow-none">
                  {lang === 'en' ? `Move All (${wishlist.length}) to Cart` : `نقل الكل (${wishlist.length}) للسلة`}
                </button>
                
                <div className="flex gap-8 items-center">
                  <button onClick={handleShare} className="text-[#9333EA] dark:text-purple-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                    <AnimatePresence mode="wait">
                      {!isCopied ? (
                        <motion.svg key="s" initial={{scale:0}} animate={{scale:1}} className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></motion.svg>
                      ) : (
                        <motion.svg key="c" initial={{scale:0}} animate={{scale:1}} className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="3" d="M5 13l4 4L19 7"/></motion.svg>
                      )}
                    </AnimatePresence>
                    <span className={isCopied ? "text-green-500" : ""}>{isCopied ? (lang === 'en' ? 'Copied' : 'تم النسخ') : (lang === 'en' ? 'Share' : 'مشاركة')}</span>
                  </button>
                  <button onClick={() => setShowConfirm(true)} className="text-gray-400 dark:text-gray-500 font-bold text-[10px] uppercase tracking-widest">
                    {lang === 'en' ? 'Clear' : 'مسح'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <AnimatePresence mode="popLayout">
          {wishlist.length === 0 ? (
            <motion.div key="empty" className="text-center py-20">
              <p className="text-gray-400 dark:text-gray-600 font-medium mb-8 text-lg">{lang === 'en' ? 'Your collection is empty.' : 'مجموعتك فارغة.'}</p>
              <a href="#/explore" className="inline-block border-2 border-[#9333EA] text-[#9333EA] dark:text-purple-400 dark:border-purple-400 px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs">{lang === 'en' ? 'Explore' : 'استكشف'}</a>
            </motion.div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {wishlist.map((product) => (
                <motion.div key={product.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showConfirm && (
            <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowConfirm(false)} className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-md" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white dark:bg-purple-900 p-8 rounded-4xl max-w-sm w-full text-center shadow-2xl">
                <h3 className="text-xl font-bold mb-2 dark:text-white">{lang === 'en' ? 'Clear Wishlist?' : 'مسح قائمة الرغبات؟'}</h3>
                <div className="flex flex-col gap-3 mt-8">
                  <button onClick={() => { setWishlist([]); setShowConfirm(false); }} className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest">{lang === 'en' ? 'Clear Everything' : 'مسح كل شيء'}</button>
                  <button onClick={() => setShowConfirm(false)} className="w-full bg-gray-100 dark:bg-white/5 dark:text-white py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest">{lang === 'en' ? 'Cancel' : 'إلغاء'}</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Wishlist;