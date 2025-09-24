import React, { useMemo } from "react";
import ProtectedContent from "../common/ProtectedContent";
import { MdNotes } from "react-icons/md";
import { FaDownload, FaStar, FaArrowLeft } from "react-icons/fa";

const Notes = ({ activeSubject, hasSubscription, onBack }) => {
  // ✅ Back button handler
  const handleBack = () => {
    if (onBack) onBack(); // Dashboard.jsx se jo onBack aayega wahi chalega
  };

  const notes = useMemo(() => {
    return [
      "Comprehensive Guide",
      "Quick Review Sheets",
      "Clinical Correlations",
      "Summary Notes",
      "Diagrams & Charts",
      "Mnemonics Collection",
    ].map((title, i) => ({
      id: i + 1,
      title: `${activeSubject?.name || "Subject"} ${title}`,
      pages: Math.floor(Math.random() * 20) + 5,
      downloads: Math.floor(Math.random() * 800) + 200,
      rating: (Math.random() * 1 + 4).toFixed(1),
      lastUpdated: `${Math.floor(Math.random() * 12) + 1} months ago`,
    }));
  }, [activeSubject]);

  return (
    <ProtectedContent hasSubscription={hasSubscription} title="Study Notes" icon={<MdNotes />}>
      <div className="space-y-6">

        {/* ✅ Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium mb-4"
        >
          <FaArrowLeft className="mr-2" />
          <span>
            {activeSubject ? `Back to ${activeSubject.name}` : "Back to Dashboard"}
          </span>
        </button>

        <h3 className="text-2xl font-bold text-gray-800 flex items-center">
          <MdNotes className="text-blue-500 mr-3" />{" "}
          {activeSubject?.name || "Select a Subject"} Study Notes
        </h3>

        {!activeSubject && (
          <div className="text-center text-gray-600">
            Select a subject from the sidebar to view notes.
          </div>
        )}

        {activeSubject && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <MdNotes className="text-blue-500 text-xl" />
                    </div>
                    <h4 className="font-medium text-lg">{note.title}</h4>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {note.pages} pages
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-2 mb-5">
                  <div className="flex items-center">
                    <FaDownload className="mr-2 text-gray-400" />
                    <span>{note.downloads.toLocaleString()} downloads</span>
                  </div>
                  <div className="flex items-center">
                    <FaStar className="mr-2 text-yellow-400" />
                    <span>{note.rating} rating</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-400">🗓️</span>
                    <span>Updated {note.lastUpdated}</span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center">
                    View Online
                  </button>
                  <button className="flex-1 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center">
                    <FaDownload className="mr-2" /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedContent>
  );
};

export default Notes;
