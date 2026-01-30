import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../AppContext';
import { UI_STRINGS } from '../translations';
import { supabase } from '../supabaseClient';
import { Store } from '../types';

// Define a type for stores that includes the dynamic count
interface StoreWithCount extends Store {
  actualProductCount: number;
}

const Stores: React.FC = () => {
  const { lang } = useApp();
  const t = (key: string) => UI_STRINGS[key]?.[lang] || key;
  const [stores, setStores] = useState<StoreWithCount[]>([]);
  const [loading, setLoading] = useState(true);

const fetchStoresData = async () => {
    setLoading(true);
    
    const { data: storesData } = await supabase.from('stores').select('*');
    
    if (storesData) {
      const storesWithCounts = await Promise.all(
        storesData.map(async (store) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('storeId', store.id);

          return {
            ...store,
            actualProductCount: count || 0
          };
        })
      );

      // Add the sorting logic right here before setting the state
      storesWithCounts.sort((a, b) => b.actualProductCount - a.actualProductCount);

      setStores(storesWithCounts);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStoresData();

    // REALTIME SYNC: Refresh counts if any product is added/deleted
    const channel = supabase
      .channel('stores-list-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchStoresData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    document.title = lang === 'en' ? 'Zari Perfumes | Stores' : 'عطور زاري | المحلات';
  }, [lang]);

  if (loading) return <div className="h-screen flex items-center justify-center text-purple-600 font-black">Loading...</div>;

  return (
    <div className="pt-16 pb-20">
      <div className="h-75 mb-12 bg-linear-to-r from-purple-900 to-purple-500 flex flex-col items-center justify-center text-white text-center px-4">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
           <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/></svg>
        </div>
        <h1 className="text-6xl font-black mb-2">{t('ourStores')}</h1>
        <p className="text-xl opacity-80">{lang === 'en' ? 'Discover the finest perfume stores' : 'اكتشف أفضل محلات العطور'}</p>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {stores.map(store => (
            <Link key={store.id} to={`/stores/${store.id}`} className="group relative block rounded-[40px] overflow-hidden bg-white shadow-lg hover:-translate-y-3 hover:shadow-2xl transition-all duration-500 border border-purple-50">
              <div className="aspect-4/3 relative">
                {store.image && <img src={store.image} alt={store.nameEn} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <div className="flex items-center gap-2 mb-3 text-white/80">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/></svg>
                    <span className="font-bold">{store.actualProductCount} {t('products')}</span>
                  </div>
                  <h3 className="text-3xl font-black">{lang === 'en' ? store.nameEn : store.nameAr}</h3>
                  <p className="text-white/60 mt-4 flex items-center gap-2 text-lg font-bold">
                    {t('browseStore')}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stores;