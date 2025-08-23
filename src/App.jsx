import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./components/ui/AuthPage";
import Loader from "./components/ui/Loader";
import SubscriptionPage from "./components/ui/SubscriptionPage";
import Dashboard from "./components/dashboard/DashBoard";

function App() {
  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<AuthPage />} />

        {/* Agar loader chahiye to alag route ya conditional render */}
        <Route path="/loader" element={<Loader />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/subscribe" element={<SubscriptionPage />} />
      </Routes>
    </Router>
  );
}

export default App;


