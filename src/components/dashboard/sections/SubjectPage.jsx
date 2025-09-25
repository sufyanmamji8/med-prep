import React, { useState, useEffect } from "react";
import { FaHistory, FaUserPlus, FaUserMinus, FaTimes } from "react-icons/fa";
import { MdQuiz, MdNotes } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";

// ImageSlider Component
const ImageSlider = ({ images, altText }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="relative bg-white rounded-lg p-4 border border-gray-200">
      <div className="overflow-x-auto">
        <div className="flex justify-center min-w-min">
          <img
            src={images[currentIndex].startsWith("http") ? images[currentIndex] : `${window.location.origin}${images[currentIndex]}`}
            alt={`${altText} - ${currentIndex + 1}`}
            className="max-w-none h-auto rounded-lg shadow-md max-h-96"
            onError={(e) => {
              e.target.style.display = 'none';
              setTimeout(nextSlide, 100);
            }}
          />
        </div>
      </div>
      
      {images.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center shadow-lg border border-gray-200 transition-all hover:scale-110"
          >
            ←
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center shadow-lg border border-gray-200 transition-all hover:scale-110"
          >
            →
          </button>
          
          <div className="flex justify-center mt-4 space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex ? 'bg-blue-500 scale-110' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
};

// Recursive filter function to remove blocked keys
const filterSubjectDetails = (details) => {
  const blockedKeys = ["Video Lectures", "Past Papers"];
  if (!details) return details;

  if (typeof details === "object" && !Array.isArray(details)) {
    return Object.entries(details)
      .filter(([k]) => !blockedKeys.includes(k))
      .reduce((acc, [k, v]) => {
        acc[k] = filterSubjectDetails(v);
        return acc;
      }, {});
  } else if (Array.isArray(details)) {
    return details.map(filterSubjectDetails);
  }
  return details;
};

const SubjectPage = ({ activeSubject, subjectDetails, loadingDetails, handleContentAccess: parentHandleContentAccess }) => {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const [showLocalHtml, setShowLocalHtml] = useState(false);
  const [subjectMap, setSubjectMap] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [action, setAction] = useState(""); // Tracks whether it's enroll or disenroll

  useEffect(() => {
    fetch("/subject-map.json")
      .then((res) => res.json())
      .then((data) => setSubjectMap(data))
      .catch((err) => console.error("Error loading subject-map.json:", err));
  }, []);

  // Check enrollment status when activeSubject changes
  useEffect(() => {
    if (activeSubject) {
      const enrolledSubjects = JSON.parse(localStorage.getItem('enrolledSubjects') || '[]');
      setIsEnrolled(enrolledSubjects.includes(activeSubject.id));
    }
  }, [activeSubject]);

  const handleEnrollToggle = () => {
    if (!activeSubject) return;
    setAction(isEnrolled ? "disenroll" : "enroll");
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    if (!activeSubject) return;

    const enrolledSubjects = JSON.parse(localStorage.getItem('enrolledSubjects') || '[]');

    if (action === "enroll") {
      const updatedSubjects = [...enrolledSubjects, activeSubject.id];
      localStorage.setItem('enrolledSubjects', JSON.stringify(updatedSubjects));
      setIsEnrolled(true);
    } else if (action === "disenroll") {
      const updatedSubjects = enrolledSubjects.filter(id => id !== activeSubject.id);
      localStorage.setItem('enrolledSubjects', JSON.stringify(updatedSubjects));
      setIsEnrolled(false);
    }
    setShowConfirmation(false);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  const filteredDetails = filterSubjectDetails(subjectDetails);

  const statsData = [
    { id: "progress", label: "Progress", value: "64%" },
    { id: "mcqs_done", label: "MCQs Done", value: "120" },
    { id: "notes", label: "Notes Read", value: "12" },
  ];

  const quickItems = [
    { id: "mcqs", label: "MCQs Practice", Icon: MdQuiz },
    { id: "notes", label: "Study Notes", Icon: MdNotes },
  ];

  const subjectKey = activeSubject?.slug;
  const localHtml = subjectKey && subjectMap ? subjectMap[subjectKey]?.localHtml : null;

  const handleContentAccess = (id) => {
    if (!activeSubject) {
      alert("Select a subject first!");
      return;
    }
    if (parentHandleContentAccess) {
      parentHandleContentAccess(id);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Subject Header with Enroll Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-gray-500">Subject</p>
          <h1 className="text-2xl font-bold">{activeSubject?.name || "Subject"}</h1>
          {activeSubject?.chapter && (
            <p className="text-sm text-gray-400">Chapter: {activeSubject.chapter}</p>
          )}
        </div>
        
        {/* Enroll/Disenroll Button */}
        {activeSubject && (
          <button
            onClick={handleEnrollToggle}
            className={`mt-4 sm:mt-0 px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 ${
              isEnrolled
                ? "bg-red-100 text-red-700 border border-red-200 hover:bg-red-200"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isEnrolled ? (
              <>
                <FaUserMinus className="text-sm" />
                <span>Disenroll</span>
              </>
            ) : (
              <>
                <FaUserPlus className="text-sm" />
                <span>Enroll Now</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Enrollment Status Message */}
      {activeSubject && (
        <div className="text-sm mt-2">
          {isEnrolled ? (
            <p className="text-green-600">You are enrolled in <strong>{activeSubject.name}</strong>.</p>
          ) : (
            <p className="text-red-600">You are not enrolled in this subject yet.</p>
          )}
        </div>
      )}

    {/* Details Section */}
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-all duration-300">
  {loadingDetails ? (
    <div className="flex items-center justify-center py-10">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  ) : !activeSubject ? (
    <div className="text-center py-8">
      <div className="text-4xl text-gray-300 mb-3">📚</div>
      <p className="text-gray-500 font-medium">Select a subject to see details</p>
    </div>
  ) : showLocalHtml && localHtml ? (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">{activeSubject.name}</h3>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Offline Mode</span>
      </div>
      <iframe
        src={localHtml}
        title={activeSubject.name}
        className="w-full h-[75vh] border-0 rounded-lg shadow-inner"
      />
    </div>
  ) : (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-bold text-gray-800">{activeSubject.name}</h3>
        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Subject Details</span>
      </div>
      
      {/* Image Slider at the Top */}
      {(() => {
        const extractAllImages = (details) => {
          const images = [];
          
          if (typeof details === "string") {
            const imgRegex = /<img[^>]+src="([^">]+)"/g;
            let match;
            while ((match = imgRegex.exec(details)) !== null) {
              images.push(match[1]);
            }
          } else if (typeof details === "object" && details !== null) {
            const extractFromObject = (obj) => {
              Object.values(obj).forEach(value => {
                if (typeof value === "string" && value.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
                  images.push(value);
                } else if (Array.isArray(value)) {
                  value.forEach(item => {
                    if (typeof item === "string" && item.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
                      images.push(item);
                    }
                  });
                } else if (typeof value === "object" && value !== null) {
                  extractFromObject(value);
                }
              });
            };
            extractFromObject(details);
          }
          
          return images;
        };

        const allImages = extractAllImages(filteredDetails);
        
        if (allImages.length > 0) {
          return (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                Images
              </h4>
              <ImageSlider images={allImages} altText={activeSubject.name} />
            </div>
          );
        }
        return null;
      })()}
      
      {/* Content Display */}
      {typeof filteredDetails === "string" ? (
        <div className="subject-content space-y-4">
          <div
            dangerouslySetInnerHTML={{
              __html: filteredDetails
                .replace(/HTML Content|HTMIL Content/gi, '')
                .replace(
                  /<img[^>]*>/g,
                  '' // Remove images since they're now in the slider above
                )
                .replace(
                  /<table/g,
                  '<div class="overflow-x-auto w-full"><table class="min-w-full table-auto" style="table-layout: fixed; width: 100%;"'
                )
                .replace(
                  /<\/table>/g,
                  '</table></div>'
                )
                .replace(
                  /<td/g,
                  '<td style="word-wrap: break-word; overflow-wrap: break-word;"'
                )
                .replace(
                  /<th/g,
                  '<th style="word-wrap: break-word; overflow-wrap: break-word;"'
                )
            }}
            className="w-full overflow-hidden break-words"
            style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
          />
        </div>
      ) : (
        Object.entries(filteredDetails || {}).map(([key, value]) => {
          const isImage = typeof value === "string" && value.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
          const isImageArray = Array.isArray(value) && value.every(item => typeof item === "string" && item.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i));
          
          if (isImage || isImageArray) return null;
          
          return (
            <div
              key={key}
              className="bg-gray-50 rounded-xl p-4 md:p-6 border border-gray-200 hover:shadow-md transition-all duration-200 w-full"
            >
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center break-words">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-3 flex-shrink-0"></span>
                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h4>

              {typeof value === "string" ? (
                value.startsWith('http') ? (
                  <div className="bg-white rounded-lg p-3 border border-gray-200 w-full">
                    <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 break-all">
                      🔗 {value}
                    </a>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-4 border border-gray-200 w-full">
                    <div 
                      className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words w-full"
                      style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                    >
                      {value}
                    </div>
                  </div>
                )
              ) : Array.isArray(value) ? (
                <div className="space-y-2 w-full">
                  {value.map((item, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-gray-200 w-full">
                      <div 
                        className="text-gray-700 break-words"
                        style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                      >
                        {String(item)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg p-4 border border-gray-200 w-full overflow-x-auto">
                  <pre 
                    className="whitespace-pre-wrap text-sm text-gray-600 break-words"
                    style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                  >
                    {JSON.stringify(value, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  )}

  {localHtml && (
    <div className="flex justify-center mt-6">
      <button
        onClick={() => setShowLocalHtml((prev) => !prev)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 flex items-center"
      >
        <span className="mr-2">{showLocalHtml ? "📄" : "🌐"}</span>
        {showLocalHtml ? "Show API Details" : "Show Offline Details"}
      </button>
    </div>
  )}
</div>

      {/* Stats + Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-400 p-6 space-y-4 hover:shadow-md transition">
          <h3 className="text-lg font-semibold">Stats</h3>
          <ul className="space-y-2 text-gray-700">
            {statsData.map((s) => (
              <li key={s.id} className="flex justify-between hover:bg-gray-50 p-2 rounded-md transition">
                <span className="text-sm text-gray-600">{s.label}</span>
                <span className="font-medium">{s.value}</span>
              </li>
            ))}
          </ul>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Quick Access</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickItems.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => handleContentAccess(id)}
                  className="flex items-center justify-between px-3 py-2 rounded-md border hover:bg-gray-50 transition text-sm"
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="text-blue-500" />
                    <span>{label}</span>
                  </div>
                  <span className="text-gray-400">&rarr;</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-400 p-6 hover:shadow-md transition">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FaHistory className="mr-2 text-blue-500" /> Recent Activity
          </h3>
          <div className="text-sm text-gray-600">
            <p>No recent activity yet for this subject.</p>
          </div>
        </div>
      </div>

      {/* Custom Confirmation Container */}
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20">
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300 relative w-full max-w-md">
            <button
              onClick={handleCancel}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={20} />
            </button>

            <h2 className="text-lg font-semibold mb-4">
              {action === "enroll" ? "Confirm Enrollment" : "Confirm Disenrollment"}
            </h2>
            <p className="mb-6">
              Are you sure you want to{" "}
              {action === "enroll" ? "enroll in" : "disenroll from"}{" "}
              <strong>{activeSubject?.name}</strong>?
            </p>

            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 rounded ${
                  action === "enroll"
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                {action === "enroll" ? "Enroll" : "Disenroll"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectPage;