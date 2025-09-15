'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../redux/hooks/hooks';
import { logout } from '../redux/features/auth/authSlice';
import { LayoutDashboard, Settings, LogOut, User, CreditCard } from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      router.push('/login');
    } catch (error) {
      // Handle logout error
    }
  };

  const menuItems = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: LayoutDashboard
    },
    { 
      name: 'Subscriptions', 
      path: '/subscriptions', 
      icon: CreditCard
    },
    { 
      name: 'Settings', 
      path: '/settings', 
      icon: Settings
    },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden">
            <img 
              src="https://images.ctfassets.net/y2vv62dcl0ut/5lFN96dA38Pp1pVBCdUua9/8067ea4e60ca711e7c0b7539b3bdc04a/square_logo_guideline_ok.png.png.png.png.png.png.png.png.png.png.png.png" 
              alt="Square Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Subport</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  pathname === item.path
                    ? 'bg-green-50 text-primary border-l-4 border-primary'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className={`w-5 h-5 ${pathname === item.path ? 'text-primary' : 'text-gray-500'}`} />
                <span className="font-medium">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || 'user@example.com'}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <LogOut className="w-5 h-5 text-gray-500" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
