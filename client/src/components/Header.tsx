import React, { useState } from "react";
import { FaBell } from "react-icons/fa";

type Notification = {
  id: number;
  message: string;
};

export default function Header() {
  const [notifications, setNotifications] = useState<Notification[]>([]); 
  const [showNotifications, setShowNotifications] = useState(false);

  const handleNotificationClick = () => {
    const newNotification: Notification = {
      id: Date.now(),
      message: "New notification received!",
    };
    setNotifications([newNotification, ...notifications].slice(0, 10));
    setShowNotifications((prev) => !prev);
  };

  return (
    <>
      <div className="sticky top-0 z-10 w-full bg-white">
        <div className="flex items-center p-4">
          <h1 className="font-bold text-gray-800 text-2xl">PharmaC</h1>
          <div className="ml-auto flex items-center space-x-4">
            <button
              onClick={handleNotificationClick}
              className="p-2 bg-gray-200 rounded-full shadow-md hover:bg-gray-300 flex items-center"
            >
              <FaBell className="h-6 w-6 text-gray-600" />
            </button>
            <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>

      {showNotifications && notifications.length > 0 && (
        <div
          className="absolute top-12 right-4 bg-white p-4 rounded-lg shadow-lg w-72 max-h-80 overflow-y-auto z-20"
          style={{ top: "50px" }}
        >
          <h3 className="font-semibold text-lg mb-4">Notifications</h3>
          <div className="overflow-y-auto max-h-64">
            {notifications.map((notification, index) => (
              <div
                key={notification.id}
                className={`p-3 ${
                  index !== notifications.length - 1
                    ? "border-b border-gray-300"
                    : ""
                } bg-white`}
              >
                <p>{notification.message}</p>
              </div>
            ))}
          </div>

          <div className="absolute bottom-0 left-0 w-full p-2">
            <button className="w-full bg-white py-2 rounded-full shadow hover:bg-gray-200">
              See All
            </button>
          </div>
        </div>
      )}
    </>
  );
}
