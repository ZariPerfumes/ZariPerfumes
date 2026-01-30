import { useState } from 'react';
import { useApp } from '../AppContext';

export default function WhatsAppButton() {
  const { lang } = useApp();
  const [showTooltip, setShowTooltip] = useState(false);
  const whatsappUrl = "https://wa.me/971588537024";

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip(!showTooltip)}
      className={`group fixed bottom-6 right-6 z-60 flex items-center gap-3 ${
        lang === 'ar' ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      <span className={`transition-opacity duration-300 bg-black/70 text-white px-3 py-1 rounded-lg text-sm backdrop-blur-sm whitespace-nowrap ${
        showTooltip ? 'opacity-100' : 'opacity-0'
      }`}>
        {lang === 'en' ? 'Need Help?' : 'تحتاج مساعدة؟'}
      </span>
      <div className="p-4 bg-purple-600 text-white rounded-2xl shadow-2xl transition-all duration-300 hover:bg-purple-700 active:scale-90 flex items-center justify-center">
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>
    </a>
  );
}