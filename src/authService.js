import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebase";

// Login with Firebase and return the Firebase ID token
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get Firebase ID token
    const idToken = await user.getIdToken();
    console.log("Firebase ID Token:", idToken);

    return idToken;
  } catch (error) {
    console.error("Login error:", error.message);
    throw error;
  }
};

// Read current user info from the JWT stored in localStorage (set after backend login)
export const getCurrentUser = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));

    // Normalized shape; AdminDashboard uses email/name/role
    return {
      email: decoded.email || decoded.user?.email || "",
      role: decoded.role || decoded.user?.role || "",
      ...decoded
    };
  } catch (err) {
    console.error("getCurrentUser error", err);
    return null;
  }
};

// Logout function - cleans up both localStorage token and Firebase auth state
export const logoutUser = async () => {
  try {
    // Remove local storage token
    localStorage.removeItem("token");
    
    // Sign out from Firebase
    await signOut(auth);
    
    console.log("User successfully logged out from both Firebase and local storage");
  } catch (error) {
    console.error("Logout error:", error);
    // Even if Firebase signout fails, still remove local token
    localStorage.removeItem("token");
  }
};
