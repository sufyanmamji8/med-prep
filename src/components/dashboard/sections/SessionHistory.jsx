import React, { useState, useEffect } from "react";
import { FaFilter, FaCalendarAlt, FaArrowLeft, FaChartBar, FaClock, FaCheckCircle, FaTimesCircle, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import axios from "axios";

const SessionHistory = ({ onBack, onViewSessionDetails }) => {
  const [filterType, setFilterType] = useState("ALL");
  const [filterMonth, setFilterMonth] = useState("ALL TIME");
  const [showFilters, setShowFilters] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 4,
    total: 0,
    totalPages: 0
  });

  // Format month for API call
  const formatMonthForAPI = (monthString) => {
    if (monthString === "ALL TIME") return null;
    const [month, year] = monthString.split(' ');
    const monthMap = {
      'JANUARY': '01', 'FEBRUARY': '02', 'MARCH': '03', 'APRIL': '04',
      'MAY': '05', 'JUNE': '06', 'JULY': '07', 'AUGUST': '08',
      'SEPTEMBER': '09', 'OCTOBER': '10', 'NOVEMBER': '11', 'DECEMBER': '12'
    };
    return `${year}-${monthMap[month]}`;
  };

  // Calculate percentage
  const calculatePercentage = (correctAnswers, totalQuestions) => {
    const correct = Number(correctAnswers) || 0;
    const total = Number(totalQuestions) || 0;
    if (total === 0) return 0;
    const percentage = Math.round((correct / total) * 100);
    return isNaN(percentage) ? 0 : percentage;
  };

  // FIXED: Proper session data extraction from localStorage
  const getSessionDataFromStorage = () => {
    const sessionData = [];
    
    try {
      console.log("🔍 Scanning localStorage for session data...");

      // 1. Check revisionProgress - FIXED: Proper comparison of userAnswers vs correctAnswers
      const savedRevision = localStorage.getItem('revisionProgress');
      if (savedRevision) {
        try {
          const revision = JSON.parse(savedRevision);
          console.log("📁 RAW revisionProgress data:", revision);
          
          if (revision) {
            let correctCount = 0;
            let totalQuestions = 0;

            // Try multiple methods to get correct data
            
            // Method 1: Check if we have userAnswers and correctAnswers objects
            if (revision.userAnswers && revision.correctAnswers && typeof revision.userAnswers === 'object' && typeof revision.correctAnswers === 'object') {
              const questionIds = Object.keys(revision.userAnswers);
              totalQuestions = questionIds.length;
              
              correctCount = questionIds.filter(questionId => {
                const userAnswer = revision.userAnswers[questionId];
                const correctAnswer = revision.correctAnswers[questionId];
                return userAnswer === correctAnswer;
              }).length;
              
              // Method 1 successful
            }
            // Method 2: Check questions array
            else if (revision.questions && Array.isArray(revision.questions)) {
              totalQuestions = revision.questions.length;
              correctCount = revision.questions.filter(q => {
                return q.isCorrect === true || 
                       q.correct === true ||
                       q.is_correct === true ||
                       q.status === 'correct' ||
                       (q.userAnswer && q.correctAnswer && q.userAnswer === q.correctAnswer) ||
                       (q.selectedAnswer && q.correctAnswer && q.selectedAnswer === q.correctAnswer) ||
                       (q.answer && q.correctAnswer && q.answer === q.correctAnswer);
              }).length;
              // Method 2 successful
            }
            
            // Method 3: Use direct properties if available
            if (revision.correctCount !== undefined && revision.correctCount !== null) {
              correctCount = parseInt(revision.correctCount) || correctCount;
              // Method 3 successful
            }
            if (revision.correct_count !== undefined && revision.correct_count !== null) {
              correctCount = parseInt(revision.correct_count) || correctCount;
              // Method 3 successful
            }
            if (revision.totalQuestions !== undefined && revision.totalQuestions !== null) {
              totalQuestions = parseInt(revision.totalQuestions) || totalQuestions;
            }
            if (revision.total_questions !== undefined && revision.total_questions !== null) {
              totalQuestions = parseInt(revision.total_questions) || totalQuestions;
            }

            // Method 4: Calculate from score/percentage if we have it
            if (correctCount === 0 && totalQuestions > 0) {
              if (revision.percentage !== undefined && revision.percentage !== null && revision.percentage > 0) {
                correctCount = Math.round((revision.percentage / 100) * totalQuestions);
                // Method 4: Calculated from percentage
              } else if (revision.score !== undefined && revision.score !== null && revision.score > 0) {
                correctCount = Math.round((revision.score / 100) * totalQuestions);
                // Method 4: Calculated from score
              }
            }

            // Ensure valid numbers
            if (totalQuestions === 0) totalQuestions = 1;
            if (correctCount > totalQuestions) correctCount = totalQuestions;

            const percentage = calculatePercentage(correctCount, totalQuestions);
            
            console.log("📝 FINAL Revision session stats:", { 
              correctCount, 
              totalQuestions, 
              percentage 
            });
            
            sessionData.push({
              id: revision.sessionId || `local-rev-${Date.now()}`,
              type: "REVISION",
              title: revision.title || "Revision Session",
              date: revision.submittedAt || revision.completedAt || new Date().toISOString(),
              score: percentage,
              percentage: percentage,
              totalQuestions: totalQuestions,
              correctAnswers: correctCount,
              timeSpent: (() => {
                // Handle different time formats
                if (revision.timeSpent !== undefined && revision.timeSpent !== null) {
                  const time = parseInt(revision.timeSpent);
                  // If time is very large, it's probably in milliseconds
                  return time > 36000 ? Math.round(time / 1000) : time;
                }
                if (revision.time_spent !== undefined && revision.time_spent !== null) {
                  const time = parseInt(revision.time_spent);
                  return time > 36000 ? Math.round(time / 1000) : time;
                }
                return 0;
              })(),
              subject: revision.subject?.name || revision.subject || "General",
              submittedAt: revision.submittedAt || revision.completedAt || new Date().toISOString(),
              source: 'local'
            });
          }
        } catch (e) {
          console.error("❌ Error parsing revision data:", e);
        }
      }

      // 2. Check quizResults - FIXED: Similar logic for quiz data
      const savedQuiz = localStorage.getItem('quizResults');
      if (savedQuiz) {
        try {
          const quiz = JSON.parse(savedQuiz);
          console.log("📁 RAW quizResults data:", quiz);
          
          if (quiz) {
            let correctAnswers = 0;
            let totalQuestions = 0;

            // Try multiple methods to get correct data
            
            // Method 1: Check for userAnswers vs correctAnswers comparison
            if (quiz.userAnswers && quiz.correctAnswers && typeof quiz.userAnswers === 'object' && typeof quiz.correctAnswers === 'object') {
              const questionIds = Object.keys(quiz.userAnswers);
              totalQuestions = questionIds.length;
              
              correctAnswers = questionIds.filter(questionId => {
                const userAnswer = quiz.userAnswers[questionId];
                const correctAnswer = quiz.correctAnswers[questionId];
                return userAnswer === correctAnswer;
              }).length;
              // Quiz Method 1 successful
            }
            // Method 2: Check questions array
            else if (quiz.questions && Array.isArray(quiz.questions)) {
              totalQuestions = quiz.questions.length;
              correctAnswers = quiz.questions.filter(q => 
                q.isCorrect === true || 
                q.correct === true ||
                q.is_correct === true ||
                q.status === 'correct' ||
                (q.userAnswer && q.correctAnswer && q.userAnswer === q.correctAnswer)
              ).length;
              // Quiz Method 2 successful
            }
            
            // Method 3: Use direct properties
            if (quiz.correctAnswers !== undefined && typeof quiz.correctAnswers === 'number') {
              correctAnswers = parseInt(quiz.correctAnswers) || correctAnswers;
              // Quiz Method 3 successful
            }
            if (quiz.correct_count !== undefined && quiz.correct_count !== null) {
              correctAnswers = parseInt(quiz.correct_count) || correctAnswers;
              // Quiz Method 3 successful
            }
            if (quiz.totalQuestions !== undefined && quiz.totalQuestions !== null) {
              totalQuestions = parseInt(quiz.totalQuestions) || totalQuestions;
            }
            if (quiz.total_questions !== undefined && quiz.total_questions !== null) {
              totalQuestions = parseInt(quiz.total_questions) || totalQuestions;
            }

            // Method 4: Calculate from score/percentage
            if (correctAnswers === 0 && totalQuestions > 0) {
              if (quiz.percentage !== undefined && quiz.percentage !== null && quiz.percentage > 0) {
                correctAnswers = Math.round((quiz.percentage / 100) * totalQuestions);
                // Quiz Method 4: Calculated from percentage
              } else if (quiz.score !== undefined && quiz.score !== null && quiz.score > 0) {
                correctAnswers = Math.round((quiz.score / 100) * totalQuestions);
                // Quiz Method 4: Calculated from score
              }
            }

            if (totalQuestions === 0) totalQuestions = 1;
            if (correctAnswers > totalQuestions) correctAnswers = totalQuestions;

            const percentage = calculatePercentage(correctAnswers, totalQuestions);
            
            sessionData.push({
              id: quiz.quizId || `quiz-${Date.now()}`,
              type: "QUIZ",
              title: quiz.quizTitle || "Quiz Session",
              date: quiz.completedAt || new Date().toISOString(),
              score: percentage,
              percentage: percentage,
              totalQuestions: totalQuestions,
              correctAnswers: correctAnswers,
              timeSpent: (() => {
                if (quiz.timeSpent !== undefined && quiz.timeSpent !== null) {
                  const time = parseInt(quiz.timeSpent);
                  return time > 36000 ? Math.round(time / 1000) : time;
                }
                if (quiz.time_spent !== undefined && quiz.time_spent !== null) {
                  const time = parseInt(quiz.time_spent);
                  return time > 36000 ? Math.round(time / 1000) : time;
                }
                return 0;
              })(),
              subject: quiz.subject || "General",
              submittedAt: quiz.completedAt || new Date().toISOString(),
              source: 'local'
            });
          }
        } catch (e) {
          console.error("❌ Error parsing quiz data:", e);
        }
      }

      // 3. Check completed sessions
      const completedSessions = localStorage.getItem('completedSessions');
      if (completedSessions) {
        try {
          const sessions = JSON.parse(completedSessions);
          if (Array.isArray(sessions)) {
            sessions.forEach(session => {
              if (session && session.id) {
                const percentage = calculatePercentage(
                  session.correctAnswers, 
                  session.totalQuestions
                );
                sessionData.push({
                  ...session,
                  percentage: percentage,
                  source: 'local-stored'
                });
              }
            });
          }
        } catch (e) {
          console.error("❌ Error parsing completed sessions:", e);
        }
      }

    } catch (storageError) {
      console.error("❌ Storage Error:", storageError);
    }
    
    console.log("🎯 Final session data from storage:", sessionData);
    return sessionData;
  };

  // Fetch all sessions
  const fetchAllSessions = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const allSessions = [];
      const localSessions = getSessionDataFromStorage();
      
      // Fetch ALL sessions from API (not just 4)
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const currentMonth = formatMonthForAPI(filterMonth);
          let apiUrl = "http://mrbe.codovio.com/api/v1/revision/sessions";
          
          const params = new URLSearchParams();
          params.append('page', '1');
          params.append('limit', '100'); // Fetch more sessions to get all
          
          if (currentMonth) {
            params.append('month', currentMonth);
          }

          apiUrl += `?${params.toString()}`;

          console.log("🌐 Fetching from API:", apiUrl);
          const response = await axios.get(apiUrl, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log("📡 API Response:", response.data);

          if (response.data?.status === "success") {
            if (response.data.pagination) {
              setPagination({
                page: response.data.pagination.page || 1,
                limit: 4,
                total: response.data.pagination.total || 0,
                totalPages: response.data.pagination.total_pages || 0
              });
            }

            if (Array.isArray(response.data.data) && response.data.data.length > 0) {
              const apiSessionsData = response.data.data.map(session => {
                console.log('🔍 Raw API session:', session);
                
                // Extract total questions
                let totalQuestions = 
                  parseInt(session.total_questions) || 
                  parseInt(session.totalQuestions) || 
                  1;
                
                // Extract correct count - API uses 'score' field as the number of correct answers
                let correctCount = 0;
                
                // First try: score field (which is the correct count in this API)
                if (session.score !== undefined && session.score !== null) {
                  correctCount = Math.round(parseFloat(session.score));
                  // Using API score as correct count
                } else if (session.correct_count !== undefined && session.correct_count !== null) {
                  correctCount = parseInt(session.correct_count);
                } else if (session.correctAnswers !== undefined && session.correctAnswers !== null) {
                  correctCount = parseInt(session.correctAnswers);
                } else if (session.correct_answers !== undefined && session.correct_answers !== null) {
                  correctCount = parseInt(session.correct_answers);
                }
                
                // Get percentage - API provides it directly
                let percentage = 0;
                if (session.percentage !== undefined && session.percentage !== null) {
                  percentage = Math.round(parseFloat(session.percentage));
                  // Using API percentage
                } else {
                  percentage = calculatePercentage(correctCount, totalQuestions);
                  // Calculated percentage
                }
                
                // API Session processed
                
                return {
                  id: session.session_id || session.id || `api-${Date.now()}`,
                  type: session.type || "REVISION",
                  title: session.title || "Revision Session",
                  date: session.submitted_at || session.created_at || new Date().toISOString(),
                  score: percentage,
                  percentage: percentage,
                  totalQuestions: totalQuestions,
                  correctAnswers: correctCount,
                  timeSpent: (() => {
                    let time = 0;
                    
                    // First try: direct time_spent field
                    if (session.time_spent !== undefined && session.time_spent !== null) {
                      time = parseInt(session.time_spent);
                      console.log('⏱️ Found time_spent:', session.time_spent);
                    } else if (session.timeSpent !== undefined && session.timeSpent !== null) {
                      time = parseInt(session.timeSpent);
                      console.log('⏱️ Found timeSpent:', session.timeSpent);
                    } 
                    // Calculate from start_at and submitted_at if available
                    else if (session.start_at && session.submitted_at) {
                      try {
                        const startTime = new Date(session.start_at).getTime();
                        const endTime = new Date(session.submitted_at).getTime();
                        time = Math.round((endTime - startTime) / 1000); // Convert to seconds
                        console.log('⏱️ Calculated time from timestamps:', time, 'seconds');
                      } catch (e) {
                        console.log('⚠️ Error calculating time from timestamps:', e);
                        time = 0;
                      }
                    } else {
                      console.log('⚠️ No time information available');
                    }
                    
                    // Ensure time is non-negative and reasonable
                    return Math.max(0, time);
                  })(),
                  subject: session.subject || session.category || "General",
                  submittedAt: session.submitted_at || session.created_at || new Date().toISOString(),
                  source: 'api'
                };
              });
              
              allSessions.push(...apiSessionsData);
            }
          }
        }
      } catch (apiError) {
        console.error("❌ API Error:", apiError);
      }
      
      // Always include local sessions (but avoid duplicates with API)
      allSessions.push(...localSessions);
      
      // Remove duplicates by session_id (prefer API data over local)
      const sessionMap = new Map();
      
      // Add API sessions first (they have more complete data)
      allSessions.forEach(session => {
        if (session.source === 'api') {
          sessionMap.set(session.id, session);
        }
      });
      
      // Add local sessions only if not already in map
      allSessions.forEach(session => {
        if (session.source === 'local' && !sessionMap.has(session.id)) {
          sessionMap.set(session.id, session);
        }
      });
      
      const uniqueSessions = Array.from(sessionMap.values());
      uniqueSessions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      
      console.log("🎯 Final sessions to display:", uniqueSessions.length, "sessions");
      setSessions(uniqueSessions);
      
      // Don't set pagination here - it's calculated client-side from filtered sessions
      
      if (uniqueSessions.length === 0 && page === 1) {
        setError("No sessions found. Complete a session to see your history here.");
      }
      
    } catch (error) {
      console.error("❌ Error fetching sessions:", error);
      setError("Failed to load session history. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle page change - CLIENT SIDE ONLY
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalFilteredPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  // Handle view details
  const handleViewDetails = (session) => {
    console.log("📋 View details for session:", session);
    if (onViewSessionDetails) {
      onViewSessionDetails(session.id, session);
    }
  };

  // Initial load only
  useEffect(() => {
    fetchAllSessions(1);
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [filterMonth, filterType]);

  // Time formatting
  const formatTimeSpent = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const totalSeconds = Math.round(Number(seconds));
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate statistics
  const calculateTotalTimeSpent = () => {
    return sessions.reduce((total, session) => {
      return total + (parseInt(session.timeSpent) || 0);
    }, 0);
  };

  const calculateTotalQuestions = () => {
    return sessions.reduce((total, session) => {
      return total + (parseInt(session.totalQuestions) || 0);
    }, 0);
  };

  const calculateTotalCorrect = () => {
    return sessions.reduce((total, session) => {
      return total + (parseInt(session.correctAnswers) || 0);
    }, 0);
  };

  const calculateAverageScore = () => {
    if (sessions.length === 0) return 0;
    const totalPercentage = sessions.reduce((sum, session) => {
      return sum + (parseFloat(session.percentage) || 0);
    }, 0);
    return Math.round(totalPercentage / sessions.length);
  };

  // Date formatting
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "COMPLETED: RECENTLY";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "COMPLETED: RECENTLY";
      const day = date.getDate();
      const suffix = day % 10 === 1 && day !== 11 ? 'ST' : 
                   day % 10 === 2 && day !== 12 ? 'ND' : 
                   day % 10 === 3 && day !== 13 ? 'RD' : 'TH';
      const month = date.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
      const year = date.getFullYear();
      return `COMPLETED: ${day}${suffix} ${month} ${year}`;
    } catch {
      return "COMPLETED: RECENTLY";
    }
  };

  // Session type functions
  const getSessionType = (type) => {
    switch(type) {
      case 'REVISION': return 'Revision Session';
      case 'PRACTICE': return 'Practice Test';
      case 'QUIZ': return 'Quiz Session';
      default: return 'Session';
    }
  };

  const getSessionTypeColor = (type) => {
    switch(type) {
      case 'REVISION': return 'bg-purple-100 text-purple-800';
      case 'PRACTICE': return 'bg-green-100 text-green-800';
      case 'QUIZ': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const months = [
    "ALL TIME", "OCTOBER 2025", "SEPTEMBER 2025", "AUGUST 2025", 
    "JULY 2025", "JUNE 2025", "MAY 2025", "APRIL 2025", 
    "MARCH 2025", "FEBRUARY 2025", "JANUARY 2025", "DECEMBER 2024"
  ];

  const sessionTypes = [
    { id: 'ALL', name: 'All Sessions' },
    { id: 'REVISION', name: 'Revision Sessions' },
    { id: 'PRACTICE', name: 'Practice Tests' },
    { id: 'QUIZ', name: 'Quiz Sessions' }
  ];

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    if (filterType !== "ALL" && session.type !== filterType) return false;
    if (filterMonth !== "ALL TIME") {
      try {
        const sessionDate = new Date(session.submittedAt);
        const sessionMonth = sessionDate.toLocaleDateString('en-US', { 
          month: 'long', 
          year: 'numeric' 
        }).toUpperCase();
        return sessionMonth === filterMonth;
      } catch {
        return false;
      }
    }
    return true;
  });

  // Pagination
  const sessionsPerPage = 4;
  const startIndex = (pagination.page - 1) * sessionsPerPage;
  const endIndex = startIndex + sessionsPerPage;
  const paginatedSessions = filteredSessions.slice(startIndex, endIndex);
  const totalFilteredPages = Math.ceil(filteredSessions.length / sessionsPerPage);

  // Statistics - Use FILTERED sessions for accurate stats
  const totalSessions = filteredSessions.length;
  const totalQuestions = filteredSessions.reduce((total, session) => {
    return total + (parseInt(session.totalQuestions) || 0);
  }, 0);
  const totalCorrect = filteredSessions.reduce((total, session) => {
    return total + (parseInt(session.correctAnswers) || 0);
  }, 0);
  const totalTimeSpent = filteredSessions.reduce((total, session) => {
    return total + (parseInt(session.timeSpent) || 0);
  }, 0);
  const averageScore = filteredSessions.length === 0 ? 0 : Math.round(
    filteredSessions.reduce((sum, session) => sum + (parseFloat(session.percentage) || 0), 0) / filteredSessions.length
  );
  const accuracyPercentage = totalQuestions > 0 
    ? Math.round((totalCorrect / totalQuestions) * 100) 
    : 0;

  // Pagination generation
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const currentPage = pagination.page;
    const totalPages = totalFilteredPages;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  const shouldShowPagination = totalFilteredPages > 1;

  // Toggle filter panel
  const toggleFilterPanel = () => {
    setShowFilters(!showFilters);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={onBack}
            className="mb-6 px-6 py-3 bg-white hover:bg-gray-50 border border-blue-200 transition-colors flex items-center gap-2 text-blue-700 font-medium rounded-lg shadow-sm"
          >
            <FaArrowLeft />
            Back to Dashboard
          </button>
          
          <div className="text-center py-20">
            <div className="animate-spin h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-blue-700 font-medium">Loading your session history...</p>
          </div>
        </div>
      </div>
    );
  }

  const MedicalPattern = () => (
    <div className="absolute inset-0 opacity-5 pointer-events-none">
      <div className="absolute top-10 left-10 w-20 h-20 border-2 border-blue-400"></div>
      <div className="absolute top-40 right-20 w-16 h-16 border-2 border-blue-400 rotate-45"></div>
      <div className="absolute bottom-20 left-32 w-24 h-24 border-2 border-blue-400 rounded-full"></div>
      <div className="absolute bottom-40 right-40 w-12 h-12 border-2 border-blue-400"></div>
      <div className="absolute top-60 left-60 w-28 h-28 border-2 border-blue-400 rotate-12"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6 relative overflow-hidden">
      <MedicalPattern />
      <div className="max-w-7xl mx-auto relative w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-start mb-4">
            <button
              onClick={onBack}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-white/80 backdrop-blur-sm hover:bg-white border border-blue-200 transition-all duration-300 flex items-center gap-2 text-blue-700 font-medium shadow-sm rounded-lg"
            >
              <FaArrowLeft className="hidden sm:block" />
              <span className="text-sm sm:text-base">Back to Dashboard</span>
            </button>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Session History</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track your learning progress and performance
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Total Sessions</h3>
            <p className="text-2xl font-bold text-gray-900">{totalSessions}</p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Questions Answered</h3>
            <p className="text-2xl font-bold text-gray-900">{totalQuestions}</p>
            <p className="text-xs text-gray-500 mt-1">
              {totalCorrect} correct ({accuracyPercentage}%)
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Average Score</h3>
            <p className="text-2xl font-bold text-gray-900">{averageScore}%</p>
            <p className="text-xs text-gray-500 mt-1">Across all sessions</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Total Time Spent</h3>
            <p className="text-2xl font-bold text-gray-900">{formatTimeSpent(totalTimeSpent)}</p>
            <p className="text-xs text-gray-500 mt-1">Learning time</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Sessions</h2>
              
              {/* Type Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">SESSION TYPE</h3>
                <div className="space-y-2">
                  {sessionTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setFilterType(type.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        filterType === type.id
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Month Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">TIME PERIOD</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {months.map(month => (
                    <button
                      key={month}
                      onClick={() => setFilterMonth(month)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        filterMonth === month
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sessions List */}
          <div className="lg:col-span-3">
            {error && filteredSessions.length === 0 && (
              <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FaTimesCircle className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {paginatedSessions.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <FaChartBar className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mt-3 text-lg font-medium text-gray-900">No sessions found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filterType !== "ALL" || filterMonth !== "ALL TIME"
                    ? "Try adjusting your filters or complete a new session."
                    : "Complete your first session to see it here!"}
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setFilterType("ALL");
                      setFilterMonth("ALL TIME");
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {filterType === "ALL" ? "All Sessions" : `${getSessionType(filterType)}s`}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Showing {startIndex + 1}-{Math.min(endIndex, filteredSessions.length)} of {filteredSessions.length} sessions
                      {shouldShowPagination && ` • Page ${pagination.page} of ${totalFilteredPages}`}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {paginatedSessions.map((session, index) => {
                      console.log('Session data:', { id: session.id, timeSpent: session.timeSpent, subject: session.subject, title: session.title });
                      const displayTime = formatTimeSpent(session.timeSpent);
                      
                      return (
                        <div key={`${session.id}-${index}`} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                          <div className="p-6">
                            {/* Header Row */}
                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getSessionTypeColor(session.type)}`}>
                                    {getSessionType(session.type)}
                                  </span>
                                  <span className="text-sm text-gray-500 whitespace-nowrap">
                                    {formatDisplayDate(session.submittedAt)}
                                  </span>
                                  {session.source === 'local' && (
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded whitespace-nowrap">
                                      Local
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 truncate">
                                  {session.subject && session.subject !== "General" ? session.subject : (session.title || getSessionType(session.type))}
                                </h3>
                              </div>
                              
                              {/* Score Section */}
                              <div className="flex flex-col items-end gap-2 min-w-[120px]">
                                <div className="flex items-center gap-3">
                                  <div className={`h-4 w-4 rounded-full flex-shrink-0 ${
                                    session.percentage >= 70 ? 'bg-green-500' : 
                                    session.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}></div>
                                  <span className="text-2xl font-bold text-gray-900 whitespace-nowrap">
                                    {session.percentage}%
                                  </span>
                                </div>
                                <div className="text-sm text-gray-500 text-right whitespace-nowrap">
                                  {session.correctAnswers} of {session.totalQuestions} correct
                                </div>
                              </div>
                            </div>
                            
                            {/* Stats Row - Only Time Display */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
                              <div className="flex items-center gap-3 flex-1">
                                <FaClock className="text-gray-400 flex-shrink-0" />
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500">Time:</span>
                                  <span className="text-sm font-medium text-gray-900">
                                    {displayTime}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Footer */}
                          <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
                            <button
                              onClick={() => handleViewDetails(session)}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              View Details →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pagination */}
                {shouldShowPagination && (
                  <div className="mt-8 flex justify-center items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className={`px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium transition-colors ${
                        pagination.page === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      <FaChevronLeft className="h-4 w-4" />
                    </button>

                    {generatePageNumbers().map(pageNum => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          pageNum === pagination.page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === totalFilteredPages}
                      className={`px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium transition-colors ${
                        pagination.page === totalFilteredPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      <FaChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionHistory;