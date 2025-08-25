import { useEffect, useState } from "react";
import { Plus, User, Settings, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AuthMeResponse {
  user: {
    id: number;
    email?: string;
    firstname?: string;
    lastname?: string;
    name?: string;
  };
}

interface UserProfile {
  firstname: string;
  lastname: string;
  email: string;
}

export default function Header() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const checkme = async () => {
    try {
      const authme = await fetch('http://localhost:5000/api/me', {
        method: 'GET',
        credentials: 'include'
      });
      const data: AuthMeResponse = await authme.json();
      
      if (authme.status === 401 || authme.status === 403) {
        navigate('/login');
        return;
      }

      console.log('Authme data:', data);
      setEmployeeId(data.user.id);
      
      // If the /api/me response already has firstname/lastname, use it directly
      if (data.user.firstname || data.user.lastname) {
        setUserProfile({
          firstname: data.user.firstname || '',
          lastname: data.user.lastname || '',
          email: data.user.email || '',
        });
      }
    } catch (error) {
      console.log('Error', error);
    }
  };



  useEffect(() => {
    checkme();
  }, []);



  // Display name logic - show only first name
  const displayFirstName = userProfile?.firstname || 'User';
  const fullName = userProfile 
    ? `${userProfile.firstname} ${userProfile.lastname}`.trim() || 'User'
    : 'User';
  
  return (
  
      <div
        className="sticky top-0 z-10 w-full bg-#FAF9F8
"
      >
        <div className="flex items-center p-4">
          <h1 className="font-bold text-gray-800 text-2xl">PharmaC</h1>
          <div className="ml-auto flex items-center space-x-4">
            <button onClick={()=> navigate('/poedit')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg font-semibold transition duration-200 shadow-lg hover:shadow-xl flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              สั่งซื้อยา
            </button>
            <button className="p-2 bg-gray-200 rounded-full shadow-md hover:bg-gray-300 flex items-center">
              <span>🔔</span>
            </button>
            
            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)} 
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition duration-200"
              >
                <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-gray-800 font-medium hidden sm:block">{displayFirstName}</span>
                <ChevronDown className="w-4 h-4 text-gray-600 hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  {/* User Info Section */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{fullName}</p>
                        <p className="text-sm text-gray-500">{userProfile?.email || 'No email'}</p>
                        <p className="text-xs text-gray-400">ID: #{employeeId}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate('/accountSetting');
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Profile Settings</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Overlay to close dropdown when clicking outside */}
        {showDropdown && (
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          ></div>
        )}
      </div>
    
  );
}