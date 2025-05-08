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

          <div className="w-full max-w-3xl mx-auto px-4">
            <h1 className="text-3xl font-bold text-gray-800 my-6 text-center">
              Welcome to my app
            </h1>

            <div className="w-full flex justify-center mb-8">
              <div className="w-full max-w-md">
                <MedicationDashboard />
              </div>
            </div>
            <div className="w-full mb-8">
              <RevenueTable />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
