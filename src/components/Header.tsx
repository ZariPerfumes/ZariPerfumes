import React, { useState, useEffect, useMemo } from 'react';

import { Link, useLocation } from 'react-router-dom';

import { motion, AnimatePresence } from 'framer-motion';

import { useApp } from '../AppContext';

import { UI_STRINGS } from '../translations';

import { supabase } from '../supabaseClient';

import { Product } from '../types';



import logo from '../images/logo.png';



const Header: React.FC = () => {

  const { lang, setLang, cart, wishlist, isSearchOpen, setIsSearchOpen, searchQuery, setSearchQuery } = useApp();

  const [isScrolled, setIsScrolled] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [dbProducts, setDbProducts] = useState<Product[]>([]);

  const location = useLocation();

 

  const [isDarkMode, setIsDarkMode] = useState(() =>

    document.documentElement.classList.contains('dark')

  );



  const toggleTheme = () => {

    const html = document.documentElement;

    if (html.classList.contains('dark')) {

      html.classList.remove('dark');

      localStorage.setItem('theme', 'light');

      setIsDarkMode(false);

    } else {

      html.classList.add('dark');

      localStorage.setItem('theme', 'dark');

      setIsDarkMode(true);

    }

  };



  useEffect(() => {

    const fetchProducts = async () => {

      const { data } = await supabase.from('products').select('*');

      if (data) setDbProducts(data);

    };

    if (isSearchOpen) fetchProducts();

  }, [isSearchOpen]);



  useEffect(() => {

    const handleScroll = () => setIsScrolled(window.scrollY > 20);

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);

  }, []);



  useEffect(() => {

    document.body.style.overflow = (isMobileMenuOpen || isSearchOpen) ? 'hidden' : 'unset';

  }, [isMobileMenuOpen, isSearchOpen]);



  useEffect(() => {

    setIsMobileMenuOpen(false);

    setIsSearchOpen(false);

  }, [location]);



  const t = (key: string) => UI_STRINGS[key]?.[lang] || key;



  const isActive = (path: string) => {

    if (path === '/' && location.pathname === '/') return true;

    return location.pathname.startsWith(path) && path !== '/';

  };



  const isHome = location.pathname === '/';

  const isSolid = !isHome || isScrolled;

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);



  const navItems = [

    { label: t('home'), path: '/' },

    { label: t('explore'), path: '/explore' },

    { label: t('stores'), path: '/stores' }

  ];



  const filteredProducts = searchQuery.trim() === '' ? [] : dbProducts.filter(p =>

    p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||

    p.nameAr.includes(searchQuery)

  );



  const suggestedProducts = useMemo(() => {

    return [...dbProducts].sort(() => 0.5 - Math.random()).slice(0, 3);

  }, [dbProducts]);



  const displayProducts = searchQuery.trim() === '' ? suggestedProducts : filteredProducts;



  const containerVars = {

    hidden: { opacity: 0 },

    show: {

      opacity: 1,

      transition: { staggerChildren: 0.05, delayChildren: 0.1 }

    }

  };



  const itemVars = {

    hidden: { y: 10, opacity: 0 },

    show: { y: 0, opacity: 1 }

  };



  return (

    <>

      <style>{`

        .search-scroll-area { scrollbar-width: none; -ms-overflow-style: none; }

        .search-scroll-area::-webkit-scrollbar { display: none; }

      `}</style>



      <AnimatePresence>

        {isMobileMenuOpen && (

          <motion.div

            initial={{ opacity: 0 }}

            animate={{ opacity: 1 }}

            exit={{ opacity: 0 }}

            className="fixed inset-0 z-60 bg-black/60 backdrop-blur-md md:hidden"

            onClick={() => setIsMobileMenuOpen(false)}

          >

            <motion.div

              initial={{ y: 20, opacity: 0, scale: 0.95 }}

              animate={{ y: 0, opacity: 1, scale: 1 }}

              exit={{ y: 20, opacity: 0, scale: 0.95 }}

              className="absolute inset-x-4 top-24 p-8 rounded-[3rem] bg-purple-950/95 border border-white/10 shadow-2xl flex flex-col gap-8"

              onClick={(e) => e.stopPropagation()}

            >

              <motion.div variants={containerVars} initial="hidden" animate="show" className="flex flex-col gap-8">

                {navItems.map((item) => (

                  <motion.div key={item.path} variants={itemVars}>

                    <Link

                      to={item.path}

                      className={`text-2xl font-black uppercase tracking-[0.2em] flex justify-between items-center ${isActive(item.path) ? 'text-purple-400' : 'text-white'}`}

                    >

                      <span className={lang === 'ar' ? 'w-full text-right' : ''}>{item.label}</span>

                    </Link>

                  </motion.div>

                ))}

              </motion.div>

              <div className="flex flex-col gap-4">

                <button

                  onClick={toggleTheme}

                  className="w-full py-4 rounded-2xl bg-white/10 text-white font-black uppercase text-xs flex items-center justify-center gap-2"

                >

                  {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}

                </button>

              </div>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>



      <AnimatePresence>

        {isSearchOpen && (

          <motion.div

            initial={{ opacity: 0 }}

            animate={{ opacity: 1 }}

            exit={{ opacity: 0 }}

            className="fixed inset-0 z-100 bg-black/80 backdrop-blur-lg flex items-start justify-center p-4 pt-20"

            onClick={() => setIsSearchOpen(false)}

          >

            <motion.div

              initial={{ scale: 0.95, opacity: 0 }}

              animate={{ scale: 1, opacity: 1 }}

              exit={{ scale: 0.95, opacity: 0 }}

              className="bg-purple-950 border border-white/10 w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col h-auto max-h-[80vh] overflow-hidden"

              onClick={(e) => e.stopPropagation()}

            >

              <div className="p-6 border-b border-white/10 shrink-0">

                <div className="flex items-center gap-4">

                  <svg className="w-6 h-6 text-purple-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>

                  <input

                    autoFocus

                    type="text"

                    value={searchQuery}

                    onChange={(e) => setSearchQuery(e.target.value)}

                    placeholder={lang === 'en' ? 'Search perfumes...' : 'البحث عن العطور...'}

                    className={`flex-1 text-xl font-bold outline-none bg-transparent text-white placeholder:text-white/10 ${lang === 'ar' ? 'text-right' : ''}`}

                  />

                  {searchQuery && (

                    <button

                      onClick={() => setSearchQuery('')}

                      className="p-2 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-full transition-colors"

                    >

                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />

                      </svg>

                    </button>

                  )}

                </div>

              </div>

             

              <div className="overflow-y-auto p-4 search-scroll-area flex flex-col">

                <motion.div key={searchQuery} variants={containerVars} initial="hidden" animate="show" className="flex flex-col gap-2">

                  {displayProducts.length > 0 ? (

                    displayProducts.map((product) => (

                      <motion.div key={product.id} variants={itemVars}>

                        <Link to={`/product/${product.id}`} className={`flex items-center gap-4 p-3 hover:bg-white/5 rounded-2xl group transition-all w-full ${lang === 'ar' ? 'flex-row-reverse text-right' : ''}`}>

                          <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-purple-900/40 border border-white/5">

                            <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />

                          </div>

                          <div className="flex-1 min-w-0">

                            <p className="font-bold text-white truncate">{lang === 'en' ? product.nameEn : product.nameAr}</p>

                            <p className="text-sm text-purple-400 font-black">{product.price} AED</p>

                          </div>

                        </Link>

                      </motion.div>

                    ))

                  ) : (

                    <div className="w-full py-12 text-center text-white/20 font-bold uppercase text-xs">{lang === 'en' ? 'No results found' : 'لا توجد نتائج'}</div>

                  )}

                </motion.div>

              </div>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>



      <header className={`fixed top-0 left-0 right-0 z-70 transition-all duration-500 ${isSolid ? 'bg-white/90 dark:bg-purple-950/90 backdrop-blur-xl shadow-xl py-3' : 'bg-transparent py-5'}`}>

        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center h-12">

          <div className="flex-1 flex items-center">

            <div className="md:hidden mr-4">

              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={isSolid ? 'text-purple-900 dark:text-white' : 'text-white'}>

                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>

              </button>

            </div>

            <Link to="/" className="flex items-center gap-2 group">

              <img src={logo} className="w-8 h-10" />

              <span className={`text-2xl font-black tracking-tighter ${isSolid ? 'text-purple-600 dark:text-purple-400' : 'text-white'}`}>{lang === 'en' ? 'Zari' : 'زري'}</span>

            </Link>

          </div>



          <nav className="hidden md:flex items-center justify-center flex-1">

            <div className="flex gap-10">

              {navItems.map(item => (

                <Link

                  key={item.path}

                  to={item.path}

                  className={`relative font-black text-sm uppercase tracking-widest pb-1 border-b-2 transition-all hover:opacity-100 ${isActive(item.path) ? (isSolid ? 'text-purple-600 dark:text-purple-400 border-purple-600 dark:border-purple-400 opacity-100' : 'text-white border-white opacity-100') : 'border-transparent text-current opacity-60 dark:text-white'}`}

                >

                  {item.label}

                </Link>

              ))}

            </div>

          </nav>



          <div className="flex-1 flex items-center justify-end gap-2">

            <button onClick={toggleTheme} className={`p-2 transition-transform active:scale-90 ${isSolid ? 'text-gray-900 dark:text-white' : 'text-white'}`}>

              {isDarkMode ? '☀️' : '🌙'}

            </button>

            <button onClick={() => setIsSearchOpen(true)} className={`p-2 transition-transform active:scale-90 ${isSolid ? 'text-gray-900 dark:text-white' : 'text-white'}`}>

              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>

            </button>

            <Link to="/wishlist" className={`p-2 relative transition-transform active:scale-90 ${isSolid ? 'text-gray-900 dark:text-white' : 'text-white'}`}>

              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2.2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>

              {wishlist.length > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" />}

            </Link>

            <Link to="/account" className={`p-2 transition-transform active:scale-90 ${isSolid ? 'text-gray-900 dark:text-white' : 'text-white'}`}>

              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2.2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>

            </Link>

            <Link to="/cart" className={`p-2 relative transition-transform active:scale-90 ${isSolid ? 'text-gray-900 dark:text-white' : 'text-white'}`}>

              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2.2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>

              {totalItems > 0 && <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[9px] px-1.5 py-0.5 rounded-full border-2 border-current">{totalItems}</span>}

            </Link>

            <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className={`px-3 py-1.5 rounded-xl border-2 font-black text-[10px] transition-all hover:scale-105 active:scale-95 ${isSolid ? 'bg-purple-600 border-purple-600 text-white' : 'text-white border-white'}`}>

              {lang === 'en' ? 'العربية' : 'EN'}

            </button>

          </div>

        </div>

      </header>

    </>

  );

};



export default Header;