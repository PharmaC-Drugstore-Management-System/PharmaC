import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        tax_id: "",
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        phonenumber: "",
        gender: "",
        role_id: 3, // Employee role default
        storecode: "",
        additional_info: "",
        zipcode: "",
        country: "",
        province: "",
        birthdate: "",
        address: "",
        acceptTerms: false,
    });

    const [passwordError, setPasswordError] = useState("");

    const validatePassword = (password: string) => {
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        return strongPasswordRegex.test(password);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        if (name === "password") {
            if (!validatePassword(value)) {
                setPasswordError(
                    "Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters"
                );
            } else {
                setPasswordError("");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validatePassword(formData.password)) {
            setPasswordError(
                "Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters"
            );
            return;
        }

        if (!formData.acceptTerms) {
            alert("กรุณายอมรับเงื่อนไขก่อนสมัคร");
            return;
        }

        console.log("Registration data:", formData);

        await register();
    };

    const register = async () => {
        try {
            const payload = {
                ...formData,
                role_id: Number(formData.role_id),
            };

            const response = await fetch(`${API_URL}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(payload),
            });
            console.log(response);
            if (response.ok) {
                navigate("/");
            }

        } catch (error) {
            alert("เกิดข้อผิดพลาดในการสมัครสมาชิก");
            console.error(error);
        }
    };

    


    return (
        <div>
            <div className="bg-[#FAF9F8] px-6 py-4 ">
                <h1 className="text-xl font-semibold text-gray-800">PharmaC</h1>
            </div>

            <div className="bg-[#FAF9F8] min-h-screen flex items-center justify-center p-4">
                {/* Form Container */}
                <form onSubmit={handleSubmit} className="p-6 sm:p-8 w-full max-w-5xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Left Column - General Information */}
                        <div className="bg-[#FAF9F8] rounded-3xl rounded-bl-none rounded-br-none sm:rounded-3xl sm:rounded-tr-none sm:rounded-br-none p-6 shadow-xl border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-800 mb-6 text-center">
                                General Information
                            </h2>

                            <div className="space-y-4">
                                {/* First Name & Last Name */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            name="firstname"
                                            placeholder="Your first name...."
                                            value={formData.firstname}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            name="lastname"
                                            placeholder="Your last name...."
                                            value={formData.lastname}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white ${passwordError ? "border-red-500" : "border-gray-300"
                                            }`}
                                        required
                                    />
                                    {passwordError && (
                                        <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                                    )}
                                </div>

                                {/* Position */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Position
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="role_id"
                                            value={formData.role_id}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                                            required
                                        >
                                            <option value="" disabled hidden>
                                                Select your position
                                            </option>
                                            <option value={1}>Admin</option>
                                            <option value={2}>Owner</option>
                                            <option value={3}>Employee</option>
                                            <option value={4}>Phamarcist</option>
                                            <option value={5}>Owner/Phamarcist</option>
                                            <option value={6}>Employee/Phamarcist</option>
                                        </select>

                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Gender
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                                            required
                                        >
                                            <option value="" disabled hidden>
                                                Select your position
                                            </option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                    </div>
                                </div>
                                {/* Birthdate */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Birthdate
                                    </label>
                                    <input
                                        type="date"
                                        name="birthdate"
                                        value={formData.birthdate ? formData.birthdate.split('T')[0] : ''}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                                        required
                                    />
                                </div>
                                {/* Tax id */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tax id
                                    </label>
                                    <input
                                        type="number"
                                        name="tax_id"
                                        value={formData.tax_id}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                                        required
                                    />
                                </div>


                                {/* Store Code */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Store Code
                                    </label>
                                    <input
                                        type="text"
                                        name="storecode"
                                        placeholder="Your Store code..."
                                        value={formData.storecode}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Contact Details */}
                        <div className="bg-[#d6ccc2] rounded-3xl rounded-tl-none rounded-tr-none sm:rounded-3xl sm:rounded-tl-none sm:rounded-bl-none p-6 shadow-xl border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-800 mb-6 text-center">
                                Contact Details
                            </h2>

                            <div className="space-y-4">
                                {/* Street + No */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Street + No
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        placeholder="Your Street & No..."
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                                        required
                                    />
                                </div>

                                {/* Additional Information */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Additional Information
                                    </label>
                                    <input
                                        type="text"
                                        name="additional_info"
                                        placeholder="Any additional information..."
                                        value={formData.additional_info}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                                    />
                                </div>

                                {/* Zip Code & Province */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Zip Code
                                        </label>
                                        <input
                                            type="number"
                                            name="zipcode"
                                            placeholder="Your Zip Code..."
                                            value={formData.zipcode}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Province
                                        </label>
                                        <input
                                            type="text"
                                            name="province"
                                            placeholder="Your Province..."
                                            value={formData.province}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                                        />
                                    </div>
                                </div>

                                {/* Country */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        name="country"
                                        placeholder="Your Country..."
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                                        required
                                    />
                                </div>

                                {/* Phone Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="number"
                                        name="phonenumber"
                                        placeholder="Your Phone Number..."
                                        value={formData.phonenumber}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                                        required
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Your Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Your Email..."
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                                        required
                                    />
                                </div>

                                {/* Terms and Conditions */}
                                <div className="flex items-start space-x-2 mt-6">
                                    <input
                                        type="checkbox"
                                        name="acceptTerms"
                                        checked={formData.acceptTerms}
                                        onChange={handleInputChange}
                                        className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                        required
                                    />
                                    <label className="text-sm text-gray-700">
                                        I do accept the{" "}
                                        <a
                                            href="#"
                                            className="text-green-600 hover:text-green-700 underline"
                                        >
                                            Terms and Conditions
                                        </a>{" "}
                                        of your site.
                                    </label>
                                </div>

                                {/* Register Button */}
                                <button
                                    type="submit"
                                    disabled={!formData.acceptTerms || passwordError !== ""}
                                    className="w-full bg-green-700 text-white py-3 rounded-md font-semibold hover:bg-green-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                                >
                                    Register
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
