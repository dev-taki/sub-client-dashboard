'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../redux/hooks/hooks';
import { getMe } from '../redux/features/auth/authSlice';

export default function Home() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, token, user, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // If we have a token but no user data, fetch user info
    if (token && !user && !isLoading) {
      dispatch(getMe());
    }
  }, [token, user, isLoading, dispatch]);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
