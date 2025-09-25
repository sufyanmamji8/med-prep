// src/services/authService.js
import axios from "axios";

const API_BASE_URL = "https://mrbe.codovio.com/api/v1/users";

// ✅ Register user
export const registerUser = async ({ name, email, password, confirmPassword }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, {
      name,
      email,
      password,
      confirm_password: confirmPassword, // backend requires this
    });

    // Return consistent structure: user, token, message
    return {
      message: response.data.message || "User registered successfully",
      user: response.data.user || null,
      token: response.data.token || null,
    };
  } catch (err) {
    const backendMsg = err.response?.data?.messages || err.response?.data || err.message;
    console.error("Register error:", backendMsg);
    throw new Error(
      backendMsg?.email ||
      backendMsg?.password ||
      backendMsg?.confirm_password ||
      backendMsg?.name ||
      "Registration failed"
    );
  }
};

// ✅ Login user
export const loginUser = async ({ email, password }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, { email, password });

    // Return consistent structure: user, token, message
    return {
      message: response.data.message || "Login successful",
      user: response.data.user || null,
      token: response.data.token || null,
    };
  } catch (err) {
    const backendMsg = err.response?.data?.messages || err.response?.data || err.message;
    console.error("Login error:", backendMsg);
    throw new Error(backendMsg?.email || backendMsg?.password || "Login failed");
  }
};

// ✅ Logout user
export const logoutUser = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

// ✅ Get current user
export const getCurrentUser = () => {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};
