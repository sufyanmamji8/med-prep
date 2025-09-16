import React, { useState, useEffect } from "react";
import { FaHistory } from "react-icons/fa";
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

const SubjectPage = ({ activeSubject, subjectDetails, loadingDetails }) => {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const [showLocalHtml, setShowLocalHtml] = useState(false);
  const [subjectMap, setSubjectMap] = useState(null);

  useEffect(() => {
    fetch("/subject-map.json")
      .then((res) => res.json())
      .then((data) => setSubjectMap(data))
      .catch((err) => console.error("Error loading subject-map.json:", err));
  }, []);

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
  const localHtml =
    subjectKey && subjectMap ? subjectMap[subjectKey]?.localHtml : null;

  const handleContentAccess = (id) => {
    if (!activeSubject) return alert("Select a subject first!");

    if (id === "mcqs") {
      navigate(`/dashboard/subjects/${activeSubject.id}/mcqs/practice`, {
        state: { subject: activeSubject },
      });
    } else if (id === "notes") {
      navigate(`/dashboard/subjects/${activeSubject.id}/notes`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Subject Header */}
      <div>
        <p className="text-xs text-gray-500">Subject</p>
        <h1 className="text-2xl font-bold">{activeSubject?.name || "Subject"}</h1>
        {activeSubject?.chapter && (
          <p className="text-sm text-gray-400">Chapter: {activeSubject.chapter}</p>
        )}
      </div>

      {/* Details Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
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
          <div
            className="prose max-w-none prose-headings:font-semibold prose-img:rounded-lg prose-img:shadow"
            dangerouslySetInnerHTML={{ __html: filteredDetails }}
          />
        ) : (
          <div className="space-y-3">
            {Object.entries(filteredDetails || {}).map(([k, v]) => (
              <div key={k} className="border rounded-md p-3 hover:bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">{k}</p>
                {typeof v === "string" ? (
                  v.endsWith(".jpg") || v.endsWith(".png") ? (
                    <img
                      src={v.startsWith("http") ? v : `${window.location.origin}${v}`}
                      alt={k}
                      className="max-h-60 rounded shadow"
                    />
                  ) : (
                    <p className="text-gray-700">{v}</p>
                  )
                ) : (
                  <pre className="whitespace-pre-wrap text-sm">
                    {JSON.stringify(v, null, 2)}
                  </pre>
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
              <li
                key={s.id}
                className="flex justify-between hover:bg-gray-50 p-2 rounded-md transition"
              >
                <span className="text-sm text-gray-600">{s.label}</span>
                <span className="font-medium">{s.value}</span>
              </li>
            ))}
          </ul>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Quick Access</h4>
            <div className="grid grid-cols-2 gap-2">
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
    </div>
  );
};

export default SubjectPage;
