import { useState } from 'react';
import { Barcode, Upload } from 'lucide-react';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import BarcodeScanner from 'react-qr-barcode-scanner';
import type { Result } from '@zxing/library'; // Import correct type

export default function AddMedicinePage() {
    const [data, setData] = useState("Not Found");
    const [showScanner, setShowScanner] = useState(false);
    const [hasScanned, setHasScanned] = useState(false);


    const handleScan = (err: unknown, result?: Result) => {
        if (result && !hasScanned) {
            setData(result.getText());
            setHasScanned(true); // Stop further scanning
        } else if (!result && !hasScanned) {
            setData("Not Found");
        }
    };

    return (
        <>
            <div className="flex flex-row">
                <Navbar />
                <div className="w-full h-full flex flex-col">
                    <Header />

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

                        {/* Barcode Scanner Toggle Button */}
                        <div className="mt-6">
                            <button
                                onClick={() => setShowScanner(!showScanner)}
                                className="flex items-center justify-center bg-white p-3 rounded-lg shadow-md border border-gray-200 w-full hover:bg-gray-50 transition"
                            >
                                <div className="flex flex-col items-center">
                                    <span className="text-sm font-medium mb-1">Add by barcode</span>
                                    <Barcode size={40} />
                                </div>
                            </button>
                        </div>

                        {/* Barcode Scanner */}
                        {showScanner && (
                            <div className="flex flex-col items-center">
                                <h2 className="text-lg font-bold text-gray-800 mt-4">Scan Barcode</h2>

                                <div className="mt-6 flex flex-col items-center w-fit p-4 bg-gray-50 rounded-xl shadow-md border border-gray-200">
                                    {!hasScanned && (
                                        <BarcodeScanner
                                            width={400}
                                            height={400}
                                            onUpdate={handleScan}
                                        />
                                    )}
                                    <p className="mt-2 text-sm">
                                        Scanned Data:{" "}
                                        <span className={`font-bold ${data === "Not Found" ? "text-red-600" : "text-green-600"}`}>
                                            {data}
                                        </span>
                                    </p>

                                    {hasScanned && (
                                        <button
                                            onClick={() => {
                                                setHasScanned(false);
                                                setData("Not Found");
                                            }}
                                            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            Scan Again
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </>
    );
}