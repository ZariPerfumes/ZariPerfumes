import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from '../../firebaseConfig';
import { supabase } from '../supabaseClient';
import { useApp } from '../AppContext';
import { UI_STRINGS } from '../translations';
import { User, Lock, Mail, Phone, LogOut, Settings } from 'lucide-react';

const Account: React.FC = () => {
  const { lang } = useApp();
  const [mode, setMode] = useState<'login' | 'signup' | 'otp' | 'forgot'>('login');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const t = (key: string) => UI_STRINGS[key]?.[lang] || key;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
  }, []);

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      });
    }
  };

  const handleSignupRequest = async () => {
    setLoading(true);
    setupRecaptcha();
    try {
      const appVerifier = (window as any).recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(confirmation);
      setMode('otp');
    } catch (err: any) {
      alert(err.message);
    }
    setLoading(false);
  };

  const verifyOtpAndSignup = async () => {
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { data: { full_name: fullName, phone: phone } }
      });
      if (error) throw error;
      setMode('login');
      alert(lang === 'en' ? 'Verified! Now login.' : 'تم التحقق! سجل دخولك الآن.');
    } catch (err: any) {
      alert(err.message);
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-purple-950 pt-32 pb-20 px-4 transition-colors">
      <div id="recaptcha-container"></div>
      <div className="container mx-auto max-w-4xl">
        {!user && (
          <div className="bg-gray-50 dark:bg-purple-900/20 rounded-[3rem] p-8 md:p-16 shadow-2xl">
            <AnimatePresence mode="wait">
              {mode === 'login' && (
                <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto space-y-6">
                  <h2 className="text-4xl font-black text-center dark:text-white">{t('login')}</h2>
                  <input type="email" placeholder={t('email')} className="w-full px-8 py-4 rounded-3xl dark:bg-purple-900/60 dark:text-white outline-none" onChange={e => setEmail(e.target.value)} />
                  <input type="password" placeholder={t('password')} className="w-full px-8 py-4 rounded-3xl dark:bg-purple-900/60 dark:text-white outline-none" onChange={e => setPassword(e.target.value)} />
                  <button onClick={handleLogin} className="w-full bg-purple-600 text-white py-5 rounded-3xl font-black">{t('loginAction')}</button>
                  <button onClick={() => setMode('signup')} className="w-full text-purple-600 font-bold">{t('createAccount')}</button>
                </motion.div>
              )}

              {mode === 'signup' && (
                <motion.div key="signup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto space-y-4">
                  <h2 className="text-4xl font-black text-center dark:text-white">{t('signup')}</h2>
                  <input type="text" placeholder={t('fullName')} className="w-full px-8 py-4 rounded-3xl dark:bg-purple-900/60 dark:text-white outline-none" onChange={e => setFullName(e.target.value)} />
                  <input type="email" placeholder={t('email')} className="w-full px-8 py-4 rounded-3xl dark:bg-purple-900/60 dark:text-white outline-none" onChange={e => setEmail(e.target.value)} />
                  <input type="text" placeholder="+123456789" className="w-full px-8 py-4 rounded-3xl dark:bg-purple-900/60 dark:text-white outline-none" onChange={e => setPhone(e.target.value)} />
                  <input type="password" placeholder={t('password')} className="w-full px-8 py-4 rounded-3xl dark:bg-purple-900/60 dark:text-white outline-none" onChange={e => setPassword(e.target.value)} />
                  <button onClick={handleSignupRequest} className="w-full bg-purple-600 text-white py-5 rounded-3xl font-black">{loading ? '...' : t('sendOtp')}</button>
                </motion.div>
              )}

              {mode === 'otp' && (
                <motion.div key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto space-y-6">
                  <h2 className="text-2xl font-black text-center dark:text-white">{t('enterOtp')}</h2>
                  <input type="text" placeholder="6-digit code" className="w-full px-8 py-4 rounded-3xl dark:bg-purple-900/60 dark:text-white outline-none text-center text-2xl tracking-widest" onChange={e => setOtp(e.target.value)} />
                  <button onClick={verifyOtpAndSignup} className="w-full bg-purple-600 text-white py-5 rounded-3xl font-black">{t('verify')}</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {user && (
          <div className="bg-gray-50 dark:bg-purple-900/20 rounded-[3rem] p-8 md:p-16 shadow-2xl dark:text-white">
            <h2 className="text-3xl font-black mb-8 flex items-center gap-2"><Settings /> {t('settings')}</h2>
            <p className="mb-4 font-bold">{user.email}</p>
            <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 text-red-500 font-black"><LogOut size={20} /> {t('logout')}</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;