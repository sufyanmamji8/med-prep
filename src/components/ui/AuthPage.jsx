import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import {
  doSignInWithEmailAndPassword,
  doSignInWithGoogle,
  doSignInWithGithub,
  doCreateUserWithEmailAndPassword,
} from "../../firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase";

const AuthPage = () => {
  const navigate = useNavigate();

  // Redirect if already logged in (no context used)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) navigate("/dashboard");
    });
    return () => unsub();
  }, [navigate]);

  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isSignIn) {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match!");
        return;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
    }

    try {
      setLoading(true);
      if (isSignIn) {
        await doSignInWithEmailAndPassword(formData.email, formData.password);
      } else {
        await doCreateUserWithEmailAndPassword(
          formData.email,
          formData.password,
          formData.name
        );
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err?.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      setLoading(true);
      await doSignInWithGoogle();
      navigate("/dashboard");
    } catch (err) {
      setError(err?.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setError(null);
    try {
      setLoading(true);
      await doSignInWithGithub();
      navigate("/dashboard");
    } catch (err) {
      setError(err?.message || "GitHub sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-500 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Logo and Heading */}
          <div className="flex flex-col items-center pt-6 pb-2">
            <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center mb-3 border-2 border-sky-200">
              <svg className="w-8 h-8 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">Welcome to Prep Center</h1>
          </div>

          {/* Toggle */}
          <div className="flex">
            <button
              onClick={() => setIsSignIn(true)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                isSignIn ? "bg-sky-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignIn(false)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                !isSignIn ? "bg-sky-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {!isSignIn && (
                <div className="mb-3">
                  <label htmlFor="name" className="block text-gray-700 text-xs font-medium mb-1">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isSignIn}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="Enter your name"
                  />
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="email" className="block text-gray-700 text-xs font-medium mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  placeholder="your@email.com"
                />
              </div>

              {/* Password */}
              <div className="mb-3 relative">
                <label htmlFor="password" className="block text-gray-700 text-xs font-medium mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-sky-500 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-8 text-gray-500 hover:text-sky-600"
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? <FiEye /> : <FiEyeOff />}
                </button>
              </div>

              {/* Confirm Password */}
              {!isSignIn && (
                <div className="mb-4 relative">
                  <label htmlFor="confirmPassword" className="block text-gray-700 text-xs font-medium mb-1">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required={!isSignIn}
                    minLength={6}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-sky-500 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    title={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    className="absolute right-3 top-8 text-gray-500 hover:text-sky-600"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                  >
                    {showConfirmPassword ? <FiEye /> : <FiEyeOff />}
                  </button>
                </div>
              )}

              {isSignIn && (
                <div className="flex items-center justify-between mb-4">
                  <label className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 block text-xs text-gray-700">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-xs text-sky-600 hover:text-sky-500"
                    onClick={() => alert("Password reset functionality to be implemented")}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sky-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : isSignIn ? "Sign In" : "Sign Up"}
              </button>
            </form>

            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={handleGithubLogin}
                  disabled={loading}
                  className="w-full inline-flex justify-center py-2 px-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  GitHub
                </button>
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full inline-flex justify-center py-2 px-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  Google
                </button>
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-gray-600">
              {isSignIn ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => setIsSignIn(false)}
                    className="text-sky-600 hover:text-sky-500 font-medium"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setIsSignIn(true)}
                    className="text-sky-600 hover:text-sky-500 font-medium"
                  >
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
