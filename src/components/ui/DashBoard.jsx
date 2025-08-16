import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaBookMedical, 
  FaFileMedical, 
  FaClipboardList, 
  FaVideo, 
  FaUserMd,
  FaRegBell
} from "react-icons/fa";
import { 
  MdPayment, 
  MdDashboard, 
  MdQuiz, 
  MdAssignment,
  MdMenu
} from "react-icons/md";

// ye mock data hai authentication sy replace hoga
const mockUser = {
  name: "Sufyan Mamji",
  email: "sufyanmamji@gmail.com",
  avatar: "https://randomuser.me/api/portraits/lego/1.jpg"
};


const AppContext = React.createContext();

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [activeSubject, setActiveSubject] = useState(null);
  const [activeTab, setActiveTab] = useState("past-papers");
  const [subscriptionStatus, setSubscriptionStatus] = useState(true); // Change to false to test payment redirect
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  const subjects = [
    { id: 1, name: "Anatomy", icon: <FaUserMd className="text-lg" /> },
    { id: 2, name: "Physiology", icon: <FaBookMedical className="text-lg" /> },
    { id: 3, name: "Biochemistry", icon: <FaFileMedical className="text-lg" /> },
    { id: 4, name: "Pharmacology", icon: <FaClipboardList className="text-lg" /> },
  ];

  // Mock function to check subscription status
  const checkSubscription = () => {
    // In a real app, this would be an API call
    const isSubscribed = true; // Change to false to test payment flow
    setSubscriptionStatus(isSubscribed);
    return isSubscribed;
  };

  // Mock function to fetch dashboard data
  const fetchDashboardData = async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const data = {
      enrolledSubjects: subjects,
      recentActivity: [
        { id: 1, subject: "Anatomy", type: "MCQs", date: "2023-05-15" },
        { id: 2, subject: "Physiology", type: "Past Paper", date: "2023-05-10" },
      ],
      subscriptionStatus: subscriptionStatus,
    };
    
    setDashboardData(data);
    setActiveSubject(subjects[0]); // Set first subject as default
  };

  useEffect(() => {
    const isSubscribed = checkSubscription();
    if (!isSubscribed) {
      navigate("/payment");
    } else {
      fetchDashboardData();
    }
  }, []);

  const renderContent = () => {
    if (!activeSubject) return <div className="text-center py-10">Loading content...</div>;

    switch (activeTab) {
      case "past-papers":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">{activeSubject.name} Past Papers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[2023, 2022, 2021].map((year) => (
                <div key={year} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{year} Paper</span>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                      Download
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Total questions: 100</p>
                </div>
              ))}
            </div>
          </div>
        );
      case "mcqs":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">{activeSubject.name} MCQs</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((set) => (
                <div key={set} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">MCQ Set {set}</span>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                      Start Practice
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">50 questions | 60 minutes</p>
                </div>
              ))}
            </div>
          </div>
        );
      case "videos":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">{activeSubject.name} Video Lectures</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["Introduction", "Key Concepts", "Clinical Applications"].map((title, i) => (
                <div key={i} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="bg-gray-200 h-40 flex items-center justify-center">
                    <FaVideo className="text-4xl text-gray-500" />
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium">{title}</h4>
                    <p className="text-sm text-gray-600">45 min</p>
                    <button className="mt-2 text-blue-600 text-sm font-medium hover:text-blue-800">
                      Watch Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "notes":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">{activeSubject.name} Study Notes</h3>
            <div className="space-y-3">
              {["Basic Concepts", "Advanced Topics", "Clinical Correlations"].map((chapter, i) => (
                <div key={i} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-medium">{chapter}</h4>
                  <p className="text-sm text-gray-600 mt-1">15 pages</p>
                  <div className="flex space-x-3 mt-3">
                    <button className="text-blue-600 text-sm font-medium hover:text-blue-800">
                      View Online
                    </button>
                    <button className="text-blue-600 text-sm font-medium hover:text-blue-800">
                      Download PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ user: mockUser, subscriptionStatus, checkSubscription }}>
      <div className="flex min-h-screen bg-gray-50">
        {/* Mobile menu button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-md shadow-md"
        >
          <MdMenu className="text-xl" />
        </button>

        {/* Sidebar - shown on desktop and mobile when menu open */}
        <div className={`w-64 bg-white shadow-md fixed md:static h-full z-40 transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-xl font-bold text-blue-800">MedPrep Pro</h2>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-gray-500"
            >
              &times;
            </button>
          </div>
          
          {/* User profile */}
          <div className="p-4 border-b flex items-center space-x-3">
            <img 
              src={mockUser.avatar} 
              alt="User" 
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-medium">{mockUser.name}</p>
              <p className="text-xs text-gray-500">{mockUser.email}</p>
            </div>
          </div>

          <nav className="p-4 space-y-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Main Menu
            </div>
            <button className="flex items-center space-x-2 w-full p-2 rounded bg-blue-50 text-blue-700">
              <MdDashboard className="text-lg" />
              <span>Dashboard</span>
            </button>
            
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6">
              Subjects
            </div>
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => {
                  setActiveSubject(subject);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-2 w-full p-2 rounded ${activeSubject?.id === subject.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              >
                {subject.icon}
                <span>{subject.name}</span>
              </button>
            ))}

            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6">
              Account
            </div>
            <button className="flex items-center space-x-2 w-full p-2 rounded hover:bg-gray-100">
              <MdPayment className="text-lg" />
              <span>Subscription</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto md:ml-64">
          {/* Top bar */}
          <div className="bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-30">
            <h1 className="text-xl font-bold text-gray-800">
              {activeSubject?.name || "Dashboard"}
            </h1>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900 relative">
                <FaRegBell className="text-xl" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <img 
                src={mockUser.avatar} 
                alt="User" 
                className="w-8 h-8 rounded-full"
              />
            </div>
          </div>

          <div className="p-4 md:p-8">
            {/* Content Tabs */}
            <div className="flex overflow-x-auto mb-6 bg-white p-1 rounded-lg shadow-sm sticky top-16 z-20">
              {[
                { id: "past-papers", label: "Past Papers", icon: <MdAssignment className="mr-2" /> },
                { id: "mcqs", label: "MCQs Practice", icon: <MdQuiz className="mr-2" /> },
                { id: "videos", label: "Video Lectures", icon: <FaVideo className="mr-2" /> },
                { id: "notes", label: "Study Notes", icon: <FaFileMedical className="mr-2" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 font-medium whitespace-nowrap ${activeTab === tab.id ? 'bg-blue-100 text-blue-700 rounded' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              {renderContent()}
            </div>

            {/* Recent Activity */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {dashboardData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex justify-between items-center p-4 border-b hover:bg-gray-50">
                    <div>
                      <p className="font-medium">{activity.subject} - {activity.type}</p>
                      <p className="text-sm text-gray-500">{activity.date}</p>
                    </div>
                    <button className="text-blue-600 text-sm font-medium hover:text-blue-800 px-3 py-1 bg-blue-50 rounded">
                      Continue
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppContext.Provider>
  );
};

export default Dashboard;