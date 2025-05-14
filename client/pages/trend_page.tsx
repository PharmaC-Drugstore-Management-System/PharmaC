import "react-datepicker/dist/react-datepicker.css";
import { FaFire } from "react-icons/fa";
import React from "react";
import MedicationDashboard from "../components/medication_dashbaord";

const revenueDetailData = [
  {
    id: 1,
    name: "Amoxicillin",
    productId: "A001",
    price: 10,
    amount: 100,
    totalSale: 1000,
    status: "Out of stock",
  },
  {
    id: 2,
    name: "Ibuprofen",
    productId: "I001",
    price: 12,
    amount: 100,
    totalSale: 1200,
    status: "Running out",
  },
  {
    id: 3,
    name: "Paracetamol",
    productId: "P001",
    price: 8,
    amount: 100,
    totalSale: 800,
    status: "Instock",
  },
  {
    id: 4,
    name: "Benzonatate",
    productId: "B001",
    price: 5,
    amount: 20,
    totalSale: 100,
    status: "Instock",
  },
];

// Sort products by totalSale to calculate rank
const rankedData = [...revenueDetailData]
  .sort((a, b) => b.totalSale - a.totalSale)
  .map((item, index) => ({
    ...item,
    rank: index + 1,
  }));

const renderRevenueRow = (item: {
  rank: any;
  id: any;
  name: any;
  productId: any;
  price: any;
  amount: any;
  totalSale: any;
  status: any;
}) => {
  const rankColor =
    item.rank <= 3
      ? "bg-orange-100 text-orange-800"
      : "bg-gray-200 text-gray-700";

  return (
    <div key={item.id} className="border-t border-gray-200 py-3">
      <div className="flex items-center text-sm">
        {/* Rank */}
        <div className="w-24 text-center">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full font-medium ${rankColor}`}
          >
            {item.rank <= 3 && <FaFire className="mr-1 text-orange-500" />}
            {item.rank}
          </span>
        </div>

        {/* Product Name */}
        <div className="flex-1">
          <a href="#" className="text-xl hover:underline">
            {item.name}
          </a>
        </div>

        {/* Product ID */}
        <div className="w-24 text-center">{item.productId}</div>

        {/* Price */}
        <div className="w-24 text-center">{item.price} THB</div>

        {/* Amount */}
        <div className="w-24 text-center">{item.amount}</div>

        {/* Total Sale */}
        <div className="w-24 text-center">
          {item.totalSale.toLocaleString()} THB
        </div>

        {/* Status */}
        <div className="w-32 text-center">
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              item.status === "Instock"
                ? "bg-green-100 text-green-800"
                : item.status === "Running out"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {item.status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function RevenueDetail() {
  return (
    <>
      <div className="flex flex-col justify-center items-center w-full">
        <h1 className="text-3xl font-bold text-gray-800 my-6 text-left w-full pl-4">
          Trend
        </h1>
        <h1 className="text-3xl font-bold text-gray-800 mb-1 text-left w-full pl-4">
          Month Sales
        </h1>
        <h2 className="text-xl font-semibold text-gray-600 mb-4 text-left w-full pl-4">
          1 January 2023 - 31 January 2023
        </h2>
      </div>

      <div className="p-4">
        <MedicationDashboard />
        <div className="flex flex-col justify-center items-center w-full">
          <h1 className="text-3xl  text-gray-800 mb-1 text-left w-full pl-4">
            Stock shortage based on trend
          </h1>
          <h2 className="text-xl font-semibold text-gray-600 mb-4 text-left w-full pl-4">
            1 January 2023 - 31 January 2023
          </h2>
        </div>
        {/* Revenue Detail Table */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Revenue Detail</h3>
          <div className="flex font-semibold text-sm py-3 border-b border-gray-300">
            <div className="w-24 text-center">Rank</div>
            <div className="flex-1 text-left">Product Name</div>
            <div className="w-24 text-center">Product ID</div>
            <div className="w-24 text-center">Price</div>
            <div className="w-24 text-center">Amount</div>
            <div className="w-24 text-center">Total Sale</div>
            <div className="w-32 text-center">Status</div>
          </div>
          {rankedData.map((item) => renderRevenueRow(item))}
        </div>
        <div className="flex justify-center w-full my-6">
          <div className="flex flex-col space-y-4 w-full max-w-md">
            <button
              className="w-full py-3 px-4 bg-[#1E3706] text-white font-medium rounded hover:bg-green-800 transition-colors"
              onClick={() => console.log("Create Quotation clicked")}
            >
              Create Quotation
            </button>

            <button
              className="w-full py-3 px-4 bg-[#DFDFDF] text-gray-800 font-medium rounded hover:bg-gray-300 transition-colors"
              onClick={() => console.log("Copy text clicked")}
            >
              Copy text
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
