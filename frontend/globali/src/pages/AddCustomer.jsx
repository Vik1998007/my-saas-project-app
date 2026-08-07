import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL;

function AddCustomer() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    service: "",
    status: "Pending",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please login again.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
       `${API_BASE_URL}/api/customers/create`,
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

      if (data.success) {
        setMessage("Customer added successfully.");

        setFormData({
          name: "",
          email: "",
          service: "",
          status: "Pending",
        });

        setTimeout(() => {
          navigate("/customers");
        }, 1000);
      } else {
        setMessage(data.message);
      }
    } catch {
      setMessage("Backend server is not responding.");
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
      }}
    >
      <Sidebar />

      <div style={{ flex: 1, padding: "40px" }}>
        <h1 style={{ color: "#0f62fe" }}>Add Customer</h1>

        <form
          onSubmit={handleSubmit}
          style={{
            maxWidth: "600px",
            background: "#fff",
            padding: "30px",
            borderRadius: "12px",
            marginTop: "20px",
          }}
        >
          <input
            type="text"
            name="name"
            placeholder="Customer Name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "15px",
            }}
          />

          <input
            type="email"
            name="email"
            placeholder="Customer Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "15px",
            }}
          />

          <input
            type="text"
            name="service"
            placeholder="Service"
            value={formData.service}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "15px",
            }}
          />

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "20px",
            }}
          >
            <option>Pending</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#0f62fe",
              color: "#fff",
              border: "none",
              padding: "12px 20px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            {loading ? "Saving..." : "Add Customer"}
          </button>

          {message && (
            <p style={{ marginTop: "20px" }}>{message}</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default AddCustomer;