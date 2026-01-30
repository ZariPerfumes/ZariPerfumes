import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { useApp } from '../AppContext';
import { AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const { lang } = useApp();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const initSession = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const hash = window.location.hash;
      const fragmentParams = new URLSearchParams(hash.includes('#') ? hash.split('#').pop() : '');
      const queryParams = new URLSearchParams(window.location.search);
      
      const accessToken = fragmentParams.get('access_token') || queryParams.get('access_token');
      const refreshToken = fragmentParams.get('refresh_token') || queryParams.get('refresh_token');

      if (accessToken && refreshToken) {
        const { data, error: sessionErr } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!sessionErr && data.session) {
          setHasSession(true);
          return;
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setHasSession(true);
      } else {
        setError(lang === 'en' ? "Invalid or expired reset link." : "رابط غير صالح أو منتهي الصلاحية.");
      }
    };
    initSession();
  }, [lang]);

  const handleUpdatePassword = async () => {
    setError(null);
    if (!newPassword || newPassword !== confirmPassword) {
      setError(lang === 'en' ? "Passwords do not match" : "كلمات السر غير متطابقة");
      return;
    }
    
    if (newPassword.length < 6) {
      setError(lang === 'en' ? "Min 6 characters required" : "6 أحرف على الأقل");
      return;
    }
    
    setLoading(true);
    const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });
    
    if (updateErr) {
      setError(updateErr.message);
    } else {
      setSuccess(true);
      // Automatically redirect to account page while keeping the session active
      setTimeout(() => {
        window.location.href = '/#/account';
      }, 1500);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-purple-950 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gray-50 dark:bg-purple-900/20 p-8 rounded-3xl shadow-2xl border dark:border-white/5 max-w-md w-full">
        <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg">
          <KeyRound size={32} />
        </div>

        <h2 className="text-3xl font-black text-center dark:text-white mb-6">
          {lang === 'en' ? 'New Password' : 'كلمة سر جديدة'}
        </h2>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {success ? (
          <div className="text-center space-y-4">
            <CheckCircle2 size={64} className="mx-auto text-green-500 animate-bounce"/>
            <p className="font-black dark:text-white text-xl">
              {lang === 'en' ? 'Password Set! Entering Account...' : 'تم تعيين كلمة السر! جاري الدخول...'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <input 
              type="password" 
              placeholder="New Password" 
              className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-purple-900/60 dark:text-white font-bold outline-none border dark:border-white/10" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
            />
            <input 
              type="password" 
              placeholder="Confirm Password" 
              className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-purple-900/60 dark:text-white font-bold outline-none border dark:border-white/10" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
            />
            <button 
              onClick={handleUpdatePassword} 
              disabled={loading || !hasSession} 
              className="w-full bg-purple-600 text-white py-5 rounded-3xl font-black text-lg shadow-xl disabled:bg-gray-400"
            >
              {loading ? '...' : lang === 'en' ? 'Update & Login' : 'تحديث ودخول'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;