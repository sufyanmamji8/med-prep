import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";

import AuthPage from "./components/ui/AuthPage";
import Loader from "./components/ui/Loader";
import SubscriptionPage from "./components/ui/SubscriptionPage";
import Dashboard from "./components/dashboard/DashBoard";

function App() {
  const [hasSubscription, setHasSubscription] = useState(false);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<AuthPage />} />
        <Route path="/loader" element={<Loader />} />
        <Route path="/subscribe" element={<SubscriptionPage />} />

        {/* Dashboard Route - All internal navigation handled by Dashboard component state */}
        <Route path="/dashboard/*" element={<Dashboard />} />
        
        {/* Catch all route */}
        <Route path="/" element={<AuthPage />} />
      </Routes>
    </Router>
  );
}

export default App;