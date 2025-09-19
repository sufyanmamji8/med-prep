// DashboardHome.jsx
import React, { useState, useMemo } from "react";
import {
  FaLock,
  FaBookmark,
  FaSearch,
  FaStar,
  FaChevronDown,
  FaChevronRight,
  FaHistory,
} from "react-icons/fa";
import {
  MdOutlineSchool,
  MdOutlineRateReview,
  MdOutlineInsertChart,
  MdNotes,
  MdQuiz,
} from "react-icons/md";

// Utility function to normalize subjects data
const normalizeSubjects = (subjects) => {
  if (!subjects || typeof subjects !== "object") return {};

  const normalized = {};

  Object.entries(subjects).forEach(([mainSubject, content]) => {
    normalized[mainSubject] = [];

    if (Array.isArray(content)) {
      content.forEach((item) => {
        if (typeof item === "string") {
          normalized[mainSubject].push({ id: `${mainSubject}-${item}`, name: item, type: "topic" });
        } else if (typeof item === "object" && item !== null) {
          normalized[mainSubject].push({
            id: item.id || `${mainSubject}-${item.name}`,
            name: item.name || "Unnamed",
            type: item.type || "topic",
            ...item,
          });
        }
      });
    } else if (typeof content === "object" && content !== null) {
      Object.entries(content).forEach(([chapter, topics]) => {
        if (Array.isArray(topics)) {
          topics.forEach((topic) => {
            if (typeof topic === "string") {
              normalized[mainSubject].push({
                id: `${mainSubject}-${chapter}-${topic}`,
                name: topic,
                type: "subtopic",
                chapter: chapter,
              });
            } else if (typeof topic === "object" && topic !== null) {
              normalized[mainSubject].push({
                id: topic.id || `${mainSubject}-${chapter}-${topic.name}`,
                name: topic.name || "Unnamed",
                type: topic.type || "subtopic",
                chapter: chapter,
                ...topic,
              });
            }
          });
        }
      });
    }
  });

  return normalized;
};

const DashboardHome = ({
  currentUser,
  hasSubscription,
  navigate,
  searchQuery,
  setSearchQuery,
  subjects = {},
  activeSubject,
  setActiveSubject,
  setActiveTab,
  handleContentAccess,
}) => {
  const [openSubjects, setOpenSubjects] = useState({});

  const normalizedSubjects = useMemo(() => normalizeSubjects(subjects), [subjects]);

  const toggleDropdown = (mainSubject) => {
    setOpenSubjects((prev) => ({
      ...prev,
      [mainSubject]: !prev[mainSubject],
    }));
  };

  // Stats data (without video lectures & past papers)
  const statsData = [
    {
      id: "subjects-enrolled",
      label: "Subjects Enrolled",
      value: "4",
      icon: <MdOutlineSchool className="text-blue-500 text-xl" />,
      bg: "bg-blue-100",
      footer: "Last added: Pharmacology",
    },
    {
      id: "mcqs-attempted",
      label: "MCQs Attempted",
      value: "1,248",
      icon: <MdOutlineRateReview className="text-green-500 text-xl" />,
      bg: "bg-green-100",
      footer: "Accuracy: 78%",
    },
    {
      id: "study-progress",
      label: "Study Progress",
      value: "64%",
      icon: <MdOutlineInsertChart className="text-yellow-500 text-xl" />,
      bg: "bg-yellow-100",
      footer: "On track with peers",
    },
  ];

  // Quick access items (MCQs & Notes only)
  const quickAccessItems = [
    { id: "mcqs", label: "MCQs Practice", Icon: MdQuiz },
    { id: "notes", label: "Study Notes", Icon: MdNotes },
  ];

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Header */}
      <div className=" flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 transition-colors">
          Welcome, {currentUser?.displayName?.split(" ")[0] || "User"}
        </h2>
        <div className="relative mt-3 md:mt-0 md:w-64">
          <input
            type="text"
            placeholder="Search Subjects..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      {/* Premium Banner */}
      {!hasSubscription && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 p-5 rounded-lg">
          <div className="flex items-start">
            <div className="p-2 bg-blue-500 rounded-lg mr-4">
              <FaLock className="text-white text-xl" />
            </div>
            <div>
              <h3 className="font-medium text-lg text-blue-800 mb-2">Upgrade to Premium</h3>
              <p className="text-blue-700 mb-4">
                Unlock all subjects, MCQs practice, and study notes
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => navigate("/subscribe")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium"
                  aria-label="Upgrade to premium plan"
                >
                  Upgrade Now
                </button>
                <button
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  aria-label="Learn more about premium benefits"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsData.map((stat) => (
          <div
            key={stat.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg} transition-transform duration-200 hover:scale-105`}>
                {stat.icon}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">{stat.footer}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Subject Preview & Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Preview */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-200 hover:shadow-md">
          <h3 className="text-xl font-semibold mb-5 flex items-center">
            <FaHistory className="mr-2 text-blue-500" /> Selected Subject Preview
          </h3>

          {!activeSubject && (
            <div className="text-sm text-gray-500">
              No subject selected. Click a subject below or from the sidebar to open its page.
            </div>
          )}

          {activeSubject && (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500">Selected</p>
                <h4 className="text-lg font-semibold">{activeSubject.name}</h4>
                {activeSubject.chapter && <p className="text-xs text-gray-400">Chapter: {activeSubject.chapter}</p>}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setActiveTab("subject")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Open Subject Page
                </button>
                <button
                  onClick={() => handleContentAccess("mcqs")}
                  className="border border-gray-200 px-4 py-2 rounded-lg text-sm"
                >
                  Practice MCQs
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Access */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-200 hover:shadow-md">
          <h3 className="text-xl font-semibold mb-5 flex items-center">
            <FaBookmark className="mr-2 text-blue-500" /> Quick Access
          </h3>
          <div className="space-y-3">
            {quickAccessItems.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => handleContentAccess(id)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors duration-200"
                aria-label={`Access ${label}`}
              >
                <div className="flex items-center">
                  <Icon className="text-blue-500 mr-3 transition-transform duration-200 group-hover:scale-105" />
                  <span>{label}</span>
                </div>
                <span className="text-gray-400">&rarr;</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Subjects */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-200 hover:shadow-md">
        <h3 className="text-xl font-semibold mb-5 flex items-center">
          <FaStar className="mr-2 text-blue-500" /> Recommended Subjects
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(normalizedSubjects).length > 0 ? (
            Object.entries(normalizedSubjects).map(([mainSubject, topics]) => (
              <div
                key={mainSubject}
                className="border border-gray-200 rounded-lg p-3 transition-all duration-200 hover:border-blue-200 hover:shadow-sm"
              >
                <button
                  onClick={() => toggleDropdown(mainSubject)}
                  className="flex justify-between items-center w-full font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
                  aria-label={`Toggle ${mainSubject} dropdown`}
                >
                  <span>{mainSubject}</span>
                  {openSubjects[mainSubject] ? <FaChevronDown /> : <FaChevronRight />}
                </button>

                {openSubjects[mainSubject] && topics.length > 0 && (
                  <div className="mt-2 pl-3 space-y-1 transition-all duration-200 ease-out">
                    {topics.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => {
                          setActiveSubject({ ...topic, mainSubject });
                          setActiveTab && setActiveTab("subject");
                        }}
                        className={`flex items-center w-full p-2 rounded-md text-sm transition-colors duration-200 ${
                          activeSubject?.id === topic.id
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        aria-label={`Select ${topic.name}`}
                      >
                        <span>{topic.name}</span>
                        {topic.chapter && <span className="ml-2 text-xs text-gray-400">({topic.chapter})</span>}
                      </button>
                    ))}
                  </div>
                )}

                {openSubjects[mainSubject] && topics.length === 0 && (
                  <p className="mt-2 pl-3 text-sm text-gray-400">No topics available</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400">No subjects available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
