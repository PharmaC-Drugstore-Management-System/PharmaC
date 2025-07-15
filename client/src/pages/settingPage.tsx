import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const navigate = useNavigate();
  const settingsItems = [
    { label: 'Account', href: '/accountSetting' },
    { label: 'Page Setting', href: '/pageSetting' },
    { label: 'Edit role', href: '/editrole' },
    { label: 'Term & Condition', href: '#' },
    { label: 'Contact us', href: '#' }
  ];

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center p-6 ">
          <button className="flex items-center justify-center w-12 h-12 bg-teal-600 rounded-full mr-4"   onClick={() => navigate('/')}>
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h2 className="text-lg font-medium text-gray-900">PhamarC</h2>
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          </div>
        </div>

        {/* Settings Menu */}
        <div className="pr-22 pl-22 ">
          <div className="space-y-0">
            {settingsItems.map((item, index) => (
              <div key={index}>
                <a
                  href={item.href}
                  className="flex items-center justify-between py-4 text-gray-900 hover:text-teal-600 transition-colors duration-200"
                >
                  <span className="text-lg font-medium">{item.label}</span>
                  <ChevronLeft className="w-5 h-5 rotate-180 text-gray-400" />
                </a>
                {index < settingsItems.length - 1 && (
                  <div className="border-b border-gray-100"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}