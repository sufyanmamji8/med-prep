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

// ✅ Backend Auth
import { getCurrentUser, logoutUser } from "../../services/authService";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeSubject, setActiveSubject] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(true);
  const [subjects, setSubjects] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [loading, setLoading] = useState(true); // Start with true
  const [currentUser, setCurrentUser] = useState(null);

  // ✅ MCQ result state
  const [mcqResultData, setMcqResultData] = useState(null);

  // ✅ Subject details state
  const [subjectDetails, setSubjectDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // 1️⃣ FIXED Auth check (Backend)
  useEffect(() => {
    console.log("🔍 Dashboard - Checking authentication...");
    
    const user = getCurrentUser();
    const token = localStorage.getItem('token');
    
    console.log("🔍 Dashboard - User from getCurrentUser:", user);
    console.log("🔍 Dashboard - Token from localStorage:", token);
    console.log("🔍 Dashboard - All localStorage:");
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      console.log(`  ${key}: ${localStorage.getItem(key)?.substring(0, 30)}...`);
    }

    if (user && token) {
      console.log("✅ Dashboard - User authenticated");
      setCurrentUser({
        name: user.name || "User",
        email: user.email,
        photoURL: user.profileImage || "https://randomuser.me/api/portraits/lego/1.jpg",
      });
      setLoading(false);
    } else {
      console.log("❌ Dashboard - No user or token, redirecting to login");
      // ✅ FIX: Redirect to LOGIN, not dashboard (this was causing infinite loop)
      navigate("/");
    }
  }, [navigate]);

  // 2️⃣ Fetch subjects
  useEffect(() => {
    if (loading) return; // Don't fetch until auth is checked
    
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
  }, [loading]);

  // 3️⃣ Lock body scroll when mobile menu open
  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // 4️⃣ Handle sign out
  const handleSignOut = () => {
    console.log("🚪 Dashboard - Signing out...");
    logoutUser();
    navigate("/");
  };

  const handleContentAccess = (tab) => {
    console.log("📱 Dashboard - Switching to tab:", tab);
    setActiveTab(tab);
  };

  // 5️⃣ Build subject path (keep your existing function)
  const findMainSubjectFor = (subject) => {
    if (!subject || !subjects) return null;
    for (const [main, content] of Object.entries(subjects)) {
      if (Array.isArray(content)) {
        for (const it of content) {
          if (typeof it === "string" && it === subject.name) return main;
          if (
            typeof it === "object" &&
            (it.name === subject.name || it.id === subject.id)
          )
            return main;
        }
      } else if (content && typeof content === "object") {
        for (const items of Object.values(content)) {
          if (!Array.isArray(items)) continue;
          for (const it of items) {
            if (typeof it === "string" && it === subject.name) return main;
            if (
              typeof it === "object" &&
              (it.name === subject.name || it.id === subject.id)
            )
              return main;
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

  useEffect(() => {
    if (location.state?.fromMcqPractice && location.state?.mcqResultData) {
      setMcqResultData(location.state.mcqResultData);
      setActiveTab("mcqResult");
      window.history.replaceState({}, document.title); // clean state
    }
  }, [location.state]);

  // 6️⃣ Fetch subject details
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
      .catch(() => setSubjectDetails(null))
      .finally(() => setLoadingDetails(false));
  }, [activeSubject, subjects]);

  // ✅ Add debug button to check auth status
  const debugAuth = () => {
    console.log("=== 🐞 DASHBOARD AUTH DEBUG ===");
    console.log("Current User State:", currentUser);
    console.log("Loading State:", loading);
    console.log("Token:", localStorage.getItem('token'));
    console.log("User:", localStorage.getItem('user'));
    console.log("All localStorage:");
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      console.log(`  ${key}: ${localStorage.getItem(key)}`);
    }
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
      {/* Debug button */}
      {/* <button 
        onClick={debugAuth}
        className="fixed top-2 right-2 z-50 bg-red-500 text-white p-2 rounded text-sm"
      >
        
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
        setActiveTab={setActiveTab}
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
            setActiveTab("dashboard");
          }}
        />

        <main className="p-4 md:p-8">
          {activeTab !== "dashboard" && (
            <ContentTabs
              activeTab={activeTab}
              handleContentAccess={handleContentAccess}
            />
          )}

          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            {{
              dashboard: (
                <DashboardHome
                  currentUser={currentUser}
                  hasSubscription={hasSubscription}
                  navigate={navigate}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  subjects={subjects}
                  activeSubject={activeSubject}
                  setActiveSubject={setActiveSubject}
                  setActiveTab={setActiveTab}
                  handleContentAccess={handleContentAccess}
                />
              ),
              mcqs: (
                <Mcqs
                  activeSubject={activeSubject}
                  selectedDifficulty={selectedDifficulty}
                  setSelectedDifficulty={setSelectedDifficulty}
                  hasSubscription={hasSubscription}
                  navigate={navigate}
                  onBack={() => setActiveTab("subject")}
                  setActiveTab={setActiveTab}
                  setMcqResultData={setMcqResultData}
                />
              ),
              revision: <RevisionPage onBack={() => setActiveTab("dashboard")} />,
              notes: (
                <Notes
                  activeSubject={activeSubject}
                  hasSubscription={hasSubscription}
                  onBack={() => setActiveTab("subject")}
                />
              ),
              subject: (
                <SubjectPage
                  activeSubject={activeSubject}
                  subjectDetails={subjectDetails}
                  loadingDetails={loadingDetails}
                  handleContentAccess={handleContentAccess}
                  navigate={navigate}
                  hasSubscription={hasSubscription}
                />
              ),
              mcqPractice: (
                <McqPracticePage
                  activeSubject={activeSubject}
                  difficulty={selectedDifficulty}
                  onFinish={(result) => {
                    setMcqResultData(result);
                    setActiveTab("mcqResult");
                  }}
                  onBack={() => setActiveTab("mcqs")}
                />
              ),
              mcqResult: (
                <McqResultPage
                  resultData={mcqResultData}
                  onRetry={() => setActiveTab("mcqPractice")}
                  onBack={() => setActiveTab("mcqs")}
                />
              ),
            }[activeTab]}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;