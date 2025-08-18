import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashBoard from "./components/ui/DashBoard";   
import SubscriptionPage from "./components/ui/SubscriptionPage";
import AuthPage from "./components/ui/AuthPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />       
        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="/subscribe" element={<SubscriptionPage />} />
      </Routes>
    </Router>
  );
}

export default App;


