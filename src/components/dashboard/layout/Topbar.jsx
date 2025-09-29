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
    <div className="bg-white h-14 sm:h-16 px-3 sm:px-4 py-2 shadow-sm flex justify-between items-center sticky top-0 z-40 border-b border-gray-200">
      {/* Left Section */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 mr-4 md:mr-6">
        {activeSubject && (
          <button
            onClick={onBack}
            className="hidden sm:flex text-gray-600 hover:text-blue-600 focus:outline-none flex-shrink-0 p-1"
          >
            <FaArrowLeft size={18} className="sm:w-5 sm:h-5" />
          </button>
        )}

        <div className="min-w-0 flex-1 sm:ml-6 ml-16">
          <h1 className="font-bold text-gray-800 text-sm sm:text-base md:text-lg lg:text-xl truncate flex items-center gap-2">
            {activeSubject && (
              <button
                onClick={onBack}
                className="inline-flex sm:hidden text-gray-600 hover:text-blue-600 focus:outline-none flex-shrink-0 p-1"
                aria-label="Go back"
              >
                <FaArrowLeft size={16} />
              </button>
            )}
            <span className="truncate">{activeSubject?.name || "Dashboard Overview"}</span>
          </h1>
          {activeSubject && (
            <div className="hidden sm:block">
              <span className="text-xs text-gray-500 truncate block max-w-[200px] md:max-w-[300px]">
                {activeSubject.chapter && `Chapter: ${activeSubject.chapter}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
        {/* Notifications */}
        <button
          className="text-gray-600 hover:text-gray-900 relative p-1"
          aria-label="Notifications"
        >
          <FaRegBell className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center space-x-1 sm:space-x-2 focus:outline-none"
          >
          <img
  src={currentUser?.photoURL || "/default-avatar.png"}  // ✅ Use user's photoURL
  alt="User"
  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border object-cover flex-shrink-0 bg-gray-100"
  onError={(e) => {
    // Fallback if image fails to load
    e.target.src = "/default-avatar.png";
  }}
/>
            {/* Show user name */}
            <span className="hidden md:inline text-sm font-medium truncate max-w-[80px] lg:max-w-[120px]">
              {currentUser?.name || "User"}
            </span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
              <div className="px-4 py-2 border-b border-gray-200">
                <p className="text-sm font-medium truncate">
                  {currentUser?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentUser?.email || ""}
                </p>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onSignOut();
                }}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <FaSignOutAlt className="mr-2 w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
