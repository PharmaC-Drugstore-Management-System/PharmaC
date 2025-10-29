import React, { useState, useEffect } from 'react';
import { 
  Inbox,
  Clock,
  FileText,
  Settings,
  ClipboardCheck,
  ShoppingCart,
  Menu,
  X,
  BarChart3
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Tooltip Component
interface TooltipProps {
  children: React.ReactNode;
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, text }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative hidden md:block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute left-16 top-1/2 transform -translate-y-1/2 z-50">
          <div className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg whitespace-nowrap">
            {text}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1">
              <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-r-[6px] border-transparent border-r-gray-800"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function NavbarComponent() {
  const [activeTab, setActiveTab] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const navigationItems = [
    { name: t('pointOfSale'), icon: ShoppingCart, path: '/' },  // POS เป็นหน้าแรก
    { name: t('dashboard'), icon: BarChart3, path: '/dashboard' },  // Dashboard ดูภาพรวม
    { name: t('inventory'), icon: Inbox, path: '/inventory' },
    { name: t('expiryMonitor'), icon: Clock, path: '/expiry-monitor' },
    { name: t('documentRecords'), icon: FileText, path: '/doc-record' },
    { name: t('orderRecords'), icon: ClipboardCheck, path: '/order-record' },
    { name: t('memberManagement'), icon: null, path: '/membership' },
    { name: t('settings'), icon: Settings, path: '/settings' }
  ];

  // Sync activeTab with current URL on mount and location change
  useEffect(() => {
    const currentPath = location.pathname;
    const currentIndex = navigationItems.findIndex(item => {
      // Exact match for most routes
      if (item.path === currentPath) return true;
      // Special case: /inventory/:id should highlight inventory tab
      if (item.path === '/inventory' && currentPath.startsWith('/inventory')) return true;
      // Special case: /pos should highlight POS (/) tab
      if (item.path === '/' && currentPath === '/pos') return true;
      return false;
    });
    
    if (currentIndex !== -1) {
      setActiveTab(currentIndex);
    }
  }, [location.pathname, navigationItems]);

  const handleTabClick = (index: number): void => {
    setActiveTab(index);
    navigate(navigationItems[index].path);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navbar */}
      <div className="hidden md:flex h-screen items-center">
        <div className="bg-teal-600 dark:bg-teal-700 flex flex-col items-center rounded-[20px]" style={{ width: '60px', height: '85vh', marginLeft: '20px', marginRight: '20px' }}>
          <div className="flex flex-col items-center justify-between h-full py-8">
            <div className="flex flex-col space-y-6">
              {navigationItems.map((item, index) => (
                <Tooltip key={index} text={item.name}>
                  <div 
                    className={`flex items-center justify-center w-10 h-10 ${activeTab === index ? 'bg-white dark:bg-gray-200 rounded-full' : ''} cursor-pointer transition-all duration-200 hover:scale-110`}
                    onClick={() => handleTabClick(index)}
                  >
                    {item.icon ? (
                      <item.icon size={20} color={activeTab === index ? "#0D9488" : "white"} />
                    ) : (
                      // Custom membership icon
                      <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="8" r="4" stroke={activeTab === index ? "#0D9488" : "white"} strokeWidth="2" />
                        <rect x="6" y="14" width="12" height="6" rx="3" stroke={activeTab === index ? "#0D9488" : "white"} strokeWidth="2" />
                      </svg>
                    )}
                  </div>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed bottom-4 right-4 z-50 bg-teal-600 dark:bg-teal-700 text-white p-3 rounded-full shadow-lg hover:bg-teal-700 dark:hover:bg-teal-800 transition-all duration-200"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Navbar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Navbar */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 bg-teal-600 dark:bg-teal-700 transform transition-transform duration-300 z-40 ${isMobileMenuOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="grid grid-cols-4 gap-2 p-4">
          {navigationItems.map((item, index) => (
            <div
              key={index}
              className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${activeTab === index ? 'bg-white dark:bg-gray-200' : ''}`}
              onClick={() => handleTabClick(index)}
            >
              {item.icon ? (
                <item.icon size={20} color={activeTab === index ? "#0D9488" : "white"} />
              ) : (
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke={activeTab === index ? "#0D9488" : "white"} strokeWidth="2" />
                  <rect x="6" y="14" width="12" height="6" rx="3" stroke={activeTab === index ? "#0D9488" : "white"} strokeWidth="2" />
                </svg>
              )}
              <span className={`text-xs mt-1 text-center ${activeTab === index ? 'text-teal-600' : 'text-white'}`}>
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}