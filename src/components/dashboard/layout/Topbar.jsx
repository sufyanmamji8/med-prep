import React from "react";
import { FaRegBell, FaSignOutAlt } from "react-icons/fa";

const Topbar = ({ activeSubject, currentUser, onSignOut }) => {
  return (
    <div className="bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-10 border-b border-gray-200">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-gray-800">{activeSubject?.name || "Dashboard Overview"}</h1>
        {activeSubject && (
          <span className={`ml-3 text-xs px-2 py-1 rounded-full ${activeSubject.color}`}>
            {activeSubject.name}
          </span>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <button className="text-gray-600 hover:text-gray-900 relative" aria-label="Notifications">
          <FaRegBell className="text-xl" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Dropdown */}
        <div className="relative group">
          <button className="flex items-center space-x-2 focus:outline-none">
            <img
              src={currentUser?.photoURL || "https://randomuser.me/api/portraits/lego/1.jpg"}
              alt="User"
              className="w-8 h-8 rounded-full border-2 border-blue-200 object-cover"
            />
            <span className="hidden md:inline text-sm font-medium">
              {currentUser?.displayName?.split(" ")[0] || "User"}
            </span>
          </button>

          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
            <div className="px-4 py-2 border-b border-gray-200">
              <p className="text-sm font-medium">{currentUser?.displayName || "User"}</p>
              <p className="text-xs text-gray-500 truncate">{currentUser?.email || ""}</p>
            </div>
            <button
              onClick={onSignOut}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              <FaSignOutAlt className="mr-2" /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
