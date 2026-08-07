import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL;

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editService, setEditService] = useState("");
  const [editStatus, setEditStatus] = useState("");

  const fetchCustomers = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login again.");
      setLoading(false);
      return;
    }

   fetch(`${API_BASE_URL}/api/customers`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setCustomers(data.customers);
        } else {
          setError(data.message || "Customers could not be loaded.");
        }
      })
      .catch(() => {
        setError("Backend server is not responding.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const getStatusColor = (status) => {
    if (status === "Active") {
      return "green";
    }

    if (status === "Inactive") {
      return "red";
    }

    return "orange";
  };

  const handleEdit = (customer) => {
    setEditingId(customer._id);
    setEditName(customer.name);
    setEditEmail(customer.email);
    setEditService(customer.service);
    setEditStatus(customer.status);
    setError("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    setEditingId("");
    setEditName("");
    setEditEmail("");
    setEditService("");
    setEditStatus("");
    setError("");
    setSuccess("");
  };

  const handleUpdate = async (customerId) => {
    if (
      !editName.trim() ||
      !editEmail.trim() ||
      !editService.trim() ||
      !editStatus
    ) {
      setError("All customer fields are required.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login again.");
      return;
    }

    try {
      setUpdatingId(customerId);
      setError("");
      setSuccess("");

      const response = await fetch(
      `${API_BASE_URL}/api/customers/${customerId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editName.trim(),
            email: editEmail.trim(),
            service: editService.trim(),
            status: editStatus,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setCustomers((previousCustomers) =>
          previousCustomers.map((customer) =>
            customer._id === customerId ? data.customer : customer
          )
        );

        setEditingId("");
        setEditName("");
        setEditEmail("");
        setEditService("");
        setEditStatus("");
        setSuccess("Customer updated successfully.");
      } else {
        setError(data.message || "Customer could not be updated.");
      }
    } catch (err) {
      setError("Backend server is not responding.");
    } finally {
      setUpdatingId("");
    }
  };

  const handleDelete = async (customerId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this customer?"
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
      setDeletingId(customerId);
      setError("");
      setSuccess("");

      const response = await fetch(
      `${API_BASE_URL}/api/customers/${customerId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setCustomers((previousCustomers) =>
          previousCustomers.filter(
            (customer) => customer._id !== customerId
          )
        );

        setSuccess("Customer deleted successfully.");
      } else {
        setError(data.message || "Customer could not be deleted.");
      }
    } catch (err) {
      setError("Backend server is not responding.");
    } finally {
      setDeletingId("");
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "9px",
    border: "1px solid #bbbbbb",
    borderRadius: "6px",
    boxSizing: "border-box",
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
        <h1 style={{ color: "#0f62fe" }}>Customers</h1>

        {loading && (
          <p
            style={{
              marginTop: "25px",
              fontSize: "17px",
            }}
          >
            Loading customers...
          </p>
        )}

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

        {!loading && customers.length === 0 && (
          <div
            style={{
              marginTop: "25px",
              background: "#ffffff",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
            }}
          >
            <h3>No customers found</h3>
            <p>Add your first customer from the Add Customer page.</p>
          </div>
        )}

        {!loading && customers.length > 0 && (
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
                minWidth: "1100px",
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
                  <th style={{ padding: "15px" }}>Service</th>
                  <th style={{ padding: "15px" }}>Status</th>
                  <th style={{ padding: "15px" }}>Created Date</th>
                  <th style={{ padding: "15px" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer, index) => (
                  <tr key={customer._id}>
                    <td
                      style={{
                        padding: "15px",
                        borderBottom: "1px solid #dddddd",
                        textAlign: "center",
                      }}
                    >
                      {index + 1}
                    </td>

                    <td
                      style={{
                        padding: "15px",
                        borderBottom: "1px solid #dddddd",
                        fontWeight: "bold",
                      }}
                    >
                      {editingId === customer._id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(event) =>
                            setEditName(event.target.value)
                          }
                          style={inputStyle}
                        />
                      ) : (
                        customer.name
                      )}
                    </td>

                    <td
                      style={{
                        padding: "15px",
                        borderBottom: "1px solid #dddddd",
                      }}
                    >
                      {editingId === customer._id ? (
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(event) =>
                            setEditEmail(event.target.value)
                          }
                          style={inputStyle}
                        />
                      ) : (
                        customer.email
                      )}
                    </td>

                    <td
                      style={{
                        padding: "15px",
                        borderBottom: "1px solid #dddddd",
                      }}
                    >
                      {editingId === customer._id ? (
                        <input
                          type="text"
                          value={editService}
                          onChange={(event) =>
                            setEditService(event.target.value)
                          }
                          style={inputStyle}
                        />
                      ) : (
                        customer.service
                      )}
                    </td>

                    <td
                      style={{
                        padding: "15px",
                        borderBottom: "1px solid #dddddd",
                        textAlign: "center",
                        color:
                          editingId === customer._id
                            ? "#000000"
                            : getStatusColor(customer.status),
                        fontWeight: "bold",
                      }}
                    >
                      {editingId === customer._id ? (
                        <select
                          value={editStatus}
                          onChange={(event) =>
                            setEditStatus(event.target.value)
                          }
                          style={inputStyle}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      ) : (
                        customer.status
                      )}
                    </td>

                    <td
                      style={{
                        padding: "15px",
                        borderBottom: "1px solid #dddddd",
                        textAlign: "center",
                      }}
                    >
                      {customer.createdAt
                        ? new Date(customer.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>

                    <td
                      style={{
                        padding: "15px",
                        borderBottom: "1px solid #dddddd",
                        textAlign: "center",
                      }}
                    >
                      {editingId === customer._id ? (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "8px",
                          }}
                        >
                          <button
                            onClick={() => handleUpdate(customer._id)}
                            disabled={updatingId === customer._id}
                            style={{
                              background: "#198754",
                              color: "#ffffff",
                              border: "none",
                              padding: "9px 14px",
                              borderRadius: "6px",
                              cursor:
                                updatingId === customer._id
                                  ? "not-allowed"
                                  : "pointer",
                              fontWeight: "bold",
                            }}
                          >
                            {updatingId === customer._id
                              ? "Saving..."
                              : "Save"}
                          </button>

                          <button
                            onClick={handleCancelEdit}
                            disabled={updatingId === customer._id}
                            style={{
                              background: "#6c757d",
                              color: "#ffffff",
                              border: "none",
                              padding: "9px 14px",
                              borderRadius: "6px",
                              cursor:
                                updatingId === customer._id
                                  ? "not-allowed"
                                  : "pointer",
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
                            onClick={() => handleEdit(customer)}
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
                            onClick={() => handleDelete(customer._id)}
                            disabled={deletingId === customer._id}
                            style={{
                              background:
                                deletingId === customer._id
                                  ? "#e27b85"
                                  : "#dc3545",
                              color: "#ffffff",
                              border: "none",
                              padding: "9px 16px",
                              borderRadius: "6px",
                              cursor:
                                deletingId === customer._id
                                  ? "not-allowed"
                                  : "pointer",
                              fontWeight: "bold",
                            }}
                          >
                            {deletingId === customer._id
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

export default Customers;