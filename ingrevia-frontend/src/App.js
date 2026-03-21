import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./Login";
import Navbar from "./Navbar";
import Dashboard from "./Dashboard";
import Profile from "./Profile";
import HistoryPage from "./HistoryPage";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("email");
    if (savedUser) setUser(savedUser);
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  if (loading) return null;

  return (
    <Router>
      {!user ? (
        <Routes>
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        <div className="app-main-layout">
          <Navbar user={user} logout={logout} />
          <main className="content-area">
            <Routes>
              <Route path="/" element={<Dashboard user={user} />} />
              <Route path="/profile" element={<Profile user={user} />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      )}
    </Router>
  );
}

export default App;
