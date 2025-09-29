import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

// ✅ Backend auth service
import { loginUser, registerUser } from "../../services/authService";

const AuthPage = () => {
  const navigate = useNavigate();

  // ✅ Redirect if already logged in
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) navigate("/dashboard"); // go to dashboard if already logged in
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
  const [loading, setLoading] = useState(false);

  // ✅ Update input values
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation for signup
    if (!isSignIn) {
      if (formData.password !== formData.confirmPassword) {
        toast.error("❌ Passwords do not match!");
        return;
      }
      if (formData.password.length < 6) {
        toast.error("❌ Password must be at least 6 characters.");
        return;
      }
    }

    try {
      setLoading(true);

      if (isSignIn) {
        // 🔑 Login
const res = await loginUser({
  email: formData.email,
  password: formData.password,
});
console.log("🔑 Login response:", res);

// ❌ remove duplicate localStorage.setItem here
// if (res.token) localStorage.setItem("token", res.token);
// localStorage.setItem("user", JSON.stringify(res.user));

toast.success("✅ Logged in successfully!");
navigate("/dashboard");

      } else {
        // 📝 Signup
        const res = await registerUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        });
        console.log("📝 Signup response:", res);

        if (res.token) {
          localStorage.setItem("token", res.token);
        }
        localStorage.setItem("user", JSON.stringify(res.user));

        toast.success(res.message || "🎉 Account created successfully!");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Auth error:", err);
      toast.error(err.message || "❌ Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => toast.error("Google login not yet supported.");
  const handleGithubLogin = () => toast.error("GitHub login not yet supported.");
  const handlePasswordReset = () => {
    if (!formData.email) return toast.error("⚠️ Please enter your email first.");
    toast.info("Password reset not yet implemented.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-500 to-white flex items-center justify-center p-4">
      <Toaster position="top-right" />
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Logo */}
          <div className="flex flex-col items-center pt-6 pb-2">
            <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center mb-3 border-2 border-sky-200">
              <svg className="w-8 h-8 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              Welcome to <span className="text-sky-600">Mrcem</span>
            </h1>
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
            <form onSubmit={handleSubmit}>
              {!isSignIn && (
                <div className="mb-3">
                  <label className="block text-gray-700 text-xs font-medium mb-1">Full Name</label>
                  <input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isSignIn}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="Enter your name"
                  />
                </div>
              )}

              {/* Email */}
              <div className="mb-3">
                <label className="block text-gray-700 text-xs font-medium mb-1">Email Address</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  placeholder="your@email.com"
                />
              </div>

              {/* Password */}
              <div className="mb-3 relative">
                <label className="block text-gray-700 text-xs font-medium mb-1">Password</label>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-sky-500 pr-10"
                  placeholder="Enter Password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-gray-500 hover:text-sky-600"
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? <FiEye /> : <FiEyeOff />}
                </button>
              </div>

              {/* Confirm Password */}
              {!isSignIn && (
                <div className="mb-4 relative">
                  <label className="block text-gray-700 text-xs font-medium mb-1">Confirm Password</label>
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required={!isSignIn}
                    minLength={6}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-sky-500 pr-10"
                    placeholder="Confirm Password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-8 text-gray-500 hover:text-sky-600"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                  >
                    {showConfirmPassword ? <FiEye /> : <FiEyeOff />}
                  </button>
                </div>
              )}

              {/* Forgot Password */}
              {isSignIn && (
                <div className="flex items-center justify-between mb-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-sky-600 border-gray-300 rounded" />
                    <span className="ml-2 block text-xs text-gray-700">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-xs text-sky-600 hover:text-sky-500"
                    onClick={handlePasswordReset}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sky-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : isSignIn ? "Sign In" : "Sign Up"}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Social Login */}
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

            {/* Toggle */}
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
