import React, { useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const settingsItems = [
    { label: t('account'), href: '/accountSetting' },
    { label: t('pageSetting'), href: '/pageSetting' },
    { label: t('editRole'), href: '/editrole' },
    { label: t('termCondition'), href: '/termCondition' },
    { label: t('contactUs'), href: '/contactUs' }
  ];
  const checkme = async () => {
    try {
      const authme = await fetch(`${API_URL}/api/me`, {
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
    <div className="min-h-screen bg-gradient-to-br"
         style={{
           background: document.documentElement.classList.contains('dark') 
             ? 'linear-gradient(to bottom right, #111827, #374151)' 
             : 'linear-gradient(to bottom right, #f9fafb, white)'
         }}>
      {/* Header */}
      <div className="px-6 py-8"
           style={{
             background: document.documentElement.classList.contains('dark')
               ? 'linear-gradient(to right, #047857, #065f46)'
               : 'linear-gradient(to right, #0d9488, #0f766e)'
           }}>
        <div className="flex items-center max-w-6xl mx-auto">
          <button 
            className="flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-full mr-4 hover:bg-opacity-30 transition-all duration-200" 
            onClick={() => navigate('/')}
          >
            <ChevronLeft className="w-6 h-6 text-green-500" />
          </button>
          <div>
            <h2 className="text-sm font-medium text-teal-100">{t('pharmacyTitle')}</h2>
            <h1 className="text-3xl font-bold text-white">{t('settings')}</h1>
          </div>
        </div>
      </div>

      {/* Settings Menu */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="rounded-2xl border overflow-hidden"
             style={{
               backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
               borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
             }}>
          <div className="divide-y"
               style={{borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f3f4f6'}}>
            {settingsItems.map((item, index) => (
              <div key={index} className="group">
                <a
                  href={item.href}
                  className="flex items-center justify-between px-8 py-6 transition-all duration-200"
                  style={{
                    color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = document.documentElement.classList.contains('dark') 
                      ? 'rgba(6, 78, 59, 0.2)' : '#f0fdfa';
                    e.currentTarget.style.color = document.documentElement.classList.contains('dark') 
                      ? '#5eead4' : '#0f766e';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = document.documentElement.classList.contains('dark') 
                      ? '#d1d5db' : '#374151';
                  }}
                >
                  <span className="text-lg font-medium">{item.label}</span>
                  <div className="flex items-center">
                    <ChevronLeft className="w-5 h-5 rotate-180 transition-colors duration-200"
                                 style={{
                                   color: document.documentElement.classList.contains('dark') ? '#6b7280' : '#9ca3af'
                                 }} />
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm mt-8"
             style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
          <p>{t('pharmacManagementSystem')}</p>
          <p className="mt-1">{t('version')}</p>
        </div>
      </div>
    </div>
  );
}