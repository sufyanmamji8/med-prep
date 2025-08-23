import React, { useMemo } from "react";
import ProtectedContent from "../common/ProtectedContent";
import { MdQuiz, MdOutlineTimer } from "react-icons/md";
import { FaHistory } from "react-icons/fa";

const Mcqs = ({ activeSubject, selectedDifficulty, setSelectedDifficulty, hasSubscription, navigate }) => {
  const sets = useMemo(() => {
    return ["Basic Concepts", "Clinical Applications", "Advanced Topics", "Board Review"].map((title, i) => ({
      id: i + 1,
      title: `${activeSubject?.name} - ${title}`,
      questions: Math.floor(Math.random() * 30) + 20,
      duration: `${Math.floor(Math.random() * 30) + 30} minutes`,
      difficulty: ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)],
      attempts: Math.floor(Math.random() * 500) + 100,
    }));
  }, [activeSubject]);

  return (
    <ProtectedContent hasSubscription={hasSubscription} title="MCQs Practice" icon={<MdQuiz />} navigate={navigate}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center">
            <MdQuiz className="text-blue-500 mr-3" /> {activeSubject?.name || "Select a Subject"} MCQs Practice
          </h3>
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
            {/* tiny filter icon via CSS not necessary */}
          </div>
        </div>

        {!activeSubject && (
          <div className="text-center text-gray-600">Select a subject from the sidebar to view MCQ sets.</div>
        )}

        {activeSubject && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sets
              .filter((s) => selectedDifficulty === "All" || s.difficulty === selectedDifficulty)
              .map((set) => (
                <div key={set.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <MdQuiz className="text-blue-500 text-xl" />
                    </div>
                    <div>
                      <h4 className="font-medium text-lg">{set.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            set.difficulty === "Easy"
                              ? "bg-green-100 text-green-800"
                              : set.difficulty === "Medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
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
        )}
      </div>
    </ProtectedContent>
  );
};

export default Mcqs;
