import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiClock, FiChevronLeft, FiChevronRight, FiCheck, FiAlertCircle } from "react-icons/fi";

const McqPracticePage = ({ activeSubject, onFinish, onBack, difficulty }) => {
  const navigate = useNavigate();

  const questions = [
    { 
      id: 1, 
      question: "What is the capital of France?", 
      options: ["London", "Berlin", "Paris", "Madrid"], 
      correctOption: 2,
      explanation: "Paris is the capital and most populous city of France."
    },
    { 
      id: 2, 
      question: "Which programming language is known as the 'language of the web'?", 
      options: ["Python", "Java", "JavaScript", "C++"], 
      correctOption: 2,
      explanation: "JavaScript is the primary language for web development."
    },
    { 
      id: 3, 
      question: "What is the largest planet in our solar system?", 
      options: ["Earth", "Mars", "Jupiter", "Saturn"], 
      correctOption: 2,
      explanation: "Jupiter has a mass one-thousandth that of the Sun."
    },
    { 
      id: 4, 
      question: "Which company developed React.js?", 
      options: ["Google", "Facebook", "Microsoft", "Apple"], 
      correctOption: 1,
      explanation: "React was created by Jordan Walke, a software engineer at Facebook."
    },
    { 
      id: 5, 
      question: "What is the largest mammal in the world?", 
      options: ["Elephant", "Blue Whale", "Giraffe", "Polar Bear"], 
      correctOption: 1,
      explanation: "The blue whale is the largest mammal on Earth."
    },
    { 
      id: 6, 
      question: "Which element has the chemical symbol 'O'?", 
      options: ["Gold", "Oxygen", "Osmium", "Oganesson"], 
      correctOption: 1,
      explanation: "Oxygen has the chemical symbol O."
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);

  // Timer effect
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;

    const timerId = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft, timerActive]);

  // Auto-finish when time runs out
  useEffect(() => {
    if (timeLeft <= 0 && timerActive) {
      setTimerActive(false);
      handleTimeUp();
    }
  }, [timeLeft, timerActive]);

  const handleTimeUp = () => {
    const finalAnswers = { ...answers };
    questions.forEach(question => {
      if (finalAnswers[question.id] === undefined) {
        finalAnswers[question.id] = null;
      }
    });

    const resultPayload = { 
      subject: activeSubject || null, 
      mcqs: questions, 
      userAnswers: finalAnswers,
      timeUp: true 
    };

    if (typeof onFinish === "function") {
      onFinish(resultPayload);
    } else {
      const subjectId = activeSubject?.id || activeSubject?.name;
      navigate(`/dashboard/subjects/${encodeURIComponent(subjectId)}/mcqs/result`, { 
        state: resultPayload 
      });
    }
  };

  const currentQuestion = questions[currentIndex];

  const handleOptionSelect = (optionIndex) => {
    setSelectedOption(optionIndex);
    setAnswers({ ...answers, [currentQuestion.id]: optionIndex });
  };

  const nextQuestion = () => {
    if (selectedOption === null) return;
    setSelectedOption(null);
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const prevQuestion = () => {
    setSelectedOption(null);
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const finishQuiz = () => {
    setTimerActive(false);
    
    const finalAnswers = { ...answers };
    questions.forEach(question => {
      if (finalAnswers[question.id] === undefined) {
        finalAnswers[question.id] = null;
      }
    });

    const resultPayload = { 
      subject: activeSubject || null, 
      mcqs: questions, 
      userAnswers: finalAnswers,
      timeUp: false 
    };

    if (typeof onFinish === "function") {
      onFinish(resultPayload);
      return;
    }

    const subjectId = activeSubject?.id || activeSubject?.name;
    if (!subjectId) {
      alert("No subject selected!");
      return;
    }

    navigate(`/dashboard/subjects/${encodeURIComponent(subjectId)}/mcqs/result`, { 
      state: resultPayload 
    });
  };

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Sticky Header - Simplified without timer */}
      <div className="sticky top-0 z-50 bg-white shadow-lg border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold text-gray-800 break-words">
                  {activeSubject?.name || "MCQ Practice"}
                </h1>
                <p className="text-sm text-gray-600">
                  Question {currentIndex + 1} of {questions.length}
                </p>
              </div>
            </div>
          </div>
          
          {/* Mobile Progress Bar */}
          <div className="mt-2 lg:hidden">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress: {Math.round(progress)}%</span>
              <span>{answeredCount}/{questions.length} answered</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-3 sm:px-4 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-xl p-4 lg:p-6 border border-gray-200 h-full lg:sticky lg:top-24 flex flex-col">
              {/* Timer inside container */}
              <div className={`flex items-center justify-center space-x-3 px-4 py-3 rounded-lg mb-4 ${
                timeLeft <= 10 ? 'bg-red-100 border border-red-200' : 'bg-blue-100 border border-blue-200'
              }`}>
                <FiClock className={`text-lg ${timeLeft <= 10 ? 'text-red-600' : 'text-blue-600'}`} />
                <div className="text-center">
                  <span className={`text-sm font-medium ${timeLeft <= 10 ? 'text-red-600' : 'text-blue-600'} block`}>
                    Time Left
                  </span>
                  <span className={`text-xl font-bold ${timeLeft <= 10 ? 'text-red-700 animate-pulse' : 'text-blue-700'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
              
              <h3 className="font-semibold text-gray-800 mb-3 text-sm lg:text-base">Quiz Progress</h3>
              
              {/* Progress Stats */}
              <div className="grid grid-cols-2 gap-2 lg:gap-3 mb-4 lg:mb-6">
                <div className="text-center p-2 lg:p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-lg lg:text-xl font-bold text-green-600">{answeredCount}</div>
                  <div className="text-xs text-green-700">Answered</div>
                </div>
                <div className="text-center p-2 lg:p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-lg lg:text-xl font-bold text-gray-600">{questions.length - answeredCount}</div>
                  <div className="text-xs text-gray-700">Remaining</div>
                </div>
              </div>

              {/* Question Navigation - Grid layout that adapts to number of questions */}
              <div className="mb-4 lg:mb-6">
                <h4 className="font-medium text-gray-700 mb-2 lg:mb-3 text-sm">Questions</h4>
                <div className={`grid gap-1.5 lg:gap-2 ${
                  questions.length <= 4 ? 'grid-cols-4' : 
                  questions.length <= 6 ? 'grid-cols-6' : 
                  questions.length <= 8 ? 'grid-cols-8' : 'grid-cols-10'
                }`}>
                  {questions.map((q, index) => (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentIndex(index);
                        setSelectedOption(answers[q.id] !== undefined ? answers[q.id] : null);
                      }}
                      className={`w-7 h-7 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center text-xs lg:text-sm font-medium transition-all ${
                        index === currentIndex
                          ? 'bg-blue-600 text-white shadow-lg transform scale-110'
                          : answers[q.id] !== undefined
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress Bar - Hidden on mobile since it's in header */}
              <div className="mt-auto hidden lg:block">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl p-4 lg:p-6 xl:p-8 border border-gray-200 h-full flex flex-col">
              {/* Question Header - Hidden on mobile since it's in sticky header */}
              <div className="hidden sm:flex items-center justify-between mb-4 lg:mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                    Question {currentIndex + 1} of {questions.length}
                  </div>
                  {answers[currentQuestion.id] !== undefined && (
                    <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <FiCheck className="mr-1" /> Answered
                    </div>
                  )}
                </div>
                <div className="text-base font-semibold text-gray-700 hidden md:block">
                  {Math.ceil((questions.length - currentIndex - 1) * 0.5)} min left
                </div>
              </div>

              {/* Question */}
              <div className="mb-4 lg:mb-6">
                <h2 className="text-base lg:text-lg xl:text-xl font-semibold text-gray-800 leading-relaxed">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-2 lg:space-y-3 xl:space-y-4 mb-4 lg:mb-6 xl:mb-8 flex-1">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(index)}
                    className={`w-full text-left p-3 lg:p-4 rounded-lg lg:rounded-xl border-2 transition-all duration-200 ${
                      selectedOption === index
                        ? 'border-blue-500 bg-blue-50 shadow-md lg:transform lg:scale-[1.02]'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center mr-3 lg:mr-4 font-medium text-sm lg:text-base ${
                        selectedOption === index
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-gray-700 text-sm lg:text-base break-words flex-1">{option}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 pt-4 lg:pt-6 border-t border-gray-200">
                <button
                  onClick={prevQuestion}
                  disabled={currentIndex === 0}
                  className="flex items-center space-x-2 px-4 py-2.5 lg:py-3 bg-gray-100 text-gray-700 rounded-lg lg:rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium w-full sm:w-auto justify-center text-sm lg:text-base"
                >
                  <FiChevronLeft />
                  <span>Previous</span>
                </button>

                <div className="text-xs text-gray-500 sm:hidden">
                  {answeredCount}/{questions.length} answered
                </div>

                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={nextQuestion}
                    disabled={selectedOption === null}
                    className="flex items-center space-x-2 px-4 py-2.5 lg:py-3 bg-blue-600 text-white rounded-lg lg:rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium w-full sm:w-auto justify-center text-sm lg:text-base order-3 sm:order-2"
                  >
                    <span>Next Question</span>
                    <FiChevronRight />
                  </button>
                ) : (
                  <button
                    onClick={finishQuiz}
                    className="flex items-center space-x-2 px-4 py-2.5 lg:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg lg:rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow font-medium w-full sm:w-auto justify-center text-sm lg:text-base order-3 sm:order-2"
                  >
                    <FiCheck className="text-lg" />
                    <span>Finish Quiz</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Warning Message */}
        {timeLeft <= 30 && (
          <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-center space-x-3">
            <FiAlertCircle className="text-orange-500 text-lg flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-orange-800 text-sm">Time is running out!</p>
              <p className="text-xs text-orange-700">Complete your quiz before time expires.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default McqPracticePage;