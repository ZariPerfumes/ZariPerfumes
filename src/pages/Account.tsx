import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { auth } from "../../firebaseConfig";
import { supabase } from "../supabaseClient";
import { useApp } from "../AppContext";
import { User, LogOut, Eye, EyeOff, MapPin, ShieldCheck, Loader2, ShoppingBag, Save, ChevronDown, RotateCcw, ChevronUp, Trash2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const DEFAULT_LAT = 25.4052;
const DEFAULT_LNG = 55.5136;

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center[0] && center[1]) map.setView(center, 13);
  }, [center]);
  return null;
}

const Account: React.FC = () => {
  const { lang, setShippingAddress, addToCart } = useApp();
  const [mode, setMode] = useState<"login" | "signup" | "otp">("login");
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "orders">("profile");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [editingField, setEditingField] = useState<"password" | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [dbLocations, setDbLocations] = useState<any[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);

  const [profile, setProfile] = useState<any>({
    email: "",
    phone: "",
    full_name: "",
    address: "",
  });

  const handleDownloadReceipt = async (orderId: string) => {
    const element = document.getElementById(`receipt-${orderId}`);
    if (!element) return;

    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: 800, // Forces a wider view for the capture
      });

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png", 1.0);
      link.download = `Zari-Receipt-${orderId.slice(0, 5)}.png`;
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  useEffect(() => {
    if (user && setShippingAddress) {
      setShippingAddress(profile);
    }
  }, [profile, user, setShippingAddress]);

  useEffect(() => {
    document.title = lang === "en" ? "Zari Perfumes | Account" : "عطور زاري | الحساب";
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
        await fetchOrders(session.user.id);
      }
      setIsInitializing(false);
    };
    checkSession();
    fetchLocations();
  }, [lang]);

  const fetchLocations = async () => {
    const { data } = await supabase.from("locations").select("*");
    if (data) setDbLocations(data);
  };

  const uniqueEmirates = useMemo(() => Array.from(new Set(dbLocations.map((loc) => loc.emirateEn))).sort(), [dbLocations]);
  const filteredCities = useMemo(
    () =>
      dbLocations
        .filter((loc) => loc.emirateEn === profile.emirate)
        .map((loc) => loc.city)
        .sort(),
    [profile.emirate, dbLocations],
  );

  const fetchProfile = async (id: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", id).single();
    if (data) {
      const p = { ...data, lat: Number(data.lat) || DEFAULT_LAT, lng: Number(data.lng) || DEFAULT_LNG };
      setProfile(p);
      if (setShippingAddress) setShippingAddress(p);
    }
  };

  const fetchOrders = async (userId?: string) => {
    let targetId = userId;

    if (!targetId) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      targetId = session?.user?.id;
    }

    if (!targetId) {
      console.error("No user ID found");
      return;
    }

    console.log("Fetching orders for ID:", targetId);

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
    *,
    order_items!order_items_order_id_fkey (*)
  `,
      ) // !relationship_name tells Supabase exactly which link to follow
      .eq("user_id", targetId)
      .order("created_at", { ascending: false });

    if (!error) {
      setOrders(data || []);
    } else {
      console.error("Supabase Error:", error.message);
    }
  };

  const handleReorder = (orderItems: any[]) => {
    orderItems.forEach((item) => {
      addToCart({
        id: item.product_id,
        nameEn: item.product_name,
        nameAr: item.product_name,
        price: item.price,
        image: item.image_url || "",
      } as any);
    });
    setSuccess(lang === "en" ? "Items added to cart" : "تمت إضافة المنتجات للسلة");
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setProfile((prev) => ({ ...prev, lat: pos.coords.latitude, lng: pos.coords.longitude }));
      });
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    const { error: err } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        emirate: profile.emirate,
        city: profile.city,
        street: profile.street,
        extra_info: profile.extra_info,
        lat: profile.lat,
        lng: profile.lng,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    if (!err) {
      setSuccess(lang === "en" ? "Profile saved" : "تم حفظ الملف");
      setTimeout(() => setSuccess(null), 3000);
    } else setError(err.message);
    setLoading(false);
  };

  const setupRecaptcha = () => {
    if ((window as any).recaptchaVerifier) return;
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" });
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await supabase.rpc("get_email_from_identifier", { identifier: identifier.trim() });
      if (!data?.[0]?.email) throw new Error(lang === "en" ? "User not found" : "المستخدم غير موجود");
      const { error: loginError } = await supabase.auth.signInWithPassword({ email: data[0].email, password });
      if (loginError) throw loginError;
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!identifier) {
      setError(lang === "en" ? "Please enter your email first" : "يرجى إدخال البريد الإلكتروني أولاً");
      return;
    }
    setLoading(true);
    try {
      const { data } = await supabase.rpc("get_email_from_identifier", { identifier: identifier.trim() });
      const targetEmail = data?.[0]?.email || identifier.trim();
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(targetEmail, {
        redirectTo: `${window.location.origin}/#/resetpassword`,
      });
      if (resetErr) throw resetErr;
      setSuccess(lang === "en" ? "Reset link sent" : "تم إرسال رابط إعادة التعيين");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled" }) // Or .delete() if you want it removed entirely
      .eq("id", orderId);

    if (!error) {
      fetchOrders(); // Refresh the list
    }
  };

  const handleSignupRequest = async () => {
    setLoading(true);
    setupRecaptcha();
    let clean = phone.replace(/\D/g, "").replace(/^0/, "");
    try {
      const confirmation = await signInWithPhoneNumber(auth, `+971${clean}`, (window as any).recaptchaVerifier);
      setConfirmationResult(confirmation);
      setMode("otp");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpAndSignup = async () => {
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      const { data: authData, error: sbError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { full_name: fullName, phone: phone } },
      });
      if (sbError) throw sbError;
      if (authData.user) {
        await supabase.from("profiles").upsert({ id: authData.user.id, full_name: fullName, phone: phone, email: email.toLowerCase(), lat: DEFAULT_LAT, lng: DEFAULT_LNG });
      }
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setError(error.message);
    else {
      setSuccess(lang === "en" ? "Password updated" : "تم التحديث");
      setEditingField(null);
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    const { error } = await supabase.rpc("delete_user");
    if (error) setError(error.message);
    else {
      await supabase.auth.signOut();
      window.location.reload();
    }
    setLoading(false);
  };

  function MapEvents() {
    useMapEvents({
      click(e) {
        setProfile((p) => ({ ...p, lat: e.latlng.lat, lng: e.latlng.lng }));
      },
    });
    return null;
  }

  const toggleOrder = (id: string) => {
    setExpandedOrders((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  if (isInitializing)
    return (
      <div className='min-h-screen flex items-center justify-center dark:bg-purple-950'>
        <Loader2 className='animate-spin text-purple-600' size={40} />
      </div>
    );

  return (
    <div className='min-h-screen bg-white dark:bg-purple-950 pt-20 md:pt-32 pb-10 px-4' dir={lang === "ar" ? "rtl" : "ltr"}>
      <div id='recaptcha-container'></div>

      <div className='container mx-auto max-w-5xl'>
        {!user ? (
          <div className='bg-gray-50 dark:bg-purple-900/10 rounded-[30px] p-6 md:p-16 shadow-2xl border dark:border-white/5 max-w-xl mx-auto'>
            <div className='flex bg-white/50 dark:bg-purple-900/40 p-2 rounded-full mb-8'>
              <button onClick={() => setMode("login")} className={`flex-1 py-3 rounded-full font-black text-sm ${mode === "login" ? "bg-purple-600 text-white" : "dark:text-gray-400"}`}>
                {lang === "en" ? "Login" : "دخول"}
              </button>
              <button onClick={() => setMode("signup")} className={`flex-1 py-3 rounded-full font-black text-sm ${mode === "signup" ? "bg-purple-600 text-white" : "dark:text-gray-400"}`}>
                {lang === "en" ? "Signup" : "تسجيل"}
              </button>
            </div>
            <div className='space-y-4'>
              {error && <div className='p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-black border border-red-100'>{error}</div>}
              {success && <div className='p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-xs font-black border border-emerald-100'>{success}</div>}

              {mode === "otp" ? (
                <div className='text-center space-y-6'>
                  <input type='text' maxLength={6} placeholder='# # # # # #' className='w-full py-4 rounded-3xl dark:bg-purple-900/60 dark:text-white text-center text-4xl font-black outline-none' value={otp} onChange={(e) => setOtp(e.target.value)} />
                  <button onClick={verifyOtpAndSignup} className='w-full py-4 rounded-3xl font-black bg-purple-600 text-white flex items-center justify-center gap-2'>
                    {loading && <Loader2 className='animate-spin' size={20} />} Complete
                  </button>
                </div>
              ) : (
                <>
                  {mode === "signup" && <input type='text' placeholder='Full Name' className='w-full px-6 py-4 rounded-3xl dark:bg-purple-900/60 dark:text-white font-bold outline-none' onChange={(e) => setFullName(e.target.value)} />}
                  <input type='text' placeholder='Email' className='w-full px-6 py-4 rounded-3xl dark:bg-purple-900/60 dark:text-white font-bold outline-none' value={mode === "signup" ? email : identifier} onChange={(e) => (mode === "signup" ? setEmail(e.target.value) : setIdentifier(e.target.value))} />
                  {mode === "signup" && <input type='text' placeholder='Phone' className='w-full px-6 py-4 rounded-3xl dark:bg-purple-900/60 dark:text-white font-bold outline-none' onChange={(e) => setPhone(e.target.value)} />}
                  <div className='relative'>
                    <input type={showPassword ? "text" : "password"} placeholder='Password' className='w-full px-6 py-4 rounded-3xl dark:bg-purple-900/60 dark:text-white font-bold outline-none' onChange={(e) => setPassword(e.target.value)} />
                    <button onClick={() => setShowPassword(!showPassword)} className='absolute right-6 top-1/2 -translate-y-1/2 text-gray-400'>
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {mode === "login" && (
                    <div className='flex justify-start px-2'>
                      <button onClick={handleForgotPassword} className='text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest hover:underline'>
                        Forgot Password?
                      </button>
                    </div>
                  )}
                  <button onClick={() => (mode === "signup" ? handleSignupRequest() : handleLogin())} className='w-full bg-purple-600 text-white py-4 rounded-3xl font-black flex items-center justify-center gap-2 shadow-xl shadow-purple-600/20'>
                    {loading && <Loader2 className='animate-spin' size={20} />} {mode === "login" ? "Login" : "Signup"}
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className='bg-white dark:bg-purple-900/20 rounded-3xl md:rounded-[40px] shadow-2xl border dark:border-white/5 flex flex-col md:flex-row overflow-hidden min-h-[70vh]'>
            <div className='w-full md:w-64 p-4 md:p-8 border-b md:border-b-0 md:border-r dark:border-white/10 bg-gray-50/50 dark:bg-black/20'>
              <nav className='hidden md:block space-y-2'>
                <button onClick={() => setActiveTab("profile")} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black ${activeTab === "profile" ? "bg-purple-600 text-white" : "dark:text-gray-400"}`}>
                  <User size={20} /> Profile
                </button>
                <button onClick={() => setActiveTab("orders")} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black ${activeTab === "orders" ? "bg-purple-600 text-white" : "dark:text-gray-400"}`}>
                  <ShoppingBag size={20} /> Orders
                </button>
                <button onClick={() => setActiveTab("security")} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black ${activeTab === "security" ? "bg-purple-600 text-white" : "dark:text-gray-400"}`}>
                  <ShieldCheck size={20} /> Security
                </button>
                <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} className='w-full flex items-center gap-3 px-6 py-4 text-gray-400 font-black mt-20'>
                  <LogOut size={20} /> Logout
                </button>
              </nav>
            </div>

            <div className='flex-1 p-4 md:p-10 overflow-y-auto max-h-[75vh] md:max-h-[85vh] no-scrollbar'>
              {activeTab === "profile" ? (
                <div className='space-y-6'>
                  <div className='flex justify-between items-center'>
                    <h2 className='text-3xl font-black dark:text-white'>Profile</h2>
                    <button onClick={updateProfile} className='bg-purple-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2'>
                      {loading ? <Loader2 className='animate-spin' size={18} /> : <Save size={18} />} Save
                    </button>
                  </div>
                  {success && <div className='p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-xs font-black'>{success}</div>}
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    <div className='space-y-4'>
                      <div className='p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border dark:border-white/5'>
                        <p className='text-[10px] font-black text-purple-600 uppercase mb-1'>Name</p>
                        <input type='text' value={profile.full_name} onChange={(e) => setProfile((prev) => ({ ...prev, full_name: e.target.value }))} className='bg-transparent font-bold dark:text-white w-full outline-none' />
                      </div>
                      <div className='grid grid-cols-2 gap-4'>
                        <div className='p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border dark:border-white/5'>
                          <p className='text-[10px] font-black text-purple-600 uppercase mb-1'>Emirate</p>
                          <select value={profile.emirate} onChange={(e) => setProfile((prev) => ({ ...prev, emirate: e.target.value, city: "" }))} className='bg-transparent font-bold dark:text-white w-full outline-none'>
                            <option value=''>Select</option>
                            {uniqueEmirates.map((e) => (
                              <option key={e} value={e} className='text-black'>
                                {e}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className='p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border dark:border-white/5'>
                          <p className='text-[10px] font-black text-purple-600 uppercase mb-1'>City</p>
                          <select value={profile.city} onChange={(e) => setProfile((prev) => ({ ...prev, city: e.target.value }))} className='bg-transparent font-bold dark:text-white w-full outline-none'>
                            <option value=''>Select</option>
                            {filteredCities.map((c) => (
                              <option key={c} value={c} className='text-black'>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className='grid grid-cols-2 gap-4'>
                        <div className='p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border dark:border-white/5'>
                          <p className='text-[10px] font-black text-purple-600 uppercase mb-1'>Street</p>
                          <input type='text' value={profile.street} onChange={(e) => setProfile((prev) => ({ ...prev, street: e.target.value }))} className='bg-transparent font-bold dark:text-white w-full outline-none' />
                        </div>
                        <div className='p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border dark:border-white/5'>
                          <p className='text-[10px] font-black text-purple-600 uppercase mb-1'>Villa / Apt</p>
                          <input type='text' value={profile.villa || ""} onChange={(e) => setProfile((prev) => ({ ...prev, villa: e.target.value }))} className='bg-transparent font-bold dark:text-white w-full outline-none' />
                        </div>
                      </div>
                    </div>
                    <div className='h-64 rounded-3xl overflow-hidden relative border dark:border-white/10'>
                      <MapContainer center={[profile.lat, profile.lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
                        <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
                        <Marker position={[profile.lat, profile.lng]} />
                        <MapUpdater center={[profile.lat, profile.lng]} />
                        <MapEvents />
                      </MapContainer>
                      <button onClick={handleLocateMe} className='absolute top-4 left-4 z-1000 bg-white dark:bg-purple-900 p-3 rounded-xl shadow-xl'>
                        <MapPin size={20} className='text-purple-600' />
                      </button>
                    </div>
                  </div>
                </div>
              ) : activeTab === "orders" ? (
                <div className='space-y-6'>
                  <h2 className='text-3xl font-black dark:text-white'>Orders</h2>
                  <div className='flex flex-col items-center w-full'>
                    {orders.length === 0 ? (
                      <div className='text-center py-20 bg-purple-50 dark:bg-white/5 rounded-[40px] border-2 border-dashed border-purple-200 dark:border-white/10 w-full'>
                        <p className='text-purple-900 dark:text-purple-300 font-bold'>No orders found yet.</p>
                      </div>
                    ) : (
                      orders.map((order) => {
                        const isCancelled = order.status === "cancelled";
                        const mapLink = order.notes?.includes("Map:") ? order.notes.split("Map:")[1].trim() : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`;

                        return (
                          <div key={order.id} className='mb-20 flex flex-col items-center w-full'>
                            <div id={`receipt-${order.id}`} className='bg-white rounded-[60px] p-12 shadow-2xl relative overflow-hidden text-left border border-gray-100 mx-auto' style={{ width: "750px", color: "#4c1d95", minHeight: "900px", backgroundColor: "#ffffff" }} dir='ltr'>
                              {isCancelled && (
                                <div className='absolute inset-0 flex items-center justify-center pointer-events-none z-50'>
                                  <div className='border-16 border-red-500 text-red-500 text-9xl font-black uppercase px-12 py-8 rounded-[40px] opacity-20 -rotate-12 tracking-tighter'>CANCELLED</div>
                                </div>
                              )}

                              <div className='flex justify-between items-start mb-4'>
                                <h2 className='text-6xl font-black italic tracking-tighter uppercase' style={{ color: "#4c1d95" }}>
                                  ZARI PERFUMES
                                </h2>
                                {order.gift_wrapped && <div className='border-[3px] border-[#00c076] text-[#00c076] px-5 py-1.5 rounded-2xl text-sm font-black uppercase rotate-[-8deg] bg-white shadow-sm'>GIFT WRAPPED</div>}
                              </div>

                              <div className='flex justify-between text-xs font-black text-gray-400 mb-6 uppercase tracking-[0.2em]'>
                                <span>DATE: {new Date(order.created_at).toLocaleString()}</span>
                                <span>PAY: {order.payment_method || "CASH"}</span>
                              </div>

                              <hr className='border-gray-200 border-t-[3px] mb-10' />

                              <div className='bg-[#fcfaff] rounded-[50px] p-10 mb-12 border border-[#f3ebff]'>
                                <div className='space-y-2 mb-8'>
                                  <p className='text-xl font-black' style={{ color: "#4c1d95" }}>
                                    Customer: <span className='text-[#6b42b3] ml-2 font-bold'>{profile?.email}</span>
                                  </p>
                                  <p className='text-xl font-black' style={{ color: "#4c1d95" }}>
                                    Phone: <span className='text-[#6b42b3] ml-2 font-bold'>{profile?.phone || "+971 502323591"}</span>
                                  </p>
                                </div>

                                <div className='pt-6 border-t-[3px] border-[#4c1d95]'>
                                  <p className='text-xs font-black uppercase tracking-widest mb-2' style={{ color: "#a855f7" }}>
                                    DELIVERY ADDRESS:
                                  </p>
                                  <p className='text-2xl font-black leading-tight' style={{ color: "#4c1d95" }}>
                                    {order.address}
                                  </p>
                                </div>
                              </div>

                              <div className='space-y-10 mb-12 px-4'>
                                {order.order_items?.map((item, i) => (
                                  <div key={i} className='flex justify-between items-center text-3xl font-black' style={{ color: "#1a1a1a" }}>
                                    <span>
                                      {item.quantity}× {item.product_name}
                                    </span>
                                    <span>{(item.price * item.quantity).toFixed(0)} AED</span>
                                  </div>
                                ))}
                              </div>

                              <div className='border-b-[5px] border-dotted border-[#e9e2f5] mb-12 w-full'></div>

                              <div className='space-y-4 text-xl font-bold text-[#a1a1a1] mb-16 px-4'>
                                <div className='flex justify-between'>
                                  <span>Subtotal:</span>
                                  <span style={{ color: "#555" }}>{(order.total_amount - 10).toFixed(2)} AED</span>
                                </div>
                                <div className='flex justify-between'>
                                  <span>Delivery:</span>
                                  <span style={{ color: "#555" }}>10.00 AED</span>
                                </div>
                              </div>

                              <div className='flex justify-between items-end px-4 mt-auto'>
                                <div>
                                  <span className='text-4xl font-black block uppercase tracking-tighter' style={{ color: "#4c1d95" }}>
                                    TOTAL
                                  </span>
                                  <span className={`text-[110px] font-black leading-none ${isCancelled ? "line-through decoration-red-500 opacity-40" : ""}`} style={{ color: "#9333ea" }}>
                                    {order.total_amount} AED
                                  </span>
                                </div>
                                <div className='p-4 border-4 border-black rounded-[35px] bg-white mb-4'>
                                  <QRCodeSVG value={mapLink} size={140} level='H' />
                                </div>
                              </div>
                            </div>

                            <div className='flex justify-center gap-6 mt-12' data-html2canvas-ignore='true'>
                              {!isCancelled ? (
                                <>
                                  {order.status === "waiting" && (
                                    <button onClick={() => setCancellingOrder(order.id)} className='bg-red-50 text-red-500 px-10 py-5 rounded-[25px] font-black text-sm border-2 border-red-100 tracking-[0.2em]'>
                                      CANCEL ORDER
                                    </button>
                                  )}
                                  <button onClick={() => handleDownloadReceipt(order.id)} className='bg-gray-100 text-gray-700 px-10 py-5 rounded-[25px] font-black text-sm border-2 border-gray-200 tracking-[0.2em]'>
                                    DOWNLOAD RECEIPT
                                  </button>
                                </>
                              ) : (
                                <div className='bg-red-50 text-red-600 px-10 py-5 rounded-[25px] font-black text-sm border-2 border-red-200 tracking-[0.2em]'>ORDER VOIDED</div>
                              )}
                              <button onClick={() => handleReorder(order.order_items)} className='bg-[#6b42b3] text-white px-10 py-5 rounded-[25px] font-black text-sm tracking-[0.2em] shadow-xl'>
                                REORDER
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : activeTab === "security" ? (
                <div className='space-y-10'>
                  <div className='space-y-6'>
                    <h2 className='text-3xl font-black dark:text-white'>Security</h2>
                    <div className='p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border dark:border-white/5'>
                      <p className='text-[10px] font-black text-purple-600 uppercase mb-1'>Email</p>
                      <p className='font-bold dark:text-white text-sm'>{profile.email}</p>
                    </div>
                    {editingField === "password" ? (
                      <div className='space-y-3'>
                        <input type='password' placeholder='New Password' className='w-full px-5 py-3 rounded-xl dark:bg-white/5 dark:text-white outline-none' onChange={(e) => setNewPassword(e.target.value)} />
                        <button onClick={handlePasswordChange} className='w-full bg-purple-600 text-white py-3 rounded-xl font-black'>
                          Update
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setEditingField("password")} className='w-full p-4 bg-gray-50 dark:bg-white/5 rounded-2xl flex justify-between items-center font-bold dark:text-white'>
                        Change Password <ChevronDown size={18} />
                      </button>
                    )}
                  </div>
                  <div className='pt-10 border-t dark:border-white/10'>
                    <h3 className='text-red-500 font-black uppercase text-xs tracking-widest mb-4'>Danger Zone</h3>
                    {!showDeleteConfirm ? (
                      <button onClick={() => setShowDeleteConfirm(true)} className='flex items-center gap-2 text-gray-400 hover:text-red-500 font-black text-sm'>
                        <Trash2 size={18} /> Remove Account
                      </button>
                    ) : (
                      <div className='bg-red-50 dark:bg-red-500/10 p-6 rounded-4xl border border-red-100 text-center'>
                        <p className='text-red-600 font-black mb-4'>Are you sure?</p>
                        <div className='flex gap-4'>
                          <button onClick={handleDeleteAccount} className='flex-1 bg-red-600 text-white py-3 rounded-2xl font-black'>
                            Yes
                          </button>
                          <button onClick={() => setShowDeleteConfirm(false)} className='flex-1 bg-white py-3 rounded-2xl font-black'>
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
      {cancellingOrder && (
        <div className='fixed inset-0 z-2000 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'>
          <div className='bg-white dark:bg-gray-900 w-full max-w-sm rounded-4xl p-8 shadow-2xl scale-in-center'>
            <h3 className='text-2xl font-black text-gray-900 dark:text-white mb-2 text-center'>Cancel Order?</h3>
            <p className='text-gray-500 text-center mb-8'>This action cannot be undone. Are you sure you want to cancel this order?</p>

            <div className='flex flex-col gap-3'>
              <button
                onClick={async () => {
                  await supabase.from("orders").update({ status: "cancelled" }).eq("id", cancellingOrder);
                  setCancellingOrder(null);
                  fetchOrders();
                }}
                className='w-full bg-red-500 text-white py-4 rounded-2xl font-bold hover:bg-red-600 transition-colors'>
                Yes, Cancel Order
              </button>
              <button onClick={() => setCancellingOrder(null)} className='w-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-colors'>
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
