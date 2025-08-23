import React from "react";
import { MdLockOutline } from "react-icons/md";

const ProtectedContent = ({ hasSubscription, title, icon, navigate, children }) => {
  if (!hasSubscription) {
    return (
      <div className="text-center py-10">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
          <div className="flex justify-center">
            <div className="p-3 bg-blue-100 rounded-full mb-4">{icon || <MdLockOutline className="text-3xl text-blue-500" />}</div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Premium Content Locked</h3>
          <p className="text-gray-600 mb-4">Upgrade to access all {title.toLowerCase()} and enhance your preparation</p>
          <button
            onClick={() => navigate("/subscribe")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium"
          >
            Unlock Premium Features
          </button>
        </div>
      </div>
    );
  }
  return children;
};

export default ProtectedContent;
