import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../AppContext';
import { supabase } from '../supabaseClient';
import ProductCard from '../components/ProductCard';
import { Product, Store } from '../types';

const StoreDetail: React.FC = () => {
  const { id } = useParams();
  const { lang } = useApp();

  const [store, setStore] = useState<Store | null>(null);
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const fetchStoreData = async () => {
    setLoading(true);
    const { data: storeData } = await supabase.from('stores').select('*').eq('id', id).single();
    const { data: productsData, error } = await supabase.from('products').select('*').eq('storeId', id);

    if (storeData) setStore(storeData);
    if (productsData) setStoreProducts(productsData);
    if (error) console.error("Supabase Error:", error.message);
    setLoading(false);
  };

  useEffect(() => {
    fetchStoreData();
    const channel = supabase
      .channel('admin-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchStoreData();
      })
      .subscribe();

    window.scrollTo(0, 0);
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  const filteredProducts = useMemo(() => {
    let result = [...storeProducts];
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category === categoryFilter);
    }
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else {
      result.sort((a, b) => (lang === 'en' ? a.nameEn : a.nameAr).localeCompare(lang === 'en' ? b.nameEn : b.nameAr));
    }
    return result;
  }, [storeProducts, categoryFilter, sortBy, lang]);

  if (loading) return <div className="h-screen flex items-center justify-center text-purple-600 font-black dark:bg-purple-950">Loading...</div>;
  if (!store) return <div className="pt-40 text-center font-black dark:text-white">Store not found</div>;

  return (
    <div className="pt-24 pb-20 bg-white dark:bg-purple-950 transition-colors duration-300 min-h-screen">
      <div className="relative h-87.5 mb-16">
        {store.image && (
          <img src={store.image} className="w-full h-full object-cover" alt={store.nameEn} />
        )}
        <div className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 text-center">
          <Link to="/stores" className="mb-6 opacity-70 hover:opacity-100 flex items-center gap-2 font-bold uppercase text-xs tracking-widest">
            {lang === 'en' ? '← Back to Stores' : '← العودة للمحلات'}
          </Link>
          <h1 className="text-6xl font-black mb-4 uppercase tracking-tighter">
            {lang === 'en' ? store.nameEn : store.nameAr}
          </h1>
          <p className="text-sm font-black bg-purple-600 px-6 py-2 rounded-full shadow-lg">
            {storeProducts.length} {lang === 'en' ? 'Products Total' : 'إجمالي المنتجات'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="bg-white dark:bg-purple-900/40 p-6 rounded-[2.5rem] shadow-xl mb-12 flex flex-col lg:flex-row items-center justify-between gap-6 border border-purple-50 dark:border-white/5">
          <div className="flex items-center gap-4">
            <span className="font-black text-xl uppercase tracking-tight dark:text-white">
              {lang === 'en' ? 'Filter' : 'تصفية'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full lg:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-gray-50 dark:bg-white/5 dark:text-white p-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-purple-600 transition-all"
            >
              <option value="all" className="dark:bg-purple-900">{lang === 'en' ? 'All Categories' : 'جميع الفئات'}</option>
              {Array.from(new Set(storeProducts.map(p => p.category))).map(cat => (
                cat && <option key={cat} value={cat} className="dark:bg-purple-900">{cat}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-50 dark:bg-white/5 dark:text-white p-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-purple-600 transition-all"
            >
              <option value="name" className="dark:bg-purple-900">{lang === 'en' ? 'Name' : 'الاسم'}</option>
              <option value="price-asc" className="dark:bg-purple-900">{lang === 'en' ? 'Price: Low to High' : 'السعر: من الأقل'}</option>
              <option value="price-desc" className="dark:bg-purple-900">{lang === 'en' ? 'Price: High to Low' : 'السعر: من الأعلى'}</option>
            </select>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <h3 className="text-2xl font-black text-gray-300 dark:text-gray-700 uppercase tracking-widest">
              {lang === 'en' ? 'No products matching filters' : 'لا توجد منتجات تطابق التصفية'}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreDetail;