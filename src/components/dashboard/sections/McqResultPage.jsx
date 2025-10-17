import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  FiAward, 
  FiClock, 
  FiCheck, 
  FiX, 
  FiBarChart2, 
  FiChevronDown, 
  FiChevronUp,
  FiLoader,
  FiAlertCircle,
  FiArrowLeft,
  FiRotateCw
} from "react-icons/fi";

const McqResultPage = ({ 
  resultData: propResultData, 
  onBack = () => window.history.back(), 
  onRetry = () => window.location.reload(),
  tabState = {} 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State for UI
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Quiz result data state
  const [data, setData] = useState({
    questions: [],
    userAnswers: {},
    correctAnswers: {},
    score: 0,
    percentage: 0,
    totalQuestions: 0,
    subject: { name: 'Quiz' },
    submittedAt: new Date().toISOString(),
    timeSpent: 0,
    correctCount: 0,
    attemptedCount: 0
  });

  // Score data state
  const [scoreData, setScoreData] = useState({
    correctCount: 0,
    attemptedCount: 0,
    finalPercentage: 0,
    finalScore: 0
  });
  
  const sessionId = tabState?.sessionId || location.state?.sessionId;
  const initialResultData = tabState?.mcqResultData || propResultData || location.state?.result;

  // Process API response into our expected format
  const processApiResponse = (apiData) => {
    if (!apiData) return null;
    
    console.log('🔍 FULL API RESPONSE INSPECTION:', {
      hasHistory: !!apiData.history,
      historyType: typeof apiData.history,
      historyIsArray: Array.isArray(apiData.history),
      historyLength: apiData.history?.length,
      firstHistoryItem: apiData.history?.[0],
      allHistoryKeys: apiData.history?.[0] ? Object.keys(apiData.history[0]) : 'no history items',
      fullApiKeys: Object.keys(apiData)
    });
    
    // Format 1: API response with detailed history
    if (apiData.history && Array.isArray(apiData.history)) {
      console.log('📝 Processing history array format with', apiData.history.length, 'items');
      
      try {
        const questions = [];
        const userAnswers = {};
        const correctAnswers = {};
        let correctCount = 0;
        let attemptedCount = 0;
        
        // Process each history item
        apiData.history.forEach((item, index) => {
          const questionId = item.question_id || `q${index}`;
          const isCorrect = item.is_correct || item.selected_option === item.correct_answer;
          
          // Add to questions array
          questions.push({
            id: questionId,
            question: item.question || `Question ${index + 1}`,
            options: item.options || [],
            selectedOption: item.selected_option,
            correctAnswer: item.correct_answer,
            isCorrect,
            explanation: item.explanation || '',
            category: item.category || 'General',
            subcategory: item.subcategory || '',
            _rawItem: item
          });
          
          // Track answers
          userAnswers[questionId] = item.selected_option;
          correctAnswers[questionId] = item.correct_answer;
          
          // Update counts
          if (item.selected_option) {
            attemptedCount++;
            if (isCorrect) correctCount++;
          }
        });
        
        const score = Number(apiData.score) || correctCount;
        const totalQuestions = Number(apiData.total_questions) || questions.length;
        const percentage = Number(apiData.percentage) || (totalQuestions ? (correctCount / totalQuestions) * 100 : 0);
        
        return {
          questions,
          userAnswers,
          correctAnswers,
          score,
          percentage,
          totalQuestions,
          subject: { name: apiData.category || 'Quiz' },
          submittedAt: apiData.submitted_at || new Date().toISOString(),
          timeSpent: 0,
          correctCount,
          attemptedCount,
          sessionId: apiData.session_id,
          isBasicFormat: false
        };
        
      } catch (error) {
        console.error('❌ Error processing history data:', error);
        // Fall through to basic format if there's an error
      }
    }
    
    // Format 2: Basic score response (fallback format)
    if (apiData.session_id || apiData.status === 'success') {
      console.log('📊 Processing basic score format');
      
      const score = Number(apiData.score) || 0;
      const totalQuestions = Number(apiData.total_questions) || 1;
      const percentage = Number(apiData.percentage) || 0;
      const correctCount = Math.round((percentage / 100) * totalQuestions) || score;
      
      return {
        questions: [{
          id: 'summary',
          question: 'Quiz Summary',
          options: [],
          selectedOption: null,
          correctAnswer: null,
          isCorrect: true,
          explanation: `You scored ${score} out of ${totalQuestions} (${percentage}%)`,
          _rawItem: apiData
        }],
        userAnswers: {},
        correctAnswers: {},
        score,
        percentage,
        totalQuestions,
        subject: { name: 'Quiz' },
        submittedAt: apiData.submitted_at || new Date().toISOString(),
        timeSpent: 0,
        correctCount,
        attemptedCount: totalQuestions,
        sessionId: apiData.session_id,
        isBasicFormat: true
      };
    }
    
    // If we get here, the format is not recognized
    console.warn('❌ Unsupported API response format. Available keys:', Object.keys(apiData));
    
    // Return a safe default structure instead of throwing an error
    return {
      questions: [],
      userAnswers: {},
      correctAnswers: {},
      score: 0,
      percentage: 0,
      totalQuestions: 0,
      subject: { name: 'Quiz' },
      submittedAt: new Date().toISOString(),
      timeSpent: 0,
      correctCount: 0,
      attemptedCount: 0,
      sessionId: apiData.session_id,
      isBasicFormat: true
    };
  };

  // Fetch results from the API
  const fetchResults = async (sessionId) => {
    const token = localStorage.getItem('token') || '';
    console.log('🔑 Using token for API request:', token ? 'Token found' : 'No token found');
    
    try {
      const response = await fetch(
        `http://mrbe.codovio.com/api/v1/revision/history/${sessionId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error (${response.status}):`, errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ API Response:', data);
      return data;
    } catch (error) {
      console.error('❌ Error in fetchResults:', error);
      throw error;
    }
  };

  // Calculate score data from questions and answers
  const calculateScoreData = (questions = [], userAnswers = {}, correctAnswers = {}) => {
    const totalQuestions = questions.length;
    let correctCount = 0;
    let attemptedCount = 0;

    questions.forEach(question => {
      const userAnswer = userAnswers[question.id];
      const correctAnswer = correctAnswers[question.id];
      
      if (userAnswer !== undefined && userAnswer !== null) {
        attemptedCount++;
        if (userAnswer === correctAnswer) {
          correctCount++;
        }
      }
    });

    const finalPercentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    return {
      correctCount,
      attemptedCount,
      finalPercentage: finalPercentage.toFixed(1),
      finalScore: correctCount
    };
  };

  // Process initial result data
  const processInitialResultData = () => {
    if (!initialResultData) return;
    
    try {
      setData(prev => ({
        ...prev,
        ...initialResultData,
        questions: Array.isArray(initialResultData.questions) ? initialResultData.questions : [],
        userAnswers: initialResultData.userAnswers || {},
        correctAnswers: initialResultData.correctAnswers || {}
      }));

      const calculatedScoreData = calculateScoreData(
        initialResultData.questions || [],
        initialResultData.userAnswers || {},
        initialResultData.correctAnswers || {}
      );
      setScoreData(calculatedScoreData);
    } catch (e) {
      console.error('Error processing initial result data:', e);
      setError('Failed to process quiz results.');
    } finally {
      setLoading(false);
    }
  };

  // Load data from API or local storage
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 1. ALWAYS try API first if we have sessionId (regardless of initialResultData)
        if (sessionId) {
          console.log('📡 Fetching FRESH results from API for session ID:', sessionId);
          try {
            const apiData = await fetchResults(sessionId);
            console.log('🎯 RAW API RESPONSE:', apiData);
            
            // Process the API response using our unified processor
            const processedData = processApiResponse(apiData);
            
            if (!isMounted) return;
            
            if (processedData) {
              setData(prev => ({
                ...prev,
                ...processedData,
                questions: Array.isArray(processedData.questions) ? processedData.questions : [],
                userAnswers: processedData.userAnswers || {},
                correctAnswers: processedData.correctAnswers || {}
              }));

              // If we have a basic format but also have initial data, try to merge them
              if (processedData.isBasicFormat && initialResultData) {
                console.log('🔄 Merging basic API data with initial result data');
                const mergedData = {
                  ...processedData,
                  questions: initialResultData.questions || processedData.questions,
                  userAnswers: initialResultData.userAnswers || processedData.userAnswers,
                  correctAnswers: initialResultData.correctAnswers || processedData.correctAnswers
                };
                
                setData(prev => ({
                  ...prev,
                  ...mergedData
                }));
                
                const calculatedScoreData = calculateScoreData(
                  mergedData.questions,
                  mergedData.userAnswers,
                  mergedData.correctAnswers
                );
                setScoreData(calculatedScoreData);
              } else {
                const calculatedScoreData = calculateScoreData(
                  processedData.questions,
                  processedData.userAnswers,
                  processedData.correctAnswers
                );
                setScoreData(calculatedScoreData);
              }
              
              console.log('✅ Successfully loaded data from API');
              setLoading(false);
              return;
            }
            
            // If we get here, processing failed but we didn't throw an error
            throw new Error('Unsupported API response format');
            
          } catch (apiError) {
            console.error('❌ API fetch/process failed:', apiError);
            
            if (!isMounted) return;
            
            // Show error but continue to fallback options
            setError(`API Error: ${apiError.message}. Trying fallback data...`);
            
            // Add a small delay to show the error message before falling back
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Fall through to use initialResultData or localStorage
          }
        }
        
        // 2. Use initial result data if available
        if (initialResultData) {
          console.log('🔄 Using initial result data');
          processInitialResultData();
          return;
        }
        
        // 3. Fallback to localStorage
        const savedData = localStorage.getItem('revisionProgress');
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            const processedData = processApiResponse(parsedData);
            
            if (isMounted && processedData) {
              setData(prev => ({
                ...prev,
                ...processedData,
                questions: Array.isArray(processedData.questions) ? processedData.questions : [],
                userAnswers: processedData.userAnswers || {},
                correctAnswers: processedData.correctAnswers || {}
              }));

              const calculatedScoreData = calculateScoreData(
                processedData.questions,
                processedData.userAnswers,
                processedData.correctAnswers
              );
              setScoreData(calculatedScoreData);
              console.log('✅ Successfully loaded data from localStorage');
            }
          } catch (e) {
            console.error('❌ Error parsing saved data:', e);
            if (isMounted) {
              setError('Error loading saved results. The data format is invalid.');
            }
          }
        } else if (isMounted) {
          setError('No result data available. Please complete a quiz first.');
        }
      } catch (error) {
        console.error('❌ Unexpected error in loadData:', error);
        if (isMounted) {
          setError('An unexpected error occurred while loading the results.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Call loadData when component mounts
    loadData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [sessionId, initialResultData]);

  // Get grade based on percentage
  const getGrade = () => {
    const percentage = parseFloat(scoreData.finalPercentage);
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-600' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-500' };
    if (percentage >= 70) return { grade: 'B', color: 'text-blue-500' };
    if (percentage >= 60) return { grade: 'C', color: 'text-yellow-500' };
    if (percentage >= 50) return { grade: 'D', color: 'text-orange-500' };
    return { grade: 'F', color: 'text-red-500' };
  };

  const gradeInfo = getGrade();

  // Toggle question expansion
  const toggleQuestion = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Results</h2>
          <p className="text-gray-600">Please wait while we fetch your quiz results...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiX className="text-2xl text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Result Available</h2>
          <p className="text-gray-600 mb-6">{error || 'Please complete a quiz to see results.'}</p>
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

  const { questions = [], subject = { name: 'Quiz' }, userAnswers = {}, correctAnswers = {}, timeUp = false } = data;
  const { correctCount, attemptedCount, finalPercentage } = scoreData;
  const totalQuestions = questions.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-6">
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        {/* Header */}
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
            <div className="text-xl sm:text-2xl font-bold">{finalPercentage}%</div>
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
              <div className="text-base sm:text-lg font-bold text-orange-600">
                {totalQuestions - attemptedCount}
              </div>
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
            {questions.map((q, index) => {
              const userAnswer = userAnswers[q.id];
              const correctAnswer = correctAnswers[q.id];
              const isAttempted = userAnswer !== null && userAnswer !== undefined;
              const isCorrect = isAttempted && userAnswer === correctAnswer;
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
                        <div className="flex items-center">
                          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0 ${
                            !isAttempted 
                              ? 'bg-gray-300 text-gray-700' 
                              : isCorrect 
                              ? 'bg-green-500 text-white' 
                              : 'bg-red-500 text-white'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="ml-3">
                            <div className="text-gray-800 text-sm sm:text-base line-clamp-1">
                              {q.question}
                            </div>
                            <div className="flex items-center space-x-2 mt-1 text-xs">
                              <span className={`px-2 py-0.5 rounded-full ${
                                !isAttempted 
                                  ? 'bg-gray-100 text-gray-600' 
                                  : isCorrect 
                                  ? 'bg-green-100 text-green-600' 
                                  : 'bg-red-100 text-red-600'
                              }`}>
                                {!isAttempted ? 'Not Attempted' : isCorrect ? 'Correct' : 'Incorrect'}
                              </span>
                              {isAttempted && (
                                <span className="text-gray-500">
                                  Your choice: {String.fromCharCode(65 + (q.options || []).indexOf(userAnswer))}
                                </span>
                              )}
                            </div>
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
                    <div className="p-3 sm:p-4 bg-gray-50">
                      <div className="space-y-2">
                        {(q.options || []).map((opt, idx) => {
                          const isCorrectAnswer = String(opt).trim() === String(correctAnswer || '').trim();
                          const isUserAnswer = String(opt).trim() === String(userAnswer || '').trim();
                          const showAsIncorrect = isUserAnswer && !isCorrectAnswer;
                          
                          return (
                            <div
                              key={idx}
                              className={`p-2 sm:p-3 rounded-lg text-xs sm:text-sm ${
                                isCorrectAnswer
                                  ? 'bg-green-50 text-green-800 border-2 border-green-400'
                                  : showAsIncorrect
                                  ? 'bg-red-50 text-red-800 border-2 border-red-400'
                                  : 'bg-white text-gray-700 border border-gray-200'
                              }`}
                            >
                              <div className="flex items-center">
                                <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center mr-2 text-xs font-medium flex-shrink-0 ${
                                  isCorrectAnswer
                                    ? 'bg-green-500 text-white'
                                    : isUserAnswer
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-200 text-gray-700'
                                }`}>
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                <span className="break-words flex-1">{opt}</span>
                                {isCorrectAnswer && (
                                  <div className="ml-2 flex items-center text-green-600">
                                    <FiCheck className="mr-1" size={14} />
                                    <span className="text-xs">Correct</span>
                                  </div>
                                )}
                                {isUserAnswer && !isCorrectAnswer && (
                                  <div className="ml-2 flex items-center text-red-600">
                                    <FiX className="mr-1" size={14} />
                                    <span className="text-xs">Your Answer</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-800 mb-2">
                          {isCorrect ? 'Correct! ' : 'Incorrect. '}
                          {isCorrect ? 'Your answer is correct.' : 'The correct answer is:'}
                        </p>
                        
                        {!isCorrect && (
                          <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded">
                            <p className="text-sm font-medium text-green-800">
                              {correctAnswer || 'No correct answer provided'}
                            </p>
                            {userAnswer && (
                              <p className="text-sm text-red-600 mt-1">
                                Your answer: {userAnswer}
                              </p>
                            )}
                          </div>
                        )}
                        
                        {(q.explanation) && (
                          <div className="mt-3 pt-3 border-t border-blue-100">
                            <p className="text-xs font-medium text-blue-800 mb-1">Explanation:</p>
                            <div 
                              className="text-xs text-blue-700 space-y-2 whitespace-pre-line"
                              dangerouslySetInnerHTML={{ 
                                __html: (q.explanation || '').replace(/\n/g, '<br />')
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                if (onRetry) {
                  onRetry();
                } else if (subject) {
                  navigate('/dashboard/revision', { 
                    state: { 
                      subject: subject,
                      fromResult: true 
                    } 
                  });
                } else {
                  navigate('/dashboard/revision');
                }
              }}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg sm:rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow font-medium text-sm sm:text-base flex-1"
            >
              Retry Quiz
            </button>
            <button
              onClick={() => (onBack ? onBack() : navigate('/dashboard'))}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-gray-700 border border-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all shadow font-medium text-sm sm:text-base flex-1"
            >
              Back to Revision Categories
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default McqResultPage;