import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const AuthPage = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignIn) {
      console.log('Signing in with:', formData.email, formData.password);
    } else {
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords don't match!");
        return;
      }
      console.log('Signing up with:', formData);
    }
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-500 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Logo and Heading Section */}
          <div className="flex flex-col items-center pt-6 pb-2">
            {/* Replace this with your actual image */}
            <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center mb-3 border-2 border-sky-200">
              <svg className="w-8 h-8 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">Welcome to prep Center</h1>
          </div>

          {/* Toggle Buttons */}
          <div className="flex">
            <button
              onClick={() => setIsSignIn(true)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${isSignIn ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignIn(false)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${!isSignIn ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Sign Up
            </button>
          </div>

          {/* Form Container */}
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              {!isSignIn && (
                <div className="mb-3">
                  <label htmlFor="name" className="block text-gray-700 text-xs font-medium mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="Enter your name"
                    required={!isSignIn}
                  />
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="email" className="block text-gray-700 text-xs font-medium mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="mb-3 relative">
                <label htmlFor="password" className="block text-gray-700 text-xs font-medium mb-1">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-sky-500 pr-10"
                  placeholder="••••••••"
                  required
                  minLength="6"
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-gray-500 hover:text-sky-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FiEye className="text-sky-600" />
                  ) : (
                    <div className="relative">
                      <FiEye className="text-gray-500" />
                      <div className="absolute top-1/2 left-1/2 w-4 h-px bg-gray-500 transform -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
                    </div>
                  )}
                </button>
              </div>

              {!isSignIn && (
                <div className="mb-4 relative">
                  <label htmlFor="confirmPassword" className="block text-gray-700 text-xs font-medium mb-1">
                    Confirm Password
                  </label>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-sky-500 pr-10"
                    placeholder="••••••••"
                    required={!isSignIn}
                    minLength="6"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-8 text-gray-500 hover:text-sky-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <FiEye className="text-sky-600" />
                    ) : (
                      <div className="relative">
                        <FiEye className="text-gray-500" />
                        <div className="absolute top-1/2 left-1/2 w-4 h-px bg-gray-500 transform -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
                      </div>
                    )}
                  </button>
                </div>
              )}

              {isSignIn && (
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-xs text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <a href="#" className="text-xs text-sky-600 hover:text-sky-500">
                    Forgot password?
                  </a>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-sky-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-colors"
              >
                {isSignIn ? 'Sign In' : 'Sign Up'}
              </button>
            </form>

            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button className="w-full inline-flex justify-center py-2 px-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-sky-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0110 4.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.933.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.14 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="w-full inline-flex justify-center py-2 px-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-sky-500">
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
                  </svg>
                </button>
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-gray-600">
              {isSignIn ? (
                <>
                  Don't have an account?{' '}
                  <button onClick={() => setIsSignIn(false)} className="text-sky-600 hover:text-sky-500 font-medium">
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button onClick={() => setIsSignIn(true)} className="text-sky-600 hover:text-sky-500 font-medium">
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;