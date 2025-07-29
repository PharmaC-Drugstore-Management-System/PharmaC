import React, { useState } from "react";
import { Calendar, Bell } from "lucide-react";

export default function ExpiryMonitor() {
  const [startDate, setStartDate] = useState("2025-05-01");
  const [filterStartDate, setFilterStartDate] = useState("2025-09-01");
  const [filterEndDate, setFilterEndDate] = useState("2025-12-31");

  const allMedications = [
    {
      name: "Cetirizine",
      brand: "CENTRAL PO..",
      amount: 10,
      expiredDate: "03/11/2025",
      total: 1,
      lotId: "000002",
    },
    {
      name: "BAKAMOL",
      brand: "MEDIC PHAR..",
      amount: 39,
      expiredDate: "10/11/2025",
      total: 4,
      lotId: "000003",
    },
    {
      name: "PARACETAMOL",
      brand: "PHARMA CO..",
      amount: 15,
      expiredDate: "15/01/2026",
      total: 2,
      lotId: "000004",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Inventory Title */}
      <div className="flex items-center mb-6">
        <div className="w-1 h-8 bg-green-600 mr-2"></div>
        <h2 className="text-xl font-bold" style={{ color: "black" }}>
          Expiry Monitor
        </h2>
      </div>

      {/* Earliest to Expire Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Earliest to Expire
        </h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="flex items-center justify-between p-4 border-b bg-gray-50 font-medium text-gray-700">
            <div className="flex-1">Name</div>
            <div className="flex-1 px-2">Brand</div>
            <div className="w-16 text-center">Amount</div>
            <div className="w-24 text-center">Expired date</div>
            <div className="w-16 text-center">Total</div>
            <div className="w-20 text-center">Lot id</div>
          </div>
        </div>
      </div>

      {/* Filter by Expiry Date Section */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Filter by expiry date
        </h3>
        <div className="flex items-center space-x-4 mb-4">
          {[filterStartDate, filterEndDate].map((val, i) => (
            <div className="relative" key={i}>
              <input
                type="date"
                value={val}
                onChange={(e) =>
                  i === 0
                    ? setFilterStartDate(e.target.value)
                    : setFilterEndDate(e.target.value)
                }
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="flex items-center justify-between p-4 border-b bg-gray-50 font-medium text-gray-700">
            <div className="flex-1">Name</div>
            <div className="flex-1 px-2">Brand</div>
            <div className="w-16 text-center">Amount</div>
            <div className="w-24 text-center">Expired date</div>
            <div className="w-16 text-center">Total</div>
            <div className="w-20 text-center">Lot id</div>
          </div>
        </div>
      </div>
    </div>
  );
}
