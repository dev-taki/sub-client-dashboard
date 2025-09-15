'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../redux/hooks/hooks';
import { getMe, revokeSquareConnection } from '../../redux/features/auth/authSlice';
import AuthGuard from '../../components/AuthGuard';
import Sidebar from '../../components/Sidebar';

export default function SettingsPage() {
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

  const handleSquareConnect = () => {
    // Use the exact URL format you provided (without redirect_uri)
    const squareOAuthUrl = 'https://squareup.com/oauth2/authorize?client_id=sq0idp-8kztSVgh4k2MrA47TAO_XA&scope=CUSTOMERS_WRITE+CUSTOMERS_READ+PAYMENTS_READ+PAYMENTS_WRITE+SUBSCRIPTIONS_WRITE+SUBSCRIPTIONS_READ+ITEMS_READ+ORDERS_WRITE+INVOICES_WRITE+MERCHANT_PROFILE_READ+INVOICES_READ+PAYMENTS_WRITE_SHARED_ONFILE+ITEMS_WRITE+ORDERS_READ+&session=False#randomizer';
    
    // Open Square OAuth in new window
    window.open(squareOAuthUrl, '_blank', 'width=600,height=700,scrollbars=yes,resizable=yes');
  };

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
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
              
              {/* Square Connection Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {business && business.merchant_id ? (
                      <>
                        <h2 className="text-xl font-semibold text-green-600 mb-4">
                          Square Account Connected
                        </h2>
                        <p className="text-gray-600 mb-6">
                          Your Square Seller account is successfully connected to Order Hoarder! 
                          You can now access all Square data and features.
                        </p>
                      </>
                    ) : (
                      <>
                        <h2 className="text-xl font-semibold text-blue-600 mb-4">
                          Connect to your Square Account
                        </h2>
                        <p className="text-gray-600 mb-6">
                          Securely connect your Square Seller account with Order Hoarder! Once connected, 
                          all of the great benefits from Order Hoarder will be directly available for use 
                          on your Square data!
                        </p>
                      </>
                    )}
                  </div>
                  
                  <div className="ml-6">
                    {business && business.merchant_id ? (
                      <button
                        onClick={handleDisconnectSquare}
                        disabled={businessLoading}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {businessLoading ? 'Disconnecting...' : 'Disconnect'}
                      </button>
                    ) : (
                      <button
                        onClick={handleSquareConnect}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* User Info Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-8 mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <p className="text-gray-900 font-medium">{user.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <p className="text-gray-900 font-medium">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <p className="text-gray-900 font-medium capitalize">{user.role}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business ID</label>
                    <p className="text-gray-900 font-mono text-sm">{user.business_id}</p>
                  </div>
                  {user.square_customer_id && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Square Customer ID</label>
                      <p className="text-gray-900 font-mono text-sm">{user.square_customer_id}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                    <p className="text-gray-900 font-medium">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
