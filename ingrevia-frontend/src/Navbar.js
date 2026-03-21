import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";

function Navbar({ user, logout }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Extract name from email (e.g., test from test@gmail.com)
  const displayName = user ? user.split("@")[0] : "User";

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-logo" onClick={() => navigate("/")}>
        <span>🧪</span> AllerSafe
      </div>

      <div className="nav-user-container" ref={dropdownRef}>
        <div className="user-badge" onClick={() => setIsOpen(!isOpen)}>
          👤 {displayName} <span className={`arrow ${isOpen ? "up" : "down"}`}>▾</span>
        </div>

        {isOpen && (
          <div className="nav-dropdown glass-panel">
            <Link to="/profile" className="dropdown-item" onClick={() => setIsOpen(false)}>
              <span>👤</span> User Profile
            </Link>
            <Link to="/history" className="dropdown-item" onClick={() => setIsOpen(false)}>
              <span>📜</span> History
            </Link>
            <div className="dropdown-divider"></div>
            <div className="dropdown-item logout" onClick={() => { logout(); setIsOpen(false); }}>
              <span>🚪</span> Logout
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
