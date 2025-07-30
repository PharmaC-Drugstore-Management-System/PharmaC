import { useEffect, useState } from 'react';
import { ChevronLeft, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthMeResponse {
    user: {
        id: number;
    };
}

interface AccountDetailResponse {
    data: {
        firstname: string;
        lastname: string;
        email: string;
        tax_id: string;
        gender?: string;
        phonenumber: string;
        birthdate: string;
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
        { label: 'Birthdate', value: '' }
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

    const checkme = async () => {
        try {
            const authme = await fetch('http://localhost:5000/api/me', {
                method: 'GET',
                credentials: 'include'
            });
            const data: AuthMeResponse = await authme.json();

            if (authme.status === 401) {
                navigate('/login');
                return;
            }

            console.log('Authme data:', data);
            setEmployeeId(data.user.id);
        } catch (error) {
            console.log('Error', error);
        }
    };

    const loadData = async () => {
        if (employeeid === null) return;

        try {
            const res = await fetch('http://localhost:5000/acc/account-detail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employee_id: employeeid,
                }),
            });
            const load: AccountDetailResponse = await res.json();

            setFirstname(load.data.firstname || '');
            setLastname(load.data.lastname || '');

            setUserInfo([
                { label: 'Email', value: load.data.email },
                { label: 'Tax ID', value: load.data.tax_id },
                { label: 'Gender', value: load.data.gender || 'N/A' },
                { label: 'Phone', value: load.data.phonenumber },
                {
                    label: 'Birthdate',
                    value: new Date(load.data.birthdate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                    }),
                },
            ]);
        } catch (error) {
            console.log('Error', error);
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
        checkme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (employeeid !== null) {
            loadData();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [employeeid]);

    return (
        <div className="min-h-screen bg-white p-4">
            <div className="w-full">
                {/* Header */}
                <div className="flex items-center p-6">
                    <button
                        onClick={() => navigate('/settings')}
                        className="flex items-center justify-center w-12 h-12 bg-teal-600 rounded-full mr-4"
                    >
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <div>
                        <h2 className="text-lg font-medium text-gray-900">PharmAC</h2>
                        <h1 className="text-2xl font-semibold text-gray-900">Account</h1>
                    </div>
                </div>

                {/* Profile Section */}
                <div className="flex justify-center items-center p-10">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8 p-10 bg-white rounded-lg shadow-md">
                        {/* Left side - Profile Image and Name */}
                        <div className="flex flex-col items-center mb-8 lg:mb-0 lg:w-1/2">
                            <div className="relative w-48 h-48 rounded-full overflow-hidden bg-gray-200 mb-6 group cursor-pointer">
                                <img
                                    src={imageUrl}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                                {isEditing && (
                                    <>
                                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Pencil className="w-8 h-8" />
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

                            {isEditing ? (
                                <div className="flex flex-col sm:flex-row sm:space-x-2 text-center sm:text-left">
                                    <input
                                        type="text"
                                        className="text-xl font-semibold text-gray-900 mb-2 sm:mb-0 border rounded px-2 py-1"
                                        value={firstname}
                                        onChange={(e) => setFirstname(e.target.value)}
                                        placeholder="First name"
                                    />
                                    <input
                                        type="text"
                                        className="text-xl font-semibold text-gray-900 mb-2 border rounded px-2 py-1"
                                        value={lastname}
                                        onChange={(e) => setLastname(e.target.value)}
                                        placeholder="Last name"
                                    />
                                </div>
                            ) : (
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{`${firstname} ${lastname}`}</h3>
                            )}
                            <p className="text-lg text-gray-500">#10001</p>
                        </div>

                        {/* Right side - User Information */}
                        <div className="flex-1 lg:w-2/3">
                            <div className="bg-white lg:flex">
                                <div className="hidden lg:block w-px bg-gray-200 mr-8"></div>
                                <div className="space-y-6 flex-1">
                                    {userInfo.map((item, index) => (
                                        <div key={index} className="flex flex-col sm:flex-row sm:items-center py-2">
                                            <span className="text-lg font-medium text-gray-700 mb-1 sm:mb-0 sm:w-auto sm:mr-4 flex items-center">
                                                {item.label}
                                                {isEditing && <Pencil className="w-4 h-4 ml-2 text-gray-500" />}
                                            </span>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    className="text-lg text-gray-900 sm:w-auto sm:text-left border rounded px-2 py-1"
                                                    value={item.value}
                                                    onChange={(e) => handleInputChange(index, e.target.value)}
                                                />
                                            ) : (
                                                <span className="text-lg text-gray-900 sm:w-auto sm:text-left">
                                                    {item.value}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit / Save Button */}
                <div className="flex justify-center mt-8 w-full px-4">
                    <button
                        className="bg-green-700 hover:bg-green-800 text-white w-1/3 sm:px-60 py-4 rounded-lg text-lg font-medium transition-colors duration-200 text-center"
                        onClick={() => {
                            if (isEditing) {
                                handleEdit();
                            }
                            setIsEditing(!isEditing);
                        }}
                    >
                        {isEditing ? 'Save' : 'Edit'}
                    </button>
                </div>
            </div>
        </div>
    );
}
