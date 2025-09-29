import axios from "axios";

const API_BASE_URL = "https://mrbe.codovio.com/api/v1/users";

// Register user
export const registerUser = async ({ name, email, password, confirmPassword }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, {
      name,
      email,
      password,
      confirm_password: confirmPassword,
    });

    const token = response.data.token;
    const user = {
      name: name,
      email: email
    };

    // ✅ Save in localStorage
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);

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
    const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
    
    const token = response.data.token;
    let user = { email };

    // ✅ Extract user info from token if available
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        user = {
          name: payload.name || email.split('@')[0], // Use name from token or email prefix
          email: payload.email || email,
          id: payload.id
        };
      } catch (tokenError) {
        console.warn("Token parsing failed, using basic user info");
        user = { email, name: email.split('@')[0] };
      }
    }

    // ✅ Save in localStorage
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);

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