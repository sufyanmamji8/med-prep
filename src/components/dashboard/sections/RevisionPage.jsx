import React, { useEffect, useState } from "react";
import axios from "axios";

const RevisionPage = ({ setActiveTab, onBack, onStartSession }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [startingSession, setStartingSession] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (!token || !user) {
          setError("Please login to access this page.");
          setLoading(false);
          return; // Stop further execution if not authenticated
        }
        
        setAuthChecked(true);
      } catch (error) {
        console.error("Auth check error:", error);
        setError("Authentication error. Please login again.");
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!authChecked) return;

    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          setError("Authentication token not found. Please login again.");
          setLoading(false);
          return;
        }

        const res = await axios.get(
          "http://mrbe.codovio.com/api/v1/revision/categories-count",
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log("✅ API Response:", res.data);
        
        // Process categories to ensure unique IDs and handle different API response formats
        const responseData = Array.isArray(res.data.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : [];
          
        const processedCategories = responseData.map((category, catIndex) => {
          // Ensure category has required fields
          const processedCategory = {
            ...category,
            id: category.id || `cat-${catIndex}`,
            name: category.name || category.category || `Category ${catIndex + 1}`,
            processedId: `cat-${category.id || catIndex}`
          };

          // Process subcategories
          const processedSubcategories = (category.subcategories || []).map((sub, subIndex) => ({
            ...sub,
            id: sub.id || `${category.id || catIndex}-sub-${subIndex}`,
            name: sub.name || sub.subcategory || `Subject-${catIndex}-${subIndex}`,
            category: category.name || category.category || processedCategory.name,
            categoryId: category.id || processedCategory.id,
            processedId: `sub-${sub.id || subIndex}`,
            uniqueName: sub.name || sub.subcategory || `Subject-${catIndex}-${subIndex}`
          }));

          return {
            ...processedCategory,
            subcategories: processedSubcategories
          };
        });
        
        console.log("Processed Categories:", processedCategories);
        setCategories(processedCategories);
        
      } catch (err) {
        console.error("❌ API Error:", err);
        console.log("Error details:", err.response?.data);
        
        if (err.response?.status === 401) {
          setError("Authentication failed. Please login again.");
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } else if (err.response?.status === 404) {
          setError("API endpoint not found. Please check the URL.");
        } else {
          setError(err.response?.data?.message || err.message || "Failed to fetch categories");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [authChecked]);

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleSubjectSelect = (subject) => {
    setSelectedSubjects(prev => {
      // Create a unique key using both category and subject IDs
      const subjectKey = `${subject.categoryId || 'cat'}-${subject.id || 'sub'}`;
      const isSelected = prev.some(s => 
        `${s.categoryId || 'cat'}-${s.id || 'sub'}` === subjectKey
      );
      
      if (isSelected) {
        return prev.filter(s => 
          `${s.categoryId || 'cat'}-${s.id || 'sub'}` !== subjectKey
        );
      } else {
        return [...prev, subject];
      }
    });
  };

  const handleSelectAllInCategory = (category) => {
    const categorySubjects = category.subcategories || [];
    
    // Check if all subjects in this category are already selected
    const allSelectedInCategory = categorySubjects.every(subject => 
      selectedSubjects.some(s => 
        s.id === subject.id && 
        (s.categoryId === subject.categoryId || 
         s.category === subject.category)
      )
    );

    if (allSelectedInCategory) {
      // If all are selected, deselect all in this category
      setSelectedSubjects(prev => 
        prev.filter(selected => 
          !categorySubjects.some(catSub => 
            catSub.id === selected.id && 
            (catSub.categoryId === selected.categoryId || 
             catSub.category === selected.category)
          )
        )
      );
    } else {
      // Otherwise, select all in this category that aren't already selected
      const newSelections = categorySubjects.filter(subject => 
        !selectedSubjects.some(s => 
          s.id === subject.id && 
          (s.categoryId === subject.categoryId || 
           s.category === subject.category)
        )
      );
      setSelectedSubjects(prev => [...prev, ...newSelections]);
    }
  };

  // Helper function to process successful API response
  const processSessionResponse = (apiResponse, selectedSubjects) => {
    console.log("🔍 Processing session response:", apiResponse);
    
    // Extract questions from various possible locations in the response
    let questions = [];
    let sessionId = '';
    
    // Try different possible locations for questions
    if (Array.isArray(apiResponse)) {
      questions = apiResponse; // Direct array of questions
    } 
    else if (Array.isArray(apiResponse.questions)) {
      questions = apiResponse.questions;
    } 
    else if (apiResponse.data) {
      if (Array.isArray(apiResponse.data)) {
        questions = apiResponse.data;
      } 
      else if (apiResponse.data.questions) {
        questions = apiResponse.data.questions;
      }
      else if (apiResponse.data.data && Array.isArray(apiResponse.data.data)) {
        questions = apiResponse.data.data;
      }
    }
    
    // Try to get session ID from different locations
    sessionId = apiResponse.session_id || 
               apiResponse.data?.session_id || 
               apiResponse.sessionId ||
               `session-${Date.now()}`;
    
    console.log("📝 Extracted questions:", questions);
    console.log("🔑 Session ID:", sessionId);
    
    if (!questions || questions.length === 0) {
      const errorMsg = apiResponse.message || "No questions found in the response. The test bank might be empty for the selected subjects.";
      console.error(errorMsg);
      setError(errorMsg);
      setStartingSession(false);
      return;
    }
    
    // Create session data object
    const sessionData = {
      sessionData: apiResponse,
      selectedSubjects: selectedSubjects,
      questions: questions,
      sessionId: sessionId
    };
    
    console.log("💾 Session data to be saved:", sessionData);
    
    // Store in localStorage as backup
    try {
      localStorage.setItem('currentSession', JSON.stringify(sessionData));
    } catch (e) {
      console.error("Failed to save session to localStorage:", e);
    }
    
    // Pass session data to parent component
    if (onStartSession) {
      console.log("📤 Passing session data to parent");
      onStartSession(sessionData);
    } else {
      console.log("🚀 Starting session directly");
      setActiveTab("questions");
    }
  };

  const handleStartSession = async () => {
    if (selectedSubjects.length === 0) {
      setError("Please select at least one subject to start a session.");
      return;
    }

    setStartingSession(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      // Format subjects for the API with proper error handling
      const subcategories = selectedSubjects.map(subject => {
        // Validate required fields
        if (!subject.id || !subject.name) {
          console.warn('Invalid subject data:', subject);
          return null;
        }
        
        return {
          category: subject.category || (categories.find(cat => 
            cat.subcategories?.some(sub => sub.id === subject.id)
          )?.name || 'General'),
          subcategory: subject.name || subject.subcategory || subject.uniqueName
        };
      }).filter(Boolean); // Remove any null entries from invalid subjects

      if (subcategories.length === 0) {
        throw new Error('No valid subjects selected');
      }

      // Create payload with proper structure
      const payload = { 
        subcategories: subcategories,
        select_all: false 
      };

      console.log("🔍 Selected subjects:", selectedSubjects);
      // Create a custom stringify function to control the formatting
      const customStringify = (obj) => {
        return JSON.stringify(obj, null, 2)
          .replace(/\{\s*\n\s*"(\w+)":/g, '{ "$1":')
          .replace(/,\s*\n\s*"(\w+)":/g, ', "$1":');
      };
      
      console.log("🟢 Sending payload:", customStringify(payload));

      const response = await axios.post(
        "http://mrbe.codovio.com/api/v1/revision/start",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      console.log("✅ API Response:", response.data);

      // Process the response
      if (response.status === 200) {
        // Try different response formats
        let questions = [];
        
        // Check different possible locations for questions
        if (Array.isArray(response.data)) {
          questions = response.data; // Direct array of questions
        } else if (response.data?.questions) {
          questions = response.data.questions;
        } else if (response.data?.data?.questions) {
          questions = response.data.data.questions;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          questions = response.data.data;
        }
        
        console.log("🔍 Found questions:", questions);
        
        if (questions && questions.length > 0) {
          processSessionResponse({
            ...response.data,
            questions: questions
          }, selectedSubjects);
        } else {
          throw new Error("No questions found in the response. The test bank might be empty for the selected subjects.");
        }
      } else {
        throw new Error(response.data?.message || "Failed to start session");
      }
    } catch (error) {
      console.error("❌ Failed to start session:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to start session. Please try again.";
      
      setError(errorMessage);
      
      // Only show alert for non-401 errors
      if (error.response?.status !== 401) {
        alert(errorMessage);
      }
      
      // Handle 401 Unauthorized
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    } finally {
      setStartingSession(false);
    }
  };

  const MedicalPattern = () => (
    <div className="absolute inset-0 opacity-5 pointer-events-none">
      <div className="absolute top-10 left-10 w-20 h-20 border-2 border-blue-400"></div>
      <div className="absolute top-40 right-20 w-16 h-16 border-2 border-blue-400 rotate-45"></div>
      <div className="absolute bottom-20 left-32 w-24 h-24 border-2 border-blue-400 rounded-full"></div>
      <div className="absolute bottom-40 right-40 w-12 h-12 border-2 border-blue-400"></div>
      <div className="absolute top-60 left-60 w-28 h-28 border-2 border-blue-400 rotate-12"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 relative overflow-hidden">
        <MedicalPattern />
        <button
          onClick={onBack}
          className="mb-6 px-6 py-3 bg-white/80 backdrop-blur-sm hover:bg-white border border-blue-200 transition-all duration-300 flex items-center gap-2 text-blue-700 font-medium shadow-sm rounded-lg"
        >
          <span>←</span>
          Back to Dashboard
        </button>
        <div className="text-center py-20">
          <div className="animate-spin h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-blue-700 font-medium">Loading revision categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 relative overflow-hidden">
        <MedicalPattern />
        <button
          onClick={onBack}
          className="mb-6 px-6 py-3 bg-white/80 backdrop-blur-sm hover:bg-white border border-blue-200 transition-all duration-300 flex items-center gap-2 text-blue-700 font-medium shadow-sm rounded-lg"
        >
          ← Back to Dashboard
        </button>
        
        <div className="bg-white/80 backdrop-blur-sm border border-blue-200 p-8 text-center max-w-2xl mx-auto rounded-lg shadow-sm">
          <div className="text-red-600 font-semibold text-xl mb-3">Error</div>
          <div className="text-red-500 mb-6">{error}</div>
          
          <button 
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 font-medium shadow-sm rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 relative overflow-hidden">
      <MedicalPattern />
      
      {/* Header */}
      <div className="mb-8 relative">
        <button
          onClick={onBack}
          className="mb-6 px-6 py-3 bg-white/80 backdrop-blur-sm hover:bg-white border border-blue-200 transition-all duration-300 flex items-center gap-2 text-blue-700 font-medium shadow-sm rounded-lg"
        >
          <span>←</span>
          Back to Dashboard
        </button>
        <h1 className="text-4xl font-bold text-blue-900 mb-3">Revision Categories</h1>
        <p className="text-blue-700 text-lg">Select subjects to create your revision session</p>
      </div>

      {/* Selected Subjects Summary */}
      {selectedSubjects.length > 0 && (
        <div className="mb-6 bg-white/80 backdrop-blur-sm border border-blue-200 p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-blue-800 font-semibold">
                {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} selected
              </span>
              <span className="text-blue-600 text-sm ml-3">
                Total questions: {selectedSubjects.reduce((total, sub) => total + (sub.total_questions || 0), 0)}
              </span>
            </div>
            <button
              onClick={() => setSelectedSubjects([])}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {categories.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-lg shadow-sm">
            <p className="text-blue-600 text-lg">No categories found.</p>
          </div>
        ) : (
          categories.map((category) => {
            const categoryId = category.processedId;
            const isExpanded = expandedCategories[categoryId];
            const subcategories = category.subcategories || [];
            // Always show 4 items when collapsed, plus the "Show more" button
            const visibleSubcategories = isExpanded ? subcategories : subcategories.slice(0, 5);
            const hasMore = subcategories.length > 5;
            const categorySelectedCount = subcategories.filter(subject => 
              selectedSubjects.some(s => s.processedId === subject.processedId)
            ).length;

            return (
              <div 
                key={categoryId}
                className="bg-white/80 backdrop-blur-sm border border-blue-200 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-300 rounded-lg"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: 'auto'
                }}
              >
                {/* Category Header */}
                <div className="bg-blue-600 text-white p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold">
                        {category.category || category.name || "Unnamed Category"}
                      </h2>
                      <p className="text-white/90 text-sm mt-1">
                        {subcategories.length} Topics • {categorySelectedCount} Selected
                      </p>
                    </div>
                    <button
                      onClick={() => handleSelectAllInCategory(category)}
                      className="text-white/90 hover:text-white text-sm font-medium bg-white/20 px-3 py-1 rounded transition-colors"
                    >
                      {categorySelectedCount === subcategories.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                </div>

                {/* Subcategories List */}
                <div className="flex-1 p-4">
                  <ul className="space-y-2">
                    {visibleSubcategories.length > 0 ? (
                      <>
                        {/* First 4 subcategories */}
                        {visibleSubcategories.slice(0, 4).map((subcategory) => (
                          <li
                            key={`${subcategory.categoryId || 'cat'}-${subcategory.id || 'sub'}`}
                            className="flex items-center gap-3 p-3 hover:bg-blue-50/50 cursor-pointer transition-all duration-200 group border border-transparent hover:border-blue-200 rounded"
                            onClick={() => handleSubjectSelect(subcategory)}
                          >
                            <input
                              type="checkbox"
                              checked={selectedSubjects.some(s => 
                                `${s.categoryId || 'cat'}-${s.id || 'sub'}` === `${subcategory.categoryId || 'cat'}-${subcategory.id || 'sub'}`
                              )}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleSubjectSelect(subcategory);
                              }}
                              className="w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1 flex justify-between items-center">
                              <span 
                                className={`font-medium text-sm transition-colors ${
                                  selectedSubjects.some(s => 
                                    `${s.categoryId || 'cat'}-${s.id || 'sub'}` === `${subcategory.categoryId || 'cat'}-${subcategory.id || 'sub'}`
                                  ) ? 'text-blue-700' : 'text-gray-700 group-hover:text-blue-600'
                                }`}
                              >
                                {subcategory.name || subcategory.subcategory}
                              </span>
                              {(subcategory.total_questions || subcategory.questions_count) && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                  {subcategory.total_questions || subcategory.questions_count} Qs
                                </span>
                              )}
                            </div>
                          </li>
                        ))}
                        
                        {/* Remaining subcategories when expanded */}
                        {isExpanded && visibleSubcategories.slice(4).map((subcategory) => (
                          <li
                            key={`${subcategory.categoryId || 'cat'}-${subcategory.id || 'sub'}`}
                            className="flex items-center gap-3 p-3 hover:bg-blue-50/50 cursor-pointer transition-all duration-200 group border border-transparent hover:border-blue-200 rounded"
                            onClick={() => handleSubjectSelect(subcategory)}
                          >
                            <input
                              type="checkbox"
                              checked={selectedSubjects.some(s => 
                                `${s.categoryId || 'cat'}-${s.id || 'sub'}` === `${subcategory.categoryId || 'cat'}-${subcategory.id || 'sub'}`
                              )}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleSubjectSelect(subcategory);
                              }}
                              className="w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1 flex justify-between items-center">
                              <span 
                                className={`font-medium text-sm transition-colors ${
                                  selectedSubjects.some(s => 
                                    `${s.categoryId || 'cat'}-${s.id || 'sub'}` === `${subcategory.categoryId || 'cat'}-${subcategory.id || 'sub'}`
                                  ) ? 'text-blue-700' : 'text-gray-700 group-hover:text-blue-600'
                                }`}
                              >
                                {subcategory.name || subcategory.subcategory}
                              </span>
                              {(subcategory.total_questions || subcategory.questions_count) && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                  {subcategory.total_questions || subcategory.questions_count} Qs
                                </span>
                              )}
                            </div>
                          </li>
                        ))}
                        
                        {/* Show More/Less Buttons */}
                        {hasMore && (
                          <li className="mt-2">
                            <button
                              onClick={() => toggleCategory(categoryId)}
                              className="w-full flex items-center justify-center gap-2 text-blue-600 hover:bg-blue-50 py-2 px-3 rounded-md transition-colors text-sm font-medium border border-blue-200"
                            >
                              {isExpanded ? (
                                <>
                                  Show less
                                  <svg 
                                    className="w-4 h-4 transform rotate-180"
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </>
                              ) : (
                                <>
                                  Show {subcategories.length - 4} more topics
                                  <svg 
                                    className="w-4 h-4"
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </>
                              )}
                            </button>
                          </li>
                        )}
                      </>
                    ) : (
                      <li className="text-blue-500 text-sm text-center py-4">
                        No subcategories available
                      </li>
                    )}
                  </ul>
                </div>

                {/* Total Questions Footer */}
                {subcategories.length > 0 && (
                  <div className="border-t border-blue-200 bg-blue-50/50 px-4 py-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-blue-700">Total Questions</span>
                      <span className="font-bold text-blue-800">
                        {subcategories.reduce((total, sub) => 
                          total + (sub.total_questions || sub.questions_count || 0), 0
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Centered Start Session Button */}
      <div className="flex justify-center mb-12">
        <button
          onClick={handleStartSession}
          disabled={selectedSubjects.length === 0 || startingSession}
          className={`px-8 py-4 font-semibold text-white transition-all duration-300 flex items-center gap-3 rounded-lg ${
            selectedSubjects.length === 0 || startingSession
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
          }`}
        >
          {startingSession ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              Starting Session...
            </>
          ) : (
            `Start New Session (${selectedSubjects.length} subjects)`
          )}
        </button>
      </div>

      {/* Stats Summary */}
      {categories.length > 0 && (
        <div className="mt-8 bg-white/80 backdrop-blur-sm border border-blue-200 p-6 rounded-lg shadow-sm mb-20">
          <h3 className="text-xl font-semibold text-blue-900 mb-4">Revision Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50/50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
              <div className="text-sm text-blue-700">Categories</div>
            </div>
            <div className="text-center p-4 bg-blue-50/50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">
                {categories.reduce((total, cat) => total + (cat.subcategories?.length || 0), 0)}
              </div>
              <div className="text-sm text-blue-700">Total Topics</div>
            </div>
            <div className="text-center p-4 bg-blue-50/50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">
                {categories.reduce((total, cat) => 
                  total + (cat.subcategories?.reduce((subTotal, sub) => 
                    subTotal + (sub.total_questions || sub.questions_count || 0), 0) || 0
                  ), 0
                )}
              </div>
              <div className="text-sm text-blue-700">Total Questions</div>
            </div>
            <div className="text-center p-4 bg-blue-50/50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">
                {Math.ceil(categories.reduce((total, cat) => 
                  total + (cat.subcategories?.reduce((subTotal, sub) => 
                    subTotal + (sub.total_questions || sub.questions_count || 0), 0) || 0
                  ), 0
                ) / 60)}
              </div>
              <div className="text-sm text-blue-700">Study Hours</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevisionPage;