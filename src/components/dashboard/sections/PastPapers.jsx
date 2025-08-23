import React, { useMemo } from "react";
import ProtectedContent from "../common/ProtectedContent";
import { MdAssignment } from "react-icons/md";
import { FaClock, FaDownload, FaStar } from "react-icons/fa";

const PastPapers = ({ activeSubject, selectedYear, setSelectedYear, hasSubscription, navigate }) => {
  const papers = useMemo(() => {
    return [2023, 2022, 2021, 2020].map((year) => ({
      id: year,
      title: `${activeSubject?.name} ${year} Past Paper`,
      questions: Math.floor(Math.random() * 50) + 50,
      duration: "3 hours",
      downloads: Math.floor(Math.random() * 1000) + 500,
      rating: (Math.random() * 1 + 4).toFixed(1),
    }));
  }, [activeSubject]);

  return (
    <ProtectedContent hasSubscription={hasSubscription} title="Past Papers" icon={<MdAssignment />} navigate={navigate}>
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center">
          <MdAssignment className="text-blue-500 mr-3" /> {activeSubject?.name || "Select a Subject"} Past Papers
        </h3>

        {!activeSubject && (
          <div className="text-center text-gray-600">Select a subject from the sidebar to view past papers.</div>
        )}

        {activeSubject && (
          <>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Year:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All</option>
                {[2023, 2022, 2021, 2020].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
              {papers
                .filter((paper) => selectedYear === "All" || paper.title.includes(selectedYear))
                .map((paper) => (
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
                        <FaDownload className="mr-2" /> Download
                      </button>
                      <button className="flex-1 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 px-4 rounded-lg text-sm font-medium">
                        View Online
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </ProtectedContent>
  );
};

export default PastPapers;
