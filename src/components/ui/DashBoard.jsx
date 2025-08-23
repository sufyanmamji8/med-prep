import React, { useState, useEffect } from 'react';
import { 
  FaBookMedical, FaFileMedical, FaClipboardList, 
  FaVideo, FaUserMd, FaRegBell, FaLock, FaCheck,
  FaDownload, FaPlay, FaFileAlt, FaChartLine,
  FaBookOpen, FaClock, FaSearch, FaFilter,
  FaStar, FaHistory, FaCalendarAlt, FaBookmark,
  FaSignOutAlt
} from 'react-icons/fa';
import { 
  MdPayment, MdDashboard, MdQuiz, 
  MdAssignment, MdMenu, MdLockOutline,
  MdNotes, MdOutlineSchool, MdOutlineRateReview,
  MdOutlineInsertChart, MdOutlineTimer
} from 'react-icons/md';
import { RiTestTubeFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { doSignOut } from '../../firebase/auth';
import { auth } from '../../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSubject, setActiveSubject] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({
          displayName: user.displayName || 'User',
          email: user.email,
          photoURL: user.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg'
        });
      } else {
        navigate('/');
      }
      setLoading(false);
    });

    setTimeout(() => {
      setHasSubscription(false);
    }, 1000);

    return () => unsubscribe();
  }, [navigate]);

  // ✅ Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    try {
      await doSignOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const subjects = [
    { id: 1, name: "Anatomy", icon: <FaUserMd className="text-lg" />, color: "bg-red-100 text-red-800" },
    { id: 2, name: "Physiology", icon: <FaBookMedical className="text-lg" />, color: "bg-blue-100 text-blue-800" },
    { id: 3, name: "Biochemistry", icon: <RiTestTubeFill className="text-lg" />, color: "bg-green-100 text-green-800" },
    { id: 4, name: "Pharmacology", icon: <FaClipboardList className="text-lg" />, color: "bg-purple-100 text-purple-800" },
    { id: 5, name: "Pathology", icon: <FaFileMedical className="text-lg" />, color: "bg-yellow-100 text-yellow-800" },
    { id: 6, name: "Microbiology", icon: <MdOutlineSchool className="text-lg" />, color: "bg-pink-100 text-pink-800" },
  ];

  const handleContentAccess = (tab) => {
    if (!hasSubscription && tab !== 'dashboard') {
      navigate('/subscribe');
      return;
    }
    setActiveTab(tab);
  };

  const ProtectedContent = ({ title, icon, children }) => {
    if (!hasSubscription) {
      return (
        <div className="text-center py-10">
          <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <div className="flex justify-center">
              <div className="p-3 bg-blue-100 rounded-full mb-4">
                {icon || <MdLockOutline className="text-3xl text-blue-500" />}
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Premium Content Locked</h3>
            <p className="text-gray-600 mb-4">
              Upgrade to access all {title.toLowerCase()} and enhance your preparation
            </p>
            <button 
              onClick={() => navigate('/subscribe')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium"
            >
              Unlock Premium Features
            </button>
          </div>
        </div>
      );
    }
    return children;
  };

  const generatePastPapers = () => {
    return [2023, 2022, 2021, 2020].map(year => ({
      id: year,
      title: `${activeSubject?.name} ${year} Past Paper`,
      questions: Math.floor(Math.random() * 50) + 50,
      duration: "3 hours",
      downloads: Math.floor(Math.random() * 1000) + 500,
      rating: (Math.random() * 1 + 4).toFixed(1)
    }));
  };

  const generateMcqSets = () => {
    return ["Basic Concepts", "Clinical Applications", "Advanced Topics", "Board Review"].map((title, i) => ({
      id: i + 1,
      title: `${activeSubject?.name} - ${title}`,
      questions: Math.floor(Math.random() * 30) + 20,
      duration: `${Math.floor(Math.random() * 30) + 30} minutes`,
      difficulty: ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)],
      attempts: Math.floor(Math.random() * 500) + 100
    }));
  };

  const generateVideoLectures = () => {
    return [
      "Introduction", "Key Concepts", "Clinical Applications", 
      "Advanced Topics", "Case Studies", "Review Session"
    ].map((title, i) => ({
      id: i + 1,
      title: `${activeSubject?.name}: ${title}`,
      duration: `${Math.floor(Math.random() * 20) + 30} min`,
      views: Math.floor(Math.random() * 1000) + 200,
      instructor: ["Dr. Smith", "Prof. Johnson", "Dr. Lee"][Math.floor(Math.random() * 3)],
      thumbnail: `https://picsum.photos/300/200?random=${i}`
    }));
  };

  const generateStudyNotes = () => {
    return [
      "Comprehensive Guide", "Quick Review Sheets", "Clinical Correlations", 
      "Summary Notes", "Diagrams & Charts", "Mnemonics Collection"
    ].map((title, i) => ({
      id: i + 1,
      title: `${activeSubject?.name} ${title}`,
      pages: Math.floor(Math.random() * 20) + 5,
      downloads: Math.floor(Math.random() * 800) + 200,
      rating: (Math.random() * 1 + 4).toFixed(1),
      lastUpdated: `${Math.floor(Math.random() * 12) + 1} months ago`
    }));
  };

  const renderContent = () => {
    if (!activeSubject && activeTab !== 'dashboard') {
      return (
        <div className="text-center py-10">
          <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-3 bg-blue-100 rounded-full inline-block mb-4">
              <FaBookOpen className="text-3xl text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Select a Subject</h3>
            <p className="text-gray-600 mb-4">
              Choose a subject from the sidebar to access {activeTab.replace('-', ' ')}
            </p>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'past-papers':
        return (
          <ProtectedContent title="Past Papers" icon={<MdAssignment />}>
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <MdAssignment className="text-blue-500 mr-3" />
                {activeSubject?.name} Past Papers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatePastPapers()
                  .filter(paper => selectedYear === 'All' || paper.title.includes(selectedYear))
                  .map(paper => (
                    <div key={paper.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          <MdAssignment className="text-blue-500 text-xl" />
                        </div>
                        <div>
                          <h4 className="font-medium text-lg">{paper.title}</h4>
                          <p className="text-xs text-gray-500">{paper.questions} questions</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-2 mb-5">
                        <div className="flex items-center">
                          <FaClock className="mr-2 text-gray-400" />
                          <span>{paper.duration}</span>
                        </div>
                        <div className="flex items-center">
                          <FaDownload className="mr-2 text-gray-400" />
                          <span>{paper.downloads.toLocaleString()} downloads</span>
                        </div>
                        <div className="flex items-center">
                          <FaStar className="mr-2 text-yellow-400" />
                          <span>{paper.rating} rating</span>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center">
                          <FaDownload className="mr-2" />
                          Download
                        </button>
                        <button className="flex-1 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 px-4 rounded-lg text-sm font-medium">
                          View Online
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </ProtectedContent>
        );

      case 'mcqs':
        return (
          <ProtectedContent title="MCQs Practice" icon={<MdQuiz />}>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                  <MdQuiz className="text-blue-500 mr-3" />
                  {activeSubject?.name} MCQs Practice
                </h3>
                <div className="flex space-x-2">
                  <div className="relative">
                    <select 
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="appearance-none bg-white border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="All">All Difficulty</option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                    <FaFilter className="absolute right-3 top-2.5 text-gray-400 text-sm" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {generateMcqSets()
                  .filter(set => selectedDifficulty === 'All' || set.difficulty === selectedDifficulty)
                  .map(set => (
                    <div key={set.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          <MdQuiz className="text-blue-500 text-xl" />
                        </div>
                        <div>
                          <h4 className="font-medium text-lg">{set.title}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              set.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                              set.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {set.difficulty}
                            </span>
                            <span className="text-xs text-gray-500">{set.questions} questions</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-2 mb-5">
                        <div className="flex items-center">
                          <MdOutlineTimer className="mr-2 text-gray-400" />
                          <span>{set.duration}</span>
                        </div>
                        <div className="flex items-center">
                          <FaHistory className="mr-2 text-gray-400" />
                          <span>{set.attempts.toLocaleString()} attempts</span>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium">
                          Start Practice
                        </button>
                        <button className="flex-1 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 px-4 rounded-lg text-sm font-medium">
                          View Solutions
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </ProtectedContent>
        );

      case 'videos':
        return (
          <ProtectedContent title="Video Lectures" icon={<FaVideo />}>
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <FaVideo className="text-blue-500 mr-3" />
                {activeSubject?.name} Video Lectures
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generateVideoLectures().map(video => (
                  <div key={video.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </div>
                    </div>
                    <div className="p-5">
                      <h4 className="font-medium text-lg mb-1">{video.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">By {video.instructor}</p>
                      <div className="flex items-center text-xs text-gray-500 mb-4">
                        <span className="flex items-center mr-3">
                          <FaPlay className="mr-1" /> {video.views.toLocaleString()} views
                        </span>
                        <span className="flex items-center">
                          <FaStar className="mr-1 text-yellow-400" /> 4.8
                        </span>
                      </div>
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center">
                        <FaPlay className="mr-2" /> Watch Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ProtectedContent>
        );

      case 'notes':
        return (
          <ProtectedContent title="Study Notes" icon={<MdNotes />}>
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <MdNotes className="text-blue-500 mr-3" />
                {activeSubject?.name} Study Notes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generateStudyNotes().map(note => (
                  <div key={note.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          <MdNotes className="text-blue-500 text-xl" />
                        </div>
                        <h4 className="font-medium text-lg">{note.title}</h4>
                      </div>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {note.pages} pages
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-2 mb-5">
                      <div className="flex items-center">
                        <FaDownload className="mr-2 text-gray-400" />
                        <span>{note.downloads.toLocaleString()} downloads</span>
                      </div>
                      <div className="flex items-center">
                        <FaStar className="mr-2 text-yellow-400" />
                        <span>{note.rating} rating</span>
                      </div>
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-2 text-gray-400" />
                        <span>Updated {note.lastUpdated}</span>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center">
                        <FaFileAlt className="mr-2" /> View Online
                      </button>
                      <button className="flex-1 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center">
                        <FaDownload className="mr-2" /> Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ProtectedContent>
        );

      case 'dashboard':
      default:
        return (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Welcome, {currentUser?.displayName?.split(' ')[0] || 'User'}</h2>
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
            
            {!hasSubscription && (
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 p-5 rounded-lg">
                <div className="flex items-start">
                  <div className="p-2 bg-blue-500 rounded-lg mr-4">
                    <FaLock className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg text-blue-800 mb-2">Upgrade to Premium</h3>
                    <p className="text-blue-700 mb-4">
                      Unlock all subjects, past papers, MCQs practice, video lectures, and study notes
                    </p>
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => navigate('/subscribe')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium"
                      >
                        Upgrade Now
                      </button>
                      <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Subjects Enrolled</p>
                    <h3 className="text-2xl font-bold mt-1">4</h3>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <MdOutlineSchool className="text-blue-500 text-xl" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Last added: Pharmacology</p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">MCQs Attempted</p>
                    <h3 className="text-2xl font-bold mt-1">1,248</h3>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <MdOutlineRateReview className="text-green-500 text-xl" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Accuracy: 78%</p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Video Hours</p>
                    <h3 className="text-2xl font-bold mt-1">24.5</h3>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <FaVideo className="text-purple-500 text-xl" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Last watched: 2 days ago</p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Study Progress</p>
                    <h3 className="text-2xl font-bold mt-1">64%</h3>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <MdOutlineInsertChart className="text-yellow-500 text-xl" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">On track with peers</p>
                </div>
              </div>
            </div>

            {/* Recent Activity and Quick Access */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold mb-5 flex items-center">
                  <FaHistory className="mr-2 text-blue-500" />
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <MdQuiz className="text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium">Anatomy - MCQ Practice Set 3</p>
                        <p className="text-sm text-gray-500">Completed 32/50 questions</p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap">
                      Continue Practice
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg mr-3">
                        <FaVideo className="text-purple-500" />
                      </div>
                      <div>
                        <p className="font-medium">Physiology - Cardiac Cycle</p>
                        <p className="text-sm text-gray-500">Watched 15/45 minutes</p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap">
                      Continue Watching
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <MdAssignment className="text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium">Biochemistry - 2023 Past Paper</p>
                        <p className="text-sm text-gray-500">Downloaded 3 days ago</p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap">
                      Review Answers
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                        <MdNotes className="text-yellow-500" />
                      </div>
                      <div>
                        <p className="font-medium">Pharmacology - Drug Classes</p>
                        <p className="text-sm text-gray-500">Saved to bookmarks</p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap">
                      View Notes
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold mb-5 flex items-center">
                  <FaBookmark className="mr-2 text-blue-500" />
                  Quick Access
                </h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => handleContentAccess('past-papers')}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center">
                      <MdAssignment className="text-blue-500 mr-3" />
                      <span>Past Papers</span>
                    </div>
                    <span className="text-gray-400">&rarr;</span>
                  </button>
                  <button 
                    onClick={() => handleContentAccess('mcqs')}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center">
                      <MdQuiz className="text-blue-500 mr-3" />
                      <span>MCQs Practice</span>
                    </div>
                    <span className="text-gray-400">&rarr;</span>
                  </button>
                  <button 
                    onClick={() => handleContentAccess('videos')}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center">
                      <FaVideo className="text-blue-500 mr-3" />
                      <span>Video Lectures</span>
                    </div>
                    <span className="text-gray-400">&rarr;</span>
                  </button>
                  <button 
                    onClick={() => handleContentAccess('notes')}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center">
                      <MdNotes className="text-blue-500 mr-3" />
                      <span>Study Notes</span>
                    </div>
                    <span className="text-gray-400">&rarr;</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recommended Subjects */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-5 flex items-center">
                <FaStar className="mr-2 text-blue-500" />
                Recommended Subjects
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {subjects.map(subject => (
                  <button
                    key={subject.id}
                    onClick={() => setActiveSubject(subject)}
                    className={`flex flex-col items-center p-4 rounded-lg border transition-all ${
                      activeSubject?.id === subject.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className={`p-3 rounded-full mb-2 ${subject.color.replace('text', 'bg')}`}>
                      {subject.icon}
                    </div>
                    <span className="text-sm font-medium">{subject.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
    }
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
        <MdMenu className="text-xl text-gray-700" />
      </button>

      {/* ✅ Mobile overlay (prevents background interaction) */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`w-64 bg-white shadow-lg fixed h-full z-40 transition-transform duration-300 ease-in-out transform
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        aria-label="Sidebar"
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <h2 className="text-xl font-bold">MedPrep Pro</h2>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-white"
            aria-label="Close navigation"
          >
            &times;
          </button>
        </div>
        
        {/* User Profile */}
        <div className="p-4 border-b border-gray-200 flex items-center space-x-3 bg-gray-50">
          <div className="relative">
            <img 
              src={currentUser?.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg'} 
              alt="User" 
              className="w-10 h-10 rounded-full border-2 border-blue-200 object-cover"
            />
            {hasSubscription && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
                <FaCheck className="text-white text-xs" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-800">{currentUser?.displayName || 'Loading...'}</p>
            <p className={`text-xs ${hasSubscription ? 'text-green-600' : 'text-yellow-600'}`}>
              {hasSubscription ? 'Premium Member' : 'Basic Account'}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
            Main Menu
          </div>
          <button 
            onClick={() => {
              setActiveTab('dashboard');
              setMobileMenuOpen(false);
            }}
            className={`flex items-center space-x-3 w-full p-2 rounded-lg text-sm font-medium ${
              activeTab === 'dashboard' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MdDashboard className="text-lg" />
            <span>Dashboard</span>
          </button>
          
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6 px-2">
            Study Resources
          </div>
          <button 
            onClick={() => {
              handleContentAccess('past-papers');
              setMobileMenuOpen(false);
            }}
            className={`flex items-center space-x-3 w-full p-2 rounded-lg text-sm font-medium ${
              activeTab === 'past-papers' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MdAssignment className="text-lg" />
            <span>Past Papers</span>
          </button>
          <button 
            onClick={() => {
              handleContentAccess('mcqs');
              setMobileMenuOpen(false);
            }}
            className={`flex items-center space-x-3 w-full p-2 rounded-lg text-sm font-medium ${
              activeTab === 'mcqs' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MdQuiz className="text-lg" />
            <span>MCQs Practice</span>
          </button>
          <button 
            onClick={() => {
              handleContentAccess('videos');
              setMobileMenuOpen(false);
            }}
            className={`flex items-center space-x-3 w-full p-2 rounded-lg text-sm font-medium ${
              activeTab === 'videos' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaVideo className="text-lg" />
            <span>Video Lectures</span>
          </button>
          <button 
            onClick={() => {
              handleContentAccess('notes');
              setMobileMenuOpen(false);
            }}
            className={`flex items-center space-x-3 w-full p-2 rounded-lg text-sm font-medium ${
              activeTab === 'notes' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MdNotes className="text-lg" />
            <span>Study Notes</span>
          </button>

          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6 px-2">
            Subjects
          </div>
          {subjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => {
                setActiveSubject(subject);
                setMobileMenuOpen(false);
              }}
              className={`flex items-center space-x-3 w-full p-2 rounded-lg text-sm font-medium ${
                activeSubject?.id === subject.id 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {subject.icon}
              <span>{subject.name}</span>
            </button>
          ))}

          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6 px-2">
            Account
          </div>
          <button 
            onClick={() => {
              navigate('/subscribe');
              setMobileMenuOpen(false);
            }}
            className="flex items-center space-x-3 w-full p-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            <MdPayment className="text-lg" />
            <span>Subscription</span>
            {!hasSubscription && (
              <span className="ml-auto bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                Upgrade
              </span>
            )}
          </button>
        </nav>

        {/* Sign Out Button */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <button 
            onClick={handleSignOut}
            className="flex items-center space-x-3 w-full p-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-red-600"
          >
            <FaSignOutAlt className="text-lg" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      {/* ✅ No margin shift on mobile; only on md+ we keep space for the sidebar */}
      <div className="flex-1 overflow-auto transition-all duration-300 md:ml-64">
        {/* Top Navigation */}
        <div className="bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-10 border-b border-gray-200">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-800">
              {activeSubject?.name || "Dashboard Overview"}
            </h1>
            {activeSubject && (
              <span className={`ml-3 text-xs px-2 py-1 rounded-full ${activeSubject.color}`}>
                {activeSubject.name}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-900 relative">
              <FaRegBell className="text-xl" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            {/* User Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-2 focus:outline-none">
                <img 
                  src={currentUser?.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg'} 
                  alt="User" 
                  className="w-8 h-8 rounded-full border-2 border-blue-200 object-cover"
                />
                <span className="hidden md:inline text-sm font-medium">
                  {currentUser?.displayName?.split(' ')[0] || 'User'}
                </span>
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium">{currentUser?.displayName || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{currentUser?.email || ''}</p>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <FaSignOutAlt className="mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <main className="p-4 md:p-8">
          {/* Content Tabs */}
          {activeTab !== 'dashboard' && (
            <div className="flex overflow-x-auto mb-6 bg-white p-1 rounded-lg shadow-sm sticky top-16 z-10 border border-gray-200">
              {[
                { id: "past-papers", label: "Past Papers", icon: <MdAssignment className="mr-2" /> },
                { id: "mcqs", label: "MCQs Practice", icon: <MdQuiz className="mr-2" /> },
                { id: "videos", label: "Video Lectures", icon: <FaVideo className="mr-2" /> },
                { id: "notes", label: "Study Notes", icon: <MdNotes className="mr-2" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleContentAccess(tab.id)}
                  className={`flex items-center px-4 py-2 font-medium whitespace-nowrap text-sm transition-colors ${
                    activeTab === tab.id 
                      ? 'bg-blue-600 text-white rounded-lg shadow' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              renderContent()
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
