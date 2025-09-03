import { ChevronLeft, Pencil, X, Plus, User, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [edit, setEdit] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState(1);
  const [loading, setLoading] = useState(true);

  const roleNames = {
    1: t('customer'),
    2: t('owner'), 
    3: t('pharmacist')
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
    const isDark = document.documentElement.classList.contains('dark');
    switch (roleId) {
      case 1: return <User className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />;
      case 2: return <Shield className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />;
      case 3: return <Shield className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />;
      default: return <User className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />;
    }
  };

  const getRoleBadgeColor = (roleId: number) => {
    const isDark = document.documentElement.classList.contains('dark');
    switch (roleId) {
      case 1: return isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800';
      case 2: return isDark ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-800';
      case 3: return isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800';
      default: return isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    loadUserProfile();
    loadEmployees();
  }, []);

  return (
    <div className="min-h-screen"
         style={{backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : 'white'}}>
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center p-6">
          <button
            className="flex items-center justify-center w-12 h-12 rounded-full mr-4 shadow-lg transition-all duration-200"
            style={{
              background: document.documentElement.classList.contains('dark') 
                ? 'linear-gradient(to right, #0d9488, #0f766e)' 
                : 'linear-gradient(to right, #0d9488, #0f766e)',
              color: 'white'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            }}
            onClick={() => navigate('/settings')}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h2 className="text-lg font-medium"
                style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#4b5563'}}>
              PharmaC
            </h2>
            <h1 className="text-3xl font-bold"
                style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
              {t('roleManagement')}
            </h1>
            <p className="text-sm mt-1"
               style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
              {t('manageEmployeeRoles')}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2"
                 style={{borderColor: document.documentElement.classList.contains('dark') ? '#14b8a6' : '#0d9488'}}></div>
          </div>
        ) : (
          <div className="rounded-2xl border overflow-hidden"
               style={{
                 backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                 borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#d1d5db'
               }}>
            {/* Table Header */}
            <div className="px-6 py-4 border-b"
                 style={{
                   background: document.documentElement.classList.contains('dark') 
                     ? 'linear-gradient(to right, #4b5563, #6b7280)' 
                     : 'linear-gradient(to right, #f9fafb, #f3f4f6)',
                   borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#e5e7eb'
                 }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-semibold"
                      style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                    {t('allEmployees')}
                  </h3>
                  <span className="text-sm font-medium px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: document.documentElement.classList.contains('dark') ? '#065f46' : '#ccfbf1',
                          color: document.documentElement.classList.contains('dark') ? '#10b981' : '#115e59'
                        }}>
                    {employees.length} {t('people')}
                  </span>
                </div>
                <button
                  onClick={() => setEdit(!edit)}
                  className="flex items-center px-4 py-2 text-sm font-medium rounded-xl shadow transition-all duration-200"
                  style={{
                    background: edit 
                      ? (document.documentElement.classList.contains('dark') ? '#7f1d1d' : '#dc2626')
                      : (document.documentElement.classList.contains('dark') 
                          ? 'linear-gradient(to right, #059669, #047857)' 
                          : 'linear-gradient(to right, #059669, #047857)'),
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLButtonElement;
                    target.style.background = edit 
                      ? (document.documentElement.classList.contains('dark') ? '#991b1b' : '#b91c1c')
                      : (document.documentElement.classList.contains('dark') 
                          ? 'linear-gradient(to right, #047857, #065f46)' 
                          : 'linear-gradient(to right, #047857, #065f46)');
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLButtonElement;
                    target.style.background = edit 
                      ? (document.documentElement.classList.contains('dark') ? '#7f1d1d' : '#dc2626')
                      : (document.documentElement.classList.contains('dark') 
                          ? 'linear-gradient(to right, #059669, #047857)' 
                          : 'linear-gradient(to right, #059669, #047857)');
                  }}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  {edit ? t('cancel') : t('edit')}
                </button>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y"
                 style={{borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'}}>
              {employees.map((employee) => (
                <div
                  key={employee.employee_id}
                  className="transition-colors duration-150"
                  style={{
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLDivElement;
                    target.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#4b5563' : '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLDivElement;
                    target.style.backgroundColor = 'transparent';
                  }}
                >
                  <div className="flex items-center px-6 py-4">
                    {/* Profile Section */}
                    <div className="flex items-center flex-1 min-w-0">
                      {edit && (
                        <button
                          className="mr-3 p-1 rounded-full transition-colors"
                          style={{
                            color: document.documentElement.classList.contains('dark') ? '#f87171' : '#ef4444'
                          }}
                          onMouseEnter={(e) => {
                            const target = e.target as HTMLButtonElement;
                            target.style.color = document.documentElement.classList.contains('dark') ? '#dc2626' : '#b91c1c';
                            target.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#fef2f2' : '#fef2f2';
                          }}
                          onMouseLeave={(e) => {
                            const target = e.target as HTMLButtonElement;
                            target.style.color = document.documentElement.classList.contains('dark') ? '#f87171' : '#ef4444';
                            target.style.backgroundColor = 'transparent';
                          }}
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
                        <div className="font-semibold truncate"
                             style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                          {employee.firstname} {employee.lastname}
                        </div>
                        <div className="text-sm truncate"
                             style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                          {employee.email}
                        </div>
                        {employee.phonenumber && (
                          <div className="text-xs"
                               style={{color: document.documentElement.classList.contains('dark') ? '#6b7280' : '#9ca3af'}}>
                            {employee.phonenumber}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Role Section */}
                    <div className="flex items-center ml-4">
                      {edit ? (
                        <div className="space-y-2">
                          <div className="text-sm font-medium mb-2"
                               style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                            {t('selectRole')}
                          </div>
                          {Object.entries(roleNames).map(([roleId, roleName]) => (
                            <label key={roleId} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name={`role-${employee.employee_id}`}
                                checked={employee.role_id === parseInt(roleId)}
                                onChange={() => handleRoleChange(employee.employee_id, parseInt(roleId))}
                                className="text-teal-600 focus:ring-teal-500"
                                style={{
                                  accentColor: document.documentElement.classList.contains('dark') ? '#14b8a6' : '#0d9488'
                                }}
                              />
                              <span className="text-sm"
                                    style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                                {roleName}
                              </span>
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
              <div className="px-6 py-4 border-t"
                   style={{
                     backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f9fafb',
                     borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#e5e7eb'
                   }}>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <input
                      type="email"
                      placeholder={t('newEmployeeEmail')}
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors"
                      style={{
                        backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                        borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db',
                        color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'
                      }}
                      onFocus={(e) => {
                        const target = e.target as HTMLInputElement;
                        target.style.borderColor = '#14b8a6';
                        target.style.boxShadow = '0 0 0 2px rgba(20, 184, 166, 0.2)';
                      }}
                      onBlur={(e) => {
                        const target = e.target as HTMLInputElement;
                        target.style.borderColor = document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db';
                        target.style.boxShadow = 'none';
                      }}
                    />
                    <button
                      onClick={handleAdd}
                      className="px-6 py-2 rounded-lg font-medium transition-colors"
                      style={{
                        backgroundColor: document.documentElement.classList.contains('dark') ? '#0d9488' : '#0d9488',
                        color: 'white'
                      }}
                      onMouseEnter={(e) => {
                        const target = e.target as HTMLButtonElement;
                        target.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#0f766e' : '#0f766e';
                      }}
                      onMouseLeave={(e) => {
                        const target = e.target as HTMLButtonElement;
                        target.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#0d9488' : '#0d9488';
                      }}
                    >
                      {t('add')}
                    </button>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2"
                         style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                      {t('selectDefaultRole')}
                    </div>
                    <div className="flex space-x-4">
                      {Object.entries(roleNames).map(([roleId, roleName]) => (
                        <label key={roleId} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="newRole"
                            checked={newRole === parseInt(roleId)}
                            onChange={() => setNewRole(parseInt(roleId))}
                            className="text-teal-600 focus:ring-teal-500"
                            style={{
                              accentColor: document.documentElement.classList.contains('dark') ? '#14b8a6' : '#0d9488'
                            }}
                          />
                          <span className="text-sm"
                                style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                            {roleName}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Controls */}
            {edit && (
              <div className="px-6 py-4 border-t"
                   style={{
                     backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f9fafb',
                     borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#e5e7eb'
                   }}>
                <div className="flex items-center justify-between">
                  {/* Add Button */}
                  <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg"
                    style={{
                      background: isAdding 
                        ? (document.documentElement.classList.contains('dark') ? '#4b5563' : '#4b5563')
                        : (document.documentElement.classList.contains('dark') 
                            ? 'linear-gradient(to right, #0d9488, #0f766e)' 
                            : 'linear-gradient(to right, #0d9488, #0f766e)'),
                      color: 'white'
                    }}
                    onMouseEnter={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.background = isAdding 
                        ? (document.documentElement.classList.contains('dark') ? '#6b7280' : '#6b7280')
                        : (document.documentElement.classList.contains('dark') 
                            ? 'linear-gradient(to right, #0f766e, #134e4a)' 
                            : 'linear-gradient(to right, #0f766e, #134e4a)');
                    }}
                    onMouseLeave={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.background = isAdding 
                        ? (document.documentElement.classList.contains('dark') ? '#4b5563' : '#4b5563')
                        : (document.documentElement.classList.contains('dark') 
                            ? 'linear-gradient(to right, #0d9488, #0f766e)' 
                            : 'linear-gradient(to right, #0d9488, #0f766e)');
                    }}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    {isAdding ? t('cancel') : t('addEmployee')}
                  </button>

                  {/* Save Button */}
                  <button
                    onClick={handleSave}
                    className="font-semibold px-8 py-2 rounded-lg shadow-lg transition-all duration-200"
                    style={{
                      background: document.documentElement.classList.contains('dark') 
                        ? 'linear-gradient(to right, #059669, #047857)' 
                        : 'linear-gradient(to right, #059669, #047857)',
                      color: 'white'
                    }}
                    onMouseEnter={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.background = document.documentElement.classList.contains('dark') 
                        ? 'linear-gradient(to right, #047857, #065f46)' 
                        : 'linear-gradient(to right, #047857, #065f46)';
                    }}
                    onMouseLeave={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.background = document.documentElement.classList.contains('dark') 
                        ? 'linear-gradient(to right, #059669, #047857)' 
                        : 'linear-gradient(to right, #059669, #047857)';
                    }}
                  >
                    {t('save')}
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
