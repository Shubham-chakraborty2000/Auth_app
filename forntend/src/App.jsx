// import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthenContext/AuthContext";
import LoginPage from "./Loginpage/LoginPage";
import Dashboard from "./Dashboard/Dashboard";
import ProtectedRoute from "./Protectedroute/ProtectedRoute";

const App = () => {
  return (
    // <h1>Shubham</h1>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard/>
              </ProtectedRoute> 
            }
          />
          <Route path="*" element={<LoginPage/>} />
        </Routes>
      </Router>
     </AuthProvider>
  );
};

export default App;
