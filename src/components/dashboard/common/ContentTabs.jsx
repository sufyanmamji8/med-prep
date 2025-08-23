import React from "react";
import { MdAssignment, MdQuiz, MdNotes } from "react-icons/md";
import { FaVideo } from "react-icons/fa";

const ContentTabs = ({ activeTab, handleContentAccess }) => {
  const tabs = [
    { id: "past-papers", label: "Past Papers", icon: <MdAssignment className="mr-2" /> },
    { id: "mcqs", label: "MCQs Practice", icon: <MdQuiz className="mr-2" /> },
    { id: "videos", label: "Video Lectures", icon: <FaVideo className="mr-2" /> },
    { id: "notes", label: "Study Notes", icon: <MdNotes className="mr-2" /> },
  ];

  return (
    <div className="flex overflow-x-auto mb-6 bg-white p-1 rounded-lg shadow-sm sticky top-16 z-10 border border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleContentAccess(tab.id)}
          className={`flex items-center px-4 py-2 font-medium whitespace-nowrap text-sm transition-colors ${
            activeTab === tab.id ? "bg-blue-600 text-white rounded-lg shadow" : "text-gray-600 hover:text-blue-600"
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default ContentTabs;