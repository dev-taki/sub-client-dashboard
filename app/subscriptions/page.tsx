'use client';

import React from 'react';
import { useAppSelector } from '../../redux/hooks/hooks';
import AuthGuard from '../../components/AuthGuard';
import Sidebar from '../../components/Sidebar';
import SubscriptionPlans from '../../components/SubscriptionPlans';

const SubscriptionsPage: React.FC = () => {
  const { user, business } = useAppSelector((state) => state.auth);

  if (!user || !business) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-6xl mx-auto">
              <SubscriptionPlans businessId={business.id} />
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default SubscriptionsPage;
