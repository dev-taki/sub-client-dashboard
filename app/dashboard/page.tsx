'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../redux/hooks/hooks';
import { getMe, revokeSquareConnection } from '../../redux/features/auth/authSlice';
import AuthGuard from '../../components/AuthGuard';
import Sidebar from '../../components/Sidebar';
import LocationMenu from '../../components/LocationMenu';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isLoading, isAuthenticated, business, businessLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // If we have a token but no user data, fetch user info
    if (isAuthenticated && !user) {
      dispatch(getMe());
    }
  }, [isAuthenticated, user, dispatch, router]);

  const handleDisconnectSquare = async () => {
    if (confirm('Are you sure you want to disconnect your Square account? This will remove all Square data access.')) {
      try {
        await dispatch(revokeSquareConnection());
        // The UI will automatically update due to Redux state change
      } catch (error) {
        console.error('Failed to disconnect Square:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Main Content */}
          <div className="flex-1 p-8">
            <div className="max-w-4xl">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
              
              {/* Welcome Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Welcome to Order Hoarder, {user.name?.split(' ')[0]}! 🎉
                    </h2>
                    
                    {business && business.merchant_id ? (
                      <div>
                        <p className="text-gray-600 mb-4">
                          Your Square account is connected! You can now manage your business data.
                        </p>
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={handleDisconnectSquare}
                            disabled={businessLoading}
                            className="text-red-600 hover:text-red-700 font-medium transition-colors disabled:opacity-50"
                          >
                            {businessLoading ? 'Disconnecting...' : 'Disconnect Square'}
                          </button>
                          <span className="text-gray-500">Connected to Square</span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-600 mb-4">
                          In order to start using Order Hoarder, we need data from Square.
                        </p>
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => {
                              const squareOAuthUrl = 'https://squareup.com/oauth2/authorize?client_id=sq0idp-8kztSVgh4k2MrA47TAO_XA&scope=CUSTOMERS_WRITE+CUSTOMERS_READ+PAYMENTS_READ+PAYMENTS_WRITE+SUBSCRIPTIONS_WRITE+SUBSCRIPTIONS_READ+ITEMS_READ+ORDERS_WRITE+INVOICES_WRITE+MERCHANT_PROFILE_READ+INVOICES_READ+PAYMENTS_WRITE_SHARED_ONFILE+ITEMS_WRITE+ORDERS_READ+&session=False#randomizer';
                              window.open(squareOAuthUrl, '_blank', 'width=600,height=700,scrollbars=yes,resizable=yes');
                            }}
                            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                          >
                            Connect To Square
                          </button>
                          <span className="text-gray-500">Connect your account to Square to get started.</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-6">
                    {business && business.merchant_id ? (
                      <button
                        onClick={handleDisconnectSquare}
                        disabled={businessLoading}
                        className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                      >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const squareOAuthUrl = 'https://squareup.com/oauth2/authorize?client_id=sq0idp-8kztSVgh4k2MrA47TAO_XA&scope=CUSTOMERS_WRITE+CUSTOMERS_READ+PAYMENTS_READ+PAYMENTS_WRITE+SUBSCRIPTIONS_WRITE+SUBSCRIPTIONS_READ+ITEMS_READ+ORDERS_WRITE+INVOICES_WRITE+MERCHANT_PROFILE_READ+INVOICES_READ+PAYMENTS_WRITE_SHARED_ONFILE+ITEMS_WRITE+ORDERS_READ+&session=False#randomizer';
                          window.open(squareOAuthUrl, '_blank', 'width=600,height=700,scrollbars=yes,resizable=yes');
                        }}
                        className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
                      >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Selection Card */}
              {business && business.merchant_id && (
                <div className="bg-white rounded-lg border border-gray-200 p-8 mt-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Your Location</h2>
                  <div className="max-w-md">
                    <LocationMenu 
                      onLocationSelect={(location) => {
                        console.log('Location selected:', location);
                      }}
                    />
                    <p className="text-sm text-gray-500 mt-3">
                      Choose the Square location you want to manage with Order Hoarder.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
