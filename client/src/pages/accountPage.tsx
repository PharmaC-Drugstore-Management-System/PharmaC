import React, { useState } from 'react';
import { ChevronLeft, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AccountPage() {
     const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    
    const [name, setName] = useState('Ratchanon Promsombut');
    const [userInfo, setUserInfo] = useState([
        { label: 'Email', value: 'tanon.p@pharmac.co' },
        { label: 'Tax ID', value: '3100701234567' },
        { label: 'Gender', value: 'Male' },
        { label: 'Phone', value: '0891234567' },
        { label: 'Birthdate', value: '1992-07-15' }
    ]);
    const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face');

    const handleInputChange = (index , newValue) => {
        const newUserInfo = [...userInfo];
        newUserInfo[index].value = newValue;
        setUserInfo(newUserInfo);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

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
                                <input
                                    type="text"
                                    className="text-xl font-semibold text-gray-900 mb-2 text-center border rounded px-2 py-1"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            ) : (
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{name}</h3>
                            )}

                            <p className="text-lg text-gray-500">#10001</p>
                        </div>

                        {/* Right side - User Information */}
                        <div className="flex-1 lg:w-2/3">
                            <div className="bg-white lg:flex">
                                {/* Vertical divider line for desktop */}
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
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? 'Save' : 'Edit'}
                    </button>
                </div>


            </div>
        </div>
    );
}
