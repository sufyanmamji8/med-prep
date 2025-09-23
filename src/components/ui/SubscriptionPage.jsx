import React from "react";
import { FaArrowLeft, FaCheck, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const SubscriptionPage = ({ setHasSubscription }) => {
  const navigate = useNavigate();

  const handleSubscribe = () => {
    if (typeof setHasSubscription === "function") {
      setHasSubscription(true);
    }
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      {/* Header with Back Button */}
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-700 hover:text-blue-900 mb-6 transition-colors duration-200"
        >
          <FaArrowLeft className="mr-2" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-600 p-6 text-center">
          <FaLock className="text-4xl mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Upgrade to Premium</h1>
          <p className="mt-2 text-lg text-blue-700">
            Elevate your learning with exclusive features and unlimited access.
          </p>
        </div>

        {/* Pricing Plans */}
        <div className="p-6 grid md:grid-cols-2 gap-6">
          {/* Monthly Plan */}
          <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Monthly Plan</h2>
            <p className="text-3xl font-bold text-gray-800 mb-2">
              $9.99<span className="text-base text-gray-500">/month</span>
            </p>
            <ul className="space-y-2 mb-4 text-gray-700">
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-2" />
                <span>Access to all subjects</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-2" />
                <span>Download past papers</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-2" />
                <span>Unlimited MCQs practice</span>
              </li>
            </ul>
            <button
              onClick={handleSubscribe}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
            >
              Get Monthly Plan
            </button>
          </div>

          {/* Annual Plan (Recommended) */}
          <div className="border-2 border-blue-500 rounded-lg p-5 bg-blue-50 hover:shadow-md transition-shadow">
            <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-2 uppercase tracking-wide">
              Best Value
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Annual Plan</h2>
            <p className="text-3xl font-bold text-gray-800 mb-2">
              $99.99<span className="text-base text-gray-500">/year</span>
            </p>
            <p className="text-sm text-gray-600 mb-3">Save 20% vs. monthly</p>
            <ul className="space-y-2 mb-4 text-gray-700">
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-2" />
                <span>Everything in Monthly</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-2" />
                <span>Priority support</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-2" />
                <span>Offline access</span>
              </li>
            </ul>
            <button
              onClick={handleSubscribe}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
            >
              Get Annual Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;