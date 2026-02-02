import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../AppContext";
import { UI_STRINGS } from "../translations";
import ProductCard from "../components/ProductCard";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import html2canvas from "html2canvas";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "../supabaseClient";
import canvasConfetti from "canvas-confetti";
import { CreditCard, Banknote, Loader2, CheckCircle2, MapPin } from "lucide-react";

const icon = L.icon({ iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png", shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png", iconSize: [25, 41], iconAnchor: [12, 41] });

const CITY_COORDS: Record<string, [number, number]> = { Dubai: [25.2048, 55.2708], "Abu Dhabi": [24.4539, 54.3773], Sharjah: [25.3463, 55.4209], Ajman: [25.4052, 55.5136], "Umm Al Quwain": [25.5647, 55.5533], "Ras Al Khaimah": [25.7895, 55.9432], Fujairah: [25.1288, 56.3265], "Al Ain City": [24.1302, 55.8023] };

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
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
  const { lang, cart, updateQuantity, removeFromCart, clearCart, recentlyViewed, shippingAddress } = useApp();
  const navigate = useNavigate();
  const receiptRef = useRef<HTMLDivElement>(null);
  const t = (key: string) => UI_STRINGS[key]?.[lang] || key;
  const [dbLocations, setDbLocations] = useState<any[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showClearCartConfirm, setShowClearCartConfirm] = useState(false);
  const [showGiftPopup, setShowGiftPopup] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [saveToProfile, setSaveToProfile] = useState(true);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<"pickup" | "delivery" | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Card">("Card");
  const [emirate, setEmirate] = useState("");
  const [city, setCity] = useState("");
  const [locationDetails, setLocationDetails] = useState({ street: "", villa: "" });
  const [mapCoords, setMapCoords] = useState<[number, number]>([25.4052, 55.5136]);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [mapZoom, setMapZoom] = useState(11);
  const [orderTime] = useState(new Date().toLocaleString());
  const [recommended, setRecommended] = useState<any[]>([]);
  useEffect(() => {
    document.title = lang === "en" ? "Zari Perfumes | Cart" : "عطور زاري | السلة";
  }, [lang]);
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);
    };
    checkUser();
  }, []);
  useEffect(() => {
    const fetchRecommended = async () => {
      const { data } = await supabase.from("products").select("*").limit(10);
      if (data) {
        const shuffled = [...data].sort(() => 0.5 - Math.random()).slice(0, 4);
        setRecommended(shuffled);
      }
    };
    fetchRecommended();
  }, []);
  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);
  const deliveryFee = useMemo(() => {
    if (method === "pickup") return 0;
    const loc = dbLocations.find((l) => l.emirateEn === emirate && l.city === city);
    return loc ? loc.cost : 0;
  }, [method, emirate, city, dbLocations]);
  const discountAmount = useMemo(() => (appliedCoupon ? Math.round((subtotal * appliedCoupon.discount) / 100) : 0), [subtotal, appliedCoupon]);
  const total = useMemo(() => Math.round(subtotal - discountAmount + (deliveryFee || 0) + (isGift ? 10 : 0)), [subtotal, discountAmount, deliveryFee, isGift]);
  const applyCoupon = async () => {
    setCouponError("");
    const { data, error } = await supabase.from("coupons").select("*").eq("code", couponCode.toUpperCase()).eq("active", true).single();
    if (error || !data) {
      setCouponError(lang === "en" ? "Invalid or inactive code" : "كود غير صحيح");
      return;
    }
    if (data.times_used >= data.usage_limit) {
      setCouponError(lang === "en" ? "This coupon has expired" : "انتهت صلاحية الكود");
      return;
    }
    setAppliedCoupon({ code: data.code, discount: data.discount_percent });
  };
  const downloadReceipt = async () => {
    if (!receiptRef.current) return;
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          const allElements = clonedDoc.getElementsByTagName("*");
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i] as HTMLElement;
            const style = window.getComputedStyle(el);
            if (style.color.includes("oklch")) el.style.color = "#000000";
            if (style.backgroundColor.includes("oklch")) el.style.backgroundColor = "transparent";
            if (style.borderColor.includes("oklch")) el.style.borderColor = "#eeeeee";
          }
        },
      });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `Zari-Receipt-${Date.now()}.png`;
      link.click();
    } catch (err) {
      console.error("Receipt capture failed", err);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    // Fixed map link formatting
    const googleMapsLink = `https://www.google.com/maps?q=${mapCoords[0]},${mapCoords[1]}`;

    // Construct full address string for the database
    const addressStr = method === "delivery" ? `${emirate}, ${city}, ${locationDetails.street}, Villa/Apt: ${locationDetails.villa}` : "Pickup from Store";

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            user_id: userId,
            customer_email: email,
            customer_phone: phone,
            total_amount: total,
            method: paymentMethod,
            address: addressStr,
            is_gift: isGift,
            // Storing coordinates in notes for the admin/driver
            notes: `${orderNotes}${method === "delivery" ? `\nMap: ${googleMapsLink}` : ""}`,
            coupon_code: appliedCoupon?.code || null,
            status: "waiting",
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;
      const itemsToInsert = cart.map((item) => {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.id?.toString());
        return {
          order_id: order.id,
          product_id: isUUID ? item.id : null,
          product_name: lang === "en" ? item.nameEn : item.nameAr,
          price: item.price,
          quantity: item.quantity,
        };
      });
      const { error: itemsError } = await supabase.from("order_items").insert(itemsToInsert);
      if (itemsError) {
        console.error("Item Insert Error:", itemsError);
        throw itemsError;
      }
      // Sync the new address back to the profile if they are logged in
      if (userId && saveToProfile && method === "delivery") {
        await supabase
          .from("profiles")
          .update({
            emirate,
            city,
            street: locationDetails.street,
            extra_info: locationDetails.villa,
            lat: mapCoords[0],
            lng: mapCoords[1],
          })
          .eq("id", userId);
      }

      canvasConfetti({
        /* your confetti config */
      });
      setOrderSuccess(true);

      setTimeout(() => {
        clearCart();
        navigate("/account"); // Redirect to account so they see the receipt
      }, 3000);
    } catch (err: any) {
      console.error(err);
      alert("Order failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setEmail(session.user.email || "");
        const { data: profile } = await supabase.from("profiles").select("phone").eq("id", session.user.id).single();
        if (profile?.phone) setPhone(profile.phone.replace(/\D/g, "").slice(-9));
      }
    };
    if (showCheckout) fetchUserData();
  }, [showCheckout]);
  useEffect(() => {
    const fetchLocations = async () => {
      const { data } = await supabase.from("locations").select("*");
      if (data) setDbLocations(data);
    };
    fetchLocations();
  }, []);
  const handleCombinedClick = async () => {
    await downloadReceipt();
    handleFinish();
  };

  useEffect(() => {
    if (showCheckout && shippingAddress.emirate) {
      setMethod("delivery");
      setEmirate(shippingAddress.emirate);
      setCity(shippingAddress.city || "");

      setLocationDetails({
        street: shippingAddress.street || "",
        villa: shippingAddress.villa || shippingAddress.extra_info || "",
      });

      if (shippingAddress.lat && shippingAddress.lng) {
        setMapCoords([shippingAddress.lat, shippingAddress.lng]);
        setMapZoom(15);
      }
    }
  }, [showCheckout, shippingAddress]);

  useEffect(() => {
    if (emirate && CITY_COORDS[emirate]) {
      setMapCoords(CITY_COORDS[emirate]);
      setMapZoom(13);
    }
  }, [emirate]);
  const uniqueEmirates = useMemo(() => Array.from(new Set(dbLocations.map((loc) => loc.emirateEn))).sort(), [dbLocations]);
  const filteredCities = useMemo(
    () =>
      dbLocations
        .filter((loc) => loc.emirateEn === emirate)
        .map((loc) => loc.city)
        .sort(),
    [emirate, dbLocations],
  );
  const isStep1Valid = method === "pickup" || (method === "delivery" && emirate !== "" && city !== "");
  const isStep2Valid = phone.length >= 9 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (method === "pickup" || (locationDetails.street !== "" && locationDetails.villa !== ""));
  const finalMapLink = method === "pickup" ? "https://zariperfumes.github.io" : `https://www.google.com/maps?q=${mapCoords[0]},${mapCoords[1]}`;
  if (orderSuccess) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-white dark:bg-purple-950 p-6 text-center'>
        <CheckCircle2 size={100} className='text-emerald-500 mb-6 animate-bounce' />
        <h1 className='text-5xl font-black dark:text-white mb-4'>{lang === "en" ? "Order Placed!" : "تم تقديم الطلب!"}</h1>
        <p className='text-gray-500 font-bold text-xl'>{lang === "en" ? "Redirecting to home..." : "جاري العودة للرئيسية..."}</p>
      </div>
    );
  }
  return (
    <div className='pt-16 pb-20 bg-gray-50/50 dark:bg-purple-950 transition-colors duration-300 min-h-screen w-full' dir={lang === "ar" ? "rtl" : "ltr"}>
      {showClearCartConfirm && (
        <div className='fixed inset-0 z-150 flex items-center justify-center p-6 bg-black/40 backdrop-blur-xl'>
          <div className='bg-white dark:bg-purple-900 p-12 rounded-[48px] shadow-2xl max-w-md w-full text-center border dark:border-white/10'>
            <h4 className='text-3xl font-black mb-10 dark:text-white'>{lang === "en" ? "Clear cart?" : "مسح السلة؟"}</h4>
            <button
              onClick={() => {
                clearCart();
                setShowClearCartConfirm(false);
              }}
              className='w-full bg-gray-900 text-white dark:bg-white dark:text-purple-900 py-5 rounded-3xl font-bold mb-4'>
              {lang === "en" ? "Yes, Clear" : "نعم، امسح"}
            </button>
            <button onClick={() => setShowClearCartConfirm(false)} className='w-full text-gray-400 font-bold'>
              {lang === "en" ? "Cancel" : "إلغاء"}
            </button>
          </div>
        </div>
      )}

      {showAuthPrompt && (
        <div className='fixed inset-0 z-150 flex items-center justify-center p-6 bg-black/40 backdrop-blur-xl'>
          <div className='bg-white dark:bg-purple-900 p-10 rounded-[48px] shadow-2xl max-w-lg w-full border dark:border-white/10 text-center'>
            <h3 className='text-4xl font-black mb-6 dark:text-white'>{lang === "en" ? "Wait!" : "انتظر!"}</h3>
            <p className='text-gray-500 font-bold mb-10'>{lang === "en" ? "Log in to track your orders and save your address for next time." : "سجل دخولك لتتبع طلباتك وحفظ عنوانك للمرة القادمة."}</p>
            <div className='space-y-4'>
              <button onClick={() => navigate("/account")} className='w-full bg-purple-600 text-white py-5 rounded-3xl font-black text-xl shadow-xl'>
                {lang === "en" ? "Login / Sign Up" : "دخول / تسجيل"}
              </button>
              <button
                onClick={() => {
                  setIsGuest(true);
                  setShowAuthPrompt(false);
                  setShowCheckout(true);
                }}
                className='w-full bg-gray-100 dark:bg-white/5 dark:text-white py-5 rounded-3xl font-black'>
                {lang === "en" ? "Continue as Guest" : "المتابعة كضيف"}
              </button>

              <button onClick={() => setShowAuthPrompt(false)} className='w-full text-gray-400 font-bold text-sm'>
                {lang === "en" ? "Back to Cart" : "العودة للسلة"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showGiftPopup && (
        <div className='fixed inset-0 z-150 flex items-center justify-center p-6 bg-black/40 backdrop-blur-xl'>
          <div className='bg-white dark:bg-purple-900 p-10 rounded-[48px] shadow-2xl max-w-lg w-full border dark:border-white/10'>
            <h4 className='text-3xl font-black mb-4 dark:text-white text-center'>🎁 {lang === "en" ? "Gift Service (+10 AED)" : "خدمة الهدايا (+10 AED)"}</h4>

            <textarea
              value={orderNotes}
              onChange={(e) => {
                setOrderNotes(e.target.value);
                setIsGift(true);
              }}
              placeholder={lang === "en" ? "Write your message..." : "اكتب رسالتك..."}
              className='w-full p-5 bg-purple-50 dark:bg-white/5 dark:text-white rounded-3xl font-black outline-none min-h-30 mb-6 border-2 border-purple-100 dark:border-white/10'
            />

            <button onClick={() => setShowGiftPopup(false)} className='w-full bg-purple-600 text-white py-5 rounded-3xl font-black shadow-xl mb-4'>
              {lang === "en" ? "Save & Close" : "حفظ وإغلاق"}
            </button>

            <button
              onClick={() => {
                setIsGift(false);
                setOrderNotes("");
                setShowGiftPopup(false);
              }}
              className='w-full text-gray-400 font-bold text-sm'>
              {lang === "en" ? "Remove Gift Service" : "إزالة خدمة الهدايا"}
            </button>
          </div>
        </div>
      )}

      <div className='h-62.5 mb-12 bg-linear-to-br from-purple-950 to-purple-800 flex items-center justify-center text-white text-center w-full'>
        <h1 className='text-6xl font-black tracking-tighter'>{t("cart")}</h1>
      </div>

      <div className='max-w-400 mx-auto px-6'>
        {cart.length === 0 && !showCheckout ? (
          <div className='py-20 text-center'>
            <h2 className='text-4xl font-black mb-6 text-purple-900 dark:text-purple-400'>{t("emptyCart")}</h2>

            <Link to='/explore' className='bg-purple-600 text-white px-12 py-5 rounded-full font-black text-xl'>
              {t("continueShopping")}
            </Link>
          </div>
        ) : (
          <div className='lg:flex gap-12'>
            <div className='lg:w-2/3 space-y-6'>
              {cart.map((item) => (
                <div key={item.id} className='bg-white dark:bg-purple-900 p-8 rounded-4xl shadow-sm border border-purple-50 dark:border-white/5 flex items-center gap-8 relative overflow-hidden transition-all hover:shadow-md'>
                  <Link to={`/product/${item.id}`} className='shrink-0'>
                    <img src={item.image} className='w-32 h-32 rounded-3xl object-cover' alt='' />
                  </Link>

                  <div className='grow'>
                    <Link to={`/product/${item.id}`}>
                      <h3 className='text-2xl font-black dark:text-white hover:text-purple-600 transition-colors'>{lang === "en" ? item.nameEn : item.nameAr}</h3>
                    </Link>

                    <p className='text-purple-600 dark:text-purple-400 font-bold'>{item.price} AED</p>

                    <div className='flex items-center bg-purple-50 dark:bg-white/5 dark:text-white w-fit rounded-2xl p-1.5 mt-4 gap-6'>
                      <button onClick={() => (item.quantity === 1 ? removeFromCart(item.id) : updateQuantity(item.id, -1))} className='font-black text-xl px-2'>
                        -
                      </button>

                      <span className='font-black text-xl'>{item.quantity}</span>

                      <button onClick={() => updateQuantity(item.id, 1)} className='font-black text-xl px-2'>
                        +
                      </button>
                    </div>
                  </div>

                  <button onClick={() => removeFromCart(item.id)} className='absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors'>
                    ✕
                  </button>
                </div>
              ))}

              <button onClick={() => setShowClearCartConfirm(true)} className='text-red-500 font-black uppercase text-sm tracking-widest p-4'>
                {lang === "en" ? "Clear All Items" : "مسح كل العناصر"}
              </button>
            </div>

            <div className='lg:w-1/3'>
              <div className='bg-white dark:bg-purple-900 p-10 rounded-[48px] shadow-2xl border border-purple-100 dark:border-white/10 sticky top-32'>
                <h3 className='text-3xl font-black mb-8 dark:text-white'>{t("orderSummary")}</h3>

                <div className='flex gap-2 mb-6'>
                  <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder={lang === "en" ? "COUPON" : "كود الخصم"} className='flex-1 p-4 bg-gray-50 dark:bg-white/5 dark:text-white rounded-2xl font-black border dark:border-white/10 uppercase outline-none' />

                  <button onClick={applyCoupon} className='bg-purple-600 text-white px-6 rounded-2xl font-black'>
                    APPLY
                  </button>
                </div>

                {couponError && <p className='text-red-500 text-xs font-bold mb-4'>{couponError}</p>}

                <div className='space-y-4 border-b dark:border-white/10 pb-8 mb-8 text-xl font-bold dark:text-gray-300'>
                  <div className='flex justify-between'>
                    <span>{lang === "en" ? "Subtotal" : "المجموع الفرعي"}</span>
                    <span>{subtotal} AED</span>
                  </div>

                  {appliedCoupon && (
                    <div className='flex justify-between text-emerald-500'>
                      <span>{lang === "en" ? "Discount" : "خصم"}</span>
                      <span>-{discountAmount} AED</span>
                    </div>
                  )}

                  {isGift && (
                    <div className='flex justify-between text-purple-600 dark:text-purple-400'>
                      <span>🎁 {lang === "en" ? "Gift" : "هدية"}</span>
                      <span>10 AED</span>
                    </div>
                  )}

                  {deliveryFee > 0 && (
                    <div className='flex justify-between text-purple-600 dark:text-purple-400'>
                      <span>{t("delivery")}</span>
                      <span>{deliveryFee} AED</span>
                    </div>
                  )}
                </div>

                <div className='flex justify-between items-center mb-10 text-3xl font-black dark:text-white'>
                  <span>{t("total")}</span>
                  <span className='text-purple-600 dark:text-purple-400'>{total.toFixed(0)} AED</span>
                </div>

                <div className='space-y-4'>
                  <button onClick={() => (currentUser || isGuest ? setShowCheckout(true) : setShowAuthPrompt(true))} className='w-full bg-purple-600 text-white py-6 rounded-[28px] font-black text-2xl shadow-xl'>
                    {t("proceedToCheckout")}
                  </button>

                  <button onClick={() => setShowGiftPopup(true)} className={`w-full py-4 rounded-[28px] font-black flex items-center justify-center gap-3 border-2 transition-all ${isGift ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-600" : "border-purple-200 dark:border-white/10 text-purple-600 dark:text-purple-400"}`}>
                    <span>{isGift ? "✔️" : "🎁"}</span>
                    {lang === "en" ? "Is this a gift?" : "هل هذه هدية؟"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCheckout && (
        <div className='fixed inset-0 z-100 flex items-center justify-center p-4 bg-purple-950/40 backdrop-blur-md'>
          <div className='bg-white dark:bg-purple-900 rounded-[56px] w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] relative'>
            <div className='bg-purple-900 dark:bg-black p-10 text-white flex justify-between items-center relative overflow-hidden'>
              <div className='absolute bottom-0 left-0 h-1 bg-purple-400 transition-all duration-500' style={{ width: `${(step / 4) * 100}%` }}></div>
              <button onClick={() => setShowExitConfirm(true)} className='text-3xl font-bold z-10 hover:text-purple-300 transition-colors'>
                ✕
              </button>
              <div className='flex items-center gap-10 z-10'>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all ${step >= i ? "bg-white text-purple-900" : "bg-white/10"}`}>
                    {i}
                  </div>
                ))}
              </div>
            </div>

            {showExitConfirm && (
              <div className='absolute inset-0 z-110 bg-purple-900/95 flex items-center justify-center p-8'>
                <div className='bg-white dark:bg-purple-900 p-10 rounded-[40px] text-center max-w-sm'>
                  <h4 className='text-2xl font-black mb-6 dark:text-white'>{lang === "en" ? "Close Checkout?" : "إغلاق الدفع؟"}</h4>
                  <button
                    onClick={() => {
                      setShowCheckout(false);
                      setShowExitConfirm(false);
                      setStep(1);
                    }}
                    className='w-full bg-purple-600 text-white py-4 rounded-2xl font-black mb-2'>
                    {lang === "en" ? "Close" : "إغلاق"}
                  </button>
                  <button onClick={() => setShowExitConfirm(false)} className='w-full text-gray-500 font-bold'>
                    {lang === "en" ? "Stay" : "البقاء"}
                  </button>
                </div>
              </div>
            )}

            <div className='p-10 lg:p-14 overflow-y-auto grow'>
              {step === 1 && (
                <div className='space-y-8 animate-in fade-in slide-in-from-bottom-4'>
                  <div className='grid grid-cols-2 gap-6'>
                    <button
                      onClick={() => {
                        setMethod("pickup");
                        setCity("");
                        setEmirate("");
                      }}
                      className={`p-8 rounded-4xl border-4 font-black text-xl transition-all ${method === "pickup" ? "border-purple-600 bg-purple-50 dark:bg-purple-800 dark:text-white" : "border-gray-50 dark:border-white/5 dark:text-gray-400"}`}>
                      {lang === "en" ? "Pickup" : "استلام"}
                    </button>
                    <button onClick={() => setMethod("delivery")} className={`p-8 rounded-4xl border-4 font-black text-xl transition-all ${method === "delivery" ? "border-purple-600 bg-purple-50 dark:bg-purple-800 dark:text-white" : "border-gray-50 dark:border-white/5 dark:text-gray-400"}`}>
                      {lang === "en" ? "Delivery" : "توصيل"}
                    </button>
                  </div>
                  {method === "delivery" && (
                    <div className='grid gap-6'>
                      <select
                        value={emirate}
                        onChange={(e) => {
                          setEmirate(e.target.value);
                          setCity("");
                        }}
                        className='p-6 bg-purple-50 dark:bg-white/5 dark:text-white rounded-3xl font-black outline-none appearance-none'>
                        <option value=''>{lang === "en" ? "Select Emirate" : "اختر الإمارة"}</option>
                        {uniqueEmirates.map((e) => (
                          <option key={e} value={e}>
                            {e}
                          </option>
                        ))}
                      </select>
                      <select value={city} onChange={(e) => setCity(e.target.value)} disabled={!emirate} className='p-6 bg-purple-50 dark:bg-white/5 dark:text-white rounded-3xl font-black outline-none appearance-none disabled:opacity-50'>
                        <option value=''>{lang === "en" ? "Select City" : "اختر المدينة"}</option>
                        {filteredCities.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <button disabled={!isStep1Valid} onClick={() => setStep(2)} className='w-full bg-purple-600 text-white py-6 rounded-[28px] font-black text-xl shadow-xl'>
                    {lang === "en" ? "Continue" : "متابعة"} →
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className='space-y-6 animate-in fade-in slide-in-from-bottom-4'>
                  {method === "delivery" && (
                    <div className='space-y-4'>
                      <div className='h-64 rounded-4xl overflow-hidden border-4 border-white dark:border-white/10 shadow-lg relative z-0'>
                        <MapContainer center={mapCoords} zoom={mapZoom} style={{ height: "100%", cursor: "crosshair" }}>
                          <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
                          <Marker position={mapCoords} icon={icon} />
                          <ChangeView center={mapCoords} zoom={mapZoom} />
                          <MapEvents setCoords={setMapCoords} />
                        </MapContainer>
                        {/* Locate Me Button */}
                        <button
                          onClick={() => {
                            if (navigator.geolocation) {
                              navigator.geolocation.getCurrentPosition((pos) => {
                                setMapCoords([pos.coords.latitude, pos.coords.longitude]);
                                setMapZoom(16);
                              });
                            }
                          }}
                          className='absolute top-4 left-4 z-1000 bg-white dark:bg-purple-900 p-3 rounded-xl shadow-xl'>
                          <MapPin size={20} className='text-purple-600' />
                        </button>
                      </div>

                      {/* Place the grid here */}
                      <div className='grid grid-cols-2 gap-4'>
                        <input
                          value={locationDetails.street}
                          placeholder={lang === "en" ? "Street Name" : "اسم الشارع"}
                          className='p-5 bg-purple-50 dark:bg-white/5 dark:text-white rounded-[20px] font-black outline-none'
                          onChange={(e) =>
                            setLocationDetails({
                              ...locationDetails,
                              street: e.target.value,
                            })
                          }
                        />
                        <input
                          value={locationDetails.villa}
                          placeholder={lang === "en" ? "Villa / Apt No." : "رقم الفيلا / الشقة"}
                          className='p-5 bg-purple-50 dark:bg-white/5 dark:text-white rounded-[20px] font-black outline-none'
                          onChange={(e) =>
                            setLocationDetails({
                              ...locationDetails,
                              villa: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  )}
                  <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={lang === "en" ? "Email" : "البريد الإلكتروني"} className='w-full p-5 bg-purple-50 dark:bg-white/5 dark:text-white rounded-[20px] font-black outline-none' />
                  <div className='relative'>
                    <span className='absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold border-r pr-3 dark:border-white/10'>+971</span>
                    <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))} placeholder='501234567' className='w-full pl-24 p-5 bg-purple-50 dark:bg-white/5 dark:text-white rounded-[20px] font-black outline-none' />
                  </div>
                  <div className='flex gap-4'>
                    <button onClick={() => setStep(1)} className='w-1/3 bg-gray-100 dark:bg-white/5 dark:text-white py-6 rounded-[28px] font-black'>
                      {lang === "en" ? "Back" : "رجوع"}
                    </button>
                    <button disabled={!isStep2Valid} onClick={() => setStep(3)} className='flex-1 bg-purple-600 text-white py-6 rounded-[28px] font-black shadow-xl'>
                      {lang === "en" ? "Confirm Details" : "تأكيد البيانات"}
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className='space-y-8 animate-in fade-in slide-in-from-bottom-4'>
                  <h3 className='text-3xl font-black dark:text-white text-center'>{lang === "en" ? "Payment Method" : "طريقة الدفع"}</h3>
                  <div className='grid grid-cols-2 gap-6'>
                    <button onClick={() => setPaymentMethod("Card")} className={`p-10 rounded-4xl border-4 flex flex-col items-center gap-4 transition-all ${paymentMethod === "Card" ? "border-purple-600 bg-purple-50 dark:bg-purple-800 dark:text-white" : "border-gray-50 dark:border-white/5 dark:text-gray-400"}`}>
                      <CreditCard size={40} className={paymentMethod === "Card" ? "text-purple-600" : "text-gray-400"} />
                      <span className='font-black text-xl'>Bank Transfer</span>
                    </button>
                    <button onClick={() => setPaymentMethod("Cash")} className={`p-10 rounded-4xl border-4 flex flex-col items-center gap-4 transition-all ${paymentMethod === "Cash" ? "border-purple-600 bg-purple-50 dark:bg-purple-800 dark:text-white" : "border-gray-50 dark:border-white/5 dark:text-gray-400"}`}>
                      <Banknote size={40} className={paymentMethod === "Cash" ? "text-purple-600" : "text-gray-400"} />
                      <span className='font-black text-xl'>Cash</span>
                    </button>
                  </div>
                  <div className='flex gap-4'>
                    <button onClick={() => setStep(2)} className='w-1/3 bg-gray-100 dark:bg-white/5 dark:text-white py-6 rounded-[28px] font-black'>
                      {lang === "en" ? "Back" : "رجوع"}
                    </button>
                    <button onClick={() => setStep(4)} className='flex-1 bg-purple-600 text-white py-6 rounded-[28px] font-black shadow-xl'>
                      {lang === "en" ? "Review Order" : "مراجعة الطلب"}
                    </button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className='text-center space-y-6 animate-in fade-in slide-in-from-bottom-4'>
                  <div ref={receiptRef} className='bg-white p-10 rounded-[40px] border-8 border-purple-50 text-left space-y-6 shadow-2xl relative overflow-hidden' dir='ltr'>
                    <h2 className='text-3xl font-black text-purple-900 italic tracking-tighter'>ZARI PERFUMES</h2>
                    {isGift && <div className='absolute top-8 right-8 border-2 border-emerald-500 text-emerald-500 px-3 py-1 rounded-lg text-[10px] font-black rotate-12'>GIFT WRAPPED</div>}

                    <div className='grid grid-cols-2 gap-4 text-[10px] font-black uppercase text-gray-400 border-b pb-4'>
                      <div>Date: {orderTime}</div>
                      <div className='text-right'>Pay: {paymentMethod}</div>
                    </div>

                    <div className='space-y-1 text-xs font-bold bg-purple-50 p-4 rounded-2xl border border-purple-100'>
                      <p className='text-purple-900'>Customer: {email}</p>
                      <p className='text-purple-900'>Phone: +971 {phone}</p>

                      {method === "delivery" ? (
                        <div className='text-purple-900 mt-2 pt-2 border-t border-purple-100/50'>
                          <p className='font-black text-[10px] uppercase text-purple-400'>Delivery Address:</p>
                          <p>
                            {emirate}, {city}
                          </p>
                          <p>{locationDetails.street}</p>
                          <p>Villa/Apt: {locationDetails.villa}</p>
                        </div>
                      ) : (
                        <p className='text-emerald-600 font-black mt-2 pt-2 border-t border-purple-100/50 uppercase'>Method: Self-Pickup</p>
                      )}

                      {orderNotes && <p className='text-purple-900 text-[10px] mt-2 border-t pt-2 italic'>Notes: {orderNotes}</p>}
                    </div>

                    <div className='space-y-4 py-4 border-b-2 border-dashed border-purple-100'>
                      {cart.map((item) => (
                        <div key={item.id} className='flex justify-between text-lg font-black text-gray-800'>
                          <span>
                            {item.quantity}x {item.nameEn}
                          </span>
                          <span>{(item.price * item.quantity).toFixed(0)} AED</span>
                        </div>
                      ))}
                    </div>

                    {/* Totals Section */}
                    <div className='space-y-1 text-right text-xs font-bold text-gray-400'>
                      <div className='flex justify-between'>
                        <span>Subtotal:</span>
                        <span>{subtotal} AED</span>
                      </div>
                      {deliveryFee > 0 && (
                        <div className='flex justify-between'>
                          <span>Delivery:</span>
                          <span>{deliveryFee} AED</span>
                        </div>
                      )}
                      {isGift && (
                        <div className='flex justify-between'>
                          <span>Gift Service:</span>
                          <span>10 AED</span>
                        </div>
                      )}
                      {appliedCoupon && (
                        <div className='flex justify-between text-emerald-500'>
                          <span>Discount ({appliedCoupon.code}):</span>
                          <span>-{discountAmount} AED</span>
                        </div>
                      )}
                    </div>

                    <div className='flex justify-between items-center pt-4 border-t-2 border-purple-100'>
                      <div>
                        <span className='text-2xl font-black text-purple-900 block tracking-tighter'>TOTAL</span>
                        <span className='text-4xl font-black text-purple-600'>{total.toFixed(0)} AED</span>
                      </div>
                      <div className='bg-white p-2 border-2 rounded-xl shadow-inner'>
                        <QRCodeSVG value={finalMapLink} size={80} />
                      </div>
                    </div>
                  </div>

                  <div className='flex gap-4'>
                    <button onClick={() => setStep(3)} className='w-1/4 bg-gray-100 dark:bg-white/5 dark:text-white py-6 rounded-[28px] font-black'>
                      {lang === "en" ? "Back" : "رجوع"}
                    </button>
                    <button onClick={handleCombinedClick} disabled={loading} className='flex-1 bg-emerald-600 text-white py-6 rounded-3xl font-black text-2xl shadow-xl flex items-center justify-center gap-3'>
                      {loading ? <Loader2 className='animate-spin' /> : null}
                      {lang === "en" ? "PLACE ORDER NOW →" : "إتمام الطلب الآن ←"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!showCheckout && recommended.length > 0 && (
        <div className='max-w-400 mx-auto px-6 mt-32'>
          <h2 className='text-3xl font-black mb-10 dark:text-white'>{lang === "en" ? "Recommended For You" : "مقترح لك"}</h2>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
            {recommended.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
