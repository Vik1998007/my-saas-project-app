import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL;

function Enquiries() {
  const navigate = useNavigate();

  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
    status: "New",
  });

  const fetchEnquiries = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
      `${API_BASE_URL}/api/enquiries`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setEnquiries(data.enquiries);
      } else {
        setError(data.message || "Enquiries could not be loaded.");
      }
    } catch (error) {
      setError("Backend server is not responding.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleEdit = (enquiry) => {
    setEditingId(enquiry._id);

    setEditData({
      name: enquiry.name || "",
      email: enquiry.email || "",
      phone: enquiry.phone || "",
      service: enquiry.service || "",
      message: enquiry.message || "",
      status: enquiry.status || "New",
    });

    setError("");
    setSuccess("");
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleCancelEdit = () => {
    setEditingId("");
    setError("");
    setSuccess("");
  };

  const handleUpdate = async (enquiryId) => {
    const { name, email, phone, service, message, status } = editData;

    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !service.trim() ||
      !message.trim() ||
      !status
    ) {
      setError("Please fill in all enquiry fields.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login again.");
      return;
    }

    try {
      setUpdatingId(enquiryId);
      setError("");
      setSuccess("");

      const response = await fetch(
      `${API_BASE_URL}/api/enquiries/${enquiryId}`,
        {
          method: "PUT",
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
        setEnquiries((previousEnquiries) =>
          previousEnquiries.map((enquiry) =>
            enquiry._id === enquiryId ? data.enquiry : enquiry
          )
        );

        setEditingId("");
        setSuccess("Enquiry updated successfully.");
      } else {
        setError(data.message || "Enquiry could not be updated.");
      }
    } catch (error) {
      setError("Backend server is not responding.");
    } finally {
      setUpdatingId("");
    }
  };

  const handleDelete = async (enquiryId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this enquiry?"
    );

    if (!confirmDelete) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login again.");
      return;
    }

    try {
      setDeletingId(enquiryId);
      setError("");
      setSuccess("");

      const response = await fetch(
      `${API_BASE_URL}/api/enquiries/${enquiryId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setEnquiries((previousEnquiries) =>
          previousEnquiries.filter(
            (enquiry) => enquiry._id !== enquiryId
          )
        );

        setSuccess("Enquiry deleted successfully.");
      } else {
        setError(data.message || "Enquiry could not be deleted.");
      }
    } catch (error) {
      setError("Backend server is not responding.");
    } finally {
      setDeletingId("");
    }
  };

  const inputStyle = {
    width: "100%",
    minWidth: "140px",
    padding: "9px",
    border: "1px solid #bbbbbb",
    borderRadius: "6px",
    boxSizing: "border-box",
  };

  const cellStyle = {
    padding: "14px",
    borderBottom: "1px solid #dddddd",
    verticalAlign: "top",
  };

  const getStatusColor = (status) => {
    if (status === "New") return "#0f62fe";
    if (status === "Contacted") return "#e67e22";
    if (status === "Converted") return "#198754";
    return "#6c757d";
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
          overflowX: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          <h1 style={{ color: "#0f62fe", margin: 0 }}>Enquiries</h1>

          <button
            onClick={() => navigate("/add-enquiry")}
            style={{
              background: "#0f62fe",
              color: "#ffffff",
              border: "none",
              padding: "12px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            + Add Enquiry
          </button>
        </div>

        {loading && <p style={{ marginTop: "25px" }}>Loading enquiries...</p>}

        {error && (
          <div
            style={{
              marginTop: "25px",
              background: "#f8d7da",
              color: "#842029",
              padding: "15px",
              borderRadius: "8px",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              marginTop: "25px",
              background: "#d1e7dd",
              color: "#0f5132",
              padding: "15px",
              borderRadius: "8px",
            }}
          >
            {success}
          </div>
        )}

        {!loading && enquiries.length === 0 && (
          <div
            style={{
              marginTop: "25px",
              background: "#ffffff",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
            }}
          >
            <h3>No enquiries found</h3>
            <p>Add your first enquiry from the Add Enquiry page.</p>
          </div>
        )}

        {!loading && enquiries.length > 0 && (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              marginTop: "25px",
              overflowX: "auto",
              boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
            }}
          >
            <table
              style={{
                width: "100%",
                minWidth: "1400px",
                borderCollapse: "collapse",
              }}
            >
              <thead
                style={{
                  background: "#0f62fe",
                  color: "#ffffff",
                }}
              >
                <tr>
                  <th style={{ padding: "15px" }}>No.</th>
                  <th style={{ padding: "15px" }}>Name</th>
                  <th style={{ padding: "15px" }}>Email</th>
                  <th style={{ padding: "15px" }}>Phone</th>
                  <th style={{ padding: "15px" }}>Service</th>
                  <th style={{ padding: "15px" }}>Message</th>
                  <th style={{ padding: "15px" }}>Status</th>
                  <th style={{ padding: "15px" }}>Created Date</th>
                  <th style={{ padding: "15px" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {enquiries.map((enquiry, index) => (
                  <tr key={enquiry._id}>
                    <td style={{ ...cellStyle, textAlign: "center" }}>
                      {index + 1}
                    </td>

                    <td style={cellStyle}>
                      {editingId === enquiry._id ? (
                        <input
                          name="name"
                          value={editData.name}
                          onChange={handleEditChange}
                          style={inputStyle}
                        />
                      ) : (
                        <strong>{enquiry.name}</strong>
                      )}
                    </td>

                    <td style={cellStyle}>
                      {editingId === enquiry._id ? (
                        <input
                          type="email"
                          name="email"
                          value={editData.email}
                          onChange={handleEditChange}
                          style={inputStyle}
                        />
                      ) : (
                        enquiry.email
                      )}
                    </td>

                    <td style={cellStyle}>
                      {editingId === enquiry._id ? (
                        <input
                          name="phone"
                          value={editData.phone}
                          onChange={handleEditChange}
                          style={inputStyle}
                        />
                      ) : (
                        enquiry.phone
                      )}
                    </td>

                    <td style={cellStyle}>
                      {editingId === enquiry._id ? (
                        <select
                          name="service"
                          value={editData.service}
                          onChange={handleEditChange}
                          style={inputStyle}
                        >
                          <option value="">Select service</option>
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
                      ) : (
                        enquiry.service
                      )}
                    </td>

                    <td style={{ ...cellStyle, maxWidth: "280px" }}>
                      {editingId === enquiry._id ? (
                        <textarea
                          name="message"
                          value={editData.message}
                          onChange={handleEditChange}
                          rows="4"
                          style={{
                            ...inputStyle,
                            minWidth: "220px",
                            resize: "vertical",
                          }}
                        />
                      ) : (
                        enquiry.message
                      )}
                    </td>

                    <td style={{ ...cellStyle, textAlign: "center" }}>
                      {editingId === enquiry._id ? (
                        <select
                          name="status"
                          value={editData.status}
                          onChange={handleEditChange}
                          style={inputStyle}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Converted">Converted</option>
                          <option value="Closed">Closed</option>
                        </select>
                      ) : (
                        <span
                          style={{
                            color: getStatusColor(enquiry.status),
                            fontWeight: "bold",
                          }}
                        >
                          {enquiry.status}
                        </span>
                      )}
                    </td>

                    <td style={{ ...cellStyle, textAlign: "center" }}>
                      {enquiry.createdAt
                        ? new Date(enquiry.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>

                    <td style={{ ...cellStyle, textAlign: "center" }}>
                      {editingId === enquiry._id ? (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "8px",
                          }}
                        >
                          <button
                            onClick={() => handleUpdate(enquiry._id)}
                            disabled={updatingId === enquiry._id}
                            style={{
                              background: "#198754",
                              color: "#ffffff",
                              border: "none",
                              padding: "9px 14px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontWeight: "bold",
                            }}
                          >
                            {updatingId === enquiry._id
                              ? "Saving..."
                              : "Save"}
                          </button>

                          <button
                            onClick={handleCancelEdit}
                            style={{
                              background: "#6c757d",
                              color: "#ffffff",
                              border: "none",
                              padding: "9px 14px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontWeight: "bold",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "8px",
                          }}
                        >
                          <button
                            onClick={() => handleEdit(enquiry)}
                            style={{
                              background: "#ffc107",
                              color: "#212529",
                              border: "none",
                              padding: "9px 16px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontWeight: "bold",
                            }}
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(enquiry._id)}
                            disabled={deletingId === enquiry._id}
                            style={{
                              background: "#dc3545",
                              color: "#ffffff",
                              border: "none",
                              padding: "9px 16px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontWeight: "bold",
                            }}
                          >
                            {deletingId === enquiry._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Enquiries;