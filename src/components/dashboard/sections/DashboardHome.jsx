import React from "react";
import { FaLock, FaVideo, FaHistory, FaBookmark, FaSearch, FaStar } from "react-icons/fa";
import { MdOutlineSchool, MdOutlineRateReview, MdOutlineInsertChart, MdAssignment, MdNotes, MdQuiz } from "react-icons/md";

const DashboardHome = ({
  currentUser,
  hasSubscription,
  navigate,
  searchQuery,
  setSearchQuery,
  subjects,
  activeSubject,
  setActiveSubject,
  handleContentAccess,
}) => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Welcome, {currentUser?.displayName?.split(" ")[0] || "User"}
        </h2>
        <div className="relative mt-3 md:mt-0 md:w-64">
          <input
            type="text"
            placeholder="Search resources..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      {!hasSubscription && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 p-5 rounded-lg">
          <div className="flex items-start">
            <div className="p-2 bg-blue-500 rounded-lg mr-4">
              <FaLock className="text-white text-xl" />
            </div>
            <div>
              <h3 className="font-medium text-lg text-blue-800 mb-2">Upgrade to Premium</h3>
              <p className="text-blue-700 mb-4">
                Unlock all subjects, past papers, MCQs practice, video lectures, and study notes
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => navigate("/subscribe")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium"
                >
                  Upgrade Now
                </button>
                <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">Learn More</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Subjects Enrolled</p>
              <h3 className="text-2xl font-bold mt-1">4</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <MdOutlineSchool className="text-blue-500 text-xl" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">Last added: Pharmacology</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">MCQs Attempted</p>
              <h3 className="text-2xl font-bold mt-1">1,248</h3>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <MdOutlineRateReview className="text-green-500 text-xl" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">Accuracy: 78%</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Video Hours</p>
              <h3 className="text-2xl font-bold mt-1">24.5</h3>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FaVideo className="text-purple-500 text-xl" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">Last watched: 2 days ago</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Study Progress</p>
              <h3 className="text-2xl font-bold mt-1">64%</h3>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <MdOutlineInsertChart className="text-yellow-500 text-xl" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">On track with peers</p>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-5 flex items-center">
            <FaHistory className="mr-2 text-blue-500" /> Recent Activity
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <MdQuiz className="text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">Anatomy - MCQ Practice Set 3</p>
                  <p className="text-sm text-gray-500">Completed 32/50 questions</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap">
                Continue Practice
              </button>
            </div>

            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                  <FaVideo className="text-purple-500" />
                </div>
                <div>
                  <p className="font-medium">Physiology - Cardiac Cycle</p>
                  <p className="text-sm text-gray-500">Watched 15/45 minutes</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap">
                Continue Watching
              </button>
            </div>

            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <MdAssignment className="text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Biochemistry - 2023 Past Paper</p>
                  <p className="text-sm text-gray-500">Downloaded 3 days ago</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap">
                Review Answers
              </button>
            </div>

            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                  <MdNotes className="text-yellow-500" />
                </div>
                <div>
                  <p className="font-medium">Pharmacology - Drug Classes</p>
                  <p className="text-sm text-gray-500">Saved to bookmarks</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap">
                View Notes
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-5 flex items-center">
            <FaBookmark className="mr-2 text-blue-500" /> Quick Access
          </h3>
          <div className="space-y-3">
            {[
              { id: "past-papers", label: "Past Papers", Icon: MdAssignment },
              { id: "mcqs", label: "MCQs Practice", Icon: MdQuiz },
              { id: "videos", label: "Video Lectures", Icon: FaVideo },
              { id: "notes", label: "Study Notes", Icon: MdNotes },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => handleContentAccess(id)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center">
                  <Icon className="text-blue-500 mr-3" />
                  <span>{label}</span>
                </div>
                <span className="text-gray-400">&rarr;</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Subjects */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold mb-5 flex items-center">
          <FaStar className="mr-2 text-blue-500" /> Recommended Subjects
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => setActiveSubject(subject)}
              className={`flex flex-col items-center p-4 rounded-lg border transition-all ${
                activeSubject?.id === subject.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              <div className={`p-3 rounded-full mb-2 ${subject.color.replace("text", "bg")}`}>
                {subject.icon}
              </div>
              <span className="text-sm font-medium">{subject.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;