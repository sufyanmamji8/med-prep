import React, { useState } from "react";
import { FaArrowLeft, FaCheck, FaCrown, FaStar, FaRocket, FaDownload, FaHeadset } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const SubscriptionPage = ({ setHasSubscription }) => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("annual");

  const handleSubscribe = () => {
    if (typeof setHasSubscription === "function") {
      setHasSubscription(true);
    }
    navigate("/dashboard");
  };

  const plans = {
    monthly: {
      name: "Monthly Plan",
      price: "9.99",
      period: "month",
      savings: null,
      popular: false,
      features: [
        "Access to all subjects",
        "Unlimited MCQs practice",
        "Download past papers",
        "Basic progress tracking",
        "Email support"
      ]
    },
    annual: {
      name: "Annual Plan",
      price: "99.99",
      period: "year",
      savings: "Save 20%",
      popular: true,
      features: [
        "Everything in Monthly Plan",
        "Priority 24/7 support",
        "Offline access to content",
        "Advanced analytics",
        "Early access to new features",
        "Custom study plans"
      ]
    }
  };

  const features = [
    {
      icon: FaRocket,
      title: "Unlimited Access",
      description: "Full access to all subjects and learning materials"
    },
    {
      icon: FaDownload,
      title: "Download Resources",
      description: "Access and download past papers and study materials"
    },
    {
      icon: FaStar,
      title: "Premium Features",
      description: "Advanced analytics and personalized learning paths"
    },
    {
      icon: FaHeadset,
      title: "Priority Support",
      description: "24/7 dedicated support for all your queries"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      {/* Header with Back Button */}
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-700 hover:text-blue-900 mb-6 transition-colors duration-200 group text-sm"
        >
          <FaArrowLeft className="mr-1.5 group-hover:-translate-x-0.5 transition-transform text-sm" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-8">
        <div className="inline-flex items-center bg-blue-100 text-blue-600 rounded-full px-3 py-1.5 mb-4 border border-blue-200 text-xs">
          <FaCrown className="text-yellow-500 mr-1.5 text-xs" />
          <span className="font-medium">Premium Features</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          Upgrade Your
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Learning</span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-sm">
          Unlock exclusive features, unlimited access, and accelerate your learning journey with our premium plans.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          {Object.entries(plans).map(([key, plan]) => (
            <div
              key={key}
              className={`relative rounded-xl p-6 transition-all duration-200 hover:scale-[1.02] ${
                plan.popular
                  ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-500 shadow-lg shadow-blue-500/10"
                  : "bg-white border border-gray-200 hover:border-gray-300 shadow-sm"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center">
                    <FaStar className="mr-2" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <div className="flex items-baseline justify-center mb-1">
                  <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-500 ml-1 text-sm">/{plan.period}</span>
                </div>
                {plan.savings && (
                  <div className="inline-block bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium mt-1">
                    {plan.savings}
                  </div>
                )}
              </div>

              <ul className="space-y-2.5 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-gray-700 text-sm">
                    <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <FaCheck className="text-green-500 text-[10px]" />
                    </div>
                    <span className="leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  setSelectedPlan(key);
                  handleSubscribe();
                }}
                className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  plan.popular
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-md hover:shadow-blue-500/15"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>

        {/* Feature Grid */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-8">
            Everything You Need to <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Succeed</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-4 rounded-lg bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 transition-all duration-200 group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform duration-200">
                  <feature.icon className="text-lg text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5 text-sm">{feature.title}</h3>
                <p className="text-gray-600 text-xs leading-snug">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center mt-8">
          <div className="flex flex-wrap justify-center items-center gap-4 text-gray-500 text-xs">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center mr-1.5">
                <FaCheck className="text-white text-[10px]" />
              </div>
              <span>Secure payment</span>
            </div>
            <div className="flex items-center">
              <FaHeadset className="text-blue-500 mr-1.5 text-sm" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;