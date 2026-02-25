import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import "./App.css";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomeRoute from "./components/HomeRoute";

// Pages
import StudentLogin from "./pages/StudentLogin";
import StudentRegister from "./pages/StudentRegister";
import FacultyLogin from "./pages/FacultyLogin";
import FacultyRegister from "./pages/FacultyRegister";
import StudentDashboard from "./pages/StudentDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import AdminDashboard from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import LoginSelection from "./pages/LoginSelection";
import FacultySelection from "./pages/FacultySelection";
import DepartmentDetail from "./components/admin-views/Departmentdetail";
import ParentLogin from "./pages/Parentlogin";
import ParentDashboard from "./pages/Parentdashboard";

// Layout to hide Navbar/Footer on dashboards and login pages
const Layout = ({ children }) => {
  const location = useLocation();
  const hideOnRoutes = [
    "/admin-dashboard",
    "/faculty-dashboard",
    "/student-dashboard",
    "/admin-login",
    "/login/student",
    "/login/faculty",
    "/register/student",
    "/register/faculty",
    "/login-selection",
    "/faculty-selection",
    "/login/parent",       // ← hide navbar on parent login
    "/parent-dashboard",   // ← hide navbar on parent dashboard
    "/admin/department",
  ];
  const showNavAndFooter = !hideOnRoutes.some((route) =>
    location.pathname.startsWith(route),
  );

  return (
    <div className="App">
      {showNavAndFooter && <Navbar />}
      {children}
      {showNavAndFooter && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* SMART HOME ROUTE */}
          <Route path="/" element={<HomeRoute />} />

          {/* Student Routes */}
          <Route path="/login/student" element={<StudentLogin />} />
          <Route path="/register/student" element={<StudentRegister />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />

          {/* Faculty Routes */}
          <Route path="/login/faculty" element={<FacultyLogin />} />
          <Route path="/register/faculty" element={<FacultyRegister />} />
          <Route path="/faculty-dashboard" element={<FacultyDashboard />} />

          {/* Admin Routes */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Login Selection Routes */}
          <Route path="/login-selection" element={<LoginSelection />} />
          <Route path="/faculty-selection" element={<FacultySelection />} />

          <Route
            path="/admin/department/:deptName"
            element={<DepartmentDetail />}
          />

          {/* Parent Routes */}
          <Route path="/login/parent" element={<ParentLogin />} />
          <Route path="/parent-dashboard" element={<ParentDashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
