import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL;

const API_URL =
  `${API_BASE_URL}/api/tasks`;
  
const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("token") ||
    ""
  );
};

function Task() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Login token not found. Please login again.");
        setTasks([]);
        return;
      }

      const response = await axios.get(`${API_URL}/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks(response.data.tasks || []);
    } catch (err) {
      console.error("Fetch tasks error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load tasks. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const updateTaskStatus = async (taskId, status) => {
    try {
      setUpdatingTaskId(taskId);
      setMessage("");
      setError("");

      const token = getToken();

      if (!token) {
        setError("Login token not found. Please login again.");
        return;
      }

      const response = await axios.put(
        `${API_URL}/${taskId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task._id === taskId
            ? {
                ...task,
                status: response.data.task.status,
                completedAt: response.data.task.completedAt,
              }
            : task
        )
      );

      setMessage("Task status updated successfully.");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.error("Update task error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update task status."
      );
    } finally {
      setUpdatingTaskId("");
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getPriorityStyle = (priority) => {
    if (priority === "High") {
      return {
        backgroundColor: "#fee2e2",
        color: "#b91c1c",
      };
    }

    if (priority === "Low") {
      return {
        backgroundColor: "#dcfce7",
        color: "#15803d",
      };
    }

    return {
      backgroundColor: "#fef3c7",
      color: "#a16207",
    };
  };

  const getStatusStyle = (status) => {
    if (status === "Completed") {
      return {
        backgroundColor: "#dcfce7",
        color: "#15803d",
      };
    }

    if (status === "In Progress") {
      return {
        backgroundColor: "#dbeafe",
        color: "#1d4ed8",
      };
    }

    return {
      backgroundColor: "#f3f4f6",
      color: "#4b5563",
    };
  };

  const styles = {
    page: {
      minHeight: "100vh",
      backgroundColor: "#f4f7fb",
      padding: "30px 20px",
      fontFamily: "Arial, sans-serif",
    },

    container: {
      maxWidth: "1200px",
      margin: "0 auto",
    },

    header: {
      backgroundColor: "#ffffff",
      padding: "25px",
      borderRadius: "14px",
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
      marginBottom: "25px",
    },

    heading: {
      margin: "0 0 8px 0",
      color: "#0f172a",
      fontSize: "30px",
    },

    subtitle: {
      margin: 0,
      color: "#64748b",
      fontSize: "15px",
      lineHeight: "1.6",
    },

    message: {
      backgroundColor: "#dcfce7",
      color: "#166534",
      padding: "12px 16px",
      borderRadius: "8px",
      marginBottom: "20px",
      border: "1px solid #bbf7d0",
    },

    error: {
      backgroundColor: "#fee2e2",
      color: "#b91c1c",
      padding: "12px 16px",
      borderRadius: "8px",
      marginBottom: "20px",
      border: "1px solid #fecaca",
    },

    loading: {
      backgroundColor: "#ffffff",
      padding: "40px",
      borderRadius: "12px",
      textAlign: "center",
      color: "#475569",
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
    },

    emptyState: {
      backgroundColor: "#ffffff",
      padding: "45px 20px",
      borderRadius: "12px",
      textAlign: "center",
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
    },

    emptyHeading: {
      color: "#0f172a",
      marginBottom: "10px",
    },

    emptyText: {
      color: "#64748b",
      margin: 0,
    },

    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "20px",
    },

    card: {
      backgroundColor: "#ffffff",
      borderRadius: "14px",
      padding: "22px",
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
      border: "1px solid #e5e7eb",
    },

    topRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "10px",
      marginBottom: "15px",
    },

    taskTitle: {
      margin: 0,
      color: "#0f172a",
      fontSize: "20px",
      lineHeight: "1.4",
    },

    badge: {
      display: "inline-block",
      padding: "6px 10px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "bold",
      whiteSpace: "nowrap",
    },

    description: {
      color: "#475569",
      lineHeight: "1.6",
      marginBottom: "18px",
      minHeight: "50px",
    },

    infoRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "10px",
      padding: "9px 0",
      borderBottom: "1px solid #f1f5f9",
      fontSize: "14px",
    },

    label: {
      color: "#64748b",
      fontWeight: "bold",
    },

    value: {
      color: "#0f172a",
      textAlign: "right",
    },

    statusSection: {
      marginTop: "20px",
    },

    selectLabel: {
      display: "block",
      marginBottom: "8px",
      color: "#334155",
      fontWeight: "bold",
      fontSize: "14px",
    },

    select: {
      width: "100%",
      padding: "11px 12px",
      borderRadius: "8px",
      border: "1px solid #cbd5e1",
      backgroundColor: "#ffffff",
      color: "#0f172a",
      fontSize: "14px",
      outline: "none",
      cursor: "pointer",
    },

    refreshButton: {
      marginTop: "20px",
      padding: "11px 18px",
      border: "none",
      borderRadius: "8px",
      backgroundColor: "#0f62fe",
      color: "#ffffff",
      fontWeight: "bold",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.heading}>My Tasks</h1>

          <p style={styles.subtitle}>
            View your assigned tasks and update their current status.
          </p>
        </div>

        {message && <div style={styles.message}>{message}</div>}

        {error && <div style={styles.error}>{error}</div>}

        {loading ? (
          <div style={styles.loading}>Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div style={styles.emptyState}>
            <h2 style={styles.emptyHeading}>No Tasks Assigned</h2>

            <p style={styles.emptyText}>
              You currently do not have any assigned tasks.
            </p>

            <button
              type="button"
              style={styles.refreshButton}
              onClick={fetchTasks}
            >
              Refresh Tasks
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {tasks.map((task) => (
              <div key={task._id} style={styles.card}>
                <div style={styles.topRow}>
                  <h2 style={styles.taskTitle}>{task.title}</h2>

                  <span
                    style={{
                      ...styles.badge,
                      ...getPriorityStyle(task.priority),
                    }}
                  >
                    {task.priority}
                  </span>
                </div>

                <p style={styles.description}>
                  {task.description}
                </p>

                <div style={styles.infoRow}>
                  <span style={styles.label}>Status</span>

                  <span
                    style={{
                      ...styles.badge,
                      ...getStatusStyle(task.status),
                    }}
                  >
                    {task.status}
                  </span>
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.label}>Due Date</span>

                  <span style={styles.value}>
                    {formatDate(task.dueDate)}
                  </span>
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.label}>Assigned By</span>

                  <span style={styles.value}>
                    {task.assignedBy?.name ||
                      task.assignedBy?.email ||
                      "Admin"}
                  </span>
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.label}>Created</span>

                  <span style={styles.value}>
                    {formatDate(task.createdAt)}
                  </span>
                </div>

                {task.completedAt && (
                  <div style={styles.infoRow}>
                    <span style={styles.label}>Completed</span>

                    <span style={styles.value}>
                      {formatDate(task.completedAt)}
                    </span>
                  </div>
                )}

                <div style={styles.statusSection}>
                  <label
                    htmlFor={`status-${task._id}`}
                    style={styles.selectLabel}
                  >
                    Update Task Status
                  </label>

                  <select
                    id={`status-${task._id}`}
                    style={styles.select}
                    value={task.status}
                    disabled={updatingTaskId === task._id}
                    onChange={(event) =>
                      updateTaskStatus(
                        task._id,
                        event.target.value
                      )
                    }
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">
                      In Progress
                    </option>
                    <option value="Completed">Completed</option>
                  </select>

                  {updatingTaskId === task._id && (
                    <p
                      style={{
                        color: "#64748b",
                        fontSize: "13px",
                        marginBottom: 0,
                      }}
                    >
                      Updating status...
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Task;