import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Unsubscribe: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const id = searchParams.get('id');

  useEffect(() => {
    const processUnsubscribe = async () => {
      if (!id) {
        setStatus('error');
        return;
      }

      try {
        const email = atob(id); // Decode the email from base64
        const { error } = await supabase
          .from('subscribers')
          .delete()
          .eq('email', email);

        if (error) throw error;
        setStatus('success');
      } catch (err) {
        setStatus('error');
      }
    };

    processUnsubscribe();
  }, [id]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-center">
      <div className="bg-white p-12 rounded-[40px] shadow-xl max-w-md w-full">
        {status === 'loading' && <p className="font-black text-purple-600 animate-pulse">Processing...</p>}
        
        {status === 'success' && (
          <>
            <h1 className="text-3xl font-black text-gray-900 mb-4">Unsubscribed</h1>
            <p className="text-gray-500 font-bold mb-8">You have been successfully removed from our list. We're sorry to see you go!</p>
            <Link to="/" className="bg-purple-600 text-white px-8 py-4 rounded-2xl font-black block">Back to Home</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-3xl font-black text-red-600 mb-4">Oops!</h1>
            <p className="text-gray-500 font-bold mb-8">We couldn't process your request. The link might be expired.</p>
            <Link to="/" className="text-purple-600 font-black">Return Home</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;