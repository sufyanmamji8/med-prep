import React from "react";
import { 
  MdMenu, MdDashboard, MdAssignment, MdQuiz, MdNotes,
  MdPayment
} from "react-icons/md";
import { FaVideo, FaCheck, FaSignOutAlt } from "react-icons/fa";

const Sidebar = ({
  mobileMenuOpen,
  setMobileMenuOpen,
  activeTab,
  setActiveTab,
  handleContentAccess,
  subjects,
  activeSubject,
  setActiveSubject,
  hasSubscription,
  navigate,
  currentUser,
  onSignOut,
}) => {
  return (
    <div
      className={`w-64 bg-white shadow-lg fixed h-full z-40 transition-transform duration-300 ease-in-out transform ${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
      aria-label="Sidebar"
    >
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <h2 className="text-xl font-bold">MedPrep Pro</h2>
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden text-white"
          aria-label="Close navigation"
        >
          &times;
        </button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-200 flex items-center space-x-3 bg-gray-50">
        <div className="relative">
          <img
            src={currentUser?.photoURL || "https://randomuser.me/api/portraits/lego/1.jpg"}
            alt="User"
            className="w-10 h-10 rounded-full border-2 border-blue-200 object-cover"
          />
          {hasSubscription && (
            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
              <FaCheck className="text-white text-xs" />
            </div>
          )}
        </div>
        <div>
          <p className="font-medium text-gray-800">{currentUser?.displayName || "Loading..."}</p>
          <p className={`text-xs ${hasSubscription ? "text-green-600" : "text-yellow-600"}`}>
            {hasSubscription ? "Premium Member" : "Basic Account"}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
          Main Menu
        </div>

        <button
          onClick={() => {
            setActiveTab("dashboard");
            setMobileMenuOpen(false);
          }}
          className={`flex items-center space-x-3 w-full p-2 rounded-lg text-sm font-medium ${
            activeTab === "dashboard" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <MdDashboard className="text-lg" />
          <span>Dashboard</span>
        </button>

        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6 px-2">
          Study Resources
        </div>

        {[
          { id: "past-papers", label: "Past Papers", Icon: MdAssignment },
          { id: "mcqs", label: "MCQs Practice", Icon: MdQuiz },
          { id: "videos", label: "Video Lectures", Icon: FaVideo },
          { id: "notes", label: "Study Notes", Icon: MdNotes },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => {
              handleContentAccess(id);
              setMobileMenuOpen(false);
            }}
            className={`flex items-center space-x-3 w-full p-2 rounded-lg text-sm font-medium ${
              activeTab === id ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Icon className="text-lg" />
            <span>{label}</span>
          </button>
        ))}

        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6 px-2">
          Subjects
        </div>

        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => {
              setActiveSubject(subject);
              setMobileMenuOpen(false);
            }}
            className={`flex items-center space-x-3 w-full p-2 rounded-lg text-sm font-medium ${
              activeSubject?.id === subject.id ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {subject.icon}
            <span>{subject.name}</span>
          </button>
        ))}

        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6 px-2">
          Account
        </div>

        <button
          onClick={() => {
            navigate("/subscribe");
            setMobileMenuOpen(false);
          }}
          className="flex items-center space-x-3 w-full p-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          <MdPayment className="text-lg" />
          <span>Subscription</span>
          {!hasSubscription && (
            <span className="ml-auto bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">Upgrade</span>
          )}
        </button>
      </nav>

      {/* Sign Out */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
        <button
          onClick={onSignOut}
          className="flex items-center space-x-3 w-full p-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-red-600"
        >
          <FaSignOutAlt className="text-lg" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;