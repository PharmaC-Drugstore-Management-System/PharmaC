import { ChevronLeft, Pencil, X, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState([
    { id: 1, name: 'Thipwimon Danwattanapong', role: 'Admin' },
    { id: 2, name: 'Kampol Suvanlai', role: 'Owner/Pharmacist' },
    { id: 3, name: 'Manie Teesuk', role: 'Employee' },
    { id: 4, name: 'Thanawat Songsang', role: 'Pharmacist' },
  ]);

  const [edit, setEdit] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Admin');

  const handleRoleChange = (id: number, newRole: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, role: newRole } : item
      )
    );
  };

  const handleRemove = (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    const newItem = {
      id: Date.now(),
      name: newName.trim(),
      role: newRole,
    };
    setItems(prev => [...prev, newItem]);
    setNewName('');
    setNewRole('Admin');
    setIsAdding(false);
  };

  const handleSave = () => {
    console.log('Saving...', items);
    setEdit(false);
  };
  const checkme = async () => {
    try {
      const authme = await fetch('http://localhost:5000/api/me', {
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
    <div className="min-h-screen bg-white p-4">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center p-6">
          <button
            className="flex items-center justify-center w-12 h-12 bg-teal-600 rounded-full mr-4"
            onClick={() => navigate('/settings')}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h2 className="text-lg font-medium text-gray-900">PhamarC</h2>
            <h1 className="text-2xl font-semibold text-gray-900">Role</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Table Header */}
          <div className="flex px-6 py-4 font-medium text-gray-700 items-center justify-between">
            <div className="flex-1 text-start">Name</div>
            <div className="w-9 text-end mr-15">Role</div>
            <button
              onClick={() => setEdit(!edit)}
              className="flex items-center px-2 py-2 bg-gray-600 hover:bg-green-600 text-white text-sm font-medium rounded-xl shadow transition"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>

          {/* Table Body */}
          <div className="space-y-2 pt-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center px-6 py-4 min-h-[72px] justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    {edit && (
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleRemove(item.id)}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                    <div className="font-medium text-gray-900">{item.name}</div>
                  </div>
                  <div className="flex items-center gap-2 w-56 justify-end">
                    {edit ? (
                      <>
                        <select
                          className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          value={item.role}
                          onChange={(e) => handleRoleChange(item.id, e.target.value)}
                        >
                          <option value="Admin">Admin</option>
                          <option value="Owner/Pharmacist">Owner/Pharmacist</option>
                          <option value="Employee">Employee</option>
                          <option value="Pharmacist">Pharmacist</option>
                        </select>
                      </>
                    ) : (
                      <p className="text-sm leading-5">{item.role}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Add Form */}
            {edit && isAdding && (
              <div className="flex items-center px-6 py-4 border border-gray-300 rounded-xl">
                <input
                  type="text"
                  placeholder="Email......."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md mr-2 text-sm"
                />
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-48 px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="Admin">Admin</option>
                  <option value="Owner/Pharmacist">Owner/Pharmacist</option>
                  <option value="Employee">Employee</option>
                  <option value="Pharmacist">Pharmacist</option>
                </select>
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          {edit && (
            <div className="flex items-center justify-between mt-6">
              {/* Add Button */}
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center justify-center w-10 h-10 bg-teal-600 text-white rounded-full shadow hover:bg-teal-700 transition"
              >
                <Plus className="w-5 h-5" />
              </button>

              {/* Save Button */}
              <button
                onClick={isAdding ? handleAdd : handleSave}
                className="bg-green-900 hover:bg-green-700 text-white text-sm font-semibold px-6 py-3 rounded-xl shadow transition"
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
