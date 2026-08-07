import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL;

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [saving, setSaving] = useState(false);

  const getEmployees = async () => {
    try {
      setLoading(true);

     const response = await fetch(
      `${API_BASE_URL}/api/employees`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setEmployees(data.employees || []);
      } else {
        alert(data.message || "Failed to load employees.");
      }
    } catch (error) {
      alert("Unable to connect to the backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return employees;
    }

    return employees.filter((employee) => {
      return (
        employee.fullName?.toLowerCase().includes(value) ||
        employee.email?.toLowerCase().includes(value) ||
        employee.role?.toLowerCase().includes(value)
      );
    });
  }, [employees, search]);

  const handleDelete = async (employeeId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmed) {
      return;
    }

    try {
     const response = await fetch(
  `${API_BASE_URL}/api/employees/${employeeId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setEmployees((currentEmployees) =>
          currentEmployees.filter(
            (employee) => employee._id !== employeeId
          )
        );

        alert("Employee deleted successfully.");
      } else {
        alert(data.message || "Failed to delete employee.");
      }
    } catch (error) {
      alert("Server error.");
    }
  };

  const openEditForm = (employee) => {
    setEditingEmployee({
      id: employee._id,
      fullName: employee.fullName || "",
      email: employee.email || "",
      role: employee.role || "employee",
      isActive: employee.isActive !== false,
      password: "",
    });
  };

  const closeEditForm = () => {
    setEditingEmployee(null);
  };

  const handleEditChange = (event) => {
    const { name, value, type, checked } = event.target;

    setEditingEmployee((currentEmployee) => ({
      ...currentEmployee,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (!editingEmployee) {
      return;
    }

    try {
      setSaving(true);

      const updateData = {
        fullName: editingEmployee.fullName,
        email: editingEmployee.email,
        role: editingEmployee.role,
        isActive: editingEmployee.isActive,
      };

      if (editingEmployee.password.trim()) {
        updateData.password = editingEmployee.password;
      }

      const response = await fetch(
      `${API_BASE_URL}/api/employees/${editingEmployee.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        await getEmployees();
        closeEditForm();
        alert("Employee updated successfully.");
      } else {
        alert(data.message || "Failed to update employee.");
      }
    } catch (error) {
      alert("Server error.");
    } finally {
      setSaving(false);
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f4f7fb",
      display: "flex",
      fontFamily: "Arial, sans-serif",
    },

    content: {
      flex: 1,
      marginLeft: 250,
      padding: 30,
      boxSizing: "border-box",
    },

    topBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 15,
      marginBottom: 25,
      flexWrap: "wrap",
    },

    heading: {
      margin: 0,
      color: "#172b4d",
      fontSize: 30,
    },

    addButton: {
      background: "#0f62fe",
      color: "#ffffff",
      padding: "12px 20px",
      borderRadius: 8,
      textDecoration: "none",
      fontWeight: "bold",
    },

    card: {
      background: "#ffffff",
      borderRadius: 14,
      padding: 24,
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
    },

    searchInput: {
      width: "100%",
      padding: 13,
      border: "1px solid #d7deea",
      borderRadius: 8,
      fontSize: 15,
      boxSizing: "border-box",
      marginBottom: 20,
    },

    tableWrapper: {
      overflowX: "auto",
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: 750,
    },

    tableHeader: {
      background: "#edf4ff",
      color: "#172b4d",
      textAlign: "left",
    },

    th: {
      padding: 14,
      borderBottom: "1px solid #dfe6ef",
      fontSize: 14,
    },

    td: {
      padding: 14,
      borderBottom: "1px solid #edf0f5",
      color: "#354052",
      fontSize: 14,
    },

    roleBadge: {
      display: "inline-block",
      padding: "5px 10px",
      borderRadius: 20,
      background: "#e7f0ff",
      color: "#0f62fe",
      fontWeight: "bold",
      textTransform: "capitalize",
    },

    activeBadge: {
      display: "inline-block",
      padding: "5px 10px",
      borderRadius: 20,
      background: "#e7f8ee",
      color: "#16803c",
      fontWeight: "bold",
    },

    inactiveBadge: {
      display: "inline-block",
      padding: "5px 10px",
      borderRadius: 20,
      background: "#fdecec",
      color: "#c62828",
      fontWeight: "bold",
    },

    actionButton: {
      border: "none",
      padding: "8px 12px",
      borderRadius: 6,
      cursor: "pointer",
      fontWeight: "bold",
      marginRight: 8,
    },

    editButton: {
      background: "#fff4d8",
      color: "#8a6200",
    },

    deleteButton: {
      background: "#fdecec",
      color: "#c62828",
    },

    emptyText: {
      textAlign: "center",
      padding: 30,
      color: "#697386",
    },

    modalOverlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(15, 23, 42, 0.55)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      zIndex: 999,
    },

    modal: {
      width: "100%",
      maxWidth: 500,
      background: "#ffffff",
      borderRadius: 14,
      padding: 28,
      boxShadow: "0 18px 50px rgba(0, 0, 0, 0.22)",
    },

    modalTitle: {
      marginTop: 0,
      marginBottom: 22,
      color: "#172b4d",
    },

    input: {
      width: "100%",
      padding: 12,
      marginBottom: 14,
      border: "1px solid #ccd5e1",
      borderRadius: 8,
      boxSizing: "border-box",
      fontSize: 15,
    },

    checkboxRow: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 18,
    },

    modalActions: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 10,
    },

    cancelButton: {
      padding: "10px 16px",
      border: "1px solid #ccd5e1",
      borderRadius: 7,
      background: "#ffffff",
      cursor: "pointer",
    },

    saveButton: {
      padding: "10px 16px",
      border: "none",
      borderRadius: 7,
      background: "#0f62fe",
      color: "#ffffff",
      cursor: "pointer",
      fontWeight: "bold",
    },
  };

  return (
    <div style={styles.page}>
      <Sidebar />

      <main style={styles.content}>
        <div style={styles.topBar}>
          <h1 style={styles.heading}>Employees</h1>

          <Link to="/add-employee" style={styles.addButton}>
            + Add Employee
          </Link>
        </div>

        <div style={styles.card}>
          <input
            type="text"
            placeholder="Search by name, email or role..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={styles.searchInput}
          />

          {loading ? (
            <p style={styles.emptyText}>Loading employees...</p>
          ) : filteredEmployees.length === 0 ? (
            <p style={styles.emptyText}>No employees found.</p>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee._id}>
                      <td style={styles.td}>{employee.fullName}</td>

                      <td style={styles.td}>{employee.email}</td>

                      <td style={styles.td}>
                        <span style={styles.roleBadge}>
                          {employee.role}
                        </span>
                      </td>

                      <td style={styles.td}>
                        <span
                          style={
                            employee.isActive
                              ? styles.activeBadge
                              : styles.inactiveBadge
                          }
                        >
                          {employee.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td style={styles.td}>
                        <button
                          type="button"
                          onClick={() => openEditForm(employee)}
                          style={{
                            ...styles.actionButton,
                            ...styles.editButton,
                          }}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(employee._id)}
                          style={{
                            ...styles.actionButton,
                            ...styles.deleteButton,
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {editingEmployee && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Edit Employee</h2>

            <form onSubmit={handleUpdate}>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={editingEmployee.fullName}
                onChange={handleEditChange}
                style={styles.input}
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={editingEmployee.email}
                onChange={handleEditChange}
                style={styles.input}
                required
              />

              <select
                name="role"
                value={editingEmployee.role}
                onChange={handleEditChange}
                style={styles.input}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
              </select>

              <input
                type="password"
                name="password"
                placeholder="New Password — optional"
                value={editingEmployee.password}
                onChange={handleEditChange}
                style={styles.input}
              />

              <label style={styles.checkboxRow}>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={editingEmployee.isActive}
                  onChange={handleEditChange}
                />
                Active Employee
              </label>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={closeEditForm}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  style={styles.saveButton}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employees;