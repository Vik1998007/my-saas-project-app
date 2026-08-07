import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL;

function AddEnquiry() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
    status: "New",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const { name, email, phone, service, message, status } = formData;

    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !service.trim() ||
      !message.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login again.");
      return;
    }

    try {
      setLoading(true);

      const response = await 
      fetch(
        `${API_BASE_URL}/api/enquiries`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            service: service.trim(),
            message: message.trim(),
            status,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess("Enquiry added successfully.");

        setFormData({
          name: "",
          email: "",
          phone: "",
          service: "",
          message: "",
          status: "New",
        });

        setTimeout(() => {
          navigate("/enquiries");
        }, 1000);
      } else {
        setError(data.message || "Enquiry could not be added.");
      }
    } catch (error) {
      setError("Backend server is not responding.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    border: "1px solid #cccccc",
    borderRadius: "8px",
    fontSize: "15px",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontWeight: "bold",
    color: "#222222",
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
        <div
          style={{
            maxWidth: "750px",
            margin: "0 auto",
            background: "#ffffff",
            padding: "35px",
            borderRadius: "14px",
            boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
          }}
        >
          <h1
            style={{
              color: "#0f62fe",
              marginTop: "0",
            }}
          >
            Add Enquiry
          </h1>

          <p
            style={{
              color: "#555555",
              marginBottom: "25px",
            }}
          >
            Enter the enquiry details below.
          </p>

          {error && (
            <div
              style={{
                background: "#f8d7da",
                color: "#842029",
                padding: "14px",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                background: "#d1e7dd",
                color: "#0f5132",
                padding: "14px",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Customer Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter customer name"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Service</label>
              <select
                name="service"
                value={formData.service}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">Select a service</option>
                <option value="Website Development">
                  Website Development
                </option>
                <option value="Application Development">
                  Application Development
                </option>
                <option value="SEO Services">SEO Services</option>
                <option value="Digital Marketing">
                  Digital Marketing
                </option>
                <option value="Project Management">
                  Project Management
                </option>
              </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Converted">Converted</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div style={{ marginBottom: "25px" }}>
              <label style={labelStyle}>Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Enter enquiry message"
                rows="5"
                style={{
                  ...inputStyle,
                  resize: "vertical",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? "#7da7f8" : "#0f62fe",
                  color: "#ffffff",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                  fontSize: "15px",
                }}
              >
                {loading ? "Adding..." : "Add Enquiry"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/enquiries")}
                style={{
                  background: "#6c757d",
                  color: "#ffffff",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "15px",
                }}
              >
                View Enquiries
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddEnquiry;