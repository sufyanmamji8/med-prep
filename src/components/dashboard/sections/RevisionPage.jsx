import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RevisionPage = ({ onBack }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        console.log("🔍 Auth Check - Token:", token);
        console.log("🔍 Auth Check - User:", user);

        if (!token || !user) {
          setError("Please login to access this page.");
          setLoading(false);
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
        
        console.log("🚀 Starting API call with token:", token);

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
        
        // Process categories to ensure unique IDs
        const processedCategories = (res.data.data || res.data || []).map((category, catIndex) => ({
          ...category,
          processedId: category.id || `category-${catIndex}`,
          subcategories: (category.subcategories || []).map((sub, subIndex) => ({
            ...sub,
            // Create a unique ID combining category and subcategory
            processedId: sub.id || `${category.id || catIndex}-sub-${subIndex}`,
            // Ensure we have a unique name for identification
            uniqueName: sub.subcategory || sub.name || `Subject-${catIndex}-${subIndex}`
          }))
        }));
        
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

  // FIXED: Use processedId for unique identification
  const handleSubjectSelect = (subject) => {
    console.log("Selecting subject:", subject);
    setSelectedSubjects(prev => {
      const isSelected = prev.some(s => s.processedId === subject.processedId);
      console.log("Is selected:", isSelected);
      if (isSelected) {
        return prev.filter(s => s.processedId !== subject.processedId);
      } else {
        return [...prev, subject];
      }
    });
  };

  // FIXED: Use processedId for category selection
  const handleSelectAllInCategory = (category) => {
    const categorySubjects = category.subcategories || [];
    const allSelectedInCategory = categorySubjects.every(subject => 
      selectedSubjects.some(s => s.processedId === subject.processedId)
    );

    console.log("Select All - Category:", category.category, "All Selected:", allSelectedInCategory);

    if (allSelectedInCategory) {
      // Deselect all in this category only
      setSelectedSubjects(prev => 
        prev.filter(selected => 
          !categorySubjects.some(catSub => catSub.processedId === selected.processedId)
        )
      );
    } else {
      // Select all in this category, avoiding duplicates
      const newSelections = categorySubjects.filter(subject => 
        !selectedSubjects.some(s => s.processedId === subject.processedId)
      );
      setSelectedSubjects(prev => [...prev, ...newSelections]);
    }
  };

  const handleStartSession = () => {
    if (selectedSubjects.length === 0) return;
    
    console.log("Starting session with subjects:", selectedSubjects);
    alert(`Starting revision session with ${selectedSubjects.length} subjects selected!`);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const handleLogin = () => {
    navigate('/auth');
  };

  // Medical-themed background patterns
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
          onClick={onBack || (() => navigate("/dashboard"))}
          className="mb-6 px-6 py-3 bg-white/80 backdrop-blur-sm hover:bg-white border border-blue-200 transition-all duration-300 flex items-center gap-2 text-blue-700 font-medium shadow-sm"
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
          onClick={onBack || (() => navigate("/dashboard"))}
          className="mb-6 px-6 py-3 bg-white/80 backdrop-blur-sm hover:bg-white border border-blue-200 transition-all duration-300 flex items-center gap-2 text-blue-700 font-medium shadow-sm"
        >
          ← Back to Dashboard
        </button>
        
        <div className="bg-white/80 backdrop-blur-sm border border-blue-200 p-8 text-center max-w-2xl mx-auto rounded-lg shadow-sm">
          <div className="text-red-600 font-semibold text-xl mb-3">Error</div>
          <div className="text-red-500 mb-6">{error}</div>
          
          <div className="space-y-3">
            <button 
              onClick={handleRetry}
              className="w-full px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 font-medium shadow-sm"
            >
              Try Again
            </button>
            <button 
              onClick={handleLogin}
              className="w-full px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 font-medium shadow-sm"
            >
              Login Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 relative overflow-hidden">
      {/* Medical-themed background pattern */}
      <MedicalPattern />
      
      {/* Header */}
      <div className="mb-8 relative">
        <button
          onClick={onBack || (() => navigate("/dashboard"))}
          className="mb-6 px-6 py-3 bg-white/80 backdrop-blur-sm hover:bg-white border border-blue-200 transition-all duration-300 flex items-center gap-2 text-blue-700 font-medium shadow-sm"
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
          categories.map((category, index) => {
            const categoryId = category.processedId;
            const isExpanded = expandedCategories[categoryId];
            const subcategories = category.subcategories || [];
            const visibleSubcategories = isExpanded ? subcategories : subcategories.slice(0, 6);
            const hasMore = subcategories.length > 6;
            const categorySelectedCount = subcategories.filter(subject => 
              selectedSubjects.some(s => s.processedId === subject.processedId)
            ).length;

            return (
              <div 
                key={categoryId}
                className="bg-white/80 backdrop-blur-sm border border-blue-200 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-300"
                style={{ height: '420px' }}
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
                <div className="flex-1 p-4 overflow-y-auto">
                  <ul className="space-y-2">
                    {visibleSubcategories.length > 0 ? (
                      visibleSubcategories.map((subcategory, subIndex) => {
                        const isSelected = selectedSubjects.some(s => s.processedId === subcategory.processedId);
                        return (
                          <li
                            key={subcategory.processedId}
                            className="flex items-center gap-3 p-3 hover:bg-blue-50/50 cursor-pointer transition-all duration-200 group border border-transparent hover:border-blue-200 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSubjectSelect(subcategory)}
                              className="w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                            />
                            <span 
                              className={`font-medium text-sm transition-colors ${
                                isSelected ? 'text-blue-700' : 'text-gray-700 group-hover:text-blue-600'
                              }`}
                            >
                              {subcategory.subcategory || subcategory.name || "Unnamed Subcategory"}
                            </span>
                            <span className={`text-xs px-2 py-1 font-medium min-w-16 text-center transition-colors ${
                              isSelected 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                            }`}>
                              {subcategory.total_questions || subcategory.questions_count || 0} Qs
                            </span>
                          </li>
                        );
                      })
                    ) : (
                      <li className="text-blue-500 text-sm text-center py-4">
                        No subcategories available
                      </li>
                    )}
                  </ul>

                  {/* Show More/Less Button */}
                  {hasMore && (
                    <button
                      onClick={() => toggleCategory(categoryId)}
                      className="w-full mt-3 py-2 text-blue-600 hover:bg-blue-50 text-sm font-medium transition-all duration-200 border border-blue-200 rounded"
                    >
                      {isExpanded ? 'Show Less' : `+${subcategories.length - 6} More Topics`}
                    </button>
                  )}
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
          disabled={selectedSubjects.length === 0}
          className={`px-8 py-3 font-semibold text-white transition-all duration-300 ${
            selectedSubjects.length === 0
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
          }`}
        >
          Start New Session
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