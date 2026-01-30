import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Unsubscribe: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'resubscribed'>('loading');
  const [userEmail, setUserEmail] = useState('');
  const id = searchParams.get('id');

  useEffect(() => {
    const processUnsubscribe = async () => {
      if (!id) return setStatus('error');

      try {
        const email = atob(id);
        setUserEmail(email);
        const { error } = await supabase.from('subscribers').delete().eq('email', email);
        if (error) throw error;
        setStatus('success');
      } catch (err) {
        setStatus('error');
      }
    };
    processUnsubscribe();
  }, [id]);

  const handleResubscribe = async () => {
    setStatus('loading');
    const { error } = await supabase.from('subscribers').insert([{ email: userEmail }]);
    if (!error) setStatus('resubscribed');
    else setStatus('error');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-center">
      <div className="bg-white p-12 rounded-[40px] shadow-xl max-w-md w-full">
        {status === 'loading' && <p className="font-black text-purple-600 animate-pulse uppercase">Processing...</p>}
        
        {status === 'success' && (
          <>
            <h1 className="text-3xl font-black text-gray-900 mb-4 uppercase">Unsubscribed</h1>
            <p className="text-gray-500 font-bold mb-8">You've been removed. Click below if this was a mistake.</p>
            <button onClick={handleResubscribe} className="text-purple-600 font-black mb-6 block w-full">Oops, keep me subscribed!</button>
            <Link to="/" className="bg-purple-600 text-white px-8 py-4 rounded-2xl font-black block shadow-lg">Back to Home</Link>
          </>
        )}

        {status === 'resubscribed' && (
          <>
            <h1 className="text-3xl font-black text-emerald-600 mb-4 uppercase">Welcome Back!</h1>
            <p className="text-gray-500 font-bold mb-8">You are subscribed again. You won't miss any updates.</p>
            <Link to="/" className="bg-black text-white px-8 py-4 rounded-2xl font-black block">Continue Shopping</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-3xl font-black text-red-600 mb-4 uppercase">Invalid Link</h1>
            <p className="text-gray-500 font-bold mb-8">We couldn't find your subscription or the link is broken.</p>
            <Link to="/" className="text-purple-600 font-black">Return Home</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;