import React from "react";

export default function CustomButtons() {
  return (
    <div className="flex flex-col space-y-4 w-full max-w-md">
      <button 
        className="w-full py-3 px-4 bg-green-900 text-white font-medium rounded hover:bg-green-800 transition-colors"
        onClick={() => console.log("Create Quotation clicked")}
      >
        Create Quotation
      </button>
    </div>
  );
}