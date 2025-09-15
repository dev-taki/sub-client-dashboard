'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch } from '@/redux/hooks/hooks';
import { getBusiness } from '@/redux/features/auth/authSlice';

interface OAuthData {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
  timestamp: string;
  redirect_uri?: string;
  authToken?: string | null;
  tokens?: {
    access_token: string;
    token_type: string;
    expires_at: string;
    merchant_id: string;
    refresh_token?: string;
    short_lived_access_token?: string;
  };
}

export default function SquareCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent duplicate processing
    if (hasProcessed.current) {
      return;
    }

    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    if (error) {
      hasProcessed.current = true;
      setStatus('error');
      setMessage(`OAuth Error: ${error}`);
      
      // Send error data to webhook
      sendOAuthDataToWebhook({
        error: error,
        error_description: searchParams.get('error_description') || '',
        state: state || '',
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (code) {
      hasProcessed.current = true;
      
      // Get authToken from localStorage
      const authToken = localStorage.getItem('authToken');
      
      // Collect all OAuth response data
      const oauthData = {
        code: code,
        state: state || '',
        timestamp: new Date().toISOString(),
        redirect_uri: window.location.origin + '/auth/square/callback',
        authToken: authToken
      };

      console.log('OAuth Data:', oauthData);
      
      // Send authorization code to webhook for server-side token exchange
      sendOAuthDataToWebhook(oauthData);
      
      // Refresh business data to get updated Square connection status
      dispatch(getBusiness());
      
      setStatus('success');
      setMessage('Square account connected successfully! Authorization code sent to backend.');
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      
    } else {
      hasProcessed.current = true;
      setStatus('error');
      setMessage('No authorization code received');
    }
  }, [searchParams, router]);


  const sendOAuthDataToWebhook = async (data: OAuthData) => {
    try {
      const response = await fetch('https://xwqm-zvzg-uzfr.n7e.xano.io/api:27BQ3PIV/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.authToken}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        console.log('OAuth data sent to webhook successfully');
      } else {
        console.error('Failed to send OAuth data to webhook:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending OAuth data to webhook:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full"
      >
        <div className="text-center">
          {/* Square Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            <div className="w-16 h-16 mx-auto rounded-xl overflow-hidden shadow-lg">
              <img 
                src="https://images.ctfassets.net/y2vv62dcl0ut/5lFN96dA38Pp1pVBCdUua9/8067ea4e60ca711e7c0b7539b3bdc04a/square_logo_guideline_ok.png.png.png.png.png.png.png.png.png.png.png.png" 
                alt="Square Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {status === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6"
                />
                <motion.h2 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-gray-800 mb-3"
                >
                  Connecting to Square
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-gray-600 mb-4"
                >
                  Please wait while we securely process your authorization
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="flex justify-center space-x-1"
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -10, 0] }}
                      transition={{ 
                        duration: 0.6, 
                        repeat: Infinity, 
                        delay: i * 0.2 
                      }}
                      className="w-2 h-2 bg-primary rounded-full"
                    />
                  ))}
                </motion.div>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <motion.svg
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="w-10 h-10 text-green-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </motion.svg>
                </motion.div>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-2xl font-bold text-gray-800 mb-3"
                >
                  🎉 Success!
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-gray-600 mb-4"
                >
                  {message}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="flex items-center justify-center space-x-2 text-sm text-gray-500"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                  />
                  <span>Redirecting to dashboard...</span>
                </motion.div>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <motion.svg
                    initial={{ rotate: 0 }}
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="w-10 h-10 text-red-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </motion.svg>
                </motion.div>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-2xl font-bold text-gray-800 mb-3"
                >
                  Connection Failed
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-gray-600 mb-6"
                >
                  {message}
                </motion.p>
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/settings')}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg"
                >
                  Try Again
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
