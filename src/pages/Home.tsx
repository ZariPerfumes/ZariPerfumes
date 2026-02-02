import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useApp } from "../AppContext";
import { UI_STRINGS } from "../translations";
import { supabase } from "../supabaseClient";
import ProductCard from "../components/ProductCard";
import { Product, Store, Workshop1, Workshop2 } from "../types";
import confetti from "canvas-confetti";
import { Truck, Users, ShieldCheck, Star } from "lucide-react";

const Home: React.FC = () => {
  const { lang } = useApp();
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [workshop1, setWorkshop1] = useState<Workshop1 | null>(null);
  const [workshop2, setWorkshop2] = useState<Workshop2 | null>(null);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  const t = (key: string) => UI_STRINGS[key]?.[lang] || key;

  useEffect(() => {
    document.title = lang === "en" ? "Zari Perfumes | Home" : "عطور زاري | الصفحة الرئيسية";
  }, [lang]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: sData } = await supabase.from("stores").select("*");
        const { data: pData } = await supabase.from("products").select("*");
        const { data: w1Data } = await supabase.from("workshops").select("*").eq("id", "w1").maybeSingle();
        const { data: w2Data } = await supabase.from("workshops").select("*").eq("id", "w2").maybeSingle();

        if (sData) setStores(sData);
        if (pData) setProducts(pData);
        if (w1Data) setWorkshop1(w1Data);
        if (w2Data) setWorkshop2(w2Data);
      } catch (error) {
        console.error("Data fetch error:", error);
      }
    };
    loadData();
  }, []);

  const featuredStores = stores.slice(0, 6);
  const featuredProducts = [...products].sort(() => 0.5 - Math.random()).slice(0, 4);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  const handleSubscribe = async () => {
    if (!email || !email.includes("@")) {
      alert(lang === "en" ? "Please enter a valid email" : "يرجى إدخال بريد إلكتروني صحيح");
      return;
    }

    setIsSubmitting(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      const { data: existing } = await supabase.from("subscribers").select("email").eq("email", cleanEmail).maybeSingle();

      if (existing) {
        setIsJoined(true);
      } else {
        const { error } = await supabase.from("subscribers").insert([
          {
            email: cleanEmail,
            unsub_token: btoa(cleanEmail),
          },
        ]);

        if (error) throw error;

        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#ffffff", "#000000", "#9333ea"],
        });

        setIsJoined(true);
        setEmail("");
      }
    } catch (err) {
      console.error(err);
      alert(lang === "en" ? "Something went wrong." : "حدث خطأ ما.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-white dark:bg-purple-950 transition-colors duration-300 overflow-x-hidden'>
      {/* 1. HERO SECTION */}
      <section className='relative h-162.5 flex items-center justify-center overflow-hidden'>
        <motion.img initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1.5 }} src='images/hero.jpg' className='absolute inset-0 w-full h-full object-cover' alt='Hero' />
        <div className='absolute inset-0 bg-black/40'></div>
        <div className='relative text-center text-white px-4'>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='text-6xl md:text-7xl font-black mb-6'>
            {t("welcome")}
          </motion.h1>
          <Link to='/explore'>
            <button className='bg-purple-600 text-white px-10 py-4 rounded-full font-black hover:bg-white hover:text-purple-600 transition-all shadow-2xl transform hover:scale-105 active:scale-95'>{t("explore")}</button>
          </Link>
        </div>
      </section>

      {/* 2. TRUST BAR */}
      <div className='py-10 bg-gray-50 dark:bg-purple-900/40 border-y border-gray-100 dark:border-white/5'>
        <div className='container mx-auto px-4'>
          <div className='flex flex-wrap justify-center items-center gap-12 opacity-40 dark:opacity-80 grayscale hover:grayscale-0 transition-all dark:text-white'>
            <div className='flex items-center gap-3'>
              <Truck size={28} strokeWidth={3} />
              <span className='font-black text-2xl tracking-tighter uppercase'>{lang === "en" ? "Fast Delivery." : "توصيل سريع."}</span>
            </div>

            <div className='flex items-center gap-3'>
              <Users size={28} strokeWidth={3} />
              <span className='font-black text-2xl tracking-tighter uppercase'>{lang === "en" ? "Trusted By Many." : "موثوق به من قبل الكثيرين."}</span>
            </div>

            <div className='flex items-center gap-3'>
              <ShieldCheck size={28} strokeWidth={3} />
              <span className='font-black text-2xl tracking-tighter uppercase'>{lang === "en" ? "Secure Payment." : "الدفع الآمن."}</span>
            </div>

            <div className='flex items-center gap-3'>
              <Star size={28} strokeWidth={3} />
              <span className='font-black text-2xl tracking-tighter uppercase'>{lang === "en" ? "Top Rated." : "تقييم عالي."}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ABOUT US SECTION + STATS */}
      <section className='py-24 bg-white dark:bg-purple-950'>
        <div className='container mx-auto px-4'>
          <div className='flex flex-col lg:flex-row items-center gap-16'>
            <motion.div {...fadeInUp} className='flex-1'>
              <h2 className='text-5xl font-black mb-8 leading-tight dark:text-white'>{t("aboutUsTitle")}</h2>
              <p className='text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed'>{t("aboutUsDesc")}</p>
              <div className='grid grid-cols-3 gap-8'>
                <div>
                  <h4 className='text-4xl font-black text-purple-600 dark:text-purple-400'>6+</h4>
                  <p className='text-gray-400 font-bold uppercase text-xs tracking-widest'>{t("stores")}</p>
                </div>
                <div>
                  <h4 className='text-4xl font-black text-purple-600 dark:text-purple-400'>35+</h4>
                  <p className='text-gray-400 font-bold uppercase text-xs tracking-widest'>{t("products")}</p>
                </div>
                <div>
                  <h4 className='text-4xl font-black text-purple-600 dark:text-purple-400'>100%</h4>
                  <p className='text-gray-400 font-bold uppercase text-xs tracking-widest'>{t("authentic")}</p>
                </div>
              </div>
            </motion.div>
            <motion.div {...fadeInUp} className='flex-1'>
              <img src='images/about.jpg' className='w-full h-112.5 object-cover rounded-[3rem] shadow-2xl' alt='About Us' />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. WORKSHOPS */}
      {(workshop1?.available === "yes" || workshop2?.available === "yes") && (
        <section className='py-24 bg-purple-50 dark:bg-purple-900/20'>
          <div className='container mx-auto px-4'>
            <h2 className='text-4xl font-black text-center mb-16 dark:text-white'>{t("workshops")}</h2>
            <div className='space-y-12'>
              {[workshop1, workshop2].map(
                (ws, i) =>
                  ws?.available === "yes" && (
                    <motion.div key={i} {...fadeInUp} className='grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-purple-900/60 rounded-[40px] overflow-hidden shadow-xl border border-transparent dark:border-white/10'>
                      <div className='h-80 lg:h-full'>
                        <img src={ws.image} className='w-full h-full object-cover' alt='Workshop' />
                      </div>
                      <div className='p-10 lg:p-16 flex flex-col justify-center'>
                        <span className='text-purple-600 dark:text-purple-400 font-black uppercase tracking-widest text-sm mb-4'></span>
                        <h3 className='text-4xl font-black mb-2 dark:text-white'>{lang === "en" ? ws.nameEn : ws.nameAr}</h3>
                        <p className='text-xl text-purple-700 dark:text-purple-300 font-black mb-6' dir='ltr'>
                          {ws.date} - {ws.time}
                        </p>
                        <p className='text-gray-600 dark:text-gray-300 text-lg mb-8'>{lang === "en" ? ws.detailsEn : ws.detailsAr}</p>
                        <a href={ws.link} target='_blank' rel='noopener noreferrer'>
                          <button className='bg-purple-600 text-white px-10 py-4 rounded-full font-black hover:bg-purple-700 transition-all shadow-lg w-fit'>{t("registerNow")}</button>
                        </a>
                      </div>
                    </motion.div>
                  ),
              )}
            </div>
          </div>
        </section>
      )}

      {/* 5. STORES SECTION */}
      <section className='py-24 bg-white dark:bg-purple-950'>
        <div className='container mx-auto px-4'>
          <motion.h2 {...fadeInUp} className='text-4xl font-black mb-16 text-center dark:text-white'>
            {t("ourStores")}
          </motion.h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {featuredStores.map((store, idx) => (
              <motion.div key={store.id} {...fadeInUp} transition={{ delay: idx * 0.1 }}>
                <Link to={`/stores/${store.id}`} className='group relative h-72 rounded-4xl overflow-hidden shadow-lg block'>
                  <img src={store.image || "/placeholder.jpg"} className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500' alt={store.name || "Store image"} />
                  <div className='absolute inset-0 bg-black/30 group-hover:bg-purple-600/40 transition-all flex items-center justify-center'>
                    <h3 className='text-white text-3xl font-black'>{lang === "en" ? store.nameEn : store.nameAr}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FEATURED PRODUCTS */}
      <section className='py-24 bg-gray-50 dark:bg-purple-900/20'>
        <div className='container mx-auto px-4'>
          <motion.h2 {...fadeInUp} className='text-4xl font-black mb-16 text-center dark:text-white'>
            {t("featuredProducts")}
          </motion.h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
            {featuredProducts.map((product, idx) => (
              <motion.div key={product.id} {...fadeInUp} transition={{ delay: idx * 0.1 }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
