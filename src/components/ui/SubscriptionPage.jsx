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
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 py-8 px-4 sm:px-6 lg:px-8">
      {/* Header with Back Button */}
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-all duration-200 group text-sm font-medium"
        >
          <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Dashboard
        </button>
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-12 lg:mb-16">
        <div className="inline-flex items-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full px-4 py-2 mb-6 shadow-lg shadow-blue-500/25">
          <FaCrown className="text-yellow-300 mr-2" />
          <span className="font-semibold text-sm">Premium Features</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Upgrade Your{" "}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Learning Experience
          </span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
          Unlock exclusive features, unlimited access, and accelerate your learning journey with our premium plans designed for success.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto mb-16 lg:mb-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {Object.entries(plans).map(([key, plan]) => (
            <div
              key={key}
              className={`relative rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] ${
                plan.popular
                  ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-2xl shadow-blue-500/30 transform lg:-translate-y-4"
                  : "bg-white border border-gray-200 hover:border-gray-300 shadow-xl hover:shadow-2xl hover:shadow-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide flex items-center shadow-lg">
                    <FaStar className="mr-2" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className={`text-2xl font-bold mb-3 ${plan.popular ? "text-white" : "text-gray-900"}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center mb-2">
                  <span className={`text-4xl lg:text-5xl font-bold ${plan.popular ? "text-white" : "text-gray-900"}`}>
                    ${plan.price}
                  </span>
                  <span className={`ml-2 text-lg ${plan.popular ? "text-blue-100" : "text-gray-500"}`}>
                    /{plan.period}
                  </span>
                </div>
                {plan.savings && (
                  <div className="inline-block bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold mt-2">
                    {plan.savings}
                  </div>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 ${
                      plan.popular ? "bg-blue-400/30" : "bg-blue-100"
                    }`}>
                      <FaCheck className={plan.popular ? "text-white text-xs" : "text-blue-500 text-xs"} />
                    </div>
                    <span className={`text-left ${plan.popular ? "text-blue-50" : "text-gray-700"} leading-relaxed`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  setSelectedPlan(key);
                  handleSubscribe();
                }}
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 ${
                  plan.popular
                    ? "bg-white text-blue-600 hover:bg-gray-100 hover:shadow-lg hover:shadow-white/25"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/25"
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-7xl mx-auto mb-16">
        <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-xl border border-gray-100">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-12">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl bg-gradient-to-br from-gray-50 to-white hover:from-blue-50 hover:to-indigo-50 border border-gray-200 hover:border-blue-300 transition-all duration-300 group hover:shadow-lg"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/25">
                  <feature.icon className="text-2xl text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex flex-wrap justify-center items-center gap-6 lg:gap-8 text-gray-600 text-sm">
          <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2">
              <FaCheck className="text-white text-xs" />
            </div>
            <span className="font-medium">Secure payment</span>
          </div>
          <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
            <FaHeadset className="text-blue-500 mr-2 text-base" />
            <span className="font-medium">24/7 Support</span>
          </div>
          <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
            <FaStar className="text-yellow-500 mr-2 text-base" />
            <span className="font-medium">30-day guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;