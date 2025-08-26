import { ChevronLeft, Pencil, X, Plus, User, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Employee {
  employee_id: number;
  email: string;
  firstname: string;
  lastname: string;
  role_id: number; // Changed back to single role
  profile_image?: string;
  phonenumber?: string;
  tax_id?: string;
  address?: string;
}

interface UserProfile {
  firstname: string;
  lastname: string;
  email: string;
  employee_id: number;
  role_id: number;
  profile_image?: string;
}

export default function EditRolePage() {
  const navigate = useNavigate();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [edit, setEdit] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState(1);
  const [loading, setLoading] = useState(true);

  const roleNames = {
    1: 'Customer',
    2: 'Owner', 
    3: 'Pharmacist'
  };

  const loadUserProfile = async () => {
    try {
      console.log('Loading profile data from API...');
      
      // Step 1: Get employee_id from JWT token
      const authResponse = await fetch('http://localhost:5000/api/me', {
        method: 'GET',
        credentials: 'include'
      });

      if (authResponse.status === 401 || authResponse.status === 403) {
        navigate('/login');
        return;
      }

      const authResult = await authResponse.json();
      const employeeId = authResult.user.employee_id || authResult.user.id;

      if (!employeeId) {
        console.error('No employee ID found in token');
        navigate('/login');
        return;
      }

      // Step 2: Use employee_id to get full account details
      const accountResponse = await fetch('http://localhost:5000/acc/account-detail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ employee_id: employeeId })
      });

      if (accountResponse.status === 401 || accountResponse.status === 403) {
        navigate('/login');
        return;
      }

      const result = await accountResponse.json();
      const user = result.data;

      console.log('User account data:', user);

      setCurrentUser({
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        email: user.email || '',
        employee_id: user.employee_id || user.id,
        role_id: user.role_id || 1,
        profile_image: user.profile_image || '',
      });

    } catch (error) {
      console.log('Error loading profile data:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      // Get all employees from database
      const response = await fetch('http://localhost:5000/acc/get-all-employees', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.status === 401 || response.status === 403) {
        navigate('/login');
        return;
      }

      if (response.ok) {
        const result = await response.json();
        const employeesData = result.data || [];
        
        // Transform data to use single role_id
        const transformedEmployees: Employee[] = employeesData.map((emp: any) => ({
          employee_id: emp.employee_id,
          email: emp.email || '',
          firstname: emp.firstname || '',
          lastname: emp.lastname || '',
          role_id: emp.role_id || 1, // Single role, default to Customer
          profile_image: emp.profile_image || '',
          phonenumber: emp.phonenumber || '',
          tax_id: emp.tax_id || '',
          address: emp.address || ''
        }));
        
        setEmployees(transformedEmployees);
        console.log('Loaded employees:', transformedEmployees);
      } else {
        console.error('Failed to load employees');
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleRoleChange = (employeeId: number, roleId: number) => {
    setEmployees(prev =>
      prev.map(emp =>
        emp.employee_id === employeeId 
          ? { ...emp, role_id: roleId } 
          : emp
      )
    );
  };

  const handleRemove = (employeeId: number) => {
    setEmployees(prev => prev.filter(emp => emp.employee_id !== employeeId));
  };

  const handleAdd = () => {
    if (!newEmail.trim()) return;
    const newEmployee: Employee = {
      employee_id: Date.now(),
      email: newEmail.trim(),
      firstname: 'New',
      lastname: 'Employee',
      role_id: newRole,
      profile_image: '',
      phonenumber: '',
      tax_id: '',
      address: ''
    };
    setEmployees(prev => [...prev, newEmployee]);
    setNewEmail('');
    setNewRole(1);
    setIsAdding(false);
  };

  const handleSave = async () => {
    try {
      console.log('Saving employees...', employees);
      console.log('Employees data structure:', JSON.stringify(employees, null, 2));
      
      const response = await fetch('http://localhost:5000/acc/update-employee-roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ employees: employees })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('API Response:', result);
        console.log('Roles updated successfully');
        setEdit(false);
        // Reload employees to get fresh data
        await loadEmployees();
      } else {
        const errorText = await response.text();
        console.error('Failed to update roles. Status:', response.status, 'Error:', errorText);
      }
    } catch (error) {
      console.error('Error saving roles:', error);
    }
  };

  const getRoleIcon = (roleId: number) => {
    switch (roleId) {
      case 1: return <User className="w-4 h-4 text-blue-600" />;
      case 2: return <Shield className="w-4 h-4 text-purple-600" />;
      case 3: return <Shield className="w-4 h-4 text-green-600" />;
      default: return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (roleId: number) => {
    switch (roleId) {
      case 1: return 'bg-blue-100 text-blue-800';
      case 2: return 'bg-purple-100 text-purple-800';
      case 3: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    loadUserProfile();
    loadEmployees();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center p-6">
          <button
            className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-teal-600 to-teal-700 rounded-full mr-4 shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={() => navigate('/settings')}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h2 className="text-lg font-medium text-gray-600">PharmaC</h2>
            <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
            <p className="text-sm text-gray-500 mt-1">จัดการบทบาทและสิทธิ์ของพนักงาน</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-300 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-semibold text-gray-900">พนักงานทั้งหมด</h3>
                  <span className="bg-teal-100 text-teal-800 text-sm font-medium px-3 py-1 rounded-full">
                    {employees.length} คน
                  </span>
                </div>
                <button
                  onClick={() => setEdit(!edit)}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-xl shadow transition-all duration-200 ${
                    edit 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white'
                  }`}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  {edit ? 'ยกเลิก' : 'แก้ไข'}
                </button>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {employees.map((employee) => (
                <div
                  key={employee.employee_id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="flex items-center px-6 py-4">
                    {/* Profile Section */}
                    <div className="flex items-center flex-1 min-w-0">
                      {edit && (
                        <button
                          className="text-red-500 hover:text-red-700 mr-3 p-1 rounded-full hover:bg-red-50 transition-colors"
                          onClick={() => handleRemove(employee.employee_id)}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                      
                      {/* Profile Image */}
                      <div className="h-12 w-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center overflow-hidden mr-4 shadow-md">
                        {employee.profile_image ? (
                          <img 
                            src={employee.profile_image.startsWith('http') 
                              ? employee.profile_image 
                              : `http://localhost:5000/uploads/${employee.profile_image}`
                            }
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.parentElement!.innerHTML = '<div class="w-6 h-6 text-white font-semibold">' + employee.firstname.charAt(0) + '</div>';
                            }}
                          />
                        ) : (
                          <div className="text-white font-bold text-lg">
                            {employee.firstname.charAt(0)}
                          </div>
                        )}
                      </div>
                      
                      {/* Employee Info */}
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900 truncate">
                          {employee.firstname} {employee.lastname}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {employee.email}
                        </div>
                        {employee.phonenumber && (
                          <div className="text-xs text-gray-400">
                            {employee.phonenumber}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Role Section */}
                    <div className="flex items-center ml-4">
                      {edit ? (
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-700 mb-2">เลือก Role:</div>
                          {Object.entries(roleNames).map(([roleId, roleName]) => (
                            <label key={roleId} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name={`role-${employee.employee_id}`}
                                checked={employee.role_id === parseInt(roleId)}
                                onChange={() => handleRoleChange(employee.employee_id, parseInt(roleId))}
                                className="text-teal-600 focus:ring-teal-500"
                              />
                              <span className="text-sm">{roleName}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(employee.role_id)}
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(employee.role_id)}`}>
                            {roleNames[employee.role_id as keyof typeof roleNames]}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Form */}
            {edit && isAdding && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <input
                      type="email"
                      placeholder="อีเมล์พนักงานใหม่..."
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                    <button
                      onClick={handleAdd}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      เพิ่ม
                    </button>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">เลือก Role เริ่มต้น:</div>
                    <div className="flex space-x-4">
                      {Object.entries(roleNames).map(([roleId, roleName]) => (
                        <label key={roleId} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="newRole"
                            checked={newRole === parseInt(roleId)}
                            onChange={() => setNewRole(parseInt(roleId))}
                            className="text-teal-600 focus:ring-teal-500"
                          />
                          <span className="text-sm">{roleName}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Controls */}
            {edit && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  {/* Add Button */}
                  <button
                    onClick={() => setIsAdding(!isAdding)}
                    className={`flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isAdding 
                        ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                        : 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg'
                    }`}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    {isAdding ? 'ยกเลิก' : 'เพิ่มพนักงาน'}
                  </button>

                  {/* Save Button */}
                  <button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-8 py-2 rounded-lg shadow-lg transition-all duration-200"
                  >
                    บันทึก
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
