import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import React from "react";

export default function Header() {
  return (
    <>
      <div className="w-full h-full flex flex-col ">
        <div className="flex items-center p-4 bg-white shadow-sm">
          <h1 className="font-bold text-gray-800" style={{ fontSize: "32px" }}>
            PharmaC
          </h1>
          <div className="ml-auto flex items-center space-x-a4 mx-5">
            <button className="p-2 bg-gray-200 rounded-full shadow-md hover:bg-gray-800 flex items-center mx-5 ">
              <span className="text-wh-500 text-x">🔔</span>
            </button>
            <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </>
  );
}
