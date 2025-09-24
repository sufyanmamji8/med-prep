import React, { useState, useEffect } from "react";
import { FaHistory, FaUserPlus, FaUserMinus, FaTimes } from "react-icons/fa";
import { MdQuiz, MdNotes } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";

// Recursive filter function to remove blocked keys
const filterSubjectDetails = (details) => {
  const blockedKeys = ["Video Lectures", "Past Papers"];
  if (!details) return details;

  if (typeof details === "object" && !Array.isArray(details)) {
    return Object.entries(details)
      .filter(([k]) => !blockedKeys.includes(k))
      .reduce((acc, [k, v]) => {
        acc[k] = filterSubjectDetails(v);
        return acc;
      }, {});
  } else if (Array.isArray(details)) {
    return details.map(filterSubjectDetails);
  }
  return details;
};

const SubjectPage = ({ activeSubject, subjectDetails, loadingDetails, handleContentAccess: parentHandleContentAccess }) => {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const [showLocalHtml, setShowLocalHtml] = useState(false);
  const [subjectMap, setSubjectMap] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [action, setAction] = useState(""); // Tracks whether it's enroll or disenroll

  useEffect(() => {
    fetch("/subject-map.json")
      .then((res) => res.json())
      .then((data) => setSubjectMap(data))
      .catch((err) => console.error("Error loading subject-map.json:", err));
  }, []);

  // Check enrollment status when activeSubject changes
  useEffect(() => {
    if (activeSubject) {
      const enrolledSubjects = JSON.parse(localStorage.getItem('enrolledSubjects') || '[]');
      setIsEnrolled(enrolledSubjects.includes(activeSubject.id));
    }
  }, [activeSubject]);

  const handleEnrollToggle = () => {
    if (!activeSubject) return;
    setAction(isEnrolled ? "disenroll" : "enroll");
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    if (!activeSubject) return;

    const enrolledSubjects = JSON.parse(localStorage.getItem('enrolledSubjects') || '[]');

    if (action === "enroll") {
      const updatedSubjects = [...enrolledSubjects, activeSubject.id];
      localStorage.setItem('enrolledSubjects', JSON.stringify(updatedSubjects));
      setIsEnrolled(true);
    } else if (action === "disenroll") {
      const updatedSubjects = enrolledSubjects.filter(id => id !== activeSubject.id);
      localStorage.setItem('enrolledSubjects', JSON.stringify(updatedSubjects));
      setIsEnrolled(false);
    }
    setShowConfirmation(false);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  const filteredDetails = filterSubjectDetails(subjectDetails);

  const statsData = [
    { id: "progress", label: "Progress", value: "64%" },
    { id: "mcqs_done", label: "MCQs Done", value: "120" },
    { id: "notes", label: "Notes Read", value: "12" },
  ];

  const quickItems = [
    { id: "mcqs", label: "MCQs Practice", Icon: MdQuiz },
    { id: "notes", label: "Study Notes", Icon: MdNotes },
  ];

  const subjectKey = activeSubject?.slug;
  const localHtml = subjectKey && subjectMap ? subjectMap[subjectKey]?.localHtml : null;

  const handleContentAccess = (id) => {
    if (!activeSubject) {
      alert("Select a subject first!");
      return;
    }
    if (parentHandleContentAccess) {
      parentHandleContentAccess(id);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Subject Header with Enroll Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-gray-500">Subject</p>
          <h1 className="text-2xl font-bold">{activeSubject?.name || "Subject"}</h1>
          {activeSubject?.chapter && (
            <p className="text-sm text-gray-400">Chapter: {activeSubject.chapter}</p>
          )}
        </div>
        
        {/* Enroll/Disenroll Button */}
        {activeSubject && (
          <button
            onClick={handleEnrollToggle}
            className={`mt-4 sm:mt-0 px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 ${
              isEnrolled
                ? "bg-red-100 text-red-700 border border-red-200 hover:bg-red-200"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isEnrolled ? (
              <>
                <FaUserMinus className="text-sm" />
                <span>Disenroll</span>
              </>
            ) : (
              <>
                <FaUserPlus className="text-sm" />
                <span>Enroll Now</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Enrollment Status Message */}
      {activeSubject && (
        <div className="text-sm mt-2">
          {isEnrolled ? (
            <p className="text-green-600">You are enrolled in <strong>{activeSubject.name}</strong>.</p>
          ) : (
            <p className="text-red-600">You are not enrolled in this subject yet.</p>
          )}
        </div>
      )}

      {/* Details Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 md:p-6 hover:shadow-md transition overflow-hidden">
        {loadingDetails ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : !activeSubject ? (
          <p className="text-sm text-gray-500">Select a subject to see details.</p>
        ) : showLocalHtml && localHtml ? (
          <iframe
            src={localHtml}
            title={activeSubject.name}
            className="w-full h-[80vh] border-0 rounded-lg"
          />
        ) : typeof filteredDetails === "string" ? (
          <div className="subject-content overflow-x-auto">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: filteredDetails.replace(
                  /<img([^>]*?)>/g, 
                  '<div style="width: 100%; overflow-x: auto; text-align: center; margin: 16px 0;"><img$1 style="max-width: none; width: auto; height: auto; max-height: 400px; display: inline-block; object-fit: contain; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"></div>'
                )
              }}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(filteredDetails || {}).map(([k, v]) => (
              <div key={k} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  {k}
                </h4>
                {typeof v === "string" ? (
                  v.endsWith(".jpg") || v.endsWith(".png") ? (
                    <div className="bg-white rounded-lg p-2 shadow-sm overflow-x-auto">
                      <div className="text-center">
                        <img
                          src={v.startsWith("http") ? v : `${window.location.origin}${v}`}
                          alt={k}
                          style={{
                            maxWidth: 'none',
                            width: 'auto', 
                            height: 'auto',
                            maxHeight: '400px',
                            display: 'inline-block',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            objectFit: 'contain'
                          }}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-3 text-center italic">
                        {k}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-gray-700 leading-relaxed">{v}</p>
                    </div>
                  )
                ) : (
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <pre className="whitespace-pre-wrap text-sm text-gray-600 overflow-x-auto font-mono bg-gray-100 p-3 rounded">
                      {JSON.stringify(v, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {localHtml && (
          <button
            onClick={() => setShowLocalHtml((prev) => !prev)}
            className="mt-4 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            {showLocalHtml ? "Show API Details" : "Show Offline Details"}
          </button>
        )}
      </div>

      {/* Stats + Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-400 p-6 space-y-4 hover:shadow-md transition">
          <h3 className="text-lg font-semibold">Stats</h3>
          <ul className="space-y-2 text-gray-700">
            {statsData.map((s) => (
              <li key={s.id} className="flex justify-between hover:bg-gray-50 p-2 rounded-md transition">
                <span className="text-sm text-gray-600">{s.label}</span>
                <span className="font-medium">{s.value}</span>
              </li>
            ))}
          </ul>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Quick Access</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickItems.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => handleContentAccess(id)}
                  className="flex items-center justify-between px-3 py-2 rounded-md border hover:bg-gray-50 transition text-sm"
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="text-blue-500" />
                    <span>{label}</span>
                  </div>
                  <span className="text-gray-400">&rarr;</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-400 p-6 hover:shadow-md transition">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FaHistory className="mr-2 text-blue-500" /> Recent Activity
          </h3>
          <div className="text-sm text-gray-600">
            <p>No recent activity yet for this subject.</p>
          </div>
        </div>
      </div>

      {/* Custom Confirmation Container */}
    {showConfirmation && (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20">

          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300 relative w-full max-w-md">
            {/* Close Icon */}
            <button
              onClick={handleCancel}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={20} />
            </button>

            {/* Confirmation Message */}
            <h2 className="text-lg font-semibold mb-4">
              {action === "enroll" ? "Confirm Enrollment" : "Confirm Disenrollment"}
            </h2>
            <p className="mb-6">
              Are you sure you want to{" "}
              {action === "enroll" ? "enroll in" : "disenroll from"}{" "}
              <strong>{activeSubject?.name}</strong>?
            </p>

            {/* Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 rounded ${
                  action === "enroll"
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                {action === "enroll" ? "Enroll" : "Disenroll"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectPage;
