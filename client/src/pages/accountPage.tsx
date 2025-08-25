import { useEffect, useState } from 'react';
import { ChevronLeft, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AccountDetailResponse {
    data: {
        employee_id: number;
        firstname: string;
        lastname: string;
        email: string;
        tax_id: string;
        gender?: string;
        phonenumber: string;
        birthdate: string;
        address?: string;
        additional_info?: string;
        country?: string;
        province?: string;
        storecode?: string;
        zipcode?: string;
    };
}

export default function AccountPage() {
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [firstname, setFirstname] = useState('');
    const [employeeid, setEmployeeId] = useState<number | null>(null);
    const [lastname, setLastname] = useState('');

    const [userInfo, setUserInfo] = useState([
        { label: 'Email', value: '' },
        { label: 'Tax ID', value: '' },
        { label: 'Gender', value: '' },
        { label: 'Phone', value: '' },
        { label: 'Birthdate', value: '' },
        { label: 'Address', value: '' },
        { label: 'Additional Info', value: '' },
        { label: 'Country', value: '' },
        { label: 'Province', value: '' },
        { label: 'Store Code', value: '' },
        { label: 'Zip Code', value: '' }
    ]);

    const [imageUrl, setImageUrl] = useState(
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
    );

    const handleInputChange = (index: number, newValue: string) => {
        const newUserInfo = [...userInfo];
        newUserInfo[index].value = newValue;
        setUserInfo(newUserInfo);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    setImageUrl(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const loadDataFromAPI = async () => {
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

            // Set basic info
            setFirstname(user.firstname || '');
            setLastname(user.lastname || '');
            setEmployeeId(user.employee_id || user.id);

            // Set user info fields
            setUserInfo([
                { label: 'Email', value: user.email || '' },
                { label: 'Tax ID', value: user.tax_id || '' },
                { label: 'Gender', value: user.gender || '' },
                { label: 'Phone', value: user.phonenumber || '' },
                {
                    label: 'Birthdate',
                    value: user.birthdate 
                        ? new Date(user.birthdate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                        })
                        : ''
                },
                { label: 'Address', value: user.address || '' },
                { label: 'Additional Info', value: user.additional_info || '' },
                { label: 'Country', value: user.country || '' },
                { label: 'Province', value: user.province || '' },
                { label: 'Store Code', value: user.storecode || '' },
                { label: 'Zip Code', value: user.zipcode || '' }
            ]);
        } catch (error) {
            console.log('Error loading profile data:', error);
            navigate('/login');
        }
    };


    const editAccount = async () => {
        try {
            const body = {
                employee_id: Number(employeeid),
                firstname: firstname,
                lastname: lastname,
                email: userInfo[0].value,
                tax_id: userInfo[1].value,
                gender: userInfo[2].value,
                phonenumber: userInfo[3].value,
                birthdate: userInfo[4].value,
                address: userInfo[5].value,
                additional_info: userInfo[6].value,
                country: userInfo[7].value,
                province: userInfo[8].value,
                storecode: userInfo[9].value,
                zipcode: userInfo[10].value,
            };
            console.log(body);

            const edit = await fetch('http://localhost:5000/acc/edit-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(body),
            });

            console.log('Successful');
            const result = await edit.json();
            console.log(result);
        } catch (error) {
            console.log('Error', error);
        }
    };

    const handleEdit = async () => {
        await editAccount();
    };

    useEffect(() => {
        loadDataFromAPI();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center py-6">
                         <button
                            onClick={() => navigate('/settings')}
                            className="flex items-center justify-center w-12 h-12 bg-teal-600 rounded-xl mr-4 shadow-lg hover:bg-gray-700 transition-colors duration-200"
                        >
                            <ChevronLeft className="w-6 h-6 text-white" />
                        </button>
                        <div>
                            <h2 className="text-lg font-medium text-gray-600">PharmaC</h2>
                            <h1 className="text-2xl font-bold text-gray-900">Account Management</h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Profile Header Card */}
                <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden border border-gray-200">
                    <div className="bg-gray-800 px-8 py-6">
                        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                            {/* Profile Image */}
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full overflow-hidden bg-white p-1 shadow-lg">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-200 group cursor-pointer relative">
                                        <img
                                            src={imageUrl}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                        {isEditing && (
                                            <>
                                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-200">
                                                    <Pencil className="w-6 h-6" />
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Name and ID */}
                            <div className="text-center md:text-left text-white">
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            className="text-2xl font-bold bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg px-4 py-2 w-full"
                                            value={firstname}
                                            onChange={(e) => setFirstname(e.target.value)}
                                            placeholder="First name"
                                        />
                                        <input
                                            type="text"
                                            className="text-2xl font-bold bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg px-4 py-2 w-full"
                                            value={lastname}
                                            onChange={(e) => setLastname(e.target.value)}
                                            placeholder="Last name"
                                        />
                                    </div>
                                ) : (
                                    <h1 className="text-3xl font-bold mb-2">{`${firstname} ${lastname}`}</h1>
                                )}
                                <div className="flex items-center justify-center md:justify-start space-x-2">
                                    <span className="px-3 py-1 bg-gray-700 rounded-full text-sm font-medium">
                                        Employee ID: #10001
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Information Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Personal Information Card */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                        <div className="bg-gray-700 px-6 py-4">
                            <h2 className="text-xl font-bold text-white">Personal Information</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {userInfo.slice(0, 5).map((item, index) => (
                                <div key={index} className="group">
                                    <div className="flex flex-col space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                            {item.label}
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type={item.label === 'Email' ? 'email' : item.label === 'Phone' ? 'tel' : 'text'}
                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-gray-600 focus:outline-none transition-colors duration-200 bg-white hover:border-gray-400"
                                                value={item.value}
                                                onChange={(e) => handleInputChange(index, e.target.value)}
                                                placeholder={`Enter ${item.label.toLowerCase()}`}
                                            />
                                        ) : (
                                            <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                                                <span className="text-gray-900 font-medium">
                                                    {item.value || 'Not specified'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Address & Work Information Card */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                        <div className="bg-gray-700 px-6 py-4">
                            <h2 className="text-xl font-bold text-white">Address & Work Information</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {userInfo.slice(5).map((item, index) => (
                                <div key={index + 5} className="group">
                                    <div className="flex flex-col space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                            {item.label}
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-gray-600 focus:outline-none transition-colors duration-200 bg-white hover:border-gray-400"
                                                value={item.value}
                                                onChange={(e) => handleInputChange(index + 5, e.target.value)}
                                                placeholder={`Enter ${item.label.toLowerCase()}`}
                                            />
                                        ) : (
                                            <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                                                <span className="text-gray-900 font-medium">
                                                    {item.value || 'Not specified'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-center">
                    <button
                        className="px-12 py-4 rounded-2xl text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg bg-gray-800 hover:bg-gray-700 text-white"
                        onClick={() => {
                            if (isEditing) {
                                handleEdit();
                            }
                            setIsEditing(!isEditing);
                        }}
                    >
                        {isEditing ? (
                            <span className="flex items-center space-x-2">
                                <span>Save Changes</span>
                            </span>
                        ) : (
                            <span className="flex items-center space-x-2">
                                <Pencil className="w-5 h-5" />
                                <span>Edit Profile</span>
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
