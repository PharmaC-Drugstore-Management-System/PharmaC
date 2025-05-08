import React from "react";

export default function Header() {
  return (
    <>
      <div className="sticky top-0 z-10 w-full bg-white">
      <div className="flex items-center p-4">
        <h1 className="font-bold text-gray-800 text-2xl">PharmaC</h1>
        <div className="ml-auto flex items-center space-x-4">
          <button className="p-2 bg-gray-200 rounded-full shadow-md hover:bg-gray-300 flex items-center">
            <span>🔔</span>
          </button>
          <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </div>
    </>
  );
}
