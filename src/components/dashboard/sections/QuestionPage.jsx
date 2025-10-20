import React, { useState, useEffect } from "react";
import axios from "axios";

const QuestionsPage = ({ sessionData, setActiveTab, onBack }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(3600); // 60 minutes in seconds
  const [showExitModal, setShowExitModal] = useState(false);
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState(60); // 1 minute per question
  const [subject, setSubject] = useState(''); // Store the subject name
  const [isModalOpen, setIsModalOpen] = useState(false); // For modal animation
  const [retryCount, setRetryCount] = useState(0); // Track retry attempts

  useEffect(() => {
    // Load questions from session data
    const loadSession = async () => {
      try {
        if (sessionData) {
          console.log("📝 Loading questions from session data:", sessionData);
          
          // Check different possible locations for questions in the response
          let questionsToSet = [];
          let sessionIdToSet = '';
          
          // Handle different possible response formats
          if (Array.isArray(sessionData)) {
            questionsToSet = sessionData;
          } else if (sessionData.questions) {
            questionsToSet = sessionData.questions;
            sessionIdToSet = sessionData.id || sessionData.sessionId || sessionData.session_id;
          } else if (sessionData.data) {
            if (Array.isArray(sessionData.data)) {
              questionsToSet = sessionData.data;
              sessionIdToSet = sessionData.id || sessionData.sessionId || sessionData.session_id;
              questionsToSet = sessionData.data.questions;
              sessionIdToSet = sessionData.data.id || sessionData.data.sessionId || sessionData.data.session_id;
            }
          }
          
          console.log('Questions to set:', questionsToSet);
          console.log('Session ID to set:', sessionIdToSet);
          
          // Set session ID from various possible locations
          const possibleSessionId = 
            sessionIdToSet || 
            sessionData.id || 
            sessionData.sessionId || 
            sessionData.session_id ||
            (sessionData.data && (sessionData.data.id || sessionData.data.sessionId || sessionData.data.session_id));
          
          if (possibleSessionId) {
            console.log('Setting session ID:', possibleSessionId);
            setSessionId(possibleSessionId);
          } else {
            console.warn('No session ID found in session data');
            // Generate a fallback session ID if none is provided
            const fallbackId = `temp-${Date.now()}`;
            console.log('Using fallback session ID:', fallbackId);
            setSessionId(fallbackId);
          }
          
          // Set subject from session data
          const subjectToSet = 
            sessionData.subject || 
            (sessionData.data && sessionData.data.subject) || 
            'Revision Session';
          setSubject(subjectToSet);
          
          // Set questions
          if (questionsToSet && questionsToSet.length > 0) {
            console.log(`Setting ${questionsToSet.length} questions`);
            setQuestions(questionsToSet);
            setUserAnswers(Array(questionsToSet.length).fill(null));
            
            // Extract subject from session data
            let subjectFromData = 'Revision Session';
            
            // Check different possible locations for subject
            if (sessionData.subject) {
              // Case 1: Direct subject object
              if (typeof sessionData.subject === 'object') {
                subjectFromData = sessionData.subject.name || sessionData.subject.subcategory || 'Revision Session';
              } 
              // Case 2: Subject as string
              else if (typeof sessionData.subject === 'string') {
                subjectFromData = sessionData.subject;
              }
            } 
            // Case 3: Check selectedSubjects array
            else if (sessionData.selectedSubjects && sessionData.selectedSubjects.length > 0) {
              const firstSubject = sessionData.selectedSubjects[0];
              subjectFromData = firstSubject.name || firstSubject.subcategory || 'Revision Session';
            }
            // Case 4: Check in sessionData.data
            else if (sessionData.data?.subject) {
              subjectFromData = typeof sessionData.data.subject === 'string' 
                ? sessionData.data.subject 
                : sessionData.data.subject.name || 'Revision Session';
            }
            
            console.log('Extracted subject:', subjectFromData);
            setSubject(subjectFromData);
          } else {
            console.error('No questions found in session data');
            setError('No questions found in session data');
          }
        } else {
          // Try to load from localStorage as fallback
          const savedSession = localStorage.getItem('currentSession');
          if (savedSession) {
            try {
              const session = JSON.parse(savedSession);
              console.log("📝 Loading questions from localStorage:", session);
              
              if (session.questions && session.questions.length > 0) {
                setQuestions(session.questions);
                setUserAnswers(Array(session.questions.length).fill(null));
                setSessionId(session.id || session.sessionId || `temp-${Date.now()}`);
                setSubject(session.subject || 'Revision Session');
              } else {
                setError("No valid questions found in saved session");
              }
            } catch (e) {
              console.error("Error parsing saved session:", e);
              setError("Failed to load saved session");
            }
          } else {
            setError("No session data provided");
          }
        }
      } catch (err) {
        console.error('Error loading session data:', err);
        setError('Failed to load session data');
      } finally {
        setLoading(false);
      }
    };
    
    loadSession();
    
    // Set up interval for question timer
    const questionTimer = setInterval(() => {
      setQuestionTimeRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    
    return () => clearInterval(questionTimer);
  }, [sessionData]);

  // Main session timer effect
  useEffect(() => {
    if (questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSessionTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup function to prevent memory leaks
    return () => clearInterval(timer);
  }, [questions.length]);

  // Per-question timer effect
  useEffect(() => {
    if (questions.length === 0) return;
    
    // Reset question timer when question changes
    setQuestionTimeRemaining(60);
    
    const questionTimer = setInterval(() => {
      setQuestionTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(questionTimer);
          handleAutoNextQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(questionTimer);
  }, [currentQuestionIndex, questions.length]);

  const handleAutoNextQuestion = () => {
    // Mark current question as not attempted before moving to next
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion) {
      setUserAnswers(prevAnswers => {
        const updatedAnswers = [...prevAnswers];
        // Only mark as not attempted if not already answered
        if (!updatedAnswers[currentQuestionIndex]?.isAnswered) {
          updatedAnswers[currentQuestionIndex] = {
            questionId: currentQuestion.id || `q${currentQuestionIndex}`,
            selectedAnswer: null,
            timestamp: new Date().toISOString(),
            isAnswered: false
          };
        }
        return updatedAnswers;
      });
    }

    // Move to next question or finish session
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex + 1]?.selectedAnswer || null);
      setQuestionTimeRemaining(60); // Reset timer for next question
    } else {
      handleFinishSession();
    }
  };

  const handleSessionTimeout = () => {
    alert("Session time expired! Your progress has been saved.");
    // You can add auto-submit logic here
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answer) => {
    // Update the selected answer for the current question
    setSelectedAnswer(answer);
    
    // Save user's answer to the userAnswers array
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;
    
    setUserAnswers(prevAnswers => {
      const updatedAnswers = [...prevAnswers];
      updatedAnswers[currentQuestionIndex] = {
        questionId: currentQuestion.id || `q${currentQuestionIndex}`,
        selectedAnswer: answer,
        timestamp: new Date().toISOString(),
        isAnswered: true
      };
      return updatedAnswers;
    });
  };

  const handleNextQuestion = () => {
    // Check if current question is answered before proceeding
    const isCurrentQuestionAnswered = userAnswers[currentQuestionIndex]?.isAnswered;
    
    if (!isCurrentQuestionAnswered) {
      // Mark as not attempted
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion) {
        setUserAnswers(prevAnswers => {
          const updatedAnswers = [...prevAnswers];
          updatedAnswers[currentQuestionIndex] = {
            questionId: currentQuestion.id || `q${currentQuestionIndex}`,
            selectedAnswer: null,
            timestamp: new Date().toISOString(),
            isAnswered: false
          };
          return updatedAnswers;
        });
      }
    }
    
    // Move to next question or finish
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex + 1]?.selectedAnswer || null);
      setQuestionTimeRemaining(60); // Reset timer for next question
    } else {
      handleFinishSession();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex - 1]?.selectedAnswer || null);
    }
  };

  const handleFinishSession = async () => {
    try {
      console.log('Submitting answers with sessionId:', sessionId);
      console.log('User answers:', userAnswers);
      
      if (!sessionId) {
        throw new Error('No session ID found');
      }

      // Prepare answers array in the required format
      const answers = questions.map((question, index) => {
        const answer = userAnswers[index];
        if (!question) return null;
        return {
          question_id: question.id || index + 1,
          selected_option: answer?.selectedAnswer || ''
        };
      }).filter(Boolean); // Remove any null entries

      // Filter out unanswered questions
      const answeredQuestions = answers.filter(a => a && a.selected_option !== '');
      
      if (answeredQuestions.length === 0) {
        alert('Please answer at least one question before submitting.');
        return;
      }

      // Prepare the payload
      const payload = {
        session_id: sessionId,
        answers: answeredQuestions
      };

      console.log('Submitting payload:', JSON.stringify(payload, null, 2));

      // Call the API to submit answers
      const response = await axios.post(
        'http://mrbe.codovio.com/api/v1/revision/submit',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json'
          },
          validateStatus: function (status) {
            return status >= 200 && status < 500; // Resolve promise for all status codes < 500
          }
        }
      );

      console.log('API Response:', response.data);
      
      // Check if the response indicates success
      const isSuccess = (response.data && 
                        (response.data.success === true || 
                         response.data.status === 'success' || 
                         response.status === 200));
      
      if (isSuccess) {
        // ✅ FIX: Create minimal result data and let McqResultPage fetch detailed results from API
        const resultData = {
          questions: questions, // Pass the original questions
          userAnswers: userAnswers.reduce((acc, ans, idx) => {
            if (ans?.selectedAnswer) {
              acc[questions[idx]?.id] = ans.selectedAnswer;
            }
            return acc;
          }, {}),
          correctAnswers: {}, // Let API provide this
          score: response.data.score || 0,
          percentage: response.data.percentage || 0,
          sessionId: sessionId, // This is crucial for API call
          totalQuestions: questions.length,
          subject: { 
            id: subject?.id || 'revision', 
            name: subject?.name || 'Revision Session' 
          },
          submittedAt: new Date().toISOString(),
          timeSpent: 3600 - timeRemaining
        };
        
        // Save to localStorage for persistence
        localStorage.setItem('revisionProgress', JSON.stringify(resultData));
        
        // ✅ FIX: Navigate with ONLY sessionId - let McqResultPage fetch from API
        setActiveTab("mcqResult", { 
          fromMcqPractice: true, 
          sessionId: sessionId // Only pass sessionId, not mcqResultData
        });
      } else {
        // If the API returns a message, use it; otherwise use a default message
        const errorMessage = response.data?.message || 
                            response.data?.error || 
                            'Failed to submit answers. Please try again.';
        throw new Error(errorMessage);
      }
      
    } catch (error) {
      console.error('Error submitting answers:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Show a more user-friendly error message
      let errorMessage = 'Failed to submit answers. Please try again.';
      
      if (error.response) {
        errorMessage = error.response.data?.message || 
                      `Server responded with status ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleExitSession = () => {
    setShowExitModal(true);
    // Small delay to allow state to update before starting animation
    setTimeout(() => setIsModalOpen(true), 10);
  };

  const handleConfirmExit = () => {
    // Start exit animation
    setIsModalOpen(false);
    // Wait for the exit animation to complete before navigating
    setTimeout(() => {
      setShowExitModal(false);
      setActiveTab("revision");
    }, 300); // Match this duration with the CSS transition
  };

  const handleCancelExit = () => {
    // Start exit animation
    setIsModalOpen(false);
    // Wait for the exit animation to complete before hiding the modal
    setTimeout(() => {
      setShowExitModal(false);
    }, 300); // Match this duration with the CSS transition
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-blue-700 font-medium">Loading your revision session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-red-200 p-6 text-center">
          <div className="text-red-600 font-semibold text-xl mb-4">Session Error</div>
          <div className="text-red-500 mb-6">{error}</div>
          <button 
            onClick={onBack}
            className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium rounded-lg"
          >
            Back to Revision
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-blue-200 p-6 text-center">
          <div className="text-blue-600 font-semibold text-xl mb-4">No Questions Available</div>
          <p className="text-blue-500 mb-6">No questions found for this session.</p>
          <button 
            onClick={onBack}
            className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium rounded-lg"
          >
            Back to Revision
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header - Mobile Optimized */}
      <div className="max-w-6xl mx-auto mb-6">
        {/* Top Bar - Stack on mobile */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-4">
          {/* Exit Button */}
          <button
            onClick={handleExitSession}
            className="w-full lg:w-auto px-4 py-3 bg-white hover:bg-gray-50 border border-blue-200 transition-colors flex items-center justify-center gap-2 text-blue-700 font-medium rounded-lg shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Exit Session
          </button>
          
          {/* Session Info - Centered */}
          <div className="text-center order-first lg:order-none">
            <h1 className="text-xl lg:text-2xl font-bold text-blue-900 mb-2 line-clamp-2">
              {subject || 'Revision Session'}
            </h1>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-blue-700">
              <span className="font-medium bg-blue-50 px-2 py-1 rounded">Question {currentQuestionIndex + 1} of {questions.length}</span>
              <div className="hidden sm:block h-4 w-px bg-gray-300"></div>
              <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
                <span className="font-medium hidden xs:inline">Time:</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${questionTimeRemaining < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {questionTimeRemaining}s
                </span>
              </div>
            </div>
          </div>

          {/* Session ID - Hidden on small screens */}
          <div className="hidden lg:block text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded">
            Session ID: {sessionId?.substring(0, 8)}...
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Progress: {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
          <span>Answered: {userAnswers.filter(a => a !== undefined).length}/{currentQuestionIndex + 1}</span>
        </div>
      </div>
      
      {/* Question Card */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-4 lg:p-6 mb-6">
          {/* Session Info */}
          <div className="mb-4 lg:mb-6 pb-4 border-b border-gray-100">
            <h1 className="text-lg lg:text-xl font-bold text-blue-800">
              Revision Session
            </h1>
          </div>
          
          {/* Question */}
          <div className="mb-4 lg:mb-6">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 leading-relaxed">
              <span className="text-blue-600 font-bold">{currentQuestionIndex + 1}.</span> {currentQuestion.question_text || currentQuestion.question || "Question not available"}
            </h2>
            
            {/* Question Image if available */}
            {currentQuestion.image_url && (
              <div className="mb-4 lg:mb-6 mt-4 bg-gray-50 p-3 lg:p-4 rounded-lg border border-gray-200">
                <div className="flex justify-center">
                  <img 
                    src={currentQuestion.image_url} 
                    alt="Question illustration" 
                    className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200"
                    style={{
                      maxHeight: '300px',
                      objectFit: 'contain',
                      width: 'auto',
                      height: 'auto',
                      display: 'block',
                      margin: '0 auto'
                    }}
                    onError={(e) => {
                      console.error('Error loading image:', currentQuestion.image_url);
                      e.target.style.display = 'none';
                      const container = e.target.parentElement;
                      if (container) {
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'text-center text-gray-500 text-sm p-2';
                        errorDiv.textContent = 'Image not available';
                        container.appendChild(errorDiv);
                      }
                    }}
                  />
                </div>
                {currentQuestion.image_caption && (
                  <div className="mt-2 text-center text-sm text-gray-600 italic">
                    {currentQuestion.image_caption}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Options */}
          {(() => {
            let options = [];
            try {
              // Try to parse options if it's a string
              options = typeof currentQuestion.options === 'string' 
                ? JSON.parse(currentQuestion.options) 
                : currentQuestion.options || [];
            } catch (e) {
              console.error('Error parsing options:', e);
              options = [];
            }
            
            return (
              <div className="space-y-3 mb-6">
                {options.map((option, index) => {
                  const isCorrect = option === currentQuestion.correct_answer;
                  const isSelected = selectedAnswer === option;
                  
                  let buttonClass = "w-full text-left p-3 lg:p-4 border rounded-lg transition-all duration-200 font-medium text-sm lg:text-base ";
                  buttonClass += isSelected 
                    ? "bg-blue-100 border-blue-400 text-blue-800 shadow-sm" 
                    : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400";

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      className={buttonClass}
                    >
                      <div className="flex items-start">
                        <span className="font-semibold mr-3 w-5 flex-shrink-0 mt-0.5">{String.fromCharCode(65 + index)}.</span>
                        <span className="flex-1 text-left leading-relaxed">{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })()}

          {/* Navigation Buttons - Stack on mobile */}
          <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="w-full sm:w-auto px-6 py-3 bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium rounded-lg flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            
            <button
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === questions.length - 1 
                ? userAnswers.filter(a => a?.isAnswered).length < questions.length
                : !userAnswers[currentQuestionIndex]?.isAnswered}
              className={`w-full sm:w-auto px-6 py-3 transition-colors font-medium rounded-lg flex items-center justify-center gap-2 ${
                (currentQuestionIndex === questions.length - 1 
                  ? userAnswers.filter(a => a?.isAnswered).length < questions.length
                  : !userAnswers[currentQuestionIndex]?.isAnswered)
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {currentQuestionIndex === questions.length - 1 ? (
                <>
                  Finish Session
                  <span className="text-xs font-normal ml-1">
                    ({userAnswers.filter(a => a?.isAnswered).length}/{questions.length} answered)
                  </span>
                </>
              ) : 'Next Question'}
              {currentQuestionIndex < questions.length - 1 && (
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  style={!userAnswers[currentQuestionIndex]?.isAnswered ? { opacity: 0.6 } : {}}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Exit Session Modal with Animation */}
      {showExitModal && (
        <div 
          className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${isModalOpen ? 'opacity-100' : 'opacity-0'} p-4`}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)'
          }}
        >
          <div 
            className={`relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto transition-all duration-300 transform ${isModalOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
            style={{
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Exit Session?</h3>
            <p className="text-gray-600 mb-6">
              Your progress will be saved. You can resume this session later from your dashboard.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={handleCancelExit}
                className="w-full sm:w-auto px-5 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExit}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Exit Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionsPage;