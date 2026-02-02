import React, { useEffect, useState } from "react";
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AppProvider } from "./AppContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Stores from "./pages/Stores";
import StoreDetail from "./pages/StoreDetail";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import NotFound from "./pages/NotFound";
import WhatsAppButton from "./components/WhatsAppButton";
import Admin from "./pages/Admin";
import Unsubscribe from "./pages/Unsubscribe";
import Account from "./pages/Account";
import ResetPassword from "./pages/ResetPassword";
import { Toaster } from "react-hot-toast";
import "leaflet/dist/leaflet.css";
import ProductDetail from "./pages/ProductDetail";
import { useApp } from "./AppContext";
import { supabase } from "./supabaseClient";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
};

const BackToTop = () => {
  const [visible, setVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { lang } = useApp();

  useEffect(() => {
    const toggleVisible = () => {
      window.pageYOffset > 300 ? setVisible(true) : setVisible(false);
    };
    window.addEventListener("scroll", toggleVisible);
    return () => window.removeEventListener("scroll", toggleVisible);
  }, []);

  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)} className={`group fixed bottom-24 right-6 z-60 flex items-center gap-3 transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"} ${lang === "ar" ? "flex-row-reverse" : "flex-row"}`}>
      <span className={`transition-opacity duration-300 bg-black/70 text-white px-3 py-1 rounded-lg text-sm backdrop-blur-sm whitespace-nowrap ${showTooltip ? "opacity-100" : "opacity-0"}`}>{lang === "en" ? "Top" : "للأعلى"}</span>
      <div className='p-4 bg-purple-600 text-white rounded-2xl shadow-2xl transition-all duration-300 hover:bg-purple-700 active:scale-90 flex items-center justify-center'>
        <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='3' d='M5 15l7-7 7 7' />
        </svg>
      </div>
    </button>
  );
};

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    document.body.className = "bg-white dark:bg-purple-950 transition-colors duration-300";
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <AppProvider>
      <Toaster position='bottom-center' reverseOrder={false} />
      <Router>
        <ScrollToTop />
        <div className='flex flex-col min-h-screen'>
          <Header />
          <main className='grow'>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/explore' element={<Explore />} />
              <Route path='/product/:id' element={<ProductDetail />} />
              <Route path='/stores' element={<Stores />} />
              <Route path='/stores/:id' element={<StoreDetail />} />
              <Route path='/cart' element={<Cart />} />
              <Route path='/wishlist' element={<Wishlist />} />
              <Route path='/unsubscribe' element={<Unsubscribe />} />
              <Route path='/account' element={<Account />} />"
              <Route path='/admin' element={<Admin />} />
              <Route path='/resetpassword' element={<ResetPassword />} />
              <Route path='*' element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <WhatsAppButton />
          <BackToTop />
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;
