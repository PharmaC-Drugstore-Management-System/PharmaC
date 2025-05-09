// import { useState } from 'react';
// import { Search, Plus, Edit2, ChevronDown } from 'lucide-react';
import { Barcode, Upload } from 'lucide-react';
import Navbar from '../component/Navbar';
import Header from '../component/Header';

export default function AddMedicinePage() {


    return (
        <>

            <div className="flex flex-row">
                <Navbar />
                <div className="w-full h-full flex flex-col ">
                    {/* Header */}
                    <Header />
                    {/* Main Content */}
                    <div className="min-h-screen flex flex-col p-6">
                        <h1 className="text-3xl font-bold mb-8">Add Medication</h1>

                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Upload Image Section */}
                            <div className="bg-teal-50 rounded-lg p-6 flex flex-col items-center justify-center min-h-64 w-full md:w-1/3 border border-teal-100">
                                <div className="text-teal-600 mb-4">
                                    <Upload size={48} />
                                </div>
                                <p className="text-teal-600">Upload image</p>
                            </div>

                            {/* Form Section */}
                            <div className="w-full md:w-2/3">
                                <div className="bg-white rounded-lg p-6 shadow-sm">
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            placeholder="Brand..."
                                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />

                                        <input
                                            type="text"
                                            placeholder="Medication name..."
                                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />

                                        <input
                                            type="text"
                                            placeholder="Price..."
                                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />

                                        <input
                                            type="text"
                                            placeholder="Expired date..."
                                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />

                                        <input
                                            type="text"
                                            placeholder="Remaining..."
                                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />

                                        <button className="w-full p-3 bg-green-800 text-white rounded-lg hover:bg-green-900 transition">
                                            Submit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Barcode Scanner Button */}
                        <div className="mt-4">
                            <button className="flex items-center justify-center bg-white p-3 rounded-lg shadow-md border border-gray-200 w-full">
                                <div className="flex flex-col items-center">
                                    <span className="text-sm font-medium mb-1">Add by barcode</span>
                                    <Barcode size={40} />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}