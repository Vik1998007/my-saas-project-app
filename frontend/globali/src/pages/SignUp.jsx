import React, { useState } from "react";
import { Link } from "react-router-dom";

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setError("");
    setSuccessMessage("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const { fullName, email, password, confirmPassword } = formData;

    if (
      !fullName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setSuccessMessage("Your account has been created successfully.");

    console.log("Sign Up Data:", formData);

    setFormData({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #eaf3ff 0%, #ffffff 100%)",
      padding: "30px 15px",
      fontFamily: "Arial, sans-serif",
      boxSizing: "border-box",
    },

    card: {
      width: "100%",
      maxWidth: "450px",
      backgroundColor: "#ffffff",
      padding: "40px 35px",
      borderRadius: "16px",
      boxShadow: "0 12px 35px rgba(0, 86, 179, 0.15)",
      border: "1px solid #dbeafe",
      boxSizing: "border-box",
    },

    companyName: {
      margin: "0 0 10px",
      textAlign: "center",
      color: "#0056b3",
      fontSize: "26px",
      fontWeight: "700",
    },

    heading: {
      margin: "0",
      textAlign: "center",
      color: "#1f2937",
      fontSize: "30px",
      fontWeight: "700",
    },

    subtitle: {
      margin: "10px 0 30px",
      textAlign: "center",
      color: "#6b7280",
      fontSize: "15px",
      lineHeight: "1.6",
    },

    formGroup: {
      marginBottom: "18px",
    },

    label: {
      display: "block",
      marginBottom: "7px",
      color: "#1f2937",
      fontSize: "14px",
      fontWeight: "600",
    },

    input: {
      width: "100%",
      padding: "13px 14px",
      border: "1px solid #cbd5e1",
      borderRadius: "8px",
      fontSize: "15px",
      outline: "none",
      boxSizing: "border-box",
      backgroundColor: "#ffffff",
    },

    error: {
      marginBottom: "18px",
      padding: "11px",
      backgroundColor: "#fee2e2",
      color: "#b91c1c",
      border: "1px solid #fecaca",
      borderRadius: "7px",
      fontSize: "14px",
      textAlign: "center",
    },

    success: {
      marginBottom: "18px",
      padding: "11px",
      backgroundColor: "#dcfce7",
      color: "#166534",
      border: "1px solid #bbf7d0",
      borderRadius: "7px",
      fontSize: "14px",
      textAlign: "center",
    },

    button: {
      width: "100%",
      padding: "14px",
      marginTop: "5px",
      backgroundColor: "#0066cc",
      color: "#ffffff",
      border: "none",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "700",
      cursor: "pointer",
      boxShadow: "0 5px 15px rgba(0, 102, 204, 0.25)",
    },

    loginText: {
      marginTop: "24px",
      marginBottom: "0",
      textAlign: "center",
      color: "#4b5563",
      fontSize: "15px",
    },

    loginLink: {
      color: "#0066cc",
      fontWeight: "700",
      textDecoration: "none",
      marginLeft: "5px",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.companyName}>Global Digital Solutions</h2>

        <h1 style={styles.heading}>Welcome</h1>

        <p style={styles.subtitle}>
          Create your account to access our professional digital services.
        </p>

        {error && <div style={styles.error}>{error}</div>}

        {successMessage && (
          <div style={styles.success}>{successMessage}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label htmlFor="fullName" style={styles.label}>
              Full Name
            </label>

            <input
              id="fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>
              Email Address
            </label>

            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="confirmPassword" style={styles.label}>
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.button}>
            Create Account
          </button>
        </form>

        <p style={styles.loginText}>
          Already have an account?
          <Link to="/login" style={styles.loginLink}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;