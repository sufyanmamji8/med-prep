import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const McqResultPage = ({ resultData, onBack, onRetry }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const fallback = location.state || {};
  const data = resultData || fallback.mcqResultData || fallback;
  const subject = data?.subject || null;
  const userAnswers = data?.userAnswers || data?.answers || {};
  const mcqs = data?.mcqs || data?.questions || [];

  if (!subject || !userAnswers || !mcqs.length) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold">No Result Available</h2>
        <button
          onClick={() => (onBack ? onBack() : navigate("/dashboard"))}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Mock correct answers for demonstration
  const correctAnswers = {};
  mcqs.forEach((q) => {
    correctAnswers[q.id] = q.correctOption ?? 0; // assume 0 if not provided
  });

  const totalQuestions = mcqs.length;
  let correctCount = 0;
  mcqs.forEach((q) => {
    if (userAnswers[q.id] === correctAnswers[q.id]) correctCount++;
  });

  const percentage = ((correctCount / totalQuestions) * 100).toFixed(2);

  const getGrade = () => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    return "D";
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">{subject.name} - MCQ Result</h2>
      <div className="bg-white p-4 rounded shadow border">
        <p>Total Questions: {totalQuestions}</p>
        <p>Correct Answers: {correctCount}</p>
        <p>Percentage: {percentage}%</p>
        <p>Grade: <span className="font-semibold">{getGrade()}</span></p>
      </div>

      <div className="space-y-4">
        {mcqs.map((q) => {
          const userIndex = userAnswers[q.id];
          const correctIndex = correctAnswers[q.id];
          return (
            <div key={q.id} className="bg-white p-4 rounded shadow border">
              <p className="font-medium">{q.id}. {q.question}</p>
              <ul className="list-disc list-inside space-y-1">
                {q.options.map((opt, idx) => (
                  <li
                    key={idx}
                    className={`p-2 rounded ${
                      idx === correctIndex
                        ? "bg-green-100 border border-green-500"
                        : idx === userIndex
                        ? "bg-red-100 border border-red-500"
                        : "bg-gray-100"
                    }`}
                  >
                    {opt}
                    {idx === userIndex && idx === correctIndex && (
                      <span className="ml-2 text-green-700 font-semibold">(Your choice - Correct)</span>
                    )}
                    {idx === userIndex && idx !== correctIndex && (
                      <span className="ml-2 text-red-700 font-semibold">(Your choice)</span>
                    )}
                    {idx === correctIndex && idx !== userIndex && (
                      <span className="ml-2 text-green-700 font-semibold">(Correct answer)</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center space-x-4">
        <button
          onClick={() => (onBack ? onBack() : navigate(`/dashboard/subjects/${subject.id}`))}
          className="px-5 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Back to Subject
        </button>
        <button
          onClick={() => (onRetry ? onRetry() : navigate(`/dashboard/subjects/${subject.id}/mcqs/practice`, { state: { subject } }))}
          className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry Quiz
        </button>
      </div>
    </div>
  );
};

export default McqResultPage;

