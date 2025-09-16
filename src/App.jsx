import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./components/ui/AuthPage";
import Loader from "./components/ui/Loader";
import SubscriptionPage from "./components/ui/SubscriptionPage";
import Dashboard from "./components/dashboard/DashBoard";
import DashboardHome from "./components/dashboard/sections/DashboardHome";
import SubjectPage from "./components/dashboard/sections/SubjectPage";
import Mcqs from "./components/dashboard/sections/Mcqs";
import Notes from "./components/dashboard/sections/Notes";
import PastPapers from "./components/dashboard/sections/PastPapers";
import Videos from "./components/dashboard/sections/Videos";
import McqPracticePage from "./components/dashboard/sections/McqPracticePage";
import McqResultPage from "./components/dashboard/sections/McqResultPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<AuthPage />} />
        <Route path="/loader" element={<Loader />} />
        <Route path="/subscribe" element={<SubscriptionPage />} />

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardHome />} />

          {/* Subject-related routes */}
          <Route path="subjects/:subjectId" element={<SubjectPage />} />
          <Route path="subjects/:subjectId/mcqs" element={<Mcqs />} />
          <Route path="subjects/:subjectId/notes" element={<Notes />} />
          <Route path="subjects/:subjectId/pastpapers" element={<PastPapers />} />
          <Route path="subjects/:subjectId/videos" element={<Videos />} />

          {/* MCQ Practice & Result routes */}
          <Route
            path="subjects/:subjectId/mcqs/practice"
            element={<McqPracticePage />}
          />
          <Route
            path="subjects/:subjectId/mcqs/result"
            element={<McqResultPage />}
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
