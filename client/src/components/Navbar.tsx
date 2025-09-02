import React, { useState } from 'react';
import { 
  LayoutGrid,
  Inbox,
  BarChart3,
  Clock,
  FileText,
  Settings,
  ClipboardCheck,
  ShoppingCart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // <-- Add this line

// Tooltip Component
interface TooltipProps {
  children: React.ReactNode;
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, text }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative"
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
  const [activeTab, setActiveTab] = useState(0); // Set default
  const navigate = useNavigate(); // <-- Add this line

  const navigationItems = [
    { name: 'หน้าหลัก', icon: LayoutGrid, path: '/' },
    { name: 'คลังสินค้า', icon: Inbox, path: '/inventory' },
    { name: 'จุดขาย', icon: ShoppingCart, path: '/pos' },
    { name: 'สถิติ', icon: BarChart3, path: '/statistic' },
    { name: 'ติดตามหมดอายุ', icon: Clock, path: '/expiry-monitor' },
    { name: 'บันทึกเอกสาร', icon: FileText, path: '/doc-record' },
    { name: 'บันทึกคำสั่งซื้อ', icon: ClipboardCheck, path: '/order-record' },
    { name: 'จัดการสมาชิก', icon: null, path: '/membership' }, // Custom icon
    { name: 'ตั้งค่า', icon: Settings, path: '/settings' }
  ];

  const handleTabClick = (index: number): void => {
    setActiveTab(index);
    navigate(navigationItems[index].path);
  };

   return (
    <div className="h-screen flex items-center">
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
  );
}