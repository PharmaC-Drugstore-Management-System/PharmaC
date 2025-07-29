import React from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  return (
  
      <div
        className="sticky top-0 z-10 w-full bg-#FAF9F8
"
      >
        <div className="flex items-center p-4">
          <h1 className="font-bold text-gray-800 text-2xl">PharmaC</h1>
          <div className="ml-auto flex items-center space-x-4">
            <button onClick={()=> navigate('/poedit')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg font-semibold transition duration-200 shadow-lg hover:shadow-xl flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              สั่งซื้อยา
            </button>
            <button className="p-2 bg-gray-200 rounded-full shadow-md hover:bg-gray-300 flex items-center">
              <span>🔔</span>
            </button>
            <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
    
  );
}
