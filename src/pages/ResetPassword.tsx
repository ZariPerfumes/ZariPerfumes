import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../supabaseClient";
import { useApp } from "../AppContext";
import { AlertCircle, CheckCircle2, KeyRound, Loader2 } from "lucide-react";

const ResetPassword: React.FC = () => {
  const { lang } = useApp();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const initSession = async () => {
      // Small delay to ensure URL fragment is fully loaded
      await new Promise((resolve) => setTimeout(resolve, 500));

      const hash = window.location.hash;
      const fragmentParams = new URLSearchParams(hash.includes("#") ? hash.split("#").pop() : "");
      const queryParams = new URLSearchParams(window.location.search);

      const accessToken = fragmentParams.get("access_token") || queryParams.get("access_token");
      const refreshToken = fragmentParams.get("refresh_token") || queryParams.get("refresh_token");

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

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setHasSession(true);
      } else {
        setError(lang === "en" ? "Invalid or expired reset link." : "رابط غير صالح أو منتهي الصلاحية.");
      }
    };
    initSession();
  }, [lang]);

  const handleUpdatePassword = async () => {
    setError(null);
    if (!newPassword || newPassword !== confirmPassword) {
      setError(lang === "en" ? "Passwords do not match" : "كلمات السر غير متطابقة");
      return;
    }

    if (newPassword.length < 6) {
      setError(lang === "en" ? "Min 6 characters required" : "6 أحرف على الأقل");
      return;
    }

    setLoading(true);
    const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });

    if (updateErr) {
      setError(updateErr.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/#/account";
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <div className='min-h-screen bg-white dark:bg-purple-950 flex items-center justify-center p-4'>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='bg-gray-50 dark:bg-purple-900/20 p-8 md:p-12 rounded-[40px] shadow-2xl border dark:border-white/5 max-w-md w-full'>
        <div className='w-20 h-20 bg-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 text-white shadow-xl shadow-purple-500/20'>
          <KeyRound size={40} />
        </div>

        <h2 className='text-4xl font-black text-center dark:text-white mb-8 tracking-tighter'>{lang === "en" ? "Reset" : "إعادة تعيين"}</h2>

        {error && (
          <div className='mb-6 p-5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl text-xs font-black flex items-center gap-3 border border-red-100 dark:border-red-500/10'>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {success ? (
          <div className='text-center space-y-6 py-4'>
            <div className='bg-emerald-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4'>
              <CheckCircle2 size={40} className='text-white animate-pulse' />
            </div>
            <p className='font-black dark:text-white text-2xl tracking-tighter'>{lang === "en" ? "Success! Redirecting..." : "تم بنجاح! جاري التحويل..."}</p>
          </div>
        ) : (
          <div className='space-y-4'>
            <input type='password' placeholder={lang === "en" ? "New Password" : "كلمة السر الجديدة"} className='w-full px-6 py-5 rounded-3xl bg-white dark:bg-purple-900/60 dark:text-white font-bold outline-none border dark:border-white/10 focus:border-purple-600 transition-colors' value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <input type='password' placeholder={lang === "en" ? "Confirm Password" : "تأكيد كلمة السر"} className='w-full px-6 py-5 rounded-3xl bg-white dark:bg-purple-900/60 dark:text-white font-bold outline-none border dark:border-white/10 focus:border-purple-600 transition-colors' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            <button onClick={handleUpdatePassword} disabled={loading || !hasSession} className='w-full bg-purple-600 text-white py-6 rounded-3xl font-black text-xl shadow-xl shadow-purple-600/20 disabled:bg-gray-400 disabled:shadow-none mt-4 flex items-center justify-center gap-2'>
              {loading && <Loader2 className='animate-spin' size={20} />}
              {lang === "en" ? "Update Password" : "تحديث كلمة السر"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
