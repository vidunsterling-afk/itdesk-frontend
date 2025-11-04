import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "./context/AuthContext.jsx";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import AdminVerify from "./components/AdminVerify.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Employees from "./pages/Employees.jsx";
import Assets from "./pages/Assets.jsx";
import AssignAssets from "./pages/AssignAssets.jsx";
import Software from "./pages/Software.jsx";
import EmployeeMaintenance from "./pages/EmployeeMaintenance.jsx";
import MaintenanceCalendar from "./components/MaintenanceCalendar.jsx";
import MaintenanceReport from "./components/MaintenanceReport.jsx";
import BillReminder from "./pages/BillReminder.jsx";
import Repair from "./pages/Repair.jsx";
import MonthData from "./pages/MonthData.jsx";
import TagManager from "./pages/TagManager.jsx";
import FloorPlan from "./components/FloorPlan.jsx";
import MemoGenerator from "./pages/MemoGenerator.jsx";
import M365Usage from "./components/M365Usage.jsx";
import FingerprintAssignmentForm from "./components/FingerprintAssignmentForm.jsx";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading)
    return (
      <motion.div
        className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"
          animate={{
            rotate: 360,
          }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 1,
          }}
        ></motion.div>
        <motion.p
          className="text-lg font-medium"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Checking session...
        </motion.p>
      </motion.div>
    );

  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  const { user } = useContext(AuthContext);
  const [isExpanded, setIsExpanded] = useState(user ? false : null);

  const navbarWidth = isExpanded ? 240 : 80;

  return (
    <BrowserRouter>
      {user && <Navbar setIsExpanded={setIsExpanded} defaultExpanded={false} />}
      <motion.div
        animate={{ marginLeft: user ? navbarWidth : 0 }}
        initial={{ marginLeft: user ? 80 : 0 }} // start with collapsed width
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="p-4"
      >
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<AdminVerify />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <PrivateRoute>
                <Employees />
              </PrivateRoute>
            }
          />
          <Route
            path="/assets"
            element={
              <PrivateRoute>
                <Assets />
              </PrivateRoute>
            }
          />
          <Route
            path="/software"
            element={
              <PrivateRoute>
                <Software />
              </PrivateRoute>
            }
          />
          <Route
            path="/assign-assets"
            element={
              <PrivateRoute>
                <AssignAssets />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee-maintenance"
            element={
              <PrivateRoute>
                <EmployeeMaintenance />
              </PrivateRoute>
            }
          />
          <Route
            path="/maintenance-calendar"
            element={
              <PrivateRoute>
                <MaintenanceCalendar />
              </PrivateRoute>
            }
          />
          <Route
            path="/maintenance-report"
            element={
              <PrivateRoute>
                <MaintenanceReport />
              </PrivateRoute>
            }
          />
          <Route
            path="/bill-reminder"
            element={
              <PrivateRoute>
                <BillReminder />
              </PrivateRoute>
            }
          />
          <Route
            path="/repair"
            element={
              <PrivateRoute>
                <Repair />
              </PrivateRoute>
            }
          />
          <Route
            path="/data"
            element={
              <PrivateRoute>
                <MonthData />
              </PrivateRoute>
            }
          />
          <Route
            path="/tags"
            element={
              <PrivateRoute>
                <TagManager />
              </PrivateRoute>
            }
          />
          <Route
            path="/plan"
            element={
              <PrivateRoute>
                <FloorPlan />
              </PrivateRoute>
            }
          />
          <Route
            path="/memo"
            element={
              <PrivateRoute>
                <MemoGenerator />
              </PrivateRoute>
            }
          />
          <Route
            path="/m365"
            element={
              <PrivateRoute>
                <M365Usage />
              </PrivateRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <PrivateRoute>
                <FingerprintAssignmentForm />
              </PrivateRoute>
            }
          />
        </Routes>
      </motion.div>
    </BrowserRouter>
  );
}
