import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../AppContext';
import { UI_STRINGS } from '../translations';
import { STORES } from '../data';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faInstagram, 
  faTiktok, 
  faSnapchat, 
  faWhatsapp 
} from '@fortawesome/free-brands-svg-icons';

import logo from '../images/logo.png';

const Footer: React.FC = () => {
  const { lang } = useApp();
  const t = (key: string) => UI_STRINGS[key]?.[lang] || key;

  return (
    <footer className="bg-purple-900 text-white pt-16 pb-8 text-left" dir="ltr">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-lg opacity-80">{t('licensedUAE')}</p>
          <div className="h-px bg-white/20 mt-6 max-w-4xl mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-[#4C0078] rounded-xl p-1.5 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                <img src={logo} alt="Zari Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-black tracking-tighter">{lang === 'en' ? 'Zari' : 'زري'}</span>
            </Link>
            <p className="text-white/70 leading-relaxed font-medium">
              {t('footerAbout')}
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-black uppercase tracking-widest text-purple-300">{t('ourStores')}</h4>
            <ul className="space-y-2">
              {STORES.map(s => (
                <li key={s.id}>
                  <Link to={`/stores/${s.id}`} className="text-white/70 hover:text-white transition-colors font-medium">
                    {lang === 'en' ? s.nameEn : s.nameAr}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-black uppercase tracking-widest text-purple-300">{t('contactUs')}</h4>
            <div className="space-y-3">
              <a href="https://instagram.com/zari.aj25" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-white/70 hover:text-white transition-all font-medium">
                <FontAwesomeIcon icon={faInstagram} className="w-5 h-5" />
                <span>@zari.aj25</span>
              </a>
              <a href="https://tiktok.com/@zari.aj25" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-white/70 hover:text-white transition-all font-medium">
                <FontAwesomeIcon icon={faTiktok} className="w-5 h-5" />
                <span>@zari.aj25</span>
              </a>
              <a href="http://snapchat.com/@zari.aj25" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-white/70 hover:text-white transition-all font-medium">
                <FontAwesomeIcon icon={faSnapchat} className="w-5 h-5" />
                <span>@zari.aj25</span>
              </a>
              <a href="https://wa.me/971588537024" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-white/70 hover:text-white transition-all font-medium">
                <FontAwesomeIcon icon={faWhatsapp} className="w-5 h-5" />
                <span dir="ltr">+971 58 853 7024</span>
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-black uppercase tracking-widest text-purple-300">{t('followUs')}</h4>
            <div className="flex flex-wrap gap-4">
                <a href="https://instagram.com/zari.aj25" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-purple-600 transition-all shadow-lg active:scale-90">
                    <FontAwesomeIcon icon={faInstagram} className="text-xl" />
                </a>
                <a href="https://tiktok.com/@zari.aj25" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-purple-600 transition-all shadow-lg active:scale-90">
                    <FontAwesomeIcon icon={faTiktok} className="text-xl" />
                </a>
                <a href="http://snapchat.com/@zari.aj25" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-purple-600 transition-all shadow-lg active:scale-90">
                    <FontAwesomeIcon icon={faSnapchat} className="text-xl" />
                </a>
            </div>
          </div>
        </div>

        <div className="h-0.5 bg-white/10 mt-16 mb-8 rounded-full"></div>
        <p className="text-center text-white/40 text-xs font-bold uppercase tracking-widest">{t('copyright')}</p>
      </div>
    </footer>
  );
};

export default Footer;