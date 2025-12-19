import React, { useState, useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import Home from "./Home";
import ChatBox from "./ChatBox";
import AdminDashboard from "./AdminDashboard";
import CourierDashboard from "./CourierDashboard";
import TrackingMap from "./TrackingMap";
import CustomerTracking from "./CustomerTracking";

import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

import TopRightProfileMenu from "./TopRightProfileMenu";
import FloatingChatWidget from "./FloatingChatWidget";
import SmallProfileDropdown from "./SmallProfileDropdown";

// Small wrapper so RegisterForm can redirect to /login on success

// Inner app so we can use useNavigate
function AppInner() {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(() => {
    console.log('Initializing showLoginModal state to false');
    return false;
  });
  const [showRegisterModal, setShowRegisterModal] = useState(() => {
    console.log('Initializing showRegisterModal state to false');
    return false;
  });
  const navigate = useNavigate();

  // Add event listeners to navigation links after component mounts
  useEffect(() => {
    const addNavListeners = () => {
      // Find all navigation links
      const loginLinks = document.querySelectorAll('a[href="#"]');
      loginLinks.forEach(link => {
        if (link.textContent.trim().toLowerCase().includes('login')) {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Login link clicked via React listener');
            setShowLoginModal(true);
          });
        } else if (link.textContent.trim().toLowerCase().includes('register')) {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Register link clicked via React listener');
            setShowRegisterModal(true);
          });
        }
      });
    };

    // Try to add listeners immediately
    addNavListeners();

    // Also try after a short delay in case DOM isn't ready
    setTimeout(addNavListeners, 100);
  }, []);

  // Debug modal state changes
  useEffect(() => {
    console.log('showLoginModal changed to:', showLoginModal);
  }, [showLoginModal]);

  useEffect(() => {
    console.log('showRegisterModal changed to:', showRegisterModal);
  }, [showRegisterModal]);

  // Decode JWT to get role / isAdmin (client-side only)
  const getRoleFromToken = (t) => {
    if (!t) return null;
    try {
      const payload = t.split(".")[1];
      const decoded = JSON.parse(atob(payload));

      // If backend signs { isAdmin: true }, map that to "admin"
      if (decoded.isAdmin) return "admin";
      if (decoded.role) return decoded.role;
      return null;
    } catch (err) {
      return null;
    }
  };

  const handleLogin = (t) => {
    if (t) {
      localStorage.setItem("token", t);
      setToken(t);

      const role = getRoleFromToken(t);

      if (role === "admin") {
        navigate("/admin");      // go straight to admin dashboard
      } else if (role === "courier") {
        navigate("/courier");
                } else {
                  navigate("/tracking");
                }
    }
  };

  const handleLogout = () => {
    console.log('Logging out, clearing token and user profile');
    localStorage.removeItem("token");
    setToken(null);
    setCurrentUserProfile(null);
    try {
      // Force page reload to clear any cached states
      window.location.href = window.location.origin + "/";
    } catch (error) {
      console.error('Logout navigation error:', error);
      // Fallback to hash navigation
      window.location.hash = "#/";
    }
  };

  const updateUserProfile = (updatedUser) => {
    setCurrentUserProfile(updatedUser);
  };

  // Make updateUserProfile globally available
  useEffect(() => {
    window.updateUserProfile = updateUserProfile;
    return () => {
      delete window.updateUserProfile;
    };
  }, [updateUserProfile]);

  const role = getRoleFromToken(token);

  useEffect(() => {
    console.log('Profile Fetch Effect:', {
      token: !!token,
      role,
      shouldFetch: token && role !== "admin" && role !== "courier"
    });
    
    if (token && role !== "admin" && role !== "courier") {
      const fetchProfile = async () => {
        try {
          console.log('Fetching profile from API...');
          
          // Add timeout to prevent hanging
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
          
          const res = await fetch("http://localhost:5000/api/user/profile", {
            headers: { "Authorization": `Bearer ${token}` },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          console.log('Profile API Response:', res.status, res.ok);
          
          if (res.ok) {
            const data = await res.json();
            console.log('Profile data received:', data);
            const userData = data.user || data;
            console.log('Setting user profile:', userData);
            setCurrentUserProfile(userData);
          } else {
            console.error('Profile API failed:', res.status, res.statusText);
            // Try to handle token expiry
            if (res.status === 401) {
              console.log('Token expired, clearing...');
              localStorage.removeItem('token');
              setCurrentUserProfile(null);
            }
          }
        } catch (err) {
          console.error("Failed to fetch profile:", err);
          // Set fallback after error to still show dropdown
          if (token && role !== "admin" && role !== "courier") {
            console.log('Setting fallback profile due to API error');
            setCurrentUserProfile({ name: 'User', email: 'user@example.com' });
          }
        }
      };
      fetchProfile();
    } else {
      console.log('Setting current user profile to null');
      setCurrentUserProfile(null);
    }
  }, [token, role]);

  // Toggle a body class so CSS can reposition the chatbot specifically
  // when an admin is logged in: normal users see the bot on the right,
  // admins get it moved to the left via .admin-bot-left.
  useEffect(() => {
    const body = document.body;
    if (!body) return;
    if (role === "admin") {
      body.classList.add("admin-bot-left");
    } else {
      body.classList.remove("admin-bot-left");
    }
  }, [role]);

  // Show profile dropdown for logged-in users
  // Add fallback to show dropdown if token exists but profile fetch fails
  const showProfileDropdown = token && role !== "admin" && role !== "courier" && (currentUserProfile || true);
  
  // Debug logging
  console.log('Profile Dropdown Debug:', {
    token: !!token,
    role,
    currentUserProfile: !!currentUserProfile,
    showProfileDropdown,
    fallbackUsed: !currentUserProfile && !!token
  });

  return (
    <>
      {/* Profile dropdown for logged-in customers */}
      {showProfileDropdown && (
        <div 
          style={{ 
            position: 'fixed',
            top: '14px',
            right: '70px',
            zIndex: 99998
          }}
        >
          <SmallProfileDropdown 
            onLogout={handleLogout} 
            user={currentUserProfile} 
          />
        </div>
      )}

      {/* Floating chat widget for logged-in customers */}
      {token && role !== "admin" && role !== "courier" && currentUserProfile && (
        <FloatingChatWidget user={currentUserProfile} isVisible={true} />
      )}

      {/* Page content */}
      <main>
        <Routes>
          {/* Public tracking route - accessible without login */}
          <Route path="/track-package" element={<CustomerTracking idToken={token} />} />
          
           {!token ? (
             <>
               {/* Public routes (no token) */}
               <Route path="/" element={<Home />} />
               <Route path="*" element={<Home />} />
             </>
           ) : token && role === "admin" ? (
            <>
              {/* Admin routes */}
              <Route
                path="/admin"
                element={
                  <AdminDashboard
                    idToken={token}
                    onLogout={handleLogout}
                  />
                }
              />
              <Route path="*" element={<AdminDashboard idToken={token} onLogout={handleLogout} />} />
            </>
          ) : token && role === "courier" ? (
            <>
              {/* Courier routes */}
              <Route
                path="/courier"
                element={<CourierDashboard idToken={token} />}
              />
              <Route path="*" element={<CourierDashboard idToken={token} />} />
            </>
          ) : (
            <>
              {/* Customer routes (logged in, but not admin/courier) */}
              <Route
                path="/tracking"
                element={<TrackingMap idToken={token} packageId={1} />}
              />
              <Route
                path="/chat"
                element={<ChatBox idToken={token} />}
              />
              <Route
                path="*"
                element={<Home />}
              />
            </>
          )}
        </Routes>
      </main>

      {/* Login Modal */}
      {showLoginModal && (
        console.log('Rendering login modal, showLoginModal:', showLoginModal) ||
    <section className="login-section" onClick={(e) => {
      if (e.target === e.currentTarget) {
        setShowLoginModal(false);
      }
    }}>
      <div style={{ position: 'relative', padding: '20px' }}>
            <button
              onClick={() => setShowLoginModal(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'transparent',
                color: '#666',
                border: 'none',
                borderRadius: '50%',
                width: '35px',
                height: '35px',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                zIndex: '10001'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#f0f0f0';
                e.target.style.color = '#333';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#666';
              }}
            >
              ×
            </button>
            <LoginForm onLogin={(token) => {
              setToken(token);
              setShowLoginModal(false);
            }} />
          </div>
        </section>
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        console.log('Register modal should be visible') ||
    <section className="register-section" onClick={(e) => {
      if (e.target === e.currentTarget) {
        setShowRegisterModal(false);
      }
    }}>
      <div style={{ position: 'relative', padding: '20px' }}>
            <button
              onClick={() => setShowRegisterModal(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'transparent',
                color: '#666',
                border: 'none',
                borderRadius: '50%',
                width: '35px',
                height: '35px',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                zIndex: '10001'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#f0f0f0';
                e.target.style.color = '#333';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#666';
              }}
            >
              ×
            </button>
            <RegisterForm onRegisterSuccess={() => {
              setShowRegisterModal(false);
              setShowLoginModal(true); // Show login after successful registration
            }} />
          </div>
        </section>
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppInner />
    </Router>
  );
}

export default App;
