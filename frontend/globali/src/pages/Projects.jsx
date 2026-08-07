import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL;

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [deletingId, setDeletingId] = useState("");
  const [editingId, setEditingId] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const fetchProjects = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login again.");
      setLoading(false);
      return;
    }

   fetch(`${API_BASE_URL}/api/projects`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProjects(data.projects);
        } else {
          setError(data.message || "Projects could not be loaded.");
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
    fetchProjects();
  }, []);

  const handleEdit = (project) => {
    setEditingId(project._id);
    setEditTitle(project.title);
    setEditDescription(project.description);
    setError("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    setEditingId("");
    setEditTitle("");
    setEditDescription("");
    setError("");
    setSuccess("");
  };

  const handleUpdate = async (projectId) => {
    if (!editTitle.trim() || !editDescription.trim()) {
      setError("Project title and description are required.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login again.");
      return;
    }

    try {
      setUpdatingId(projectId);
      setError("");
      setSuccess("");

      const response = await fetch(
      `${API_BASE_URL}/api/projects/${projectId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: editTitle.trim(),
            description: editDescription.trim(),
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setProjects((previousProjects) =>
          previousProjects.map((project) =>
            project._id === projectId ? data.project : project
          )
        );

        setEditingId("");
        setEditTitle("");
        setEditDescription("");
        setSuccess("Project updated successfully.");
      } else {
        setError(data.message || "Project could not be updated.");
      }
    } catch (err) {
      setError("Backend server is not responding.");
    } finally {
      setUpdatingId("");
    }
  };

  const handleDelete = async (projectId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this project?"
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
      setDeletingId(projectId);
      setError("");
      setSuccess("");

      const response = await fetch(
      `${API_BASE_URL}/api/projects/${projectId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setProjects((previousProjects) =>
          previousProjects.filter(
            (project) => project._id !== projectId
          )
        );

        setSuccess("Project deleted successfully.");
      } else {
        setError(data.message || "Project could not be deleted.");
      }
    } catch (err) {
      setError("Backend server is not responding.");
    } finally {
      setDeletingId("");
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
          overflowX: "auto",
        }}
      >
        <h1 style={{ color: "#0f62fe" }}>Projects</h1>

        {loading && (
          <p style={{ marginTop: "25px", fontSize: "17px" }}>
            Loading projects...
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

        {!loading && projects.length === 0 && (
          <div
            style={{
              marginTop: "25px",
              background: "#ffffff",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
            }}
          >
            <h3>No projects found</h3>
            <p>Your MongoDB database does not have any projects yet.</p>
          </div>
        )}

        {!loading && projects.length > 0 && (
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
                minWidth: "900px",
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
                  <th style={{ padding: "15px" }}>Project Title</th>
                  <th style={{ padding: "15px" }}>Description</th>
                  <th style={{ padding: "15px" }}>Created Date</th>
                  <th style={{ padding: "15px" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {projects.map((project, index) => (
                  <tr key={project._id}>
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
                      }}
                    >
                      {editingId === project._id ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(event) =>
                            setEditTitle(event.target.value)
                          }
                          style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #bbbbbb",
                            borderRadius: "6px",
                            boxSizing: "border-box",
                          }}
                        />
                      ) : (
                        <strong>{project.title}</strong>
                      )}
                    </td>

                    <td
                      style={{
                        padding: "15px",
                        borderBottom: "1px solid #dddddd",
                      }}
                    >
                      {editingId === project._id ? (
                        <textarea
                          value={editDescription}
                          onChange={(event) =>
                            setEditDescription(event.target.value)
                          }
                          rows="3"
                          style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #bbbbbb",
                            borderRadius: "6px",
                            resize: "vertical",
                            boxSizing: "border-box",
                          }}
                        />
                      ) : (
                        project.description
                      )}
                    </td>

                    <td
                      style={{
                        padding: "15px",
                        borderBottom: "1px solid #dddddd",
                        textAlign: "center",
                      }}
                    >
                      {project.createdAt
                        ? new Date(project.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>

                    <td
                      style={{
                        padding: "15px",
                        borderBottom: "1px solid #dddddd",
                        textAlign: "center",
                      }}
                    >
                      {editingId === project._id ? (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "8px",
                          }}
                        >
                          <button
                            onClick={() => handleUpdate(project._id)}
                            disabled={updatingId === project._id}
                            style={{
                              background: "#198754",
                              color: "#ffffff",
                              border: "none",
                              padding: "9px 14px",
                              borderRadius: "6px",
                              cursor:
                                updatingId === project._id
                                  ? "not-allowed"
                                  : "pointer",
                              fontWeight: "bold",
                            }}
                          >
                            {updatingId === project._id
                              ? "Saving..."
                              : "Save"}
                          </button>

                          <button
                            onClick={handleCancelEdit}
                            disabled={updatingId === project._id}
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
                            onClick={() => handleEdit(project)}
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
                            onClick={() => handleDelete(project._id)}
                            disabled={deletingId === project._id}
                            style={{
                              background:
                                deletingId === project._id
                                  ? "#e27b85"
                                  : "#dc3545",
                              color: "#ffffff",
                              border: "none",
                              padding: "9px 16px",
                              borderRadius: "6px",
                              cursor:
                                deletingId === project._id
                                  ? "not-allowed"
                                  : "pointer",
                              fontWeight: "bold",
                            }}
                          >
                            {deletingId === project._id
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

export default Projects;