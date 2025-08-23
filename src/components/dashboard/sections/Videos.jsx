import React, { useMemo } from "react";
import ProtectedContent from "../common/ProtectedContent";
import { FaVideo, FaPlay, FaStar } from "react-icons/fa";

const Videos = ({ activeSubject, hasSubscription, navigate }) => {
  const videos = useMemo(() => {
    return [
      "Introduction",
      "Key Concepts",
      "Clinical Applications",
      "Advanced Topics",
      "Case Studies",
      "Review Session",
    ].map((title, i) => ({
      id: i + 1,
      title: `${activeSubject?.name}: ${title}`,
      duration: `${Math.floor(Math.random() * 20) + 30} min`,
      views: Math.floor(Math.random() * 1000) + 200,
      instructor: ["Dr. Smith", "Prof. Johnson", "Dr. Lee"][Math.floor(Math.random() * 3)],
      thumbnail: `https://picsum.photos/300/200?random=${i}`,
    }));
  }, [activeSubject]);

  return (
    <ProtectedContent hasSubscription={hasSubscription} title="Video Lectures" icon={<FaVideo />} navigate={navigate}>
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center">
          <FaVideo className="text-blue-500 mr-3" /> {activeSubject?.name || "Select a Subject"} Video Lectures
        </h3>

        {!activeSubject && (
          <div className="text-center text-gray-600">Select a subject from the sidebar to view videos.</div>
        )}

        {activeSubject && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-40 object-cover" />
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="font-medium text-lg mb-1">{video.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">By {video.instructor}</p>
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <span className="flex items-center mr-3">
                      <FaPlay className="mr-1" /> {video.views.toLocaleString()} views
                    </span>
                    <span className="flex items-center">
                      <FaStar className="mr-1 text-yellow-400" /> 4.8
                    </span>
                  </div>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center">
                    <FaPlay className="mr-2" /> Watch Now
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

export default Videos;