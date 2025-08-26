import React, { useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const navigate = useNavigate();
  const settingsItems = [
    { label: 'Account', href: '/accountSetting' },
    { label: 'Page Setting', href: '/pageSetting' },
    { label: 'Edit role', href: '/editrole' },
    { label: 'Term & Condition', href: '/termCondition' },
    { label: 'Contact us', href: '/contactUs' }
  ];
  const checkme = async () => {
    try {
      const authme = await fetch('http://localhost:5000/api/me', {
        method: 'GET',
        credentials: 'include'
      })
      const data = await authme.json();
      if (authme.status === 401 || authme.status === 403) {
        navigate('/login');
        return;
      }

      console.log('Authme data:', data);
    } catch (error) {
      console.log('Error', error)

    }
  }


  useEffect(() => {
    checkme()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-8 ">
        <div className="flex items-center max-w-6xl mx-auto">
          <button 
            className="flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-full mr-4 hover:bg-opacity-30 transition-all duration-200" 
            onClick={() => navigate('/')}
          >
            <ChevronLeft className="w-6 h-6 text-green-500" />
          </button>
          <div>
            <h2 className="text-sm font-medium text-teal-100">PharmaC</h2>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
          </div>
        </div>
      </div>

      {/* Settings Menu */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {settingsItems.map((item, index) => (
              <div key={index} className="group">
                <a
                  href={item.href}
                  className="flex items-center justify-between px-8 py-6 text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-all duration-200"
                >
                  <span className="text-lg font-medium">{item.label}</span>
                  <div className="flex items-center">
                    <ChevronLeft className="w-5 h-5 rotate-180 text-gray-400 group-hover:text-teal-500 transition-colors duration-200" />
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-500 mt-8">
          <p>PharmaC Management System</p>
          <p className="mt-1">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}