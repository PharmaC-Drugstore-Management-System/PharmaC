import React, { useState } from 'react';
import { 
  LayoutGrid,
  Inbox,
  BarChart3,
  Clock,
  FileText,
  Settings,
  ClipboardCheck,
  Trophy,
  ShoppingCart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // <-- Add this line

export default function NavbarComponent() {
  const [activeTab, setActiveTab] = useState(0); // Set default
  const navigate = useNavigate(); // <-- Add this line

  const handleTabClick = (index: number): void => {
    setActiveTab(index);
    // 🔀 Navigate to the corresponding page
    switch (index) {
      case 0:
        navigate('/'); break;
      case 1:
        navigate('/inventory'); break;
      case 2:
        navigate('/pos'); break;
      case 3:
        navigate('/statistic'); break;
      case 4:
        navigate('/expiry-monitor'); break;
      case 5:
        navigate('/doc-record'); break;
      case 6:
        navigate('/order-record'); break;
      case 7:
        navigate('/membership-ranking'); break;
      case 8:
        navigate('/settings'); break;
    }
  };

   return (
    <div className="h-screen flex items-center">
      <div className="bg-teal-600 flex flex-col items-center rounded-[20px]" style={{ width: '60px', height: '85vh', marginLeft: '20px', marginRight: '20px' }}>
        <div className="flex flex-col items-center justify-between h-full py-8">
          {/* Changed from space-y-12 to space-y-6 for smaller gaps */}
          <div className="flex flex-col space-y-6">
            {/* Dashboard Icon */}
            <div 
              className={`flex items-center justify-center w-10 h-10 ${activeTab === 0 ? 'bg-white rounded-full' : ''} cursor-pointer`}
              onClick={() => handleTabClick(0)}
            >
              <LayoutGrid size={20} color={activeTab === 0 ? "#0D9488" : "white"}/>
            </div>

            {/* Inbox Icon - Inventory */}
            <div 
              className={`flex items-center justify-center w-10 h-10 ${activeTab === 1 ? 'bg-white rounded-full' : ''} cursor-pointer`}
              onClick={() => handleTabClick(1)}
            >
              <Inbox size={20} color={activeTab === 1 ? "#0D9488" : "white"} />
            </div>

            {/* POS Icon - Point of Sale */}
            <div 
              className={`flex items-center justify-center w-10 h-10 ${activeTab === 2 ? 'bg-white rounded-full' : ''} cursor-pointer`}
              onClick={() => handleTabClick(2)}
            >
              <ShoppingCart size={20} color={activeTab === 2 ? "#0D9488" : "white"} />
            </div>

            {/* Analytics Icon */}
            <div 
              className={`flex items-center justify-center w-10 h-10 ${activeTab === 3 ? 'bg-white rounded-full' : ''} cursor-pointer`}
              onClick={() => handleTabClick(3)}
            >
              <BarChart3 size={20} color={activeTab === 3 ? "#0D9488" : "white"}/>
            </div>

            {/* Clock Icon */}
            <div 
              className={`flex items-center justify-center w-10 h-10 ${activeTab === 4 ? 'bg-white rounded-full' : ''} cursor-pointer`}
              onClick={() => handleTabClick(4)}
            >
              <Clock size={20} color={activeTab === 4 ? "#0D9488" : "white"} />
            </div>

            {/* Documents Icon */}
            <div 
              className={`flex items-center justify-center w-10 h-10 ${activeTab === 5 ? 'bg-white rounded-full' : ''} cursor-pointer`}
              onClick={() => handleTabClick(5)}
            >
              <FileText size={20} color={activeTab === 5 ? "#0D9488" : "white"}/>
            </div>

            {/* Order Record */}
            <div 
              className={`flex items-center justify-center w-10 h-10 ${activeTab === 6 ? 'bg-white rounded-full' : ''} cursor-pointer`}
              onClick={() => handleTabClick(6)}
            >
              <ClipboardCheck size={20} color={activeTab === 6 ? "#0D9488" : "white"} />
            </div>

            {/* Membership's rank */}
            <div 
              className={`flex items-center justify-center w-10 h-10 ${activeTab === 7 ? 'bg-white rounded-full' : ''} cursor-pointer`}
              onClick={() => handleTabClick(7)}
            >
              <Trophy size={20} color={activeTab === 7 ? "#0D9488" : "white"} />
            </div>

            {/* Settings Icon */}
            <div 
              className={`flex items-center justify-center w-10 h-10 ${activeTab === 8 ? 'bg-white rounded-full' : ''} cursor-pointer`}
              onClick={() => handleTabClick(8)}
            >
              <Settings size={20} color={activeTab === 8 ? "#0D9488" : "white"} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}