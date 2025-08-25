import React, { useState, useMemo } from "react";
import {
  FaLock,
  FaVideo,
  FaHistory,
  FaBookmark,
  FaSearch,
  FaStar,
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa";
import {
  MdOutlineSchool,
  MdOutlineRateReview,
  MdOutlineInsertChart,
  MdAssignment,
  MdNotes,
  MdQuiz,
} from "react-icons/md";

// Utility function to normalize subjects data
const normalizeSubjects = (subjects) => {
  if (!subjects || typeof subjects !== 'object') return {};
  
  const normalized = {};
  
  Object.entries(subjects).forEach(([mainSubject, content]) => {
    normalized[mainSubject] = [];
    
    if (Array.isArray(content)) {
      // If it's an array, convert each item to a standard format
      content.forEach(item => {
        if (typeof item === 'string') {
          normalized[mainSubject].push({ id: item, name: item, type: 'topic' });
        } else if (typeof item === 'object' && item !== null) {
          normalized[mainSubject].push({ 
            id: item.id || item.name || Math.random().toString(36).substr(2, 9),
            name: item.name || 'Unnamed',
            type: item.type || 'topic'
          });
        }
      });
    } else if (typeof content === 'object' && content !== null) {
      // If it's an object with nested topics
      Object.entries(content).forEach(([topic, items]) => {
        if (Array.isArray(items)) {
          items.forEach(item => {
            if (typeof item === 'string') {
              normalized[mainSubject].push({ 
                id: `${mainSubject}-${topic}-${item}`, 
                name: item, 
                type: 'subtopic',
                topic: topic
              });
            } else if (typeof item === 'object' && item !== null) {
              normalized[mainSubject].push({ 
                id: item.id || `${mainSubject}-${topic}-${item.name}`,
                name: item.name || 'Unnamed',
                type: item.type || 'subtopic',
                topic: topic,
                ...item
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
  handleContentAccess,
  recentActivity = [],
}) => {
  const [openSubjects, setOpenSubjects] = useState({});
  
  // Normalize subjects data for consistent rendering
  const normalizedSubjects = useMemo(() => normalizeSubjects(subjects), [subjects]);

  const toggleDropdown = (mainSubject) => {
    setOpenSubjects((prev) => ({
      ...prev,
      [mainSubject]: !prev[mainSubject],
    }));
  };

  // Stats data
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
      id: "video-hours",
      label: "Video Hours",
      value: "24.5",
      icon: <FaVideo className="text-purple-500 text-xl" />,
      bg: "bg-purple-100",
      footer: "Last watched: 2 days ago",
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

  // Quick access items
  const quickAccessItems = [
    { id: "past-papers", label: "Past Papers", Icon: MdAssignment },
    { id: "mcqs", label: "MCQs Practice", Icon: MdQuiz },
    { id: "videos", label: "Video Lectures", Icon: FaVideo },
    { id: "notes", label: "Study Notes", Icon: MdNotes },
  ];

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Welcome, {currentUser?.displayName?.split(" ")[0] || "User"}
        </h2>
        <div className="relative mt-3 md:mt-0 md:w-64">
          <input
            type="text"
            placeholder="Search resources..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <h3 className="font-medium text-lg text-blue-800 mb-2">
                Upgrade to Premium
              </h3>
              <p className="text-blue-700 mb-4">
                Unlock all subjects, past papers, MCQs practice, video lectures,
                and study notes
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat) => (
          <div
            key={stat.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>{stat.icon}</div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">{stat.footer}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity & Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-5 flex items-center">
            <FaHistory className="mr-2 text-blue-500" /> Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((item) => (
                <div
                  key={item.id || `${item.title}-${item.subtitle}`}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg mr-3 ${item.bg || 'bg-gray-100'}`}>
                      {item.icon || <FaHistory className="text-gray-600" />}
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.subtitle}</p>
                    </div>
                  </div>
                  <button 
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap"
                    aria-label={`Perform action on ${item.title}`}
                  >
                    {item.action || "View"}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">No recent activity</p>
            )}
          </div>
        </div>

        {/* Quick Access */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-5 flex items-center">
            <FaBookmark className="mr-2 text-blue-500" /> Quick Access
          </h3>
          <div className="space-y-3">
            {quickAccessItems.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => handleContentAccess(id)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-200"
                aria-label={`Access ${label}`}
              >
                <div className="flex items-center">
                  <Icon className="text-blue-500 mr-3" />
                  <span>{label}</span>
                </div>
                <span className="text-gray-400">&rarr;</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Subjects */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold mb-5 flex items-center">
          <FaStar className="mr-2 text-blue-500" /> Recommended Subjects
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(normalizedSubjects).length > 0 ? (
            Object.entries(normalizedSubjects).map(([mainSubject, topics]) => (
              <div
                key={mainSubject}
                className="border border-gray-200 rounded-lg p-3"
              >
                <button
                  onClick={() => toggleDropdown(mainSubject)}
                  className="flex justify-between items-center w-full font-medium text-gray-700 hover:text-blue-600"
                  aria-label={`Toggle ${mainSubject} dropdown`}
                >
                  <span>{mainSubject}</span>
                  {openSubjects[mainSubject] ? (
                    <FaChevronDown />
                  ) : (
                    <FaChevronRight />
                  )}
                </button>

                {openSubjects[mainSubject] && topics.length > 0 && (
                  <div className="mt-2 pl-3 space-y-1">
                    {topics.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => setActiveSubject(topic)}
                        className={`flex items-center w-full p-2 rounded-md text-sm ${
                          activeSubject?.id === topic.id
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        aria-label={`Select ${topic.name}`}
                      >
                        <span>{topic.name}</span>
                        {topic.topic && (
                          <span className="ml-2 text-xs text-gray-400">({topic.topic})</span>
                        )}
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