import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const McqPracticePage = ({ activeSubject, onFinish, onBack, difficulty }) => {
  const navigate = useNavigate();

  const questions = [
    { id: 1, question: "Capital of Pakistan?", options: ["Lahore","Karachi","Islamabad","Peshawar"] },
    { id: 2, question: "React is a ___?", options: ["Library","Framework","Language","Database"] },
    { id: 1, question: "Capital of Pakistan?", options: ["Lahore","Karachi","Islamabad","Peshawar"] },
    { id: 2, question: "React is a ___?", options: ["Library","Framework","Language","Database"] },
    
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const currentQuestion = questions[currentIndex];

  const handleOptionSelect = (optionIndex) => {
    setAnswers({ ...answers, [currentQuestion.id]: optionIndex });
  };

  const nextQuestion = () => {
    if (answers[currentQuestion.id] === undefined) return;
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const prevQuestion = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const finishQuiz = () => {
    const subjectId = activeSubject?.id || activeSubject?.name;
    const resultPayload = { subject: activeSubject || null, mcqs: questions, userAnswers: answers };

    if (typeof onFinish === "function") {
      onFinish(resultPayload);
      return;
    }

    if (!subjectId) {
      alert("No subject selected!");
      return;
    }

    try {
      localStorage.setItem(`mcq_result_${subjectId}`, JSON.stringify({ questions, answers }));
    } catch (_) {}
    navigate(`/dashboard/subjects/${encodeURIComponent(subjectId)}/mcqs/result`, { state: resultPayload });
  };

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
        <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${progress}%` }}></div>
      </div>

      <h2 className="text-lg font-semibold mb-2">
        Question {currentIndex + 1} of {questions.length}
      </h2>

      <div className="bg-white shadow-lg rounded-2xl p-6 mb-4">
        <h3 className="mb-4">{currentQuestion.question}</h3>
        <div className="space-y-2">
          {currentQuestion.options.map((option, index) => (
            <label
              key={index}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                answers[currentQuestion.id] === index
                  ? "bg-blue-100 border-blue-500"
                  : "hover:bg-gray-100"
              }`}
            >
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                checked={answers[currentQuestion.id] === index}
                onChange={() => handleOptionSelect(index)}
                className="hidden"
              />
              <span className="ml-2">{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={prevQuestion}
          disabled={currentIndex === 0}
          className="px-5 py-2 bg-gray-300 text-gray-700 rounded-full disabled:opacity-50 hover:bg-gray-400"
        >
          Previous
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            onClick={nextQuestion}
            disabled={answers[currentQuestion.id] === undefined}
            className="px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50"
          >
            Next
          </button>
        ) : (
          <button
            onClick={finishQuiz}
            disabled={answers[currentQuestion.id] === undefined}
            className="px-5 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50"
          >
            Finish
          </button>
        )}
      </div>
    </div>
  );
};

export default McqPracticePage;
