// SingleSessionHistory.jsx
import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaClock, FaCheckCircle, FaTimesCircle, FaChartBar, FaBook, FaCalendarAlt, FaFilter, FaChevronDown, FaChevronUp, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import axios from "axios";

const SingleSessionHistory = ({ sessionId, onBack }) => {
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, correct, incorrect
  const [category, setCategory] = useState("all"); // all or specific category
  const [expandedExplanations, setExpandedExplanations] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Toggle explanation expansion
  const toggleExplanation = (questionId) => {
    setExpandedExplanations(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // Truncate text to one line
  const truncateText = (text, maxLength = 150) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Fetch session details from API
  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("No authentication token found");
      }

      const apiUrl = `http://mrbe.codovio.com/api/v1/revision/session-history/${sessionId}`;

      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("Session Details API Response:", response.data);

      if (response.data?.status === "success") {
        setSessionData(response.data);
        
        // Initialize expanded explanations state
        if (response.data.history && Array.isArray(response.data.history)) {
          const initialExpandedState = {};
          response.data.history.forEach((question, index) => {
            initialExpandedState[question.question_id || index] = false;
          });
          setExpandedExplanations(initialExpandedState);
        }
      } else {
        throw new Error("Failed to load session details");
      }
      
    } catch (error) {
      console.error("Session Details API Error:", error);
      setError(error.response?.data?.message || "Failed to load session details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchSessionDetails();
      setCurrentQuestionIndex(0); // Reset to first question when session changes
    }
  }, [sessionId, filter, category]);

  // Navigation functions
  const goToNextQuestion = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  // Format date for display
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return "N/A";
    }
  };

  // Calculate correct and incorrect counts from history data
  const calculateStats = () => {
    if (!sessionData?.history || !Array.isArray(sessionData.history)) {
      return { correct: 0, incorrect: 0, total: parseInt(sessionData?.total_questions) || 0 };
    }
    
    const history = sessionData.history;
    const correct = history.filter(q => q.is_correct === true).length;
    const incorrect = history.filter(q => q.is_correct === false).length;
    const total = history.length;
    
    return { correct, incorrect, total };
  };

  // Get unique categories from history data
  const getCategories = () => {
    if (!sessionData?.history || !Array.isArray(sessionData.history)) return [];
    
    const categories = sessionData.history
      .map(q => q.category || q.subject || "Uncategorized")
      .filter((category, index, self) => self.indexOf(category) === index);
    
    return categories;
  };

  // Filter questions based on selected filter and category
  const getFilteredQuestions = () => {
    if (!sessionData?.history || !Array.isArray(sessionData.history)) return [];
    
    let filtered = sessionData.history;
    
    // Apply correctness filter
    if (filter === "correct") {
      filtered = filtered.filter(q => q.is_correct === true);
    } else if (filter === "incorrect") {
      filtered = filtered.filter(q => q.is_correct === false);
    }
    
    // Apply category filter
    if (category !== "all") {
      filtered = filtered.filter(q => 
        (q.category || q.subject || "Uncategorized") === category
      );
    }
    
    return filtered;
  };

  // Get question content - FIXED: Uses 'question' field from API
  const getQuestionContent = (question) => {
    return question.question || "Question content not available";
  };

  // Get explanation
  const getExplanation = (question) => {
    return question.explanation || "No explanation available";
  };

  // Format options for display
  const renderOptions = (question) => {
    if (!question.options || !Array.isArray(question.options)) return null;
    
    return (
      <div className="mt-3">
        <p className="text-sm font-medium text-gray-700 mb-2">Options:</p>
        <div className="space-y-2">
          {question.options.map((option, optIndex) => (
            <div 
              key={optIndex}
              className={`p-2 rounded-lg border ${
                option === question.correct_answer
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : option === question.selected_option && !question.is_correct
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {String.fromCharCode(65 + optIndex)}. {option}
                </span>
                {option === question.correct_answer && (
                  <FaCheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                )}
                {option === question.selected_option && !question.is_correct && (
                  <FaTimesCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const stats = calculateStats();
  const categories = getCategories();
  const filteredQuestions = getFilteredQuestions();

  // Get current question
  const currentQuestion = filteredQuestions[currentQuestionIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={onBack}
            className="mb-6 px-6 py-3 bg-white hover:bg-gray-50 border border-blue-200 transition-colors flex items-center gap-2 text-blue-700 font-medium rounded-lg shadow-sm"
          >
            <FaArrowLeft />
            Back to Session History
          </button>
          
          <div className="text-center py-20">
            <div className="animate-spin h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-blue-700 font-medium">Loading session details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={onBack}
            className="mb-6 px-6 py-3 bg-white hover:bg-gray-50 border border-blue-200 transition-colors flex items-center gap-2 text-blue-700 font-medium rounded-lg shadow-sm"
          >
            <FaArrowLeft />
            Back to Session History
          </button>
          
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaTimesCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
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
        <div className="flex justify-start mb-6">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-white hover:bg-gray-50 border border-blue-200 transition-colors flex items-center gap-2 text-blue-700 font-medium rounded-lg shadow-sm"
          >
            <FaArrowLeft />
            Back to Session History
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              
              {/* Session Overview */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Question Session</h1>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">QUESTIONS ANSWERED:</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700">FINAL SCORE:</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {sessionData?.percentage || "0"}%
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-500" />
                      <span className="text-lg font-bold text-gray-900">{stats.correct}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaTimesCircle className="text-red-500" />
                      <span className="text-lg font-bold text-gray-900">{stats.incorrect}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Questions</h2>
                
                {/* Marked Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">MARKED</h3>
                  <div className="flex flex-wrap gap-2">
                    {["all", "correct", "incorrect"].map((filterType) => (
                      <button
                        key={filterType}
                        onClick={() => {
                          setFilter(filterType);
                          setCurrentQuestionIndex(0); // Reset to first question when filter changes
                        }}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          filter === filterType
                            ? "bg-blue-100 text-blue-700 border border-blue-300"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300"
                        }`}
                      >
                        {filterType.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">CATEGORY</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    <button
                      onClick={() => {
                        setCategory("all");
                        setCurrentQuestionIndex(0); // Reset to first question when category changes
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        category === "all"
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      ALL
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setCategory(cat);
                          setCurrentQuestionIndex(0); // Reset to first question when category changes
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          category === cat
                            ? "bg-blue-100 text-blue-700 font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {cat.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Single Question View */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Revision Session</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    DATE COMPLETED: {formatDisplayDate(sessionData?.submitted_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    Question {currentQuestionIndex + 1} of {filteredQuestions.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Single Question Display */}
            {filteredQuestions.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <FaBook className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mt-3 text-lg font-medium text-gray-900">No questions found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your filters to see more questions.
                </p>
              </div>
            ) : currentQuestion ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {currentQuestion.is_correct ? (
                        <FaCheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <FaTimesCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                      )}
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        currentQuestion.is_correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {currentQuestion.is_correct ? 'CORRECT' : 'INCORRECT'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {currentQuestion.category || "Uncategorized"}
                      </span>
                      {currentQuestion.subcategory && (
                        <span className="text-xs text-gray-400 block mt-1">
                          {currentQuestion.subcategory}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Question Content */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {getQuestionContent(currentQuestion)}
                    </h3>
                    
                    {/* Render Options */}
                    {renderOptions(currentQuestion)}
                  </div>

                  {/* User Answer vs Correct Answer */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className={`p-3 rounded-lg border ${
                      currentQuestion.is_correct 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <p className="text-sm font-medium text-gray-700 mb-1">Your Answer</p>
                      <p className={`font-medium ${
                        currentQuestion.is_correct ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {currentQuestion.selected_option || "Not answered"}
                      </p>
                    </div>
                    
                    {!currentQuestion.is_correct && currentQuestion.correct_answer && (
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <p className="text-sm font-medium text-gray-700 mb-1">Correct Answer</p>
                        <p className="font-medium text-blue-700">{currentQuestion.correct_answer}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Expandable Explanation */}
                  {currentQuestion.explanation && currentQuestion.explanation !== "No explanation available" && (
                    <div className="mt-4">
                      <button
                        onClick={() => toggleExplanation(currentQuestion.question_id || currentQuestionIndex)}
                        className="flex items-start justify-between w-full p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
                      >
                        <div className="flex-1">
                          <span className="text-sm font-medium text-blue-700 block mb-1">
                            Explanation:
                          </span>
                          <span className="text-sm text-blue-600">
                            {expandedExplanations[currentQuestion.question_id || currentQuestionIndex] 
                              ? currentQuestion.explanation 
                              : truncateText(currentQuestion.explanation)}
                          </span>
                        </div>
                        {expandedExplanations[currentQuestion.question_id || currentQuestionIndex] ? (
                          <FaChevronUp className="h-4 w-4 text-blue-500 flex-shrink-0 ml-3 mt-1" />
                        ) : (
                          <FaChevronDown className="h-4 w-4 text-blue-500 flex-shrink-0 ml-3 mt-1" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Navigation Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={goToPrevQuestion}
                      disabled={currentQuestionIndex === 0}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentQuestionIndex === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <FaChevronLeft className="h-4 w-4" />
                      Previous
                    </button>

                    {/* Question Progress Dots */}
                    <div className="flex items-center gap-1">
                      {filteredQuestions.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToQuestion(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === currentQuestionIndex
                              ? 'bg-blue-600'
                              : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                          title={`Go to question ${index + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={goToNextQuestion}
                      disabled={currentQuestionIndex === filteredQuestions.length - 1}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentQuestionIndex === filteredQuestions.length - 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      Next
                      <FaChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleSessionHistory;