'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Connecting to Square...</h2>
              <p className="text-gray-600">Please wait while we process your authorization.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Success!</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Failed</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <button
                onClick={() => router.push('/settings')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
