import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        position: "",
        storeCode: "",
        street: "",
        additionalInfo: "",
        zipCode: "",
        province: "",
        country: "",
        countryCode: "",
        phoneNumber: "",
        email: "",
        acceptTerms: false,
    });

    const handleInputChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        console.log("Registration data:", formData);
    };

    return (
        <div>
            <div className=" px-6 py-4 ">
                <h1 className="text-xl font-semibold text-gray-800">PharmaC</h1>
            </div>

            <div className="min-h-screen flex items-center justify-center p-4 ">
                {/* Form Container */}
                <div className="p-6 sm:p-8 ">
                    <div className="grid grid-cols-1 lg:grid-cols-2  ">
                        {/* Left Column - General Information */}
                        <div className="bg-[#faf9f8] rounded-3xl rounded-bl-none rounded-br-none sm:rounded-3xl sm:rounded-tr-none sm:rounded-br-none  p-6 shadow-xl">
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
                                            name="firstName"
                                            placeholder="Your first name...."
                                            value={formData.firstName}
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
                                            name="lastName"
                                            placeholder="Your last name...."
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Position */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Position
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="position"
                                            value={formData.position}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white "
                                            required
                                        >
                                            <option value="" disabled hidden>
                                                Select your position
                                            </option>
                                            <option value="pharmacist">Pharmacist</option>
                                            <option value="pharmacy-technician">
                                                Pharmacy Technician
                                            </option>
                                            <option value="pharmacy-assistant">
                                                Pharmacy Assistant
                                            </option>
                                            <option value="manager">Manager</option>
                                            <option value="owner">Owner</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Store Code */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Store Code
                                    </label>
                                    <input
                                        type="text"
                                        name="storeCode"
                                        placeholder="Your Store code..."
                                        value={formData.storeCode}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Contact Details */}
                        <div className="bg-[#d6ccc2] rounded-3xl rounded-tl-none rounded-tr-none sm:rounded-3xl sm:rounded-tl-none sm:rounded-bl-none p-6 shadow-xl">
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
                                        name="street"
                                        placeholder="Your Street & No..."
                                        value={formData.street}
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
                                        name="additionalInfo"
                                        placeholder="Any additional information..."
                                        value={formData.additionalInfo}
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
                                            type="text"
                                            name="zipCode"
                                            placeholder="Your Zip Code..."
                                            value={formData.zipCode}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                                            required
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
                                            required
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

                                {/* Code + Phone Number */}


                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        placeholder="Your Phone Number..."
                                        value={formData.phoneNumber}
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
                                    onClick={handleSubmit}
                                    disabled={!formData.acceptTerms}
                                    className="w-full bg-green-700 text-white py-3 rounded-md font-semibold hover:bg-green-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                                >
                                    Register
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}