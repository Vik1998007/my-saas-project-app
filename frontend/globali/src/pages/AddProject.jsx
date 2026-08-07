import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function AddProject() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });

    setMessage("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Project title and description are required.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login again.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await fetch(
        "http://localhost:5000/api/projects/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage("Project created successfully.");

        setFormData({
          title: "",
          description: "",
        });

        setTimeout(() => {
          navigate("/projects");
        }, 1000);
      } else {
        setError(data.message || "Project could not be created.");
      }
    } catch (err) {
      setError("Backend server is not responding.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f4f7fc",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          padding: "40px",
        }}
      >
        <h1 style={{ color: "#0f62fe" }}>Add Project</h1>

        <div
          style={{
            maxWidth: "700px",
            background: "#ffffff",
            padding: "30px",
            borderRadius: "12px",
            marginTop: "25px",
            boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
          }}
        >
          {message && (
            <div
              style={{
                background: "#d1e7dd",
                color: "#0f5132",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              {message}
            </div>
          )}

          {error && (
            <div
              style={{
                background: "#f8d7da",
                color: "#842029",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="title"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                Project Title
              </label>

              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter project title"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #cccccc",
                  borderRadius: "8px",
                  fontSize: "16px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="description"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                Project Description
              </label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter project description"
                rows="6"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #cccccc",
                  borderRadius: "8px",
                  fontSize: "16px",
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? "#6c9df8" : "#0f62fe",
                color: "#ffffff",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              {loading ? "Creating..." : "Create Project"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddProject;