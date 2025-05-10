import React, { useState } from 'react';
import { 
  LayoutGrid,
  Inbox,
  BarChart3,
  Clock,
  FileText,
  Settings
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
        navigate('/inbox'); break;
      case 2:
        navigate('/analytics'); break;
      case 3:
        navigate('/clock'); break;
      case 4:
        navigate('/documents'); break;
      case 5:
        navigate('/settings'); break;
    }
  };

  return (
    <div className="h-screen flex items-center">
      <div className="bg-teal-600 flex flex-col items-center rounded-[20px]" style={{ width: '60px', height: '90vh', marginLeft: '20px', marginRight: '20px' }}>
        <div className="flex flex-col items-center justify-between h-full py-8">
          <div className="flex flex-col space-y-12">
            {/* Dashboard Icon */}
            <div 
              className={`flex items-center justify-center w-10 h-10 ${activeTab === 0 ? 'bg-white rounded-full' : ''} cursor-pointer`}
              onClick={() => handleTabClick(0)}
            >
              <LayoutGrid size={20} color={activeTab === 0 ? "#0D9488" : "white"}/>
            </div>

            {/* Inbox Icon */}
            <div 
              className={`flex items-center justify-center w-10 h-10 ${activeTab === 1 ? 'bg-white rounded-full' : ''} cursor-pointer`}
              onClick={() => handleTabClick(1)}
            >
              <Inbox size={20} color={activeTab === 1 ? "#0D9488" : "white"} />
            </div>

            {/* Analytics Icon */}
            <div 
              className={`flex items-center justify-center w-10 h-10 ${activeTab === 2 ? 'bg-white rounded-full' : ''} cursor-pointer`}
              onClick={() => handleTabClick(2)}
            >
              <BarChart3 size={20} color={activeTab === 2 ? "#0D9488" : "white"}/>
            </div>

            {/* Clock Icon */}
            <div 
              className={`flex items-center justify-center w-10 h-10 ${activeTab === 3 ? 'bg-white rounded-full' : ''} cursor-pointer`}
              onClick={() => handleTabClick(3)}
            >
              <Clock size={20} color={activeTab === 3 ? "#0D9488" : "white"} />
            </div>

            {/* Documents Icon */}
            <div 
              className={`flex items-center justify-center w-10 h-10 ${activeTab === 4 ? 'bg-white rounded-full' : ''} cursor-pointer`}
              onClick={() => handleTabClick(4)}
            >
              <FileText size={20} color={activeTab === 4 ? "#0D9488" : "white"}/>
            </div>
          </div>

          {/* Settings Icon */}
          <div 
            className={`flex items-center justify-center w-10 h-10 ${activeTab === 5 ? 'bg-white rounded-full' : ''} cursor-pointer`}
            onClick={() => handleTabClick(5)}
          >
            <Settings size={20} color={activeTab === 5 ? "#0D9488" : "white"} />
          </div>
        </div>
      </div>
    </div>
  );
}
