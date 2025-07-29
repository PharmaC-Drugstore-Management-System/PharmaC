import React from "react";
import { useState } from "react";

export default function RevenueTable() {
  const [revenueData, setRevenueData] = useState([
    {
      rank: 1,
      productName: "Amoxilin",
      productId: "0001A",
      price: 36,
      saleAmount: 15,
      total: 99,
    },
    {
      rank: 2,
      productName: "Amoxilin",
      productId: "0001A",
      price: 60,
      saleAmount: 15,
      total: 99,
    },
    {
      rank: 3,
      productName: "Amoxilin",
      productId: "0001A",
      price: 80,
      saleAmount: 15,
      total: 99,
    },
    {
      rank: 4,
      productName: "Amoxilin",
      productId: "0001A",
      price: 100,
      saleAmount: 0,
      total: 99,
    },
  ]);

  return (
    <div className="w-full max-w-8xl bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Revenue</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Product Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Product ID
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Price
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Sale Amount
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {revenueData.map((item) => (
              <tr key={item.rank} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        item.rank === 1
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.rank < 10 ? `0${item.rank}` : item.rank}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-md mr-3"></div>
                    <span className="text-sm font-medium text-gray-900">
                      {item.productName}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {item.productId}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {item.price}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {item.saleAmount} pcs
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {item.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
