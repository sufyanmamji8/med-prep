import axios from "axios";

const API_BASE_URL = "https://mrbe.codovio.com/api/v1/users";

// ✅ Add axios interceptor for Bearer tokens
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Add response interceptor to handle token expiry
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle 401 for non-login requests
    if (error.config && error.response?.status === 401 && !error.config.url.endsWith('/')) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Don't redirect if we're already on the auth page
      if (!window.location.pathname.includes('auth')) {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

// Register user
export const registerUser = async ({ name, email, password, confirm_password }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, { 
      name, 
      email, 
      password, 
      confirm_password 
    });
    
    const token = response.data.token;
    let user = { 
      email: email,
      name: name
    };

    // ✅ Extract user info from response if available
    if (response.data.user) {
      user = { ...user, ...response.data.user };
    }

    // ✅ Save in localStorage
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);

    console.log("✅ Registration successful - Token saved:", token ? "Yes" : "No");

    return {
      message: response.data.message || "User registered successfully",
      user,
      token,
    };
  } catch (err) {
    const backendMsg = err.response?.data?.messages || err.response?.data || err.message;
    throw new Error(
      backendMsg?.email ||
        backendMsg?.password ||
        backendMsg?.confirm_password ||
        backendMsg?.name ||
        "Registration failed"
    );
  }
};

// Login user
export const loginUser = async ({ email, password }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, { 
      email, 
      password 
    });
    
    const token = response.data.token;
    let user = { 
      email: email,
      name: email.split('@')[0] // Default name
    };

    // ✅ Extract user info from response if available
    if (response.data.user) {
      user = { ...user, ...response.data.user };
    }

    // ✅ Also try to extract from token payload
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        user = {
          ...user,
          name: payload.name || user.name,
          email: payload.email || user.email,
          id: payload.id || user.id
        };
      } catch (tokenError) {
        console.warn("Token parsing failed, using response user info");
      }
    }

    // ✅ Save in localStorage
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);

    console.log("✅ Login successful - Token saved:", token ? "Yes" : "No");
    console.log("✅ User data saved:", user);

    return {
      message: response.data.message || "Login successful",
      user,
      token,
    };
  } catch (err) {
    const backendMsg = err.response?.data?.messages || err.response?.data || err.message;
    throw new Error(backendMsg?.email || backendMsg?.password || "Login failed");
  }
};

// Logout user
export const logoutUser = () => {
  try {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    console.log("✅ Logout successful - LocalStorage cleared");
    return true;
  } catch (err) {
    console.error("Logout error:", err);
    return false;
  }
};

// Get current user
export const getCurrentUser = () => {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

// Get current token
export const getCurrentToken = () => {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  try {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    if (!token || !user) return false;

    // Check if token is expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = Date.now() >= payload.exp * 1000;
      return !isExpired;
    } catch {
      return false; // Invalid token format
    }
  } catch {
    return false;
  }
};