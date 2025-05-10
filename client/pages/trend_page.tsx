import React from "react";
import MedicationDashboard from "../components/medication_dashbaord";
import RevenueTable from "../components/revenue_table";
import Header from "../components/header";
import NavbarComponent from "../components/Navbar";

export default function TrendPage() {
  return (
    <>
      <div className="flex flex-row">
        <NavbarComponent />

        <div className="flex flex-col justify-center items-center w-full">
          <Header />
          <h1 className="text-3xl font-bold text-gray-800 my-6 text-left w-full pl-4">
            Trend
          </h1>
          <h1 className="text-3xl font-bold text-gray-800 mb-1 text-left w-full pl-4">
            Month Sales
          </h1>
          <h2 className="text-xl font-semibold text-gray-600 mb-4 text-left w-full pl-4">
            1 January 2023 - 31 January 2023
          </h2>

          <div className="w-full px-4">
            <div className="w-full mb-8 ">
              <MedicationDashboard />
            </div>
            <div className="w-full">
              <RevenueTable />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
