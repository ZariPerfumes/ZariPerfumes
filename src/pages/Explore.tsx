import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../AppContext';
import { UI_STRINGS } from '../translations';
import { supabase } from '../supabaseClient';
import ProductCard from '../components/ProductCard';
import { useLocation } from 'react-router-dom';
import { Product, Store } from '../types';

const Explore: React.FC = () => {
  const { lang } = useApp();
  const { search } = useLocation();
  const t = (key: string) => UI_STRINGS[key]?.[lang] || key;

  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [storeFilter, setStoreFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: pData } = await supabase.from('products').select('*');
      const { data: sData } = await supabase.from('stores').select('*');
      if (pData) setProducts(pData);
      if (sData) setStores(sData);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const category = params.get('category');
    const store = params.get('store');
    if (category) setCategoryFilter(category);
    if (store) setStoreFilter(store);
  }, [search]);

  useEffect(() => {
    document.title = lang === 'en' ? 'Zari Perfumes | Explore' : 'عطور زاري | استكشف';
  }, [lang]);

  const filteredProducts = useMemo(() => {
    let result = [...products].filter(p => {
      const storeMatch = storeFilter === 'all' || p.storeId === storeFilter;
      const catMatch = categoryFilter === 'all' || p.category === categoryFilter;
      return storeMatch && catMatch;
    });

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else {
      result.sort((a, b) => (lang === 'en' ? a.nameEn : a.nameAr).localeCompare(lang === 'en' ? b.nameEn : b.nameAr));
    }
    return result;
  }, [products, storeFilter, categoryFilter, sortBy, lang]);

  if (loading) return <div className="h-screen flex items-center justify-center text-purple-600 font-bold dark:bg-purple-950">Loading...</div>;

  return (
    <div className="pt-16 pb-20 bg-white dark:bg-purple-950 transition-colors duration-300 min-h-screen">
      {/* Banner */}
      <div className="relative h-75 mb-12 flex items-center justify-center">
        <img src="images/explore.jpg" className="absolute inset-0 w-full h-full object-cover" alt="Explore" />
        <div className="absolute inset-0 bg-black/50 dark:bg-black/70"></div>
        <div className="relative text-center text-white px-4">
          <h1 className="text-6xl font-black mb-2">{t('explore')}</h1>
          <p className="text-xl opacity-80 capitalize">
            {storeFilter === 'all' && categoryFilter === 'all' ? (
              t('allProducts')
            ) : (
              <>
                {storeFilter !== 'all' ? (stores.find(s => s.id === storeFilter)?.[lang === 'en' ? 'nameEn' : 'nameAr']) : ''}
                {storeFilter !== 'all' && categoryFilter !== 'all' ? ' | ' : ''}
                {categoryFilter !== 'all' ? (lang === 'en' ? categoryFilter : (categoryFilter.toLowerCase() === 'perfume' ? 'عطر' : 'عود')) : ''}
              </>
            )}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Filter Bar */}
        <div className="bg-white dark:bg-purple-900/40 p-6 rounded-[28px] shadow-lg mb-12 flex flex-col lg:flex-row items-center justify-between gap-6 border border-purple-50 dark:border-white/5">
          <div className="flex items-center gap-4 w-full lg:w-auto">
             <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
             </div>
             <span className="font-bold text-lg dark:text-white">{t('filter')}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full grow">
            <select 
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
              className="bg-purple-50 dark:bg-white/5 dark:text-white p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-purple-600 font-medium"
            >
              <option value="all" className="dark:bg-purple-900">{lang === 'en' ? 'All Stores' : 'جميع المتاجر'}</option>
              {stores.map(s => (
                <option key={s.id} value={s.id} className="dark:bg-purple-900">{lang === 'en' ? s.nameEn : s.nameAr}</option>
              ))}
            </select>

            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-purple-50 dark:bg-white/5 dark:text-white p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-purple-600 font-medium"
            >
              <option value="all" className="dark:bg-purple-900">{t('allCategories')}</option>
              {['Oud', 'Perfume', 'Musk', 'Oil', 'Lotion', 'Dukhoon'].map(cat => (
                <option key={cat} value={cat} className="dark:bg-purple-900">{cat}</option>
              ))}
            </select>

            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-purple-50 dark:bg-white/5 dark:text-white p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-purple-600 font-medium"
            >
              <option value="name" className="dark:bg-purple-900">{t('name')}</option>
              <option value="price-asc" className="dark:bg-purple-900">{t('priceLowHigh')}</option>
              <option value="price-desc" className="dark:bg-purple-900">{t('priceHighLow')}</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            {(storeFilter !== 'all' || categoryFilter !== 'all') && (
              <button
                onClick={() => {
                  setStoreFilter('all');
                  setCategoryFilter('all');
                }}
                className="text-sm font-black text-red-500 hover:text-red-700 transition-colors uppercase tracking-tighter"
              >
                {lang === 'en' ? 'Reset' : 'إعادة تعيين'}
              </button>
            )}
            <div className="text-purple-600 dark:text-purple-400 font-bold whitespace-nowrap">
              {filteredProducts.length} {t('products')}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400 dark:text-gray-600">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
              {lang === 'en' ? 'No products found' : 'لم يتم العثور على منتجات'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {lang === 'en' ? 'Try adjusting your filters or search criteria.' : 'حاول تعديل الفلاتر أو معايير البحث.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;