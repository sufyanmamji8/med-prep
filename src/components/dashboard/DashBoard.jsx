import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./layout/Sidebar";
import Topbar from "./layout/Topbar";
import ContentTabs from "./common/ContentTabs";
import DashboardHome from "./sections/DashboardHome";
import Mcqs from "./sections/Mcqs";
import Notes from "./sections/Notes";
import SubjectPage from "./sections/SubjectPage";
import McqPracticePage from "./sections/McqPracticePage";
import McqResultPage from "./sections/McqResultPage";
import RevisionPage from "./sections/RevisionPage";
import QuestionsPage from "./sections/QuestionPage";
import SessionHistory from "./sections/SessionHistory";
import SingleSessionHistory from "./sections/SingleSessionHistory";

// Backend Auth
import { getCurrentUser, logoutUser } from "../../services/authService";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeSubject, setActiveSubject] = useState(null);
  const [hasSubscription, setHasSubscription] = useState(true);
  const [subjects, setSubjects] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [loading, setLoading] = useState(true);
  const [currentSession, setCurrentSession] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [subjectDetails, setSubjectDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [mcqResultData, setMcqResultData] = useState(null);
  
  // States for single session view
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [viewSingleSession, setViewSingleSession] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Fetch current user on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser(user);
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurrentUser();
  }, [navigate]);

  // Fetch subjects when user is authenticated
  useEffect(() => {
    if (!loading && currentUser) {
      console.log("📚 Dashboard - Fetching subjects...");
      fetch("https://whatsbiz.codovio.com/mrcem/textBookHierarchy")
        .then((res) => res.json())
        .then((data) => {
          if (data?.textBookHierarchy) {
            setSubjects(data.textBookHierarchy);
            console.log("✅ Subjects loaded successfully");
          } else {
            setSubjects({});
            console.log("❌ No subjects data found");
          }
        })
        .catch((error) => {
          console.error("❌ Error fetching subjects:", error);
          setSubjects({});
        });
    }
  }, [loading, currentUser]);

  // Fetch subject details when activeSubject changes
  useEffect(() => {
    if (!activeSubject) {
      setSubjectDetails(null);
      setLoadingDetails(false);
      return;
    }

    const path = buildSubjectPath(activeSubject);
    if (!path) {
      setSubjectDetails(null);
      setLoadingDetails(false);
      return;
    }

    const isLocal =
      typeof window !== "undefined" &&
      /localhost|127\.0\.0\.1/i.test(window.location.host);
    const backupUrl = isLocal
      ? `/whatsbiz/mrcem/getFile/${path}`
      : `https://whatsbiz.codovio.com/mrcem/getFile/${path}`;

    setLoadingDetails(true);
    setSubjectDetails(null);

    fetch(backupUrl, { cache: "no-store" })
      .then((res) => res.text())
      .then((txt) => setSubjectDetails(txt))
      .catch((error) => {
        console.error('Error fetching subject details:', error);
        setSubjectDetails(null);
      })
      .finally(() => setLoadingDetails(false));
  }, [activeSubject]);

  // Handle direct navigation to mcqResult with sessionId
  useEffect(() => {
    if (location.state?.sessionId && activeTab !== "mcqResult") {
      console.log("📍 Direct navigation to mcqResult with sessionId:", location.state.sessionId);
      setActiveTab("mcqResult");
    }
  }, [location.state, activeTab]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Handle sign out
  const handleSignOut = () => {
    console.log("🚪 Dashboard - Signing out...");
    logoutUser();
    navigate("/");
  };

  // Custom tab change handler
  const handleTabChange = (tab, state = {}) => {
    console.log("🔄 Setting active tab:", tab, "with state:", state);
    
    // Clear single session view when navigating away from session history
    if (tab !== "sessionHistory") {
      setViewSingleSession(false);
      setSelectedSessionId(null);
    }
    
    // Clear mcqResultData when navigating away from results
    if (tab !== "mcqResult") {
      setMcqResultData(null);
    }
    
    setActiveTab(tab);
  };

  // Handle content access
  const handleContentAccess = (contentType, subject = null) => {
    if (subject) {
      setActiveSubject(subject);
    }
    setActiveTab(contentType);
  };

  // Handle single session view
  const handleViewSingleSession = (sessionId) => {
    console.log("📋 Opening single session view for:", sessionId);
    setSelectedSessionId(sessionId);
    setViewSingleSession(true);
  };

  // Handle back from single session
  const handleBackFromSingleSession = () => {
    console.log("🔙 Returning to session history list");
    setViewSingleSession(false);
    setSelectedSessionId(null);
  };

  // Build subject path for API
  const findMainSubjectFor = (subject) => {
    if (!subject || !subjects) return null;
    
    for (const [main, content] of Object.entries(subjects)) {
      if (Array.isArray(content)) {
        for (const item of content) {
          if (typeof item === "string" && item === subject.name) return main;
          if (typeof item === "object" && (item.name === subject.name || item.id === subject.id)) {
            return main;
          }
        }
      } else if (content && typeof content === "object") {
        for (const items of Object.values(content)) {
          if (!Array.isArray(items)) continue;
          for (const item of items) {
            if (typeof item === "string" && item === subject.name) return main;
            if (typeof item === "object" && (item.name === subject.name || item.id === subject.id)) {
              return main;
            }
          }
        }
      }
    }
    return null;
  };

  const buildSubjectPath = (subject) => {
    if (!subject) return null;
    const parts = [];
    const main = subject.mainSubject || findMainSubjectFor(subject);
    if (main) parts.push(main);
    if (subject.chapter && subject.chapter !== main) parts.push(subject.chapter);
    const candidateTopic = subject.topic || subject.name;
    if (
      candidateTopic &&
      candidateTopic !== main &&
      candidateTopic !== subject.chapter
    ) {
      parts.push(candidateTopic);
    }
    if (parts.length === 0 && subject.name) parts.push(subject.name);
    const encoded = parts.map((p) => encodeURIComponent(p)).join("|");
    return encoded;
  };

  // Debug function
  const debugAuth = () => {
    console.log("=== 🐞 DASHBOARD DEBUG ===");
    console.log("Active Tab:", activeTab);
    console.log("Active Subject:", activeSubject);
    console.log("Current Session:", currentSession);
    console.log("Location State:", location.state);
    console.log("Subjects:", subjects);
    console.log("Subject Details:", subjectDetails);
    console.log("View Single Session:", viewSingleSession);
    console.log("Selected Session ID:", selectedSessionId);
    console.log("=== END DEBUG ===");
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
          <button 
            onClick={debugAuth}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
          >
            Debug Auth
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Debug button - uncomment if needed */}
      {/* <button 
        onClick={debugAuth}
        className="fixed top-2 right-2 z-50 bg-red-500 text-white p-2 rounded text-sm"
      >
        Debug
      </button> */}

      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-2 left-4 z-50 bg-white p-2 rounded-lg shadow-lg border border-gray-200"
      >
        <span className="sr-only">Toggle menu</span>
        <svg
          viewBox="0 0 24 24"
          className="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        handleContentAccess={handleContentAccess}
        subjects={subjects}
        activeSubject={activeSubject}
        setActiveSubject={setActiveSubject}
        hasSubscription={hasSubscription}
        navigate={navigate}
        currentUser={currentUser}
        onSignOut={handleSignOut}
      />

      {/* Main content */}
      <div className="flex-1 overflow-auto transition-all duration-300 md:ml-64">
        <Topbar
          activeSubject={activeSubject}
          currentUser={currentUser}
          onSignOut={handleSignOut}
          onBack={() => {
            setActiveSubject(null);
            handleTabChange("dashboard");
          }}
        />

        <main className="p-4 md:p-8">
          {activeTab !== "dashboard" && !viewSingleSession && (
            <ContentTabs activeTab={activeTab} handleContentAccess={handleTabChange} />
          )}

          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            {(() => {
              // Render SingleSessionHistory when in single session view
              if (viewSingleSession && selectedSessionId) {
                return (
                  <SingleSessionHistory
                    sessionId={selectedSessionId}
                    onBack={handleBackFromSingleSession}
                  />
                );
              }

              const components = {
                dashboard: (
                  <DashboardHome
                    currentUser={currentUser}
                    hasSubscription={hasSubscription}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    subjects={subjects}
                    activeSubject={activeSubject}
                    setActiveSubject={setActiveSubject}
                    setActiveTab={handleTabChange}
                    handleContentAccess={handleContentAccess}
                  />
                ),
                sessionHistory: (
                  <SessionHistory
                    onBack={() => handleTabChange("dashboard")}
                    onViewSessionDetails={handleViewSingleSession}
                  />
                ),
                subject: (
                  <SubjectPage
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    subjects={subjects}
                    activeSubject={activeSubject}
                    setActiveSubject={setActiveSubject}
                    setActiveTab={handleTabChange}
                    handleContentAccess={handleContentAccess}
                    subjectDetails={subjectDetails}
                    loadingDetails={loadingDetails}
                  />
                ),
                mcqs: (
                  <Mcqs
                    activeSubject={activeSubject}
                    selectedDifficulty={selectedDifficulty}
                    setSelectedDifficulty={setSelectedDifficulty}
                    hasSubscription={hasSubscription}
                    navigate={navigate}
                    onBack={() => handleTabChange("subject")}
                    setMcqResultData={setMcqResultData}
                  />
                ),
                revision: (
                  <RevisionPage 
                    onBack={() => handleTabChange("dashboard")} 
                    onStartSession={(sessionData) => {
                      console.log('Session started with data:', sessionData);
                      setCurrentSession(sessionData);
                      handleTabChange("questions");
                    }}
                  />
                ),
                questions: (
                  <QuestionsPage
                    sessionData={currentSession}
                    setActiveTab={handleTabChange}
                    onBack={() => handleTabChange("revision")}
                  />
                ),
                mcqPractice: (
                  <McqPracticePage
                    activeSubject={activeSubject}
                    difficulty={selectedDifficulty}
                    onFinish={(result) => {
                      setMcqResultData(result);
                      handleTabChange("mcqResult");
                    }}
                    onBack={() => handleTabChange("mcqs")}
                  />
                ),
                mcqResult: (
                  <McqResultPage
                    tabState={{
                      sessionId: location.state?.sessionId || currentSession?.sessionId,
                      subject: activeSubject
                    }}
                    onRetry={() => {
                      // If we have a current session, go back to questions
                      if (currentSession) {
                        handleTabChange("questions");
                      } else {
                        // Otherwise, go back to revision to start a new session
                        handleTabChange("revision");
                      }
                    }}
                    onBack={() => handleTabChange("revision")}
                  />
                ),
                notes: (
                  <Notes
                    activeSubject={activeSubject}
                    subjectDetails={subjectDetails}
                    loadingDetails={loadingDetails}
                    onBack={() => handleTabChange("subject")}
                  />
                )
              };
              
              return components[activeTab] || <div>Page not found - {activeTab}</div>;
            })()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;