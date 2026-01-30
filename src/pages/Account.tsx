import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { auth } from '../../firebaseConfig';
import { supabase } from '../supabaseClient';
import { useApp } from '../AppContext';
import { UI_STRINGS } from '../translations';
import { User, LogOut, Settings, AlertCircle, Eye, EyeOff, CheckCircle2, ShieldCheck, Mail, Phone, KeyRound, ArrowLeft, Trash2 } from 'lucide-react';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const EMIRATES = ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"];

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(center); }, [center, map]);
  return null;
}

const Account: React.FC = () => {
  const { lang, setShippingAddress } = useApp();
  const [mode, setMode] = useState<'login' | 'signup' | 'otp' | 'forgot'>('login');
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [profile, setProfile] = useState({
    full_name: '',
    emirate: '',
    city: '',
    street: '',
    extra_info: '',
    phone: '',
    lat: 25.4052,
    lng: 55.5136
  });
  const [initialPhone, setInitialPhone] = useState('');
  const [cities, setCities] = useState<any[]>([]);

  const t = (key: string) => UI_STRINGS[key]?.[lang] || key;

  useEffect(() => {
    if (user?.email) {
      const checkSub = async () => {
        const { data } = await supabase
          .from('subscribers')
          .select('email')
          .eq('email', user.email.toLowerCase())
          .single();
        setIsSubscribed(!!data);
      };
      checkSub();
    }
  }, [user]);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setEmail(session.user.email || '');
        fetchProfile(session.user.id);
      }
      setIsInitializing(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setMode('login');
        setProfile({ full_name: '', emirate: '', city: '', street: '', extra_info: '', phone: '', lat: 25.4052, lng: 55.5136 });
      } else if (session?.user) {
        setUser(session.user);
        setEmail(session.user.email || '');
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleNewsletter = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      if (isSubscribed) {
        await supabase.from('subscribers').delete().eq('email', user.email.toLowerCase());
        setIsSubscribed(false);
      } else {
        await supabase.from('subscribers').insert([{ email: user.email.toLowerCase(), phone: profile.phone }]);
        setIsSubscribed(true);
      }
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  };

  const fetchProfile = async (id: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (data) {
      const updatedProfile = {
        full_name: data.full_name || '',
        emirate: data.emirate || '',
        city: data.city || '',
        street: data.street || '',
        extra_info: data.extra_info || '',
        phone: data.phone || '',
        lat: data.lat || 25.4052,
        lng: data.lng || 55.5136
      };
      setProfile(updatedProfile);
      setInitialPhone(data.phone || '');
      setShippingAddress(updatedProfile);
      if (data.emirate) fetchCities(data.emirate);
    }
  };

  const fetchCities = async (emirate: string) => {
    const { data } = await supabase.from('locations').select('city').eq('emirateEn', emirate);
    if (data) setCities(data);
  };

  const setupRecaptcha = () => {
    if ((window as any).recaptchaVerifier) return;
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { 'size': 'invisible' });
  };

  const handlePhoneVerifyTrigger = async () => {
    setError(null);
    setLoading(true);
    setupRecaptcha();
    let cleaned = profile.phone.replace(/\D/g, '');
    if (cleaned.startsWith('05')) cleaned = cleaned.substring(1);
    try {
      const appVerifier = (window as any).recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, `+971${cleaned}`, appVerifier);
      setConfirmationResult(confirmation);
      setVerifyingPhone(true);
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  };

  const confirmPhoneOtp = async () => {
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      setInitialPhone(profile.phone);
      setVerifyingPhone(false);
      setOtp('');
      setSuccess("Phone Number Verified!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) { setError("Invalid OTP"); }
    setLoading(false);
  };

  const handleUpdateProfile = async () => {
    if (profile.phone !== initialPhone) {
      setError("Please verify your new phone number first");
      return;
    }
    setLoading(true);
    if (email !== user.email) {
      const { error: emailErr } = await supabase.auth.updateUser({ email });
      if (emailErr) { setError(emailErr.message); setLoading(false); return; }
      setSuccess("Check your new email to confirm changes.");
    }
    const { error: err } = await supabase.from('profiles').upsert({ id: user.id, ...profile, updated_at: new Date() });
    if (err) setError(err.message);
    else {
      setShippingAddress(profile);
      setSuccess(prev => prev || "Profile Updated!");
      setTimeout(() => setSuccess(null), 4000);
    }
    setLoading(false);
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true);
    const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });
    if (updateErr) setError(updateErr.message);
    else {
      setSuccess("Password Updated!");
      setNewPassword(''); setConfirmPassword('');
      setTimeout(() => setSuccess(null), 3000);
    }
    setLoading(false);
  };

const handleDeleteAccount = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Manually remove from subscribers first (using email)
      if (user?.email) {
        await supabase
          .from('subscribers')
          .delete()
          .eq('email', user.email.toLowerCase());
      }

      // 2. Call the SQL function to delete the Auth account
      const { error: deleteErr } = await supabase.rpc('delete_user_own_account');
      
      if (deleteErr) throw deleteErr;

      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || "Could not delete account");
      setShowDeleteConfirm(false);
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError(err.message);
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) { setError("Please enter your email"); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#/reset-password`,
    });
    if (err) setError(err.message);
    else {
      setSuccess("Reset link sent!");
      setTimeout(() => setMode('login'), 3000);
    }
    setLoading(false);
  };

  const handleSignupRequest = async () => {
    setLoading(true);
    setupRecaptcha();
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('05')) cleaned = cleaned.substring(1);
    try {
      const confirmation = await signInWithPhoneNumber(auth, `+971${cleaned}`, (window as any).recaptchaVerifier);
      setConfirmationResult(confirmation);
      setMode('otp');
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  };

  const verifyOtpAndSignup = async () => {
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      const { error: sbError } = await supabase.auth.signUp({ 
        email, 
        password, 
        options: { data: { full_name: fullName, phone: phone } }
      });
      if (sbError) throw sbError;
      await supabase.from('subscribers').insert([{ email: email.toLowerCase(), phone: phone }]);
      setSuccess("Account Created!");
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  };

  function MapEvents() {
    useMapEvents({ click(e) { setProfile(prev => ({ ...prev, lat: e.latlng.lat, lng: e.latlng.lng })); } });
    return null;
  }

  if (isInitializing) return <div className="min-h-screen flex items-center justify-center bg-white dark:bg-purple-950"><div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-white dark:bg-purple-950 pt-32 pb-20 px-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div id="recaptcha-container"></div>
      
      <AnimatePresence>
        {verifyingPhone && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-white dark:bg-purple-900 p-10 rounded-3xl max-w-sm w-full text-center shadow-2xl">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-purple-600"><KeyRound size={32}/></div>
              <h3 className="text-2xl font-black dark:text-white mb-2">Verify Phone</h3>
              <input type="text" maxLength={6} className="w-full py-4 rounded-2xl bg-gray-100 dark:bg-white/5 dark:text-white text-center text-3xl font-black mb-6 outline-none" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} />
              <button onClick={confirmPhoneOtp} disabled={loading || otp.length < 6} className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black shadow-lg mb-4">{loading ? '...' : 'Verify Code'}</button>
              <button onClick={() => setVerifyingPhone(false)} className="text-gray-400 font-bold">Cancel</button>
            </div>
          </motion.div>
        )}

        {showDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 text-center">
            <div className="bg-white dark:bg-purple-900 p-10 rounded-3xl max-w-sm w-full shadow-2xl border dark:border-white/10">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><Trash2 size={32}/></div>
              <h3 className="text-2xl font-black dark:text-white mb-2">{lang === 'en' ? 'Delete Account?' : 'حذف الحساب؟'}</h3>
              <p className="text-gray-500 font-bold mb-8 text-sm">{lang === 'en' ? 'This action is permanent and cannot be undone.' : 'هذا الإجراء دائم ولا يمكن التراجع عنه.'}</p>
              <div className="flex flex-col gap-3">
                <button onClick={handleDeleteAccount} disabled={loading} className="w-full bg-red-600 text-white py-4 rounded-2xl font-black shadow-lg">{loading ? '...' : lang === 'en' ? 'Yes, Delete' : 'نعم، حذف'}</button>
                <button onClick={() => setShowDeleteConfirm(false)} className="text-gray-400 font-bold py-2">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto max-w-6xl">
        <AnimatePresence>
          {success && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-purple-600 text-white px-8 py-4 rounded-full font-black shadow-2xl flex items-center gap-3 max-w-md text-center">
              <CheckCircle2 /> {success}
            </motion.div>
          )}
        </AnimatePresence>

        {!user ? (
          <div className="bg-gray-50 dark:bg-purple-900/20 rounded-3xl p-8 md:p-16 shadow-2xl border dark:border-white/5 max-w-2xl mx-auto">
            {mode !== 'forgot' && (
              <div className="flex justify-center gap-4 mb-12">
                {['login', 'signup'].map((m) => (
                  <button key={m} onClick={() => { setMode(m as any); setError(null); }} className={`px-8 py-3 rounded-full font-black transition-all ${mode === m ? 'bg-purple-600 text-white shadow-lg' : 'bg-white dark:bg-purple-900/40 dark:text-gray-400'}`}>
                    {t(m)}
                  </button>
                ))}
              </div>
            )}
            
            <AnimatePresence mode="wait">
              <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-md mx-auto">
                {error && <div className="mb-6 p-4 bg-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-2"><AlertCircle size={18} />{error}</div>}
                {mode === 'otp' ? (
                  <div className="space-y-6 text-center">
                    <h2 className="text-2xl font-black dark:text-white">{t('enterOtp')}</h2>
                    <input type="text" maxLength={6} className="w-full py-4 rounded-3xl dark:bg-purple-900/60 dark:text-white text-center text-4xl font-black outline-none" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} />
                    <button onClick={verifyOtpAndSignup} disabled={loading || otp.length !== 6} className="w-full py-5 rounded-3xl font-black bg-purple-600 text-white shadow-xl">{loading ? '...' : t('verify')}</button>
                  </div>
                ) : mode === 'forgot' ? (
                  <div className="space-y-6">
                    <button onClick={() => setMode('login')} className="flex items-center gap-2 text-purple-600 font-black mb-4"><ArrowLeft size={20}/> {lang === 'en' ? 'Back' : 'رجوع'}</button>
                    <h2 className="text-4xl font-black dark:text-white">{lang === 'en' ? 'Reset Password' : 'إعادة تعيين'}</h2>
                    <input type="email" placeholder={t('email')} className="w-full px-8 py-4 rounded-3xl dark:bg-purple-900/60 dark:text-white font-bold outline-none" value={email} onChange={e => setEmail(e.target.value)} />
                    <button onClick={handleForgotPassword} disabled={loading} className="w-full bg-purple-600 text-white py-5 rounded-3xl font-black shadow-xl">Send Reset Link</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h2 className="text-4xl font-black text-center dark:text-white mb-8">{mode === 'login' ? t('welcomeBack') : t('signupAction')}</h2>
                    {mode === 'signup' && <input type="text" placeholder={t('fullName')} className="w-full px-8 py-4 rounded-3xl dark:bg-purple-900/60 dark:text-white font-bold outline-none" onChange={e => setFullName(e.target.value)} />}
                    <input type="email" placeholder={t('email')} className="w-full px-8 py-4 rounded-3xl dark:bg-purple-900/60 dark:text-white font-bold outline-none" value={email} onChange={e => setEmail(e.target.value)} />
                    {mode === 'signup' && (
                      <div className="relative" dir="ltr">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r dark:border-white/20 pr-3"><span className="text-xl">🇦🇪</span><span className="text-gray-400 font-bold">+971</span></div>
                        <input type="text" placeholder="5# ### ####" className="w-full pl-28 pr-8 py-4 rounded-3xl dark:bg-purple-900/60 dark:text-white font-bold outline-none" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} />
                      </div>
                    )}
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} placeholder={t('password')} className="w-full px-8 py-4 rounded-3xl dark:bg-purple-900/60 dark:text-white font-bold outline-none" onChange={e => setPassword(e.target.value)} />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
                    </div>
                    <button onClick={() => mode === 'login' ? handleLogin() : handleSignupRequest()} disabled={loading} className="w-full bg-purple-600 text-white py-5 rounded-3xl font-black text-lg shadow-xl">{loading ? '...' : mode === 'login' ? t('loginAction') : t('sendOtp')}</button>
                    {mode === 'login' && <button onClick={() => setMode('forgot')} className="w-full text-center text-sm font-bold text-purple-500 mt-2">Forgot Password?</button>}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-purple-900/20 rounded-3xl shadow-2xl border dark:border-white/5 overflow-hidden flex flex-col md:flex-row min-h-screen">
            <div className="w-full md:w-80 bg-white/50 dark:bg-purple-900/40 p-8 border-r dark:border-white/5">
              <div className="flex flex-col items-center mb-12">
                <div className="w-24 h-24 bg-purple-600 rounded-3xl flex items-center justify-center mb-4 text-white shadow-xl"><User size={48} /></div>
                <h4 className="font-black text-xl dark:text-white truncate w-full text-center">{profile.full_name || 'User'}</h4>
                <p className="text-gray-500 font-bold text-xs truncate w-full text-center">{user.email}</p>
              </div>
              <nav className="space-y-3">
                <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black transition-all ${activeTab === 'profile' ? 'bg-purple-600 text-white shadow-lg' : 'dark:text-gray-400'}`}><Settings size={20}/> Profile</button>
                <button onClick={() => setActiveTab('security')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black transition-all ${activeTab === 'security' ? 'bg-purple-600 text-white shadow-lg' : 'dark:text-gray-400'}`}><ShieldCheck size={20}/> Security</button>
                <button onClick={() => supabase.auth.signOut()} className="w-full flex items-center gap-3 px-6 py-4 text-gray-500 font-black mt-10 hover:bg-gray-100 rounded-2xl transition-all"><LogOut size={20}/> Logout</button>
                <button onClick={() => setShowDeleteConfirm(true)} className="w-full flex items-center gap-3 px-6 py-4 text-red-500 font-black hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={20}/> Delete Account</button>
              </nav>
            </div>
            <div className="flex-1 p-8 md:p-12">
              <AnimatePresence mode="wait">
                {activeTab === 'profile' ? (
                  <motion.div key="p" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div className="flex justify-between items-center border-b pb-6 dark:border-white/10">
                      <h3 className="text-3xl font-black dark:text-white">Profile Details</h3>
                      <button onClick={handleUpdateProfile} disabled={loading || profile.phone !== initialPhone} className={`px-10 py-3 rounded-full font-black shadow-lg ${profile.phone !== initialPhone ? 'bg-gray-300' : 'bg-purple-600 text-white'}`}>Save</button>
                    </div>
                    {error && <div className="p-4 bg-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-2"><AlertCircle size={18} />{error}</div>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <label className="block text-sm font-black text-gray-400">Account Credentials</label>
                          <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/><input type="email" className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white dark:bg-purple-900/40 dark:text-white font-bold border dark:border-white/10" value={email} onChange={e => setEmail(e.target.value)} /></div>
                          <div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/><input type="text" className="w-full pl-12 pr-32 py-4 rounded-2xl bg-white dark:bg-purple-900/40 dark:text-white font-bold border dark:border-white/10" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />{profile.phone !== initialPhone && <button onClick={handlePhoneVerifyTrigger} className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 text-white text-xs px-4 py-2 rounded-xl font-black shadow-md">VERIFY</button>}</div>
                        </div>
                        <div className="p-6 bg-purple-50 dark:bg-white/5 rounded-3xl flex items-center justify-between">
                          <div><h5 className="font-black dark:text-white">Newsletter</h5><p className="text-sm text-gray-500 font-bold">Receive updates</p></div>
                          <button onClick={toggleNewsletter} className={`w-14 h-8 rounded-full transition-all relative ${isSubscribed ? 'bg-purple-600' : 'bg-gray-300'}`}><div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${isSubscribed ? 'left-7' : 'left-1'}`} /></button>
                        </div>
                        <div className="space-y-4">
                          <input type="text" placeholder="Full Name" className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-purple-900/40 dark:text-white font-bold border dark:border-white/10" value={profile.full_name} onChange={e => setProfile({...profile, full_name: e.target.value})} />
                          <select className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-purple-900/40 dark:text-white font-bold border dark:border-white/10" value={profile.emirate} onChange={(e) => { setProfile({...profile, emirate: e.target.value, city: ''}); fetchCities(e.target.value); }}>
                            <option value="">Select Emirate</option>
                            {EMIRATES.map(e => <option key={e} value={e}>{e}</option>)}
                          </select>
                          <select className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-purple-900/40 dark:text-white font-bold border dark:border-white/10" value={profile.city} onChange={(e) => setProfile({...profile, city: e.target.value})}>
                            <option value="">Select City</option>
                            {cities.map(c => <option key={c.city} value={c.city}>{c.city}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="h-96 rounded-3xl overflow-hidden border-4 border-white dark:border-purple-800 shadow-xl relative">
                        <MapContainer center={[profile.lat, profile.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <Marker position={[profile.lat, profile.lng]} />
                          <MapEvents />
                          <MapUpdater center={[profile.lat, profile.lng]} />
                        </MapContainer>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="s" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-md space-y-8">
                    <h3 className="text-3xl font-black dark:text-white border-b pb-6 dark:border-white/10">Security</h3>
                    <input type="password" placeholder="New Password" className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-purple-900/40 dark:text-white font-bold border" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    <input type="password" placeholder="Confirm Password" className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-purple-900/40 dark:text-white font-bold border" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                    <button onClick={handleUpdatePassword} disabled={loading} className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black shadow-lg">Update Password</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;