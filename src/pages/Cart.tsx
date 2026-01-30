import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { UI_STRINGS } from '../translations';
import ProductCard from '../components/ProductCard';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import html2canvas from 'html2canvas';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Product } from '../types';
import emailjs from '@emailjs/browser';
import { QRCodeSVG } from 'qrcode.react';

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const CITY_COORDS: Record<string, [number, number]> = {
  'Dubai': [25.2048, 55.2708], 'Abu Dhabi': [24.4539, 54.3773], 'Sharjah': [25.3463, 55.4209],
  'Ajman': [25.4052, 55.5136], 'Umm Al Quwain': [25.5647, 55.5533], 'Ras Al Khaimah': [25.7895, 55.9432],
  'Fujairah': [25.1288, 56.3265], 'Al Ain City': [24.1302, 55.8023]
};

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => { map.flyTo(center, zoom, { duration: 1.5 }); }, [center, zoom, map]);
  return null;
}

function MapEvents({ setCoords }: { setCoords: (c: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setCoords([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

const Cart: React.FC = () => {
  const { lang, cart, updateQuantity, removeFromCart, clearCart, recentlyViewed } = useApp();
  const navigate = useNavigate();
  const receiptRef = useRef<HTMLDivElement>(null);
  const t = (key: string) => UI_STRINGS[key]?.[lang] || key;

  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [dbLocations, setDbLocations] = useState<any[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showClearCartConfirm, setShowClearCartConfirm] = useState(false);
  const [showGiftPopup, setShowGiftPopup] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<'pickup' | 'delivery' | null>(null);
  const [emirate, setEmirate] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [warningId, setWarningId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState<{code: string, discount: number} | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const [newsEmail, setNewsEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapCoords, setMapCoords] = useState<[number, number]>([25.4052, 55.5136]);
  const [mapZoom, setMapZoom] = useState(11);
  const [locationDetails, setLocationDetails] = useState({ street: '', villa: '' });
  const [orderTime] = useState(new Date().toLocaleString());

  useEffect(() => {
    if (emirate && CITY_COORDS[emirate]) {
      setMapCoords(CITY_COORDS[emirate]);
      setMapZoom(13);
    }
  }, [emirate]);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = activeCoupon ? (subtotal * (activeCoupon.discount / 100)) : 0;
  
  const deliveryFee = useMemo(() => {
    if (method === 'pickup') return 0;
    if (method === 'delivery' && city) {
      return dbLocations.find(l => l.emirateEn === emirate && l.city === city)?.cost || 0;
    }
    return null;
  }, [method, city, emirate, dbLocations]);

  const giftFee = isGift ? 10 : 0;
  const total = subtotal - discountAmount + (deliveryFee || 0) + giftFee;

  const applyCoupon = async () => {
    setCouponError(lang === 'en' ? 'Service currently unavailable' : 'الخدمة غير متوفرة حالياً');
  };

  const handleDetailsConfirm = () => {
    setStep(4);
  };

  const handleNewsletterJoin = () => {
    setStep(4);
  };

  const handleIncrement = (item: any) => {
    updateQuantity(item.id, 1);
  };

  const handleFullReset = () => { clearCart(); setShowCheckout(false); setStep(1); setIsGift(false); setOrderNotes(''); navigate('/'); };

  const downloadReceipt = async () => {
    if (receiptRef.current) {
      const canvas = await html2canvas(receiptRef.current, { scale: 2 });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `Zari-Order.png`;
      link.click();
    }
  };

  const isPhoneValid = /^(05|5)\d{8}$/.test(phone.replace(/\s/g, ''));

  const isStep1Valid = method === 'pickup' || (method === 'delivery' && emirate !== '' && city !== '');
  const isStep2Valid = /^(05|5)\d{8}$/.test(phone) && 
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && 
                    (method === 'pickup' || (locationDetails.street !== '' && locationDetails.villa !== ''));
  const finalMapLink = method === 'pickup' ? "https://maps.app.goo.gl/P9JwrHX6xiBPmgiy6" : `https://www.google.com/maps?q=$${mapCoords[0]},${mapCoords[1]}`;

  return (
    <div className="pt-16 pb-20 bg-gray-50/50 dark:bg-purple-950 transition-colors duration-300 min-h-screen w-full" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {showClearCartConfirm && (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-6 bg-black/40 backdrop-blur-xl">
          <div className="bg-white dark:bg-purple-900 p-12 rounded-[48px] shadow-2xl max-w-md w-full text-center border dark:border-white/10">
            <h4 className="text-3xl font-black mb-10 dark:text-white">{lang === 'en' ? 'Clear cart?' : 'مسح السلة؟'}</h4>
            <button onClick={() => { clearCart(); setShowClearCartConfirm(false); }} className="w-full bg-gray-900 text-white dark:bg-white dark:text-purple-900 py-5 rounded-3xl font-bold mb-4">{lang === 'en' ? 'Yes, Clear' : 'نعم، امسح'}</button>
            <button onClick={() => setShowClearCartConfirm(false)} className="w-full text-gray-400 font-bold">{lang === 'en' ? 'Cancel' : 'إلغاء'}</button>
          </div>
        </div>
      )}

      {showGiftPopup && (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-6 bg-black/40 backdrop-blur-xl">
          <div className="bg-white dark:bg-purple-900 p-10 rounded-[48px] shadow-2xl max-w-lg w-full border dark:border-white/10 animate-in zoom-in-95">
            <h4 className="text-3xl font-black mb-4 dark:text-white text-center">🎁 {lang === 'en' ? 'Gift Service (+10 AED)' : 'خدمة الهدايا (+10 درهم)'}</h4>
            <p className="text-gray-600 dark:text-gray-300 font-bold text-center mb-6">
              {lang === 'en' ? "We provide elegant gift wrapping and a personalized handwritten note for your loved ones." : "نقدم تغليف هدايا أنيق مع رسالة مكتوبة بخط اليد لأحبائك."}
            </p>
            <textarea 
              value={orderNotes} 
              onChange={e => { setOrderNotes(e.target.value); setIsGift(true); }} 
              placeholder={lang === 'en' ? 'Write your message here...' : 'اكتب رسالتك هنا...'} 
              className="w-full p-5 bg-purple-50 dark:bg-white/5 dark:text-white rounded-3xl font-black outline-none min-h-30 mb-6 border-2 border-purple-100 dark:border-white/10"
            />
            <button onClick={() => setShowGiftPopup(false)} className="w-full bg-purple-600 text-white py-5 rounded-3xl font-black shadow-xl mb-4">{lang === 'en' ? 'Save & Close' : 'حفظ وإغلاق'}</button>
            <button onClick={() => { setIsGift(false); setOrderNotes(''); setShowGiftPopup(false); }} className="w-full text-gray-400 font-bold text-sm">{lang === 'en' ? 'Remove Gift Service' : 'إزالة خدمة الهدايا'}</button>
          </div>
        </div>
      )}

      <div className="h-62.5 mb-12 bg-linear-to-br from-purple-950 to-purple-800 flex items-center justify-center text-white text-center w-full">
        <h1 className="text-6xl font-black tracking-tighter">{t('cart')}</h1>
      </div>

      <div className="max-w-400 mx-auto px-6">
        {cart.length === 0 && !showCheckout ? (
          <div className="py-20 text-center">
            <h2 className="text-4xl font-black mb-6 text-purple-900 dark:text-purple-400">{t('emptyCart')}</h2>
            <Link to="/explore" className="bg-purple-600 text-white px-12 py-5 rounded-full font-black text-xl">{t('continueShopping')}</Link>
          </div>
        ) : (
          <div className="lg:flex gap-12">
            <div className="lg:w-2/3 space-y-6">
              {cart.map(item => (
                <div key={item.id} className="bg-white dark:bg-purple-900 p-8 rounded-4xl shadow-sm border border-purple-50 dark:border-white/5 flex items-center gap-8 relative overflow-hidden transition-all hover:shadow-md">
                  <Link to={`/product/${item.id}`} className="shrink-0">
                    <img src={item.image} className="w-32 h-32 rounded-3xl object-cover" alt="" />
                  </Link>
                  <div className="grow">
                    <Link to={`/product/${item.id}`}>
                      <h3 className="text-2xl font-black dark:text-white hover:text-purple-600 transition-colors">{lang === 'en' ? item.nameEn : item.nameAr}</h3>
                    </Link>
                    <p className="text-purple-600 dark:text-purple-400 font-bold">{item.price} AED</p>
                    <div className="flex items-center bg-purple-50 dark:bg-white/5 dark:text-white w-fit rounded-2xl p-1.5 mt-4 gap-6">
                      <button onClick={() => item.quantity === 1 ? removeFromCart(item.id) : updateQuantity(item.id, -1)} className="font-black text-xl px-2">-</button>
                      <span className="font-black text-xl">{item.quantity}</span>
                      <button onClick={() => handleIncrement(item)} className="font-black text-xl px-2">+</button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => setShowClearCartConfirm(true)} className="text-red-500 font-black uppercase text-sm tracking-widest p-4">{lang === 'en' ? 'Clear All Items' : 'مسح كل العناصر'}</button>
            </div>

            <div className="lg:w-1/3">
              <div className="bg-white dark:bg-purple-900 p-10 rounded-[48px] shadow-2xl border border-purple-100 dark:border-white/10 sticky top-32">
                <h3 className="text-3xl font-black mb-8 dark:text-white">{t('orderSummary')}</h3>
                <div className="flex gap-2 mb-6">
                   <input value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder={lang === 'en' ? 'COUPON' : 'كود الخصم'} className="flex-1 p-4 bg-gray-50 dark:bg-white/5 dark:text-white rounded-2xl font-black border dark:border-white/10 uppercase outline-none" />
                   <button onClick={applyCoupon} className="bg-purple-600 text-white px-6 rounded-2xl font-black">APPLY</button>
                </div>
                {couponError && <p className="text-red-500 text-xs font-bold mb-4">{couponError}</p>}
                <div className="space-y-4 border-b dark:border-white/10 pb-8 mb-8 text-xl font-bold dark:text-gray-300">
                   <div className="flex justify-between"><span>{lang === 'en' ? 'Subtotal' : 'المجموع الفرعي'}</span><span>{subtotal} AED</span></div>
                   {isGift && (
                     <div className="flex justify-between text-purple-600 dark:text-purple-400">
                       <span>🎁 {lang === 'en' ? 'Gift' : 'هدية'}</span>
                       <span>10 AED</span>
                     </div>
                   )}
                   {deliveryFee !== null && (
                       <div className="flex justify-between text-purple-600 dark:text-purple-400">
                           <span>{t('delivery')}</span>
                           <span>{deliveryFee > 0 ? `${deliveryFee} AED` : (lang === 'en' ? 'Free' : 'مجاني')}</span>
                       </div>
                   )}
                </div>
                <div className="flex justify-between items-center mb-10 text-3xl font-black dark:text-white">
                   <span>{t('total')}</span><span className="text-purple-600 dark:text-purple-400">{total.toFixed(0)} AED</span>
                </div>
                <div className="space-y-4">
                  <button onClick={() => setShowCheckout(true)} className="w-full bg-purple-600 text-white py-6 rounded-[28px] font-black text-2xl shadow-xl">{t('proceedToCheckout')}</button>
                  <button onClick={() => setShowGiftPopup(true)} className={`w-full py-4 rounded-[28px] font-black flex items-center justify-center gap-3 border-2 transition-all ${isGift ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-600' : 'border-purple-200 dark:border-white/10 text-purple-600 dark:text-purple-400'}`}>
                    <span>{isGift ? '✔️' : '🎁'}</span>
                    {lang === 'en' ? 'Is this a gift?' : 'هل هذه هدية؟'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCheckout && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-purple-950/40 backdrop-blur-md">
          <div className="bg-white dark:bg-purple-900 rounded-[56px] w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] relative">
            <div className="bg-purple-900 dark:bg-black p-10 text-white flex justify-between items-center relative overflow-hidden">
               <div className="absolute bottom-0 left-0 h-1 bg-purple-400 transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }}></div>
               <button onClick={() => setShowExitConfirm(true)} className="text-3xl font-bold z-10 hover:text-purple-300 transition-colors">✕</button>
               <div className="flex items-center gap-10 z-10">{[1, 2, 3, 4].map(i => <div key={i} className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all ${step>=i?'bg-white text-purple-900':'bg-white/10'}`}>{i}</div>)}</div>
            </div>

            {showExitConfirm && (
              <div className="absolute inset-0 z-110 bg-purple-900/95 flex items-center justify-center p-8">
                <div className="bg-white dark:bg-purple-900 p-10 rounded-[40px] text-center max-w-sm">
                  <h4 className="text-2xl font-black mb-6 dark:text-white">{lang === 'en' ? 'Close Checkout?' : 'إغلاق الدفع؟'}</h4>
                  <button onClick={() => { setShowCheckout(false); setShowExitConfirm(false); setStep(1); }} className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black mb-2">{lang === 'en' ? 'Close' : 'إغلاق'}</button>
                  <button onClick={() => setShowExitConfirm(false)} className="w-full text-gray-500 font-bold">{lang === 'en' ? 'Stay' : 'البقاء'}</button>
                </div>
              </div>
            )}

            <div className="p-10 lg:p-14 overflow-y-auto grow">
              {step === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <button onClick={() => {setMethod('pickup'); setCity(''); setEmirate('');}} className={`p-8 rounded-4xl border-4 font-black text-xl transition-all ${method === 'pickup' ? 'border-purple-600 bg-purple-50 dark:bg-purple-800 dark:text-white' : 'border-gray-50 dark:border-white/5 dark:text-gray-400'}`}>{lang === 'en' ? 'Pickup' : 'استلام'}</button>
                    </div>
                    <button onClick={() => setMethod('delivery')} className={`p-8 rounded-4xl border-4 font-black text-xl transition-all ${method === 'delivery' ? 'border-purple-600 bg-purple-50 dark:bg-purple-800 dark:text-white' : 'border-gray-50 dark:border-white/5 dark:text-gray-400'}`}>{lang === 'en' ? 'Delivery' : 'توصيل'}</button>
                  </div>
                  {method === 'delivery' && (
                    <div className="grid gap-6 animate-in zoom-in-95">
                      <select value={emirate} onChange={(e) => setEmirate(e.target.value)} className="p-6 bg-purple-50 dark:bg-white/5 dark:text-white rounded-3xl font-black outline-none appearance-none">
                        <option value="" className="dark:bg-purple-900">{lang === 'en' ? 'Select Emirate' : 'اختر الإمارة'}</option>
                        {Object.keys(CITY_COORDS).map(e => (
                           <option key={e} value={e} className="dark:bg-purple-900">{e}</option>
                        ))}
                      </select>
                      <input value={city} onChange={(e) => setCity(e.target.value)} placeholder={t('selectCity')} className="p-6 bg-purple-50 dark:bg-white/5 dark:text-white rounded-3xl font-black outline-none" />
                    </div>
                  )}
                  <button disabled={!isStep1Valid} onClick={() => setStep(2)} className="w-full bg-purple-600 text-white py-6 rounded-[28px] font-black text-xl shadow-xl disabled:opacity-20 transition-all active:scale-95">{lang === 'en' ? 'Continue' : 'متابعة'} →</button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  {method === 'delivery' && (
                    <div className="space-y-4">
                      <div className="h-64 rounded-4xl overflow-hidden border-4 border-white dark:border-white/10 shadow-lg relative z-0">
                        <MapContainer center={mapCoords} zoom={mapZoom} style={{height: "100%", cursor: 'crosshair'}}>
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <Marker position={mapCoords} icon={icon} />
                          <ChangeView center={mapCoords} zoom={mapZoom} />
                          <MapEvents setCoords={setMapCoords} />
                        </MapContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <input placeholder={t('street')} className="p-5 bg-purple-50 dark:bg-white/5 dark:text-white rounded-[20px] font-black outline-none" onChange={e => setLocationDetails({...locationDetails, street: e.target.value})} />
                        <input placeholder={t('villa')} className="p-5 bg-purple-50 dark:bg-white/5 dark:text-white rounded-[20px] font-black outline-none" onChange={e => setLocationDetails({...locationDetails, villa: e.target.value})} />
                      </div>
                    </div>
                  )}
                  <input value={email} onChange={e => setEmail(e.target.value)} placeholder={lang === 'en' ? 'Email' : 'البريد الإلكتروني'} className="w-full p-5 bg-purple-50 dark:bg-white/5 dark:text-white rounded-[20px] font-black outline-none" />
                  <input 
  value={phone} 
  onChange={e => {
    const val = e.target.value.replace(/\D/g, ''); // Removes non-numeric characters
    if (val.length <= 10) setPhone(val);
  }} 
  placeholder={lang === 'en' ? 'Phone (e.g. 0501234567)' : 'رقم الهاتف (مثال 0501234567)'} 
  className="w-full p-5 bg-purple-50 dark:bg-white/5 dark:text-white rounded-[20px] font-black outline-none" 
/>
                  
                  <div className="space-y-4">
                    <button onClick={() => { setIsGift(!isGift); if(!isGift) setShowGiftPopup(true); }} className={`w-full py-4 rounded-[20px] font-black flex items-center justify-center gap-3 border-2 transition-all ${isGift ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-600' : 'border-purple-200 dark:border-white/10 text-purple-600 dark:text-purple-400'}`}>
                        <span>{isGift ? '✔️' : '🎁'}</span>
                        {lang === 'en' ? 'Gift Service (+10 AED)' : 'خدمة الهدايا (+10 درهم)'}
                    </button>
                    <textarea value={orderNotes} onChange={e => setOrderNotes(e.target.value)} placeholder={lang === 'en' ? 'Special requests / Gift message...' : 'طلبات خاصة / رسالة هدية...'} className="w-full p-5 bg-purple-50 dark:bg-white/5 dark:text-white rounded-[20px] font-black outline-none min-h-25 resize-none" />
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setStep(1)} className="w-1/3 bg-gray-100 dark:bg-white/5 dark:text-white py-6 rounded-[28px] font-black text-xl">{lang === 'en' ? 'Back' : 'رجوع'}</button>
                    <button disabled={!isStep2Valid} onClick={handleDetailsConfirm} className="flex-1 bg-purple-600 text-white py-6 rounded-[28px] font-black shadow-xl disabled:opacity-20 transition-all active:scale-95">{lang === 'en' ? 'Confirm Details' : 'تأكيد البيانات'}</button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div ref={receiptRef} className="bg-white p-10 rounded-[40px] border-8 border-purple-50 text-left space-y-6 shadow-2xl relative overflow-hidden" dir="ltr">
                    <h2 className="text-3xl font-black text-purple-900 italic tracking-tighter">ZARI PERFUMES</h2>
                    {isGift && (
                      <div className="absolute top-8 right-8 border-2 border-emerald-500 text-emerald-500 px-3 py-1 rounded-lg text-[10px] font-black rotate-12">GIFT WRAPPED</div>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-[10px] font-black uppercase text-gray-400 border-b pb-4">
                      <div>Date: {orderTime}</div>
                      <div className="text-right">Method: {method}</div>
                    </div>
                    <div className="space-y-1 text-xs font-bold bg-purple-50 p-4 rounded-2xl border border-purple-100">
                        <p className="text-purple-900">Customer: {email}</p>
                        <p className="text-purple-900">Phone: +971 {phone}</p>
                        {method === 'delivery' && <p className="text-purple-900 italic">Address: {emirate}, {city}, {locationDetails.street}, {locationDetails.villa}</p>}
                        {(orderNotes || isGift) && <p className="text-purple-900 text-[10px] mt-2 border-t pt-2 italic">Notes: {isGift ? '🎁 GIFT: ' : ''}{orderNotes}</p>}
                    </div>
                    <div className="space-y-4 py-4 border-b-2 border-dashed border-purple-100">
                      {cart.map(item => (
                        <div key={item.id} className="flex justify-between text-lg font-black text-gray-800">
                          <span>{item.quantity}x {item.nameEn}</span>
                          <span>{(item.price * item.quantity).toFixed(0)} AED</span>
                        </div>
                      ))}
                      {isGift && <div className="flex justify-between text-purple-600 font-bold text-sm"><span>Gift Service Fee</span><span>10 AED</span></div>}
                    </div>
                    <div className="flex justify-between items-center pt-4">
                      <div><span className="text-2xl font-black text-purple-900 block tracking-tighter">TOTAL</span><span className="text-4xl font-black text-purple-600">{total.toFixed(0)} AED</span></div>
                      <div className="bg-white p-2 border-2 rounded-xl shadow-inner"><QRCodeSVG value={finalMapLink} size={80} /></div>
                    </div>
                  </div>
                  <button onClick={downloadReceipt} className="w-full bg-purple-100 dark:bg-white/5 text-purple-900 dark:text-purple-400 py-4 rounded-2xl font-black uppercase tracking-widest">{lang === 'en' ? 'Download Image' : 'حفظ كصورة'}</button>
                  <a href="https://form.jotform.com/zariperfumes/receipt-form" target="_blank" rel="noreferrer" className="w-full bg-emerald-600 text-white py-6 rounded-3xl font-black text-2xl shadow-xl block">{lang === 'en' ? 'UPLOAD SCREENSHOT →' : 'ارفع الصورة هنا ←'}</a>
                  <button onClick={handleFullReset} className="w-full border-4 border-red-500 text-red-500 py-4 rounded-2xl font-black uppercase text-xs">{lang === 'en' ? 'Finish & Clear Cart' : 'إنهاء وإفراغ السلة'}</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;