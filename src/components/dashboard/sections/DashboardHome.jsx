// DashboardHome.jsx - Updated version
import React, { useState, useMemo, useEffect } from "react";
import {
  FaLock,
  FaBookmark,
  FaSearch,
  FaStar,
  FaChevronDown,
  FaChevronRight,
  FaHistory,
  FaChartBar,
  FaXRay,
  FaPills,
  FaVirus,
  FaMicroscope,
  FaHeartbeat,
  FaArrowRight
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
  const [recentSessions, setRecentSessions] = useState([]);

  const normalizedSubjects = useMemo(() => normalizeSubjects(subjects), [subjects]);

  // Load recent sessions from localStorage
  useEffect(() => {
    const loadRecentSessions = () => {
      try {
        const savedProgress = localStorage.getItem('revisionProgress');
        const sessions = [];
        
        if (savedProgress) {
          const progress = JSON.parse(savedProgress);
          sessions.push({
            id: progress.sessionId,
            date: formatSessionDate(progress.submittedAt),
            score: progress.percentage || 0,
            subject: progress.subject?.name || "Revision Session"
          });
        }
        
        // Add mock sessions for demonstration (remove in production)
        if (sessions.length === 0) {
          sessions.push(
            { id: 1, date: "15/10/25", score: 25, subject: "Revision Session" },
            { id: 2, date: "15/10/25", score: 0, subject: "Revision Session" },
            { id: 3, date: "15/10/25", score: 0, subject: "Revision Session" },
            { id: 4, date: "08/10/25", score: 0, subject: "Revision Session" }
          );
        }
        
        setRecentSessions(sessions.slice(0, 4)); // Show only 4 most recent
      } catch (error) {
        console.error("Error loading recent sessions:", error);
      }
    };
    
    loadRecentSessions();
  }, []);

  const formatSessionDate = (dateString) => {
    if (!dateString) return "Recent";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'numeric',
        year: '2-digit'
      }).replace(/\//g, '/');
    } catch {
      return "Recent";
    }
  };

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
      id: "study-progress",
      label: "Study Progress",
      value: "64%",
      icon: <MdOutlineInsertChart className="text-yellow-500 text-xl" />,
      bg: "bg-yellow-100",
      footer: "On track with peers",
    },
  ];

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 transition-colors">
          Welcome, {currentUser?.name?.split(" ")[0] || "User"}
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

      {/* Main Content Grid - Equal Height Containers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Previous Sessions - Left Side */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-200 hover:shadow-md h-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold flex items-center">
              <FaHistory className="mr-2 text-blue-500" /> PREVIOUS SESSIONS
            </h3>
            <button
              onClick={() => setActiveTab("sessionHistory")}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
            >
              VIEW ALL <FaArrowRight className="text-xs" />
            </button>
          </div>

          <div className="space-y-4">
            {recentSessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FaHistory className="text-4xl text-gray-300 mx-auto mb-3" />
                <p>No recent sessions found</p>
                <p className="text-sm">Complete a revision session to see your history here</p>
              </div>
            ) : (
              recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      session.score >= 70 ? 'bg-green-100 text-green-600' :
                      session.score >= 50 ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      <FaChartBar className="text-lg" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{session.subject}</h4>
                      <p className="text-sm text-gray-600">{session.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      session.score >= 70 ? 'text-green-600' :
                      session.score >= 50 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {session.score}%
                    </div>
                    <div className="text-xs text-gray-500">SCORE</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Revision Session - Right Side - ORIGINAL BLUE COLOR */}
        <div className="bg-white shadow-md rounded-xl p-6 border border-blue-600 transition-all duration-200 hover:shadow-md h-full">
          <h2 className="text-lg font-semibold text-blue-600">Revision Session</h2>
          <p className="mt-2 text-gray-600">Start a mixed revision across subjects</p>
          <div className="flex space-x-4 my-4 text-blue-600 text-2xl">
            <FaChartBar />
            <FaXRay />
            <FaPills />
            <FaVirus />
            <FaMicroscope />
            <FaHeartbeat />
          </div>
          <button
            onClick={() => setActiveTab("revision")}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            Continue
          </button>
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