import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import POSPage from '../pages/POSPage';
import { LogOut, User } from 'lucide-react';

const CustomerLayout: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Customer Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-teal-600 p-2 rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ระบบขายหน้าร้าน</h1>
                <p className="text-sm text-gray-600">สวัสดี, {user?.name || user?.email}</p>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </div>

      {/* POS Content */}
      <POSPage />
    </div>
  );
};

export default CustomerLayout;
