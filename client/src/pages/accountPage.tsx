import { useEffect, useState } from 'react';
import { ChevronLeft, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL;

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
    const { t } = useTranslation();

    const [isEditing, setIsEditing] = useState(false);
    const [firstname, setFirstname] = useState('');
    const [employeeid, setEmployeeId] = useState<number | null>(null);
    const [lastname, setLastname] = useState('');

    const getUserInfoLabels = () => [
        { label: t('email'), value: '' },
        { label: t('taxId'), value: '' },
        { label: t('gender'), value: '' },
        { label: t('phone'), value: '' },
        { label: t('birthdate'), value: '' },
        { label: t('address'), value: '' },
        { label: t('additionalInfo'), value: '' },
        { label: t('country'), value: '' },
        { label: t('province'), value: '' },
        { label: t('storeCode'), value: '' },
        { label: t('zipCode'), value: '' }
    ];

    const [userInfo, setUserInfo] = useState(getUserInfoLabels());

    const [imageUrl, setImageUrl] = useState(
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
    );

    const handleInputChange = (index: number, newValue: string) => {
        const newUserInfo = [...userInfo];
        newUserInfo[index].value = newValue;
        setUserInfo(newUserInfo);
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                console.log('🖼️ Image change started');
                console.log('📁 Selected file:', file);
                
                // แสดงตัวอย่างรูปภาพทันที
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (typeof reader.result === 'string') {
                        console.log('👁️ Setting preview image');
                        setImageUrl(reader.result);
                    }
                };
                reader.readAsDataURL(file);

                // อัพโหลดไฟล์ไปยัง server ทันที (ไม่ต้องรอ save)
                console.log('📤 Starting upload to server...');
                const formData = new FormData();
                formData.append('profileImage', file);

                const response = await fetch(`${API_URL}/acc/upload-profile-image`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });

                console.log('📨 Response status:', response.status);
                console.log('📨 Response ok:', response.ok);

                if (response.ok) {
                    const result = await response.json();
                    console.log('✅ Profile image uploaded successfully:', result);
                    
                    // อัพเดท imageUrl ด้วย URL จริงจาก server
                    setImageUrl(result.data.imageUrl);
                    console.log('🎉 Image URL updated:', result.data.imageUrl);
                    
                    // แสดงข้อความสำเร็จ
                    alert('Profile image updated successfully!');
                } else {
                    const errorResult = await response.json();
                    console.error('❌ Failed to upload profile image:', errorResult);
                    
                    // แสดงข้อความผิดพลาด
                    alert(`Failed to upload image: ${errorResult.message}`);
                    
                    // โหลดข้อมูลใหม่เพื่อเอารูปเดิมกลับมา
                    loadDataFromAPI();
                }
            } catch (error) {
                console.error('💥 Error uploading profile image:', error);
                alert('Error uploading image. Please try again.');
                
                // โหลดข้อมูลใหม่เพื่อเอารูปเดิมกลับมา
                loadDataFromAPI();
            }
        }
    };

    const loadDataFromAPI = async () => {
        try {
            console.log('Loading profile data from API...');
            
            // Step 1: Get employee_id from JWT token
            const authResponse = await fetch(`${API_URL}/api/me`, {
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
            const accountResponse = await fetch(`${API_URL}/acc/account-detail`, {
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

            // Set profile image from database or use default
            if (user.profile_image) {
                setImageUrl(user.profile_image);
            } else {
                setImageUrl('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face');
            }

            // Set user info fields with translated labels
            const updatedUserInfo = getUserInfoLabels().map((item, index) => {
                const values = [
                    user.email || '',
                    user.tax_id || '',
                    user.gender || '',
                    user.phonenumber || '',
                    user.birthdate 
                        ? new Date(user.birthdate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                        })
                        : '',
                    user.address || '',
                    user.additional_info || '',
                    user.country || '',
                    user.province || '',
                    user.storecode || '',
                    user.zipcode || ''
                ];
                return { ...item, value: values[index] };
            });
            
            setUserInfo(updatedUserInfo);
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

            const edit = await fetch(`${API_URL}/acc/edit-account`, {
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
        <div className="min-h-screen"
             style={{backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#f9fafb'}}>
            {/* Header */}
            <div className="shadow-sm border-b"
                 style={{
                   backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                   borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
                 }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center py-6">
                         <button
                            onClick={() => navigate('/settings')}
                            className="flex items-center justify-center w-12 h-12 bg-teal-600 rounded-xl mr-4 shadow-lg hover:bg-gray-700 transition-colors duration-200"
                        >
                            <ChevronLeft className="w-6 h-6 text-white" />
                        </button>
                        <div>
                            <h2 className="text-lg font-medium"
                                style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>{t('pharmacyTitle')}</h2>
                            <h1 className="text-2xl font-bold"
                                style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>{t('accountManagement')}</h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Profile Header Card */}
                <div className="rounded-2xl shadow-lg mb-8 overflow-hidden border"
                     style={{
                       backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                       borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
                     }}>
                    <div className="px-8 py-6"
                         style={{backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#374151'}}>
                        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">

                            {/* Profile Image */}
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full overflow-hidden bg-white p-1 shadow-lg">
                                    <div className="w-full h-full rounded-full overflow-hidden group cursor-pointer relative"
                                         style={{backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'}}>
                                        <img
                                            src={imageUrl}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                        {/* Always show change profile picture overlay */}
                                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-200">
                                            <div className="text-center">
                                                <Pencil className="w-6 h-6 mx-auto mb-1" />
                                                <span className="text-xs font-medium">{t('changePhoto')}</span>
                                            </div>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            title="Click to change profile picture"
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* Name and ID */}
                            <div className="text-center md:text-left text-white">
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            className="text-2xl font-bold placeholder-gray-500 border rounded-lg px-4 py-2 w-full"
                                            style={{
                                              backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : 'white',
                                              borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db',
                                              color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'
                                            }}
                                            value={firstname}
                                            onChange={(e) => setFirstname(e.target.value)}
                                            placeholder={t('firstName')}
                                        />
                                        <input
                                            type="text"
                                            className="text-2xl font-bold placeholder-gray-500 border rounded-lg px-4 py-2 w-full"
                                            style={{
                                              backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : 'white',
                                              borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db',
                                              color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'
                                            }}
                                            value={lastname}
                                            onChange={(e) => setLastname(e.target.value)}
                                            placeholder={t('lastName')}
                                        />
                                    </div>
                                ) : (
                                    <h1 className="text-3xl font-bold mb-2">{`${firstname} ${lastname}`}</h1>
                                )}
                                <div className="flex items-center justify-center md:justify-start space-x-2">
                                    <span className="px-3 py-1 rounded-full text-sm font-medium"
                                          style={{backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#374151'}}>
                                        {t('employeeId')}: #10001
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Information Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Personal Information Card */}
                    <div className="rounded-2xl shadow-lg overflow-hidden border"
                         style={{
                           backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                           borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
                         }}>
                        <div className="px-6 py-4"
                             style={{backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#374151'}}>
                            <h2 className="text-xl font-bold text-white">{t('personalInformation')}</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {userInfo.slice(0, 5).map((item, index) => (
                                <div key={index} className="group">
                                    <div className="flex flex-col space-y-2">
                                        <label className="text-sm font-semibold uppercase tracking-wide"
                                               style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                                            {item.label}
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type={item.label === 'Email' ? 'email' : item.label === 'Phone' ? 'tel' : 'text'}
                                                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors duration-200"
                                                style={{
                                                  backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : 'white',
                                                  borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db',
                                                  color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'
                                                }}
                                                onFocus={(e) => {
                                                  const target = e.target as HTMLInputElement;
                                                  target.style.borderColor = document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280';
                                                }}
                                                onBlur={(e) => {
                                                  const target = e.target as HTMLInputElement;
                                                  target.style.borderColor = document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db';
                                                }}
                                                onMouseEnter={(e) => {
                                                  const target = e.target as HTMLInputElement;
                                                  if (target !== document.activeElement) {
                                                    target.style.borderColor = document.documentElement.classList.contains('dark') ? '#9ca3af' : '#9ca3af';
                                                  }
                                                }}
                                                onMouseLeave={(e) => {
                                                  const target = e.target as HTMLInputElement;
                                                  if (target !== document.activeElement) {
                                                    target.style.borderColor = document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db';
                                                  }
                                                }}
                                                value={item.value}
                                                onChange={(e) => handleInputChange(index, e.target.value)}
                                                placeholder={`${t('enterField', { field: item.label.toLowerCase() })}`}
                                            />
                                        ) : (
                                            <div className="px-4 py-3 rounded-xl border"
                                                 style={{
                                                   backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f9fafb',
                                                   borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#e5e7eb'
                                                 }}>
                                                <span className="font-medium"
                                                      style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                                                    {item.value || t('notSpecified')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Address & Work Information Card */}
                    <div className="rounded-2xl shadow-lg overflow-hidden border"
                         style={{
                           backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                           borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
                         }}>
                        <div className="px-6 py-4"
                             style={{backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#374151'}}>
                            <h2 className="text-xl font-bold text-white">{t('addressWorkInformation')}</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {userInfo.slice(5).map((item, index) => (
                                <div key={index + 5} className="group">
                                    <div className="flex flex-col space-y-2">
                                        <label className="text-sm font-semibold uppercase tracking-wide"
                                               style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                                            {item.label}
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors duration-200"
                                                style={{
                                                  backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : 'white',
                                                  borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db',
                                                  color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'
                                                }}
                                                onFocus={(e) => {
                                                  const target = e.target as HTMLInputElement;
                                                  target.style.borderColor = document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280';
                                                }}
                                                onBlur={(e) => {
                                                  const target = e.target as HTMLInputElement;
                                                  target.style.borderColor = document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db';
                                                }}
                                                onMouseEnter={(e) => {
                                                  const target = e.target as HTMLInputElement;
                                                  if (target !== document.activeElement) {
                                                    target.style.borderColor = document.documentElement.classList.contains('dark') ? '#9ca3af' : '#9ca3af';
                                                  }
                                                }}
                                                onMouseLeave={(e) => {
                                                  const target = e.target as HTMLInputElement;
                                                  if (target !== document.activeElement) {
                                                    target.style.borderColor = document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db';
                                                  }
                                                }}
                                                value={item.value}
                                                onChange={(e) => handleInputChange(index + 5, e.target.value)}
                                                placeholder={`${t('enterField', { field: item.label.toLowerCase() })}`}
                                            />
                                        ) : (
                                            <div className="px-4 py-3 rounded-xl border"
                                                 style={{
                                                   backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f9fafb',
                                                   borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#e5e7eb'
                                                 }}>
                                                <span className="font-medium"
                                                      style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                                                    {item.value || t('notSpecified')}
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
                        className="px-12 py-4 rounded-2xl text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
                        style={{
                          backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#374151',
                          color: 'white'
                        }}
                        onMouseEnter={(e) => {
                          const target = e.target as HTMLButtonElement;
                          target.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#374151' : '#4b5563';
                        }}
                        onMouseLeave={(e) => {
                          const target = e.target as HTMLButtonElement;
                          target.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#1f2937' : '#374151';
                        }}
                        onClick={() => {
                            if (isEditing) {
                                handleEdit();
                            }
                            setIsEditing(!isEditing);
                        }}
                    >
                        {isEditing ? (
                            <span className="flex items-center space-x-2">
                                <span>{t('saveChanges')}</span>
                            </span>
                        ) : (
                            <span className="flex items-center space-x-2">
                                <Pencil className="w-5 h-5" />
                                <span>{t('editProfile')}</span>
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
