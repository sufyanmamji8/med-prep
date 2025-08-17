import React from 'react';
import { FaCheck, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const SubscriptionPage = ({ setHasSubscription }) => {
  const navigate = useNavigate();

  const handleSubscribe = () => {
    setHasSubscription(true);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 text-center">
          <FaLock className="text-4xl mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Upgrade to Premium</h1>
          <p className="mt-2">Unlock all study materials and features</p>
        </div>

        {/* Pricing Plans */}
        <div className="p-6 grid md:grid-cols-2 gap-6">
          {/* Monthly Plan */}
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Monthly Plan</h2>
            <p className="text-4xl font-bold text-gray-800 mb-2">
              $9.99<span className="text-lg text-gray-500">/month</span>
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-2" />
                Access to all subjects
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-2" />
                Download past papers
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-2" />
                Unlimited MCQs practice
              </li>
            </ul>
            <button
              onClick={handleSubscribe}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Get Monthly Plan
            </button>
          </div>

          {/* Annual Plan (Recommended) */}
          <div className="border-2 border-blue-500 rounded-lg p-6 bg-blue-50 hover:shadow-md transition-shadow">
            <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">
              BEST VALUE
            </div>
            <h2 className="text-xl font-semibold mb-2">Annual Plan</h2>
            <p className="text-4xl font-bold text-gray-800 mb-2">
              $99.99<span className="text-lg text-gray-500">/year</span>
            </p>
            <p className="text-sm text-gray-600 mb-4">Save 20% compared to monthly</p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-2" />
                Everything in Monthly
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-2" />
                Priority support
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-2" />
                Offline access
              </li>
            </ul>
            <button
              onClick={handleSubscribe}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Get Annual Plan
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 text-center border-t">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;