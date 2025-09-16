// Sidebar.jsx
import React, { useState, useMemo } from "react";
import {
  FaCheck,
  FaChevronDown,
  FaChevronRight,
  FaSignOutAlt,
} from "react-icons/fa";
import {
  MdOutlineSchool,
  MdQuiz,
  MdNotes,
  MdPayment,
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
          normalized[mainSubject].push({ id: item, name: item, type: "topic" });
        } else if (typeof item === "object" && item !== null) {
          normalized[mainSubject].push({
            id: item.id || item.name || Math.random().toString(36).substr(2, 9),
            name: item.name || "Unnamed",
            type: item.type || "topic",
          });
        }
      });
    } else if (typeof content === "object" && content !== null) {
      Object.entries(content).forEach(([topic, items]) => {
        if (Array.isArray(items)) {
          items.forEach((item) => {
            if (typeof item === "string") {
              normalized[mainSubject].push({
                id: `${mainSubject}-${topic}-${item}`,
                name: item,
                type: "subtopic",
                chapter: topic,
              });
            } else if (typeof item === "object" && item !== null) {
              normalized[mainSubject].push({
                id: item.id || `${mainSubject}-${topic}-${item.name}`,
                name: item.name || "Unnamed",
                type: item.type || "subtopic",
                chapter: topic,
                ...item,
              });
            }
          });
        }
      });
    }
  });

  return normalized;
};

const Sidebar = ({
  mobileMenuOpen,
  setMobileMenuOpen,
  activeTab,
  setActiveTab,
  handleContentAccess,
  subjects = {},
  activeSubject,
  setActiveSubject,
  hasSubscription,
  navigate,
  currentUser,
  onSignOut,
}) => {
  const [openSubjects, setOpenSubjects] = useState({});
  const [openChapters, setOpenChapters] = useState({});

  const normalizedSubjects = useMemo(() => normalizeSubjects(subjects), [subjects]);

  const toggleDropdown = (mainSubject) => {
    setOpenSubjects((prev) => ({
      ...prev,
      [mainSubject]: !prev[mainSubject],
    }));
  };

  const toggleChapter = (chapter) => {
    setOpenChapters((prev) => ({
      ...prev,
      [chapter]: !prev[chapter],
    }));
  };

  const mainMenuItems = [{ id: "dashboard", label: "Dashboard", Icon: MdOutlineSchool }];
  const studyResources = [
    { id: "mcqs", label: "MCQs Practice", Icon: MdQuiz },
    { id: "notes", label: "Study Notes", Icon: MdNotes },
  ];
  const accountItems = [{ id: "subscribe", label: "Subscription", Icon: MdPayment, showUpgrade: !hasSubscription }];

  return (
    <div
      className={`w-64 bg-white shadow-lg fixed h-full z-40 transform ${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 transition-transform duration-300 ease-out`}
      aria-label="Sidebar"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <h2 className="text-xl font-bold">MrCem</h2>
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden text-white transition-opacity duration-200 hover:opacity-80"
          aria-label="Close navigation menu"
        >
          &times;
        </button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-200 flex items-center space-x-3 bg-gray-50">
        <div className="relative">
          <img
            src={currentUser?.photoURL || "https://randomuser.me/api/portraits/lego/1.jpg"}
            alt="User profile"
            className="w-10 h-10 rounded-full border-2 border-blue-200 object-cover transition-transform duration-200 ease-out hover:scale-[1.03]"
            onError={(e) => (e.target.src = "https://randomuser.me/api/portraits/lego/1.jpg")}
          />
          {hasSubscription && (
            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
              <FaCheck className="text-white text-xs" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-800 truncate">{currentUser?.displayName || "Loading..."}</p>
          <p className={`text-xs truncate ${hasSubscription ? "text-green-600" : "text-yellow-600"}`}>
            {hasSubscription ? "Premium Member" : "Basic Account"}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-180px)] custom-scrollbar">
        {/* Main Menu */}
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Main Menu</div>
        {mainMenuItems.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => {
              setActiveTab(id);
              setMobileMenuOpen(false);
            }}
            className={`group flex items-center space-x-3 w-full p-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              activeTab === id ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
            }`}
            aria-label={`Go to ${label}`}
            aria-current={activeTab === id ? "page" : undefined}
          >
            <Icon className="text-lg transition-transform duration-200 group-hover:scale-105" />
            <span>{label}</span>
          </button>
        ))}

        {/* Study Resources */}
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6 px-2">Study Resources</div>
        {studyResources.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => {
              handleContentAccess(id);
              setMobileMenuOpen(false);
            }}
            className={`group flex items-center space-x-3 w-full p-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              activeTab === id ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
            }`}
            aria-label={`Access ${label}`}
          >
            <Icon className="text-lg transition-transform duration-200 group-hover:scale-105" />
            <span>{label}</span>
          </button>
        ))}

        {/* Subjects */}
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6 px-2">Subjects</div>
        {Object.keys(normalizedSubjects).length > 0 ? (
          Object.entries(normalizedSubjects).map(([mainSubject, topics]) => (
            <div key={mainSubject} className="mb-1">
              <button
                onClick={() => toggleDropdown(mainSubject)}
                className="flex justify-between items-center w-full p-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                aria-label={`Toggle ${mainSubject} dropdown`}
                aria-expanded={openSubjects[mainSubject] || false}
              >
                <span>{mainSubject}</span>
                {openSubjects[mainSubject] ? <FaChevronDown /> : <FaChevronRight />}
              </button>

              {openSubjects[mainSubject] && (
                <div className="ml-4 mt-1 space-y-1 transition-all duration-200 ease-out">
                  {(() => {
                    const chapters = {};
                    topics.forEach((topic) => {
                      if (topic.chapter) {
                        if (!chapters[topic.chapter]) chapters[topic.chapter] = [];
                        chapters[topic.chapter].push(topic);
                      }
                    });

                    const hasChapters = Object.keys(chapters).length > 0;

                    if (hasChapters) {
                      return Object.entries(chapters).map(([chapter, chapterTopics]) => (
                        <div key={chapter}>
                          <button
                            onClick={() => toggleChapter(chapter)}
                            className="flex justify-between items-center w-full p-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                            aria-label={`Toggle ${chapter} chapter`}
                            aria-expanded={openChapters[chapter] || false}
                          >
                            <span>{chapter}</span>
                            {openChapters[chapter] ? <FaChevronDown /> : <FaChevronRight />}
                          </button>
                          {openChapters[chapter] && (
                            <div className="ml-4 mt-1 space-y-1 transition-all duration-200 ease-out">
                              {chapterTopics.map((topic) => (
                                <button
                                  key={topic.id}
                                  onClick={() => {
                                    setActiveSubject({ ...topic, mainSubject });
                                    setActiveTab("subject");
                                    setMobileMenuOpen(false);
                                  }}
                                  className={`block w-full text-left p-2 rounded-md text-sm transition-colors duration-200 ${
                                    activeSubject?.id === topic.id ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
                                  }`}
                                  aria-label={`Select ${topic.name} topic`}
                                >
                                  {topic.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ));
                    } else {
                      return topics.map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => {
                            setActiveSubject({ ...topic, mainSubject });
                            setActiveTab("subject");
                            setMobileMenuOpen(false);
                          }}
                          className={`block w-full text-left p-2 rounded-md text-sm transition-colors duration-200 ${
                            activeSubject?.id === topic.id ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
                          }`}
                          aria-label={`Select ${topic.name} topic`}
                        >
                          {topic.name}
                        </button>
                      ));
                    }
                  })()}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400 px-2">No subjects available</p>
        )}

        {/* Account */}
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6 px-2">Account</div>
        {accountItems.map(({ id, label, Icon, showUpgrade }) => (
          <button
            key={id}
            onClick={() => {
              navigate("/subscribe");
              setMobileMenuOpen(false);
            }}
            className="group flex items-center space-x-3 w-full p-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            aria-label={`Manage ${label}`}
          >
            <Icon className="text-lg transition-transform duration-200 group-hover:scale-105" />
            <span>{label}</span>
            {showUpgrade && (
              <span className="ml-auto bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">Upgrade</span>
            )}
          </button>
        ))}
      </nav>

      {/* Sign Out */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 bg-white">
        <button
           onClick={onSignOut}
          className="group flex items-center space-x-3 w-full p-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-red-600 transition-colors duration-200"
          aria-label="Sign out of account"
        >
          <FaSignOutAlt className="text-lg transition-transform duration-200 group-hover:-translate-x-0.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
