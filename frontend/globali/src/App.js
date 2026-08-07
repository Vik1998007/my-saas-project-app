import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "./pages/Home";
import WebDevelopment from "./pages/WebDevelopment";
import ApplicationDevelopment from "./pages/ApplicationDevelopment";
import DigitalMarketing from "./pages/DigitalMarketing";
import SEOServices from "./pages/SEOServices";
import ProjectMangement from "./pages/projectmangement";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Customers from "./pages/Customers";
import Projects from "./pages/Projects";
import AddProject from "./pages/AddProject";
import AddCustomer from "./pages/AddCustomer";
import Enquiries from "./pages/Enquiries";
import AddEnquiry from "./pages/AddEnquiry";
import Employees from "./pages/Employees";
import AddEmployee from "./pages/AddEmployee";
import Attendance from "./pages/Attendance";
import AdminAttendance from "./pages/AdminAttendance";
import Leave from "./pages/Leave";
import AdminLeave from "./pages/AdminLeave";
import Task from "./pages/Task";
import AdminTask from "./pages/AdminTask";
import Subscription from "./pages/Subscription";
import Notifications from "./pages/Notifications";
import Invoices from "./pages/Invoices";
import Reports from "./pages/Reports";
import Payroll from "./pages/Payroll";

function getTokenData() {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  try {
    const tokenParts = token.split(".");

    if (tokenParts.length !== 3) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return null;
    }

    const normalizedPayload = tokenParts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const decodedPayload = JSON.parse(
      decodeURIComponent(
        window
          .atob(normalizedPayload)
          .split("")
          .map(
            (character) =>
              `%${character
                .charCodeAt(0)
                .toString(16)
                .padStart(2, "0")}`
          )
          .join("")
      )
    );

    if (
      decodedPayload.exp &&
      decodedPayload.exp * 1000 < Date.now()
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return null;
    }

    return decodedPayload;
  } catch (error) {
    console.error("Invalid authentication token.", error);

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return null;
  }
}

function ProtectedRoute({ children }) {
  const tokenData = getTokenData();

  if (!tokenData) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const tokenData = getTokenData();

  if (!tokenData) {
    return <Navigate to="/login" replace />;
  }

  if (tokenData.role !== "admin") {
    return <Navigate to="/tasks" replace />;
  }

  return children;
}

function DefaultRedirect() {
  const tokenData = getTokenData();

  if (!tokenData) {
    return <Navigate to="/login" replace />;
  }

  if (tokenData.role === "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/tasks" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/web-development"
          element={
            <ProtectedRoute>
              <WebDevelopment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/application-development"
          element={
            <ProtectedRoute>
              <ApplicationDevelopment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/digital-marketing"
          element={
            <ProtectedRoute>
              <DigitalMarketing />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seo-services"
          element={
            <ProtectedRoute>
              <SEOServices />
            </ProtectedRoute>
          }
        />

        <Route
          path="/project-management"
          element={
            <ProtectedRoute>
              <ProjectMangement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <AdminRoute>
              <Notifications />
            </AdminRoute>
          }
        />
        <Route
          path="/invoices"
          element={
            <AdminRoute>
              <Invoices />
            </AdminRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <AdminRoute>
              <Reports />
            </AdminRoute>
          }
        />
        <Route
        path="/payroll"
        element={
          <AdminRoute>
            <Payroll />
          </AdminRoute>
        }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <Attendance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/leave"
          element={
            <ProtectedRoute>
              <Leave />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Task />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <AdminRoute>
              <Customers />
            </AdminRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <AdminRoute>
              <Projects />
            </AdminRoute>
          }
        />

        <Route
          path="/add-project"
          element={
            <AdminRoute>
              <AddProject />
            </AdminRoute>
          }
        />

        <Route
          path="/add-customer"
          element={
            <AdminRoute>
              <AddCustomer />
            </AdminRoute>
          }
        />

        <Route
          path="/enquiries"
          element={
            <AdminRoute>
              <Enquiries />
            </AdminRoute>
          }
        />

        <Route
          path="/add-enquiry"
          element={
            <AdminRoute>
              <AddEnquiry />
            </AdminRoute>
          }
        />

        <Route
          path="/employees"
          element={
            <AdminRoute>
              <Employees />
            </AdminRoute>
          }
        />

        <Route
          path="/add-employee"
          element={
            <AdminRoute>
              <AddEmployee />
            </AdminRoute>
          }
        />

        <Route
          path="/admin-attendance"
          element={
            <AdminRoute>
              <AdminAttendance />
            </AdminRoute>
          }
        />

        <Route
          path="/admin-leave"
          element={
            <AdminRoute>
              <AdminLeave />
            </AdminRoute>
          }
        />

        <Route
          path="/admin-tasks"
          element={
            <AdminRoute>
              <AdminTask />
            </AdminRoute>
          }
        />

        <Route
         path="/subscription"
        element={<Subscription />}
        />

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<SignUp />} />

        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />

        <Route path="*" element={<DefaultRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;