import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(
          data.message || "Login failed. Please try again."
        );
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      setMessage("Login successful.");

      const userRole = data.user?.role;

      if (userRole === "admin") {
        navigate("/dashboard", {
          replace: true,
        });
      } else {
        navigate("/tasks", {
          replace: true,
        });
      }
    } catch (error) {
      console.error("Login error:", error);

      setMessage(
        "Unable to connect to the server. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background:
        "linear-gradient(135deg, #0f62fe, #eaf2ff)",
      fontFamily: "Arial, sans-serif",
      padding: "20px",
      boxSizing: "border-box",
    },

    card: {
      width: "100%",
      maxWidth: "420px",
      background: "#ffffff",
      borderRadius: "14px",
      padding: "35px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
      boxSizing: "border-box",
    },

    company: {
      color: "#0f62fe",
      textAlign: "center",
      fontWeight: "bold",
      fontSize: "14px",
      letterSpacing: "1px",
      marginBottom: "10px",
      textTransform: "uppercase",
    },

    heading: {
      textAlign: "center",
      marginBottom: "8px",
      color: "#222222",
      fontSize: "30px",
    },

    subHeading: {
      textAlign: "center",
      color: "#666666",
      marginBottom: "30px",
      fontSize: "15px",
    },

    label: {
      display: "block",
      marginBottom: "8px",
      fontWeight: "600",
      color: "#333333",
    },

    input: {
      width: "100%",
      padding: "13px",
      border: "1px solid #d9d9d9",
      borderRadius: "8px",
      marginBottom: "20px",
      fontSize: "15px",
      outline: "none",
      boxSizing: "border-box",
    },

    row: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "25px",
      fontSize: "14px",
      flexWrap: "wrap",
      gap: "10px",
    },

    checkbox: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      color: "#555555",
    },

    link: {
      color: "#0f62fe",
      textDecoration: "none",
      fontWeight: "600",
    },

    button: {
      width: "100%",
      padding: "14px",
      background: isLoading ? "#7aa7f8" : "#0f62fe",
      color: "#ffffff",
      border: "none",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: isLoading ? "not-allowed" : "pointer",
      marginBottom: "20px",
    },

    message: {
      textAlign: "center",
      marginBottom: "18px",
      color:
        message === "Login successful."
          ? "#198754"
          : "#dc3545",
      fontWeight: "600",
      lineHeight: "1.5",
    },

    footer: {
      textAlign: "center",
      color: "#666666",
      fontSize: "15px",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.company}>
          Global Digital Solutions
        </div>

        <h1 style={styles.heading}>Welcome Back</h1>

        <p style={styles.subHeading}>
          Sign in to access your account.
        </p>

        {message && (
          <p style={styles.message}>{message}</p>
        )}

        <form onSubmit={handleLogin}>
          <label htmlFor="email" style={styles.label}>
            Email
          </label>

          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            style={styles.input}
            autoComplete="email"
            required
          />

          <label htmlFor="password" style={styles.label}>
            Password
          </label>

          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            style={styles.input}
            autoComplete="current-password"
            required
          />

          <div style={styles.row}>
            <label style={styles.checkbox}>
              <input type="checkbox" />
              Remember Me
            </label>

            <Link
              to="/forgot-password"
              style={styles.link}
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            style={styles.button}
            disabled={isLoading}
          >
            {isLoading ? "Logging In..." : "Log In"}
          </button>
        </form>

        <div style={styles.footer}>
          Don't have an account?{" "}
          <Link to="/signup" style={styles.link}>
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;