import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiAward, FiClock, FiCheck, FiX, FiBarChart2, FiChevronDown, FiChevronUp } from "react-icons/fi";

const McqResultPage = ({ resultData, onBack, onRetry }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedQuestions, setExpandedQuestions] = useState({});

  const fallback = location.state || {};
  const data = resultData || fallback.mcqResultData || fallback;
  const subject = data?.subject || null;
  const userAnswers = data?.userAnswers || data?.answers || {};
  const mcqs = data?.mcqs || data?.questions || [];
  const timeUp = data?.timeUp || false;

  const toggleQuestion = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  if (!subject || !userAnswers || !mcqs.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiX className="text-2xl text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Result Available</h2>
          <p className="text-gray-600 mb-6">Please complete a quiz to see results.</p>
          <button
            onClick={() => (onBack ? onBack() : navigate("/dashboard"))}
            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const correctAnswers = {};
  mcqs.forEach((q) => {
    correctAnswers[q.id] = q.correctOption ?? 0;
  });

  const totalQuestions = mcqs.length;
  let correctCount = 0;
  let attemptedCount = 0;

  mcqs.forEach((q) => {
    if (userAnswers[q.id] !== null && userAnswers[q.id] !== undefined) {
      attemptedCount++;
      if (userAnswers[q.id] === correctAnswers[q.id]) correctCount++;
    }
  });

  const percentage = ((correctCount / totalQuestions) * 100).toFixed(1);
  const score = correctCount;
  const maxScore = totalQuestions;

  const getGrade = () => {
    if (percentage >= 90) return { grade: "A+", color: "text-green-600", bg: "bg-green-100" };
    if (percentage >= 80) return { grade: "A", color: "text-green-600", bg: "bg-green-100" };
    if (percentage >= 70) return { grade: "B", color: "text-blue-600", bg: "bg-blue-100" };
    if (percentage >= 60) return { grade: "C", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { grade: "D", color: "text-red-600", bg: "bg-red-100" };
  };

  const gradeInfo = getGrade();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-6">
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        {/* Compact Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="text-center sm:text-left w-full sm:w-auto">
              <div className="flex items-center justify-center sm:justify-start space-x-3 mb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <FiAward className="text-lg sm:text-xl text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate">Quiz Results</h1>
                  <p className="text-gray-600 text-xs sm:text-sm truncate">{subject.name}</p>
                </div>
              </div>
            </div>
            
            {timeUp && (
              <div className="inline-flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs">
                <FiClock size={12} />
                <span>Time's Up</span>
              </div>
            )}
          </div>
        </div>

        {/* Compact Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl p-3 sm:p-4 text-white text-center shadow">
            <div className="text-xl sm:text-2xl font-bold">{percentage}%</div>
            <div className="text-blue-100 text-xs">Score</div>
          </div>
          
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 text-center shadow border border-gray-200">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{correctCount}</div>
            <div className="text-gray-600 text-xs">Correct</div>
          </div>
          
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 text-center shadow border border-gray-200">
            <div className="text-xl sm:text-2xl font-bold text-gray-800">{attemptedCount}/{totalQuestions}</div>
            <div className="text-gray-600 text-xs">Attempted</div>
          </div>
          
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 text-center shadow border border-gray-200">
            <div className={`text-xl sm:text-2xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</div>
            <div className="text-gray-600 text-xs">Grade</div>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
            <div>
              <div className="text-xs sm:text-sm text-gray-600">Total Questions</div>
              <div className="text-base sm:text-lg font-bold text-gray-800">{totalQuestions}</div>
            </div>
            <div>
              <div className="text-xs sm:text-sm text-gray-600">Wrong Answers</div>
              <div className="text-base sm:text-lg font-bold text-red-600">{attemptedCount - correctCount}</div>
            </div>
            <div>
              <div className="text-xs sm:text-sm text-gray-600">Not Attempted</div>
              <div className="text-base sm:text-lg font-bold text-orange-600">{totalQuestions - attemptedCount}</div>
            </div>
            <div>
              <div className="text-xs sm:text-sm text-gray-600">Accuracy</div>
              <div className="text-base sm:text-lg font-bold text-blue-600">
                {attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Questions Review - Improved for mobile */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-800">Question Review</h3>
            <span className="text-xs sm:text-sm text-gray-600">
              {Object.values(expandedQuestions).filter(Boolean).length} expanded
            </span>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            {mcqs.map((q) => {
              const userIndex = userAnswers[q.id];
              const correctIndex = correctAnswers[q.id];
              const isAttempted = userIndex !== null && userAnswers[q.id] !== undefined;
              const isCorrect = userIndex === correctIndex;
              const isExpanded = expandedQuestions[q.id];
              
              return (
                <div key={q.id} className="border border-gray-200 rounded-lg sm:rounded-xl overflow-hidden">
                  {/* Question Header - Always Visible */}
                  <button
                    onClick={() => toggleQuestion(q.id)}
                    className="w-full p-3 sm:p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0 ${
                          !isAttempted 
                            ? 'bg-gray-300 text-gray-700' 
                            : isCorrect 
                            ? 'bg-green-500 text-white' 
                            : 'bg-red-500 text-white'
                        }`}>
                          {q.id}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-medium text-gray-800 text-sm sm:text-base line-clamp-1 block">
                            {q.question}
                          </span>
                          <div className="flex items-center space-x-1 sm:space-x-2 mt-1 flex-wrap">
                            <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                              !isAttempted 
                                ? 'bg-gray-100 text-gray-600' 
                                : isCorrect 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-red-100 text-red-600'
                            }`}>
                              {!isAttempted ? 'Not Attempted' : isCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                            {isAttempted && (
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                Your choice: {String.fromCharCode(65 + userIndex)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        {isExpanded ? <FiChevronUp className="text-gray-400" size={18} /> : <FiChevronDown className="text-gray-400" size={18} />}
                      </div>
                    </div>
                  </button>

                  {/* Collapsible Content */}
                  {isExpanded && (
                    <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-200">
                      <div className="space-y-2">
                        {q.options.map((opt, idx) => (
                          <div
                            key={idx}
                            className={`p-2 sm:p-3 rounded-lg text-xs sm:text-sm ${
                              idx === correctIndex
                                ? 'bg-green-50 text-green-800 border border-green-200'
                                : idx === userIndex && idx !== correctIndex
                                ? 'bg-red-50 text-red-800 border border-red-200'
                                : 'bg-white text-gray-700 border border-gray-200'
                            }`}
                          >
                            <div className="flex items-center">
                              <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center mr-2 text-xs font-medium flex-shrink-0 ${
                                idx === correctIndex
                                  ? 'bg-green-500 text-white'
                                  : idx === userIndex && idx !== correctIndex
                                  ? 'bg-red-500 text-white'
                                  : 'bg-gray-300 text-gray-700'
                              }`}>
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span className="break-words flex-1">{opt}</span>
                              {idx === correctIndex && (
                                <FiCheck className="ml-2 flex-shrink-0 text-green-500" size={14} />
                              )}
                              {idx === userIndex && idx !== correctIndex && (
                                <FiX className="ml-2 flex-shrink-0 text-red-500" size={14} />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {q.explanation && (
                        <div className="mt-3 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs sm:text-sm text-blue-800 font-medium">Explanation:</p>
                          <p className="text-xs sm:text-sm text-blue-700 mt-1">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons - Sticky at bottom */}
        <div className="sticky bottom-4 sm:bottom-6 mt-4 sm:mt-6 bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-3 sm:p-4 border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
            <button
              onClick={() => (onBack ? onBack() : navigate(`/dashboard/subjects/${subject.id}`))}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-600 text-white rounded-lg sm:rounded-xl hover:bg-gray-700 transition-colors font-medium text-sm sm:text-base flex-1 sm:flex-none"
            >
              Back to Subject
            </button>
            <button
              onClick={() => (onRetry ? onRetry() : navigate(`/dashboard/subjects/${subject.id}/mcqs/practice`, { state: { subject } }))}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg sm:rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow font-medium text-sm sm:text-base flex-1 sm:flex-none"
            >
              Retry Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default McqResultPage;