import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function SmallProfileDropdown({ onLogout, user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  
  // Debug logging
  console.log('SmallProfileDropdown Props:', {
    user: user,
    hasUser: !!user,
    userName: user?.name,
    userProfilePic: user?.profilePicture
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfilePictureUpload = async (e) => {
    console.log("Profile picture upload clicked");
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result;
        const token = localStorage.getItem("token");

        console.log("Uploading profile picture...");
        const res = await fetch("http://localhost:5000/api/user/profile-picture", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ profilePicture: base64 })
        });

        if (res.ok) {
          const data = await res.json();
          // Update user data in parent component if possible
          if (data.user && typeof window.updateUserProfile === 'function') {
            window.updateUserProfile(data.user);
          }
          alert("✅ Profile picture updated successfully!");
        } else {
          alert("❌ Failed to update profile picture");
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      alert("Error uploading profile picture");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    console.log("Logout button clicked");
    if (typeof onLogout === 'function') {
      onLogout();
    } else {
      try { localStorage.removeItem('token'); } catch {}
      try { window.location.hash = ''; } catch {}
      try { window.location.reload(); } catch {}
    }
    setIsOpen(false);
  };

  if (!user) return null;

  const userInitials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "SD";

  return (
    <div ref={dropdownRef} style={{ position: "relative", display: "inline-block", zIndex: 99999 }}>
      <button
        onClick={() => {
          console.log("Profile dropdown button clicked");
          setIsOpen(!isOpen);
        }}
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "11px",
          fontWeight: "bold",
          color: "#fff",
          backgroundSize: "cover",
          backgroundPosition: "center",
          border: "2px solid rgba(255, 255, 255, 0.8)",
          backgroundImage: user.profilePicture
            ? `url(${user.profilePicture})`
            : "none",
          backgroundColor: user.profilePicture
            ? "transparent"
            : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          cursor: "pointer",
          transition: "all 0.3s ease",
          marginLeft: "10px",
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.1)";
          e.target.style.boxShadow = "0 2px 8px rgba(79, 70, 229, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.boxShadow = "none";
        }}
        title="Profile"
      >
        {!user.profilePicture && userInitials}
        {user.isVerified && (
          <div
            style={{
              position: "absolute",
              bottom: "-2px",
              right: "-2px",
              width: "12px",
              height: "12px",
              background: "#10b981",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "8px",
              color: "#fff",
              border: "2px solid #fff",
            }}
          >
            ✓
          </div>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: "0",
            marginTop: "8px",
            width: "280px",
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
            border: "2px solid #4f46e5",
            zIndex: 99999,
            overflow: "hidden",
            pointerEvents: "auto",
          }}
          onClick={(e) => {
            e.stopPropagation();
            console.log("Dropdown container clicked");
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              color: "#fff",
              padding: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#fff",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  border: "2px solid rgba(255, 255, 255, 0.8)",
                  backgroundImage: user.profilePicture
                    ? `url(${user.profilePicture})`
                    : "none",
                  backgroundColor: user.profilePicture
                    ? "transparent"
                    : "rgba(255, 255, 255, 0.3)",
                  position: "relative",
                }}
              >
                {!user.profilePicture && userInitials}
                {user.isVerified && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-2px",
                      right: "-2px",
                      width: "14px",
                      height: "14px",
                      background: "#10b981",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "9px",
                      color: "#fff",
                      border: "2px solid #fff",
                    }}
                  >
                    ✓
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "600" }}>
                  {user.name || "User"}
                </div>
                <div style={{ fontSize: "11px", opacity: 0.9 }}>
                  {user.email}
                </div>
                <div style={{ fontSize: "10px", opacity: 0.8, marginTop: "2px" }}>
                  {user.isVerified ? "✓ Verified" : "⏳ Pending Verification"}
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: "12px" }}>
            <div style={{ 
              marginBottom: "12px",
              padding: "8px",
              background: "#f0f9ff",
              border: "1px solid #bae6fd",
              borderRadius: "6px",
              fontSize: "11px",
              color: "#0369a1",
              lineHeight: "1.4"
            }}>
              📸 <strong>Upload your photo</strong> to help couriers recognize you during delivery
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label
                htmlFor="profile-upload-small"
                style={{
                  display: "block",
                  padding: "10px 12px",
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  border: "none",
                  borderRadius: "6px",
                  textAlign: "center",
                  cursor: "pointer",
                  fontSize: "12px",
                  color: "#fff",
                  fontWeight: "600",
                  transition: "all 0.2s ease",
                }}
                onClick={() => {
                  console.log("Upload label clicked");
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow = "0 4px 12px rgba(79, 70, 229, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }}
              >
                {uploading ? "⏳ Uploading..." : "📷 Upload Profile Picture"}
              </label>
              <input
                id="profile-upload-small"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                style={{ display: "none" }}
                disabled={uploading}
              />
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log("Logout button clicked");
                handleLogout();
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "6px",
                textAlign: "center",
                fontSize: "12px",
                color: "#dc2626",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontWeight: "600",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#fee2e2";
                e.target.style.borderColor = "#fca5a5";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#fef2f2";
                e.target.style.borderColor = "#fecaca";
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SmallProfileDropdown;