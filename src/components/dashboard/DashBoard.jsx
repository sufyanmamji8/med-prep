import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { doSignOut } from "../../firebase/auth";

// Icons used to build the subjects list (passed to children)
import { 
  FaBookMedical, FaFileMedical, FaClipboardList,
  FaVideo, FaUserMd
} from "react-icons/fa";
import { RiTestTubeFill } from "react-icons/ri";

// Layout
import Sidebar from "./layout/Sidebar";
import Topbar from "./layout/Topbar";

// Common
import ContentTabs from "./common/ContentTabs";

// Sections
import DashboardHome from "./sections/DashboardHome";
import PastPapers from "./sections/PastPapers";
import Mcqs from "./sections/Mcqs";
import Videos from "./sections/Videos";
import Notes from "./sections/Notes";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeSubject, setActiveSubject] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = useNavigate();

  // Auth + preload
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({
          displayName: user.displayName || "User",
          email: user.email,
          photoURL: user.photoURL || "https://randomuser.me/api/portraits/lego/1.jpg",
        });
      } else {
        navigate("/");
      }
      setLoading(false);
    });

    // Simulate subscription check (replace with real check later)
    const t = setTimeout(() => setHasSubscription(false), 1000);

    return () => {
      unsubscribe();
      clearTimeout(t);
    };
  }, [navigate]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    try {
      await doSignOut();
      navigate("/");
    } catch (e) {
      console.error("Error signing out:", e);
    }
  };

  const subjects = [
    { id: 1, name: "Anatomy", icon: <FaUserMd className="text-lg" />, color: "bg-red-100 text-red-800" },
    { id: 2, name: "Physiology", icon: <FaBookMedical className="text-lg" />, color: "bg-blue-100 text-blue-800" },
    { id: 3, name: "Biochemistry", icon: <RiTestTubeFill className="text-lg" />, color: "bg-green-100 text-green-800" },
    { id: 4, name: "Pharmacology", icon: <FaClipboardList className="text-lg" />, color: "bg-purple-100 text-purple-800" },
    { id: 5, name: "Pathology", icon: <FaFileMedical className="text-lg" />, color: "bg-yellow-100 text-yellow-800" },
    { id: 6, name: "Microbiology", icon: <FaVideo className="text-lg" />, color: "bg-pink-100 text-pink-800" },
  ];

  const handleContentAccess = (tab) => {
    if (!hasSubscription && tab !== "dashboard") {
      navigate("/subscribe");
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-lg border border-gray-200"
        aria-label="Open navigation"
        aria-expanded={mobileMenuOpen}
      >
        {/* icon inside Sidebar on header too */}
        <span className="sr-only">Toggle menu</span>
        <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
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
        <Topbar activeSubject={activeSubject} currentUser={currentUser} onSignOut={handleSignOut} />

        <main className="p-4 md:p-8">
          {activeTab !== "dashboard" && (
            <ContentTabs activeTab={activeTab} handleContentAccess={handleContentAccess} />
          )}

          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              {
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
                    handleContentAccess={handleContentAccess}
                  />
                ),
                "past-papers": (
                  <PastPapers
                    activeSubject={activeSubject}
                    selectedYear={selectedYear}
                    setSelectedYear={setSelectedYear}
                    hasSubscription={hasSubscription}
                    navigate={navigate}
                  />
                ),
                mcqs: (
                  <Mcqs
                    activeSubject={activeSubject}
                    selectedDifficulty={selectedDifficulty}
                    setSelectedDifficulty={setSelectedDifficulty}
                    hasSubscription={hasSubscription}
                    navigate={navigate}
                  />
                ),
                videos: (
                  <Videos
                    activeSubject={activeSubject}
                    hasSubscription={hasSubscription}
                    navigate={navigate}
                  />
                ),
                notes: (
                  <Notes
                    activeSubject={activeSubject}
                    hasSubscription={hasSubscription}
                    navigate={navigate}
                  />
                ),
              }[activeTab]
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;