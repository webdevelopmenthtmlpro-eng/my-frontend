import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function RegisterForm({ onRegisterSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setMessage("❌ Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,      // ✅ send 'name' instead of 'username'
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("✅ Registration successful! Please log in.");
        setFormData({ name: "", email: "", password: "", confirmPassword: "" });
        if (onRegisterSuccess) onRegisterSuccess();
      } else {
        setMessage(`❌ Error: ${data.error || "Registration failed"}`);
      }
    } catch (err) {
      setMessage("❌ Unable to connect. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: "400px",
        margin: "20px auto",
        padding: "30px",
        border: "1px solid #e1e5e9",
        borderRadius: "12px",
        backgroundColor: "#f8f9fa",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "25px", color: "#2c3e50", fontWeight: "600" }}>Register</h2>
      <input
        id="registerName"
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={handleChange}
        required
        style={{
          width: "100%",
          padding: "12px 15px",
          marginBottom: "15px",
          boxSizing: "border-box",
          border: "1px solid #ddd",
          borderRadius: "8px",
          fontSize: "14px",
          transition: "border-color 0.3s"
        }}
      />
      <input
        id="registerEmail"
        name="email"
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
        style={{
          width: "100%",
          padding: "12px 15px",
          marginBottom: "15px",
          boxSizing: "border-box",
          border: "1px solid #ddd",
          borderRadius: "8px",
          fontSize: "14px",
          transition: "border-color 0.3s"
        }}
      />
      <input
        id="registerPassword"
        name="password"
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
        style={{
          width: "100%",
          padding: "12px 15px",
          marginBottom: "15px",
          boxSizing: "border-box",
          border: "1px solid #ddd",
          borderRadius: "8px",
          fontSize: "14px",
          transition: "border-color 0.3s"
        }}
      />
      <input
        id="registerConfirmPassword"
        name="confirmPassword"
        type="password"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
        style={{
          width: "100%",
          padding: "12px 15px",
          marginBottom: "20px",
          boxSizing: "border-box",
          border: "1px solid #ddd",
          borderRadius: "8px",
          fontSize: "14px",
          transition: "border-color 0.3s"
        }}
      />
      <button
        id="registerButton"
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: "#0078d7",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "500",
          transition: "background-color 0.3s"
        }}
      >
        {loading ? "Registering..." : "Register"}
      </button>
      {message && (
        <p style={{ marginTop: "15px", textAlign: "center", fontSize: "14px" }}>{message}</p>
      )}
    </form>
  );
}

export default RegisterForm;
