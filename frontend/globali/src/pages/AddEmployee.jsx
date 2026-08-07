import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL;

function AddEmployee() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "employee",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await 
      fetch(
        `${API_BASE_URL}/api/employees`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Employee added successfully.");
        navigate("/employees");
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Server Error");
    }

    setLoading(false);
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f4f7fb",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    card: {
      width: "100%",
      maxWidth: 500,
      background: "#fff",
      padding: 30,
      borderRadius: 12,
      boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
    },
    title: {
      textAlign: "center",
      marginBottom: 25,
      color: "#0f62fe",
    },
    input: {
      width: "100%",
      padding: 12,
      marginBottom: 15,
      border: "1px solid #ccc",
      borderRadius: 8,
      fontSize: 16,
      boxSizing: "border-box",
    },
    button: {
      width: "100%",
      padding: 14,
      background: "#0f62fe",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      cursor: "pointer",
      fontSize: 16,
      fontWeight: "bold",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Add Employee</h2>

        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          <input
            style={styles.input}
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            style={styles.input}
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <select
            style={styles.input}
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
          </select>

          <button style={styles.button} disabled={loading}>
            {loading ? "Adding..." : "Add Employee"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddEmployee;