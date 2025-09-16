import React, { useState, useEffect, useRef } from "react";
import { FaRegBell, FaSignOutAlt, FaArrowLeft } from "react-icons/fa";

const Topbar = ({ activeSubject, currentUser, onSignOut, onBack }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <div className="bg-white p-3 sm:p-4 shadow-sm flex justify-between items-center sticky top-0 z-40 border-b border-gray-200">
      {/* Left Section */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
        {activeSubject && (
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-blue-600 focus:outline-none"
          >
            <FaArrowLeft size={20} />
          </button>
        )}

        {/* Heading - Dashboard should not truncate, subjects can truncate */}
        <h1
          className={`font-bold text-gray-800 ${
            activeSubject
              ? "text-base sm:text-lg md:text-xl truncate max-w-[120px] sm:max-w-xs"
              : "text-lg sm:text-xl md:text-2xl"
          }`}
        >
          {activeSubject?.name || "Dashboard Overview"}
        </h1>

        {activeSubject && (
          <span
            className={`ml-1 sm:ml-2 text-[10px] sm:text-xs px-2 py-0.5 rounded-full ${activeSubject.color}`}
          >
            {activeSubject.name}
          </span>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Notifications */}
        <button
          className="text-gray-600 hover:text-gray-900 relative"
          aria-label="Notifications"
        >
          <FaRegBell className="text-lg sm:text-xl" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center space-x-2 focus:outline-none"
          >
            <img
              src={
                currentUser?.photoURL && currentUser.photoURL.trim() !== ""
                  ? currentUser.photoURL
                  : "/default-avatar.png"
              }
              alt="User"
              className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full border object-cover flex-shrink-0 bg-gray-100"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/default-avatar.png";
              }}
            />
            <span className="hidden md:inline text-sm font-medium truncate max-w-[100px]">
              {currentUser?.displayName?.split(" ")[0] || "User"}
            </span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-200">
                <p className="text-sm font-medium">
                  {currentUser?.displayName || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentUser?.email || ""}
                </p>
              </div>
              <button
                onClick={onSignOut}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <FaSignOutAlt className="mr-2" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
