import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { Product, Store, Workshop1 } from '../types';
import emailjs from '@emailjs/browser';

interface Location { id: number; emirateEn: string; emirateAr: string; city: string; cost: number; }
interface Subscriber { id: string; email: string; phone: string; created_at: string; }
interface Coupon { 
  id: string; 
  code: string; 
  discount_percent: number; 
  active: boolean; 
  usage_limit: number; 
  times_used: number; 
}
interface Order {
  id: string;
  created_at: string;
  customer_email: string;
  customer_phone: string;
  items: any[];
  total_amount: number;
  method: string;
  address: string;
  status: 'waiting' | 'prepared' | 'shipped' | 'delivered' | 'canceled';
}

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'workshops' | 'stores' | 'products' | 'locations' | 'newsletter' | 'coupons'>('orders');
  const [loading, setLoading] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [workshops, setWorkshops] = useState<Workshop1[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortType, setSortType] = useState('name-asc');
  const [filterStore, setFilterStore] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const [storeForm, setStoreForm] = useState({ id: '', nameEn: '', nameAr: '', image: '', productCount: 0 });
  const [couponForm, setCouponForm] = useState({ code: '', discount_percent: 5, usage_limit: 1, times_used: 0, active: true });
  const [bulkEmirate, setBulkEmirate] = useState('Dubai');
  const [bulkPrice, setBulkPrice] = useState(0);

  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  useEffect(() => { if (isAuthenticated) fetchData(); }, [isAuthenticated]);

  const fetchData = async () => {
    setLoading(true);
    const { data: p } = await supabase.from('products').select('*');
    const { data: s } = await supabase.from('stores').select('*');
    const { data: w } = await supabase.from('workshops').select('*');
    const { data: l } = await supabase.from('locations').select('*').order('emirateEn', { ascending: true });
    const { data: subs } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false });
    const { data: c } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    const { data: o } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    
    if (c) {
      const fullyUsed = c.filter(coupon => coupon.times_used >= coupon.usage_limit);
      if (fullyUsed.length > 0) {
        await supabase.from('coupons').delete().in('id', fullyUsed.map(cp => cp.id));
        const { data: updatedC } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
        setCoupons(updatedC || []);
      } else {
        setCoupons(c);
      }
    }

    if (p) setProducts(p);
    if (s) setStores(s);
    if (w) setWorkshops(w);
    if (l) setLocations(l);
    if (subs) setSubscribers(subs);
    if (o) setOrders(o);
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    if (status === 'delivered') {
      if (confirm('Delete delivered order?')) {
        await supabase.from('orders').delete().eq('id', id);
        fetchData();
      }
    } else {
      await supabase.from('orders').update({ status }).eq('id', id);
      fetchData();
    }
  };

  const openMap = (address: string) => {
    const coordsRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
    const isCoords = coordsRegex.test(address.trim());
    const url = isCoords 
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  const handleUpload = async (file: File) => {
    const fileName = `${Date.now()}_${file.name}`;
    const { data } = await supabase.storage.from('images').upload(fileName, file);
    const { data: urlData } = supabase.storage.from('images').getPublicUrl(data!.path);
    return urlData.publicUrl;
  };

  const handleUpdateProduct = async (id: string, updates: any) => {
    await supabase.from('products').update(updates).eq('id', id);
    fetchData();
  };

  const handleUpdateStore = async (id: string, updates: any) => {
    await supabase.from('stores').update(updates).eq('id', id);
    fetchData();
  };

  const handleUpdateWorkshop = async (id: string, updates: any) => {
    await supabase.from('workshops').update(updates).eq('id', id);
    fetchData();
  };

  const handleUpdateLocation = async (id: number, cost: number) => {
    await supabase.from('locations').update({ cost }).eq('id', id);
    fetchData();
  };

  const handleDeleteCoupon = async (id: string) => {
    if (confirm('Delete this coupon?')) {
      await supabase.from('coupons').delete().eq('id', id);
      fetchData();
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (confirm('Remove this email?')) {
      await supabase.from('subscribers').delete().eq('id', id);
      fetchData();
    }
  };

  const sendNewsletter = async () => {
    if (!emailSubject || !emailMessage) return alert('Fill subject and message');
    setLoading(true);
    for (const sub of subscribers) {
      try {
        await emailjs.send('service_7eznisq', 'template_7qvsymj', {
          to_email: sub.email,
          to_name: sub.email.split('@')[0],
          subject: emailSubject, 
          message: emailMessage,
          unsub_id: btoa(sub.email)
        }, 'mvUmmSyFlqs13U9CR');
      } catch (err) { console.error(err); }
    }
    setLoading(false);
    alert('Newsletter sent!');
  };

  const sendTestEmail = async () => {
    if (!emailSubject || !emailMessage) return alert('Write something first!');
    const testEmail = window.prompt("Where should I send the test?");
    if (!testEmail) return;
    setLoading(true);
    try {
      await emailjs.send('service_7eznisq', 'template_7qvsymj', {
        to_email: testEmail,
        to_name: "Admin Test",
        subject: emailSubject, 
        message: emailMessage,
        unsub_id: btoa(testEmail)
      }, 'mvUmmSyFlqs13U9CR');
      alert('Test sent!');
    } catch (err) { alert('Test failed.'); } 
    finally { setLoading(false); }
  };

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => (p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) || p.nameAr.includes(searchQuery)) && (filterStore === 'all' || p.storeId === filterStore) && (filterCategory === 'all' || p.category === filterCategory));
    if (sortType === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (sortType === 'price-desc') result.sort((a, b) => b.price - a.price);
    if (sortType === 'stock-asc') result.sort((a, b) => a.stock - b.stock);
    if (sortType === 'stock-desc') result.sort((a, b) => b.stock - a.stock);
    if (sortType === 'name-asc') result.sort((a, b) => a.nameEn.localeCompare(b.nameEn));
    if (sortType === 'name-desc') result.sort((a, b) => b.nameEn.localeCompare(a.nameEn));
    return result;
  }, [products, searchQuery, sortType, filterStore, filterCategory]);

  if (!isAuthenticated) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-purple-950">
        <div className="bg-white dark:bg-purple-900 p-8 rounded-3xl shadow-xl border dark:border-white/10 w-full max-w-md">
          <h2 className="text-2xl font-black mb-6 text-center dark:text-white">Admin Access</h2>
          <input type="password" placeholder="Password" className="w-full p-4 border dark:border-white/10 dark:bg-white/5 dark:text-white rounded-2xl mb-4 font-bold outline-none" onChange={(e) => setPassword(e.target.value)} />
          <button onClick={() => password === import.meta.env.VITE_ADMIN_PASSWORD ? setIsAuthenticated(true) : alert('Wrong Password')} className="w-full bg-black dark:bg-white dark:text-purple-900 text-white p-4 rounded-2xl font-black transition-all active:scale-95">Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen bg-gray-50 dark:bg-purple-950 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-black uppercase tracking-tighter dark:text-white">Dashboard</h1>
            <button onClick={fetchData} disabled={loading} className={`p-2 rounded-xl bg-white dark:bg-white/5 border dark:border-white/10 transition-all active:rotate-180 ${loading ? 'animate-spin' : ''}`}>🔄</button>
          </div>
          <button onClick={() => setIsAuthenticated(false)} className="bg-red-50 dark:bg-red-900/20 text-red-500 px-6 py-2 rounded-xl font-bold text-sm">Logout</button>
        </div>

        <div className="flex gap-2 mb-10 overflow-x-auto pb-2 no-scrollbar">
          {['orders', 'workshops', 'stores', 'products', 'locations', 'newsletter', 'coupons'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-3 rounded-2xl font-black capitalize whitespace-nowrap transition-all ${activeTab === tab ? 'bg-purple-600 text-white shadow-lg' : 'bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400'}`}>{tab}</button>
          ))}
        </div>

        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in">
            {orders.length === 0 && <p className="text-center py-20 font-bold text-gray-400">No active orders</p>}
            {orders.map(order => (
              <div key={order.id} className="bg-white dark:bg-purple-900 p-6 rounded-4xl border dark:border-white/10 flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${order.status === 'waiting' ? 'bg-amber-500' : order.status === 'prepared' ? 'bg-blue-500' : order.status === 'shipped' ? 'bg-purple-500' : order.status === 'canceled' ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                    <h3 className="font-black dark:text-white uppercase tracking-tighter">{order.customer_email}</h3>
                  </div>
                  <button onClick={() => openMap(order.address)} className="text-sm font-bold text-gray-400 uppercase tracking-widest hover:text-purple-500 transition-colors text-left flex items-center gap-1">📍 {order.address}</button>
                  <p className="text-xs font-black text-purple-500">971 {order.customer_phone} • {order.method}</p>
                  <div className="pt-2">
                    {order.items.map((item: any, idx: number) => (
                      <span key={idx} className="inline-block bg-gray-100 dark:bg-white/5 dark:text-gray-400 px-3 py-1 rounded-lg text-[10px] font-bold mr-2">{item.quantity}x {item.nameEn}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between gap-4">
                  <p className="text-2xl font-black dark:text-white">{order.total_amount} AED</p>
                  <div className="flex flex-wrap justify-end gap-1 bg-gray-50 dark:bg-black/20 p-1 rounded-2xl">
                    {['waiting', 'prepared', 'shipped', 'canceled', 'delivered'].map((s) => (
                      <button key={s} onClick={() => handleUpdateStatus(order.id, s)} className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${order.status === s ? 'bg-white dark:bg-purple-600 shadow-sm dark:text-white' : 'text-gray-400 hover:text-gray-600'} ${s === 'canceled' && order.status !== 'canceled' ? 'hover:text-red-500' : ''}`}>{s}</button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="grid lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-4">
            <form className="bg-white dark:bg-purple-900 p-6 rounded-3xl border dark:border-white/10 h-fit space-y-4 shadow-sm" onSubmit={async (e) => { e.preventDefault(); await supabase.from('coupons').insert([couponForm]); fetchData(); setCouponForm({ code: '', discount_percent: 5, usage_limit: 1, times_used: 0, active: true }); }}>
              <h3 className="font-black text-xl dark:text-white">Marketing Coupon</h3>
              <input required className="w-full p-3 border dark:border-white/10 dark:bg-white/5 dark:text-white rounded-xl font-bold outline-none" placeholder="Code" value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} />
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" className="w-full p-3 border dark:border-white/10 dark:bg-white/5 dark:text-white rounded-xl font-bold" placeholder="%" value={couponForm.discount_percent} onChange={e => setCouponForm({...couponForm, discount_percent: Number(e.target.value)})} />
                <input required type="number" className="w-full p-3 border dark:border-white/10 dark:bg-white/5 dark:text-white rounded-xl font-bold" placeholder="Limit" value={couponForm.usage_limit} onChange={e => setCouponForm({...couponForm, usage_limit: Number(e.target.value)})} />
              </div>
              <button className="w-full bg-purple-600 text-white p-4 rounded-xl font-black shadow-lg">Add Coupon</button>
            </form>
            <div className="lg:col-span-2 space-y-4">
              {coupons.map(c => (
                <div key={c.id} className="p-5 bg-white dark:bg-purple-900 border dark:border-white/10 rounded-3xl flex items-center justify-between">
                  <div><p className="font-black dark:text-white">{c.code}</p><p className="text-[10px] text-purple-600 font-black">{c.discount_percent}% OFF • {c.times_used}/{c.usage_limit} USED</p></div>
                  <button onClick={() => handleDeleteCoupon(c.id)} className="text-red-400 font-black text-[10px] uppercase">Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'workshops' && (
          <div className="grid gap-8 animate-in fade-in">
            {workshops.map((w) => (
              <div key={w.id} className="bg-white dark:bg-purple-900 p-8 rounded-4xl border dark:border-white/10 space-y-6">
                <div className="flex justify-between border-b dark:border-white/10 pb-4">
                  <h3 className="text-xl font-black uppercase text-purple-600 dark:text-purple-400">Workshop: {w.id}</h3>
                  <select className="font-bold border dark:border-white/10 dark:bg-purple-900 dark:text-white rounded-lg p-1" defaultValue={w.available} onChange={(e) => handleUpdateWorkshop(w.id, {available: e.target.value})}>
                    <option value="yes">Visible</option><option value="no">Hidden</option>
                  </select>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <input className="w-full p-3 border dark:border-white/10 dark:bg-white/5 dark:text-white rounded-xl font-bold" placeholder="Name EN" defaultValue={w.nameEn} onBlur={e => handleUpdateWorkshop(w.id, {nameEn: e.target.value})} />
                    <input className="w-full p-3 border dark:border-white/10 dark:bg-white/5 dark:text-white text-right font-bold" placeholder="الاسم بالعربي" defaultValue={w.nameAr} onBlur={e => handleUpdateWorkshop(w.id, {nameAr: e.target.value})} />
                  </div>
                  <div className="space-y-4">
                    <textarea className="w-full p-3 border dark:border-white/10 dark:bg-white/5 dark:text-white rounded-xl h-24 font-bold" placeholder="Details EN" defaultValue={w.detailsEn} onBlur={e => handleUpdateWorkshop(w.id, {detailsEn: e.target.value})} />
                    <textarea className="w-full p-3 border dark:border-white/10 dark:bg-white/5 dark:text-white rounded-xl h-24 text-right font-bold" placeholder="التفاصيل بالعربي" defaultValue={w.detailsAr} onBlur={e => handleUpdateWorkshop(w.id, {detailsAr: e.target.value})} />
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center gap-4 border border-dashed dark:border-white/10">
                  <img src={w.image} className="w-20 h-20 object-cover rounded-lg" alt="" />
                  <input type="file" className="text-xs font-bold dark:text-gray-400" onChange={async e => { if (e.target.files?.[0]) handleUpdateWorkshop(w.id, {image: await handleUpload(e.target.files[0])})}} />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'stores' && (
          <div className="grid lg:grid-cols-3 gap-10 animate-in fade-in">
            <form className="bg-white dark:bg-purple-900 p-6 rounded-3xl border dark:border-white/10 h-fit space-y-4 shadow-sm" onSubmit={async (e) => { e.preventDefault(); await supabase.from('stores').insert([storeForm]); fetchData(); }}>
              <h3 className="font-black text-xl dark:text-white">New Store</h3>
              <input required className="w-full p-3 border dark:border-white/10 dark:bg-white/5 dark:text-white rounded-xl font-bold" placeholder="ID" onChange={e => setStoreForm({...storeForm, id: e.target.value})} />
              <input required className="w-full p-3 border dark:border-white/10 dark:bg-white/5 dark:text-white rounded-xl font-bold" placeholder="Name EN" onChange={e => setStoreForm({...storeForm, nameEn: e.target.value})} />
              <input required className="w-full p-3 border dark:border-white/10 dark:bg-white/5 dark:text-white rounded-xl text-right font-bold" placeholder="الاسم بالعربي" onChange={e => setStoreForm({...storeForm, nameAr: e.target.value})} />
              <button className="w-full bg-black dark:bg-white dark:text-purple-900 text-white p-4 rounded-xl font-black">Add Store</button>
            </form>
            <div className="lg:col-span-2 space-y-4">
              {stores.map(s => (
                <div key={s.id} className="p-4 bg-white dark:bg-purple-900 border dark:border-white/10 rounded-2xl flex items-center gap-4">
                  <div className="relative group w-12 h-12 shrink-0">
                      <img src={s.image} className="w-full h-full object-cover rounded-lg" alt="" />
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async e => { if (e.target.files?.[0]) handleUpdateStore(s.id, {image: await handleUpload(e.target.files[0])})}} />
                  </div>
                  <input className="font-bold border-b dark:border-white/10 bg-transparent flex-1 outline-none dark:text-white" defaultValue={s.nameEn} onBlur={e => handleUpdateStore(s.id, {nameEn: e.target.value})} />
                  <input className="font-bold border-b dark:border-white/10 bg-transparent flex-1 text-right outline-none dark:text-white" defaultValue={s.nameAr} onBlur={e => handleUpdateStore(s.id, {nameAr: e.target.value})} />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid lg:grid-cols-4 gap-4">
              <input className="p-4 bg-white dark:bg-purple-900 border dark:border-white/10 dark:text-white rounded-2xl font-black outline-none" placeholder="Search..." onChange={e => setSearchQuery(e.target.value)} />
              <select className="p-4 bg-white dark:bg-purple-900 border dark:border-white/10 dark:text-white rounded-2xl font-black outline-none" onChange={e => setSortType(e.target.value)}>
                  <option value="name-asc">A-Z</option><option value="name-desc">Z-A</option>
                  <option value="price-asc">Price Low-High</option><option value="price-desc">Price High-Low</option>
                  <option value="stock-asc">Stock Low-High</option><option value="stock-desc">Stock High-Low</option>
              </select>
              <select className="p-4 bg-white dark:bg-purple-900 border dark:border-white/10 dark:text-white rounded-2xl font-black outline-none" onChange={e => setFilterStore(e.target.value)}>
                  <option value="all">All Stores</option>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.nameEn}</option>)}
              </select>
              <select className="p-4 bg-white dark:bg-purple-900 border dark:border-white/10 dark:text-white rounded-2xl font-black outline-none" onChange={e => setFilterCategory(e.target.value)}>
                  <option value="all">All Types</option>
                  <option value="Perfume">Perfume</option><option value="Oud">Oud</option><option value="Oil">Oil</option><option value="Lotion">Lotion</option>
              </select>
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
              {filteredProducts.map(p => (
                <div key={p.id} className="bg-white dark:bg-purple-900 p-4 border dark:border-white/10 rounded-3xl space-y-4 hover:shadow-md transition-all">
                  <div className="flex gap-4">
                    <div className="relative group w-20 h-20 shrink-0">
                      <img src={p.image} className="w-full h-full object-cover rounded-2xl" alt="" />
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async e => { if (e.target.files?.[0]) handleUpdateProduct(p.id, {image: await handleUpload(e.target.files[0])})}} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <input className="w-full font-black border-b dark:border-white/10 bg-transparent outline-none text-sm dark:text-white" defaultValue={p.nameEn} onBlur={e => handleUpdateProduct(p.id, {nameEn: e.target.value})} />
                      <input className="w-full font-black border-b dark:border-white/10 bg-transparent text-right outline-none text-sm dark:text-white" defaultValue={p.nameAr} onBlur={e => handleUpdateProduct(p.id, {nameAr: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex gap-2 text-[10px] font-black">
                    <div className="flex-1">
                      <label className="text-gray-400 dark:text-gray-500 ml-1">PRICE</label>
                      <input type="number" className="w-full p-2 border dark:border-white/10 dark:bg-white/5 dark:text-white rounded-xl font-black" defaultValue={p.price} onBlur={e => handleUpdateProduct(p.id, {price: Number(e.target.value)})} />
                    </div>
                    <div className="flex-1">
                      <label className="text-gray-400 dark:text-gray-500 ml-1">STOCK</label>
                      <input type="number" className={`w-full p-2 border dark:border-white/10 dark:bg-white/5 dark:text-white rounded-xl font-black ${p.stock < 5 ? 'bg-red-50 dark:bg-red-900/20 text-red-500 border-red-100' : ''}`} defaultValue={p.stock} onBlur={e => handleUpdateProduct(p.id, {stock: Number(e.target.value)})} />
                    </div>
                  </div>
                  <button onClick={async () => { if(confirm('Delete?')) { await supabase.from('products').delete().eq('id', p.id); fetchData(); }}} className="w-full text-red-400 hover:text-red-600 font-black text-[10px] uppercase pt-2">Delete Product</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'locations' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-purple-50 dark:bg-purple-900/50 p-6 rounded-3xl border border-purple-100 dark:border-white/10 flex flex-wrap gap-4 items-center">
              <select className="p-3 rounded-xl border dark:border-white/10 dark:bg-purple-900 dark:text-white font-black outline-none" onChange={e => setBulkEmirate(e.target.value)}>
                {['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'].map(e => <option key={e} value={e}>{e}</option>)}
              </select>
              <input type="number" placeholder="Price" className="p-3 rounded-xl border dark:border-white/10 dark:bg-purple-900 dark:text-white w-24 font-black outline-none" onChange={e => setBulkPrice(Number(e.target.value))} />
              <button onClick={async () => { await supabase.from('locations').update({ cost: bulkPrice }).eq('emirateEn', bulkEmirate); fetchData(); }} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-black">Update All</button>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              {locations.filter(l => l.city.toLowerCase().includes(searchQuery.toLowerCase())).map(l => (
                <div key={l.id} className="bg-white dark:bg-purple-900 p-4 border dark:border-white/10 rounded-2xl flex justify-between items-center hover:border-purple-200 transition-all">
                  <div><p className="text-[10px] font-black text-purple-600 uppercase">{l.emirateEn}</p><p className="font-bold text-xs dark:text-white">{l.city}</p></div>
                  <input type="number" className="w-16 p-1 border dark:border-white/10 dark:bg-purple-900 dark:text-white rounded font-black text-right text-sm outline-none" defaultValue={l.cost} onBlur={e => handleUpdateLocation(l.id, Number(e.target.value))} />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'newsletter' && (
          <div className="grid lg:grid-cols-2 gap-10 animate-in fade-in">
            <div className="bg-white dark:bg-purple-900 p-8 rounded-4xl border dark:border-white/10 space-y-6 h-fit shadow-sm">
              <h3 className="text-2xl font-black uppercase tracking-tighter dark:text-white">Write Newsletter</h3>
              <div className="space-y-4">
                <input className="w-full p-4 border dark:border-white/10 dark:bg-white/5 dark:text-white rounded-2xl font-black outline-none focus:border-purple-400" placeholder="Subject Line" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
                <textarea className="w-full p-4 border dark:border-white/10 dark:bg-white/5 dark:text-white rounded-2xl h-64 font-bold outline-none focus:border-purple-400" placeholder="Write your announcement here..." value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button disabled={loading} onClick={sendTestEmail} className="w-full bg-gray-100 dark:bg-white/10 dark:text-white p-5 rounded-2xl font-black uppercase tracking-widest disabled:opacity-20 transition-all">Send Test Email</button>
                  <button disabled={loading} onClick={sendNewsletter} className="w-full bg-purple-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest disabled:opacity-20 shadow-xl active:scale-95 transition-all">{loading ? 'Sending...' : `Send to ${subscribers.length} Subs`}</button>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-black uppercase tracking-tighter dark:text-white">Subscriber List</h3>
              <div className="max-h-150 overflow-y-auto space-y-2 pr-2 no-scrollbar">
                {subscribers.map((sub) => (
                  <div key={sub.id} className="bg-white dark:bg-purple-900 p-4 border dark:border-white/10 rounded-2xl flex justify-between items-center group hover:border-purple-100 transition-all">
                    <div><p className="font-black text-sm dark:text-white">{sub.email}</p><p className="text-[10px] text-gray-400 font-bold uppercase">{sub.phone ? `+971 ${sub.phone}` : 'No Phone'}</p></div>
                    <button onClick={() => handleDeleteSubscriber(sub.id)} className="text-red-400 font-black text-[10px] uppercase opacity-0 group-hover:opacity-100 transition-all">Remove</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;