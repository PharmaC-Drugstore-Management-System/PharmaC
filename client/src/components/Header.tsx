import { useEffect, useState } from "react";
import { Plus, User } from "lucide-react";
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

  // Fetch detailed user profile data if not available from /api/me
  const loadUserProfile = async () => {
    if (employeeId === null || userProfile?.firstname) return;
    
    try {
      const res = await fetch('http://localhost:5000/acc/account-detail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          employee_id: employeeId,
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setUserProfile({
          firstname: data.data.firstname || '',
          lastname: data.data.lastname || '',
          email: data.data.email || '',
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    checkme();
  }, []);

  useEffect(() => {
    if (employeeId !== null) {
      loadUserProfile();
    }
  }, [employeeId]);

  // Display name logic
  const displayName = userProfile 
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
            <button 
              onClick={() => navigate('/accountSetting')} 
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition duration-200"
            >
              <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-gray-800 font-medium hidden sm:block">{displayName}</span>
            </button>
          </div>
        </div>
      </div>
    
  );
}