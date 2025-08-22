import React from "react";
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import MainLayout from "./Layouts/MainLayout.jsx";
import Home from "./Pages/homePage.jsx";
import Schedule from "./Pages/Schedule.jsx";
import CommissionGrid from "./Pages/Commission.jsx";
import About from "./Pages/About.jsx";
import SupportUs from "./Pages/SupportUs.jsx";

import AdminDashboard from "./Pages/AdminDashboard.jsx";
import HiddenAdminLogin from "./Components/HiddenAdminLogin.jsx";

import ProtectedRoute from "./Components/ProtectedRoute.jsx";
import { ROLES } from "./contexts/AuthContext.jsx";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home/>} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="about" element={<About />} />
            <Route path="commissions" element={<CommissionGrid />} />
            <Route path="support" element={<SupportUs />} />
          </Route>
          

          
          {/* Admin Routes - Super discreet route */}
          <Route path={`/${import.meta.env.ADMIN_ROUTE || 'admin-panel-choir-8942'}`} element={
              <ProtectedRoute requiredRole={ROLES.ADMIN}>
                  <AdminDashboard/>
              </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
