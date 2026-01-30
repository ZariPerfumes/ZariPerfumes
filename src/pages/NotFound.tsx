import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../AppContext';

const NotFound: React.FC = () => {
  const { lang } = useApp();

  useEffect(() => {
    document.title = lang === 'en' ? 'Zari Perfumes | Error' : 'عطور زاري | مشكلة';
  }, [lang]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-9xl font-black text-purple-100 relative">
          404
          <span className="absolute inset-0 flex items-center justify-center text-4xl text-gray-900 font-bold">
            Lost in Style
          </span>
        </h1>
        <p className="text-gray-500 mt-8 mb-12 font-bold tracking-widest uppercase text-xs">
          The page you are looking for does not exist
        </p>
        <Link 
          to="/" 
          className="bg-[#9333EA] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-[#7e22ce] transition-all inline-block"
        >
          Return Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;