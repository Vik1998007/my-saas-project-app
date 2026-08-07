import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL;

const API_URL =
  `${API_BASE_URL}/api/tasks`;
const getAuthHeaders = () => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("token") ||
    "";

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

function AdminTask() {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "Medium",
    dueDate: "",
  });

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("authToken") ||
          sessionStorage.getItem("token");

        if (!token) {
          setError("Login token not found. Please login again.");
          return;
        }

        const headers = getAuthHeaders();

        const [employeesResponse, tasksResponse] =
          await Promise.all([
            axios.get(`${API_URL}/employees`, {
              headers,
            }),

            axios.get(API_URL, {
              headers,
            }),
          ]);

        setEmployees(
          employeesResponse.data.employees || []
        );

        setTasks(tasksResponse.data.tasks || []);
      } catch (err) {
        console.error("Load admin tasks error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load task management data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      assignedTo: "",
      priority: "Medium",
      dueDate: "",
    });
  };

  const clearMessageAfterDelay = () => {
    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setCreating(true);
      setMessage("");
      setError("");

      if (
        !formData.title.trim() ||
        !formData.description.trim() ||
        !formData.assignedTo ||
        !formData.dueDate
      ) {
        setError("Please complete all required fields.");
        return;
      }

      const response = await axios.post(
        API_URL,
        {
          title: formData.title.trim(),
          description: formData.description.trim(),
          assignedTo: formData.assignedTo,
          priority: formData.priority,
          dueDate: formData.dueDate,
        },
        {
          headers: getAuthHeaders(),
        }
      );

      setTasks((previousTasks) => [
        response.data.task,
        ...previousTasks,
      ]);

      resetForm();

      setMessage(
        "Task created and assigned successfully."
      );

      clearMessageAfterDelay();
    } catch (err) {
      console.error("Create task error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to create task."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(taskId);
      setMessage("");
      setError("");

      await axios.delete(`${API_URL}/${taskId}`, {
        headers: getAuthHeaders(),
      });

      setTasks((previousTasks) =>
        previousTasks.filter(
          (task) => task._id !== taskId
        )
      );

      setMessage("Task deleted successfully.");

      clearMessageAfterDelay();
    } catch (err) {
      console.error("Delete task error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete task."
      );
    } finally {
      setDeletingId("");
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const isOverdue = (task) => {
    if (
      !task.dueDate ||
      task.status === "Completed"
    ) {
      return false;
    }

    const dueDate = new Date(task.dueDate);

    dueDate.setHours(23, 59, 59, 999);

    return dueDate < new Date();
  };

  const statistics = useMemo(() => {
    return {
      total: tasks.length,

      pending: tasks.filter(
        (task) => task.status === "Pending"
      ).length,

      inProgress: tasks.filter(
        (task) => task.status === "In Progress"
      ).length,

      completed: tasks.filter(
        (task) => task.status === "Completed"
      ).length,

      overdue: tasks.filter((task) =>
        isOverdue(task)
      ).length,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return tasks.filter((task) => {
      const employeeName =
        task.assignedTo?.fullName ||
        task.assignedTo?.email ||
        "";

      const title = task.title || "";
      const description = task.description || "";

      const matchesSearch =
        !normalizedSearch ||
        title
          .toLowerCase()
          .includes(normalizedSearch) ||
        description
          .toLowerCase()
          .includes(normalizedSearch) ||
        employeeName
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All" ||
        task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" ||
        task.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    tasks,
    search,
    statusFilter,
    priorityFilter,
  ]);

  const getStatusStyle = (status) => {
    if (status === "Completed") {
      return {
        backgroundColor: "#dcfce7",
        color: "#166534",
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
      color: "#475569",
    };
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

  const styles = {
    page: {
      minHeight: "100vh",
      backgroundColor: "#f4f7fb",
      padding: "30px 20px",
      fontFamily: "Arial, sans-serif",
    },

    container: {
      maxWidth: "1250px",
      margin: "0 auto",
    },

    header: {
      backgroundColor: "#ffffff",
      borderRadius: "14px",
      padding: "25px",
      boxShadow:
        "0 4px 18px rgba(0,0,0,0.06)",
      marginBottom: "22px",
    },

    heading: {
      margin: "0 0 8px 0",
      fontSize: "30px",
      color: "#0f172a",
    },

    subtitle: {
      margin: 0,
      color: "#64748b",
      lineHeight: "1.6",
    },

    alertSuccess: {
      backgroundColor: "#dcfce7",
      border: "1px solid #bbf7d0",
      color: "#166534",
      padding: "12px 16px",
      borderRadius: "9px",
      marginBottom: "18px",
    },

    alertError: {
      backgroundColor: "#fee2e2",
      border: "1px solid #fecaca",
      color: "#b91c1c",
      padding: "12px 16px",
      borderRadius: "9px",
      marginBottom: "18px",
    },

    statsGrid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(170px, 1fr))",
      gap: "16px",
      marginBottom: "22px",
    },

    statCard: {
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      padding: "20px",
      boxShadow:
        "0 4px 16px rgba(0,0,0,0.05)",
      border: "1px solid #e5e7eb",
    },

    statLabel: {
      color: "#64748b",
      margin: "0 0 8px 0",
      fontSize: "14px",
      fontWeight: "bold",
    },

    statValue: {
      margin: 0,
      color: "#0f172a",
      fontSize: "28px",
      fontWeight: "bold",
    },

    contentGrid: {
      display: "grid",
      gridTemplateColumns:
        "minmax(300px, 390px) minmax(0, 1fr)",
      gap: "22px",
      alignItems: "start",
    },

    panel: {
      backgroundColor: "#ffffff",
      borderRadius: "14px",
      padding: "22px",
      boxShadow:
        "0 4px 18px rgba(0,0,0,0.06)",
      border: "1px solid #e5e7eb",
    },

    panelTitle: {
      margin: "0 0 20px 0",
      color: "#0f172a",
      fontSize: "22px",
    },

    formGroup: {
      marginBottom: "16px",
    },

    label: {
      display: "block",
      color: "#334155",
      fontWeight: "bold",
      fontSize: "14px",
      marginBottom: "7px",
    },

    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: "11px 12px",
      border: "1px solid #cbd5e1",
      borderRadius: "8px",
      fontSize: "14px",
      outline: "none",
      backgroundColor: "#ffffff",
    },

    textarea: {
      width: "100%",
      boxSizing: "border-box",
      padding: "11px 12px",
      border: "1px solid #cbd5e1",
      borderRadius: "8px",
      fontSize: "14px",
      outline: "none",
      resize: "vertical",
      minHeight: "110px",
      fontFamily: "Arial, sans-serif",
    },

    submitButton: {
      width: "100%",
      border: "none",
      borderRadius: "8px",
      padding: "12px 16px",
      backgroundColor: "#0f62fe",
      color: "#ffffff",
      fontWeight: "bold",
      fontSize: "15px",
      cursor: "pointer",
    },

    filters: {
      display: "grid",
      gridTemplateColumns:
        "minmax(180px, 1fr) repeat(2, minmax(140px, 180px))",
      gap: "12px",
      marginBottom: "18px",
    },

    loading: {
      padding: "50px 20px",
      textAlign: "center",
      backgroundColor: "#ffffff",
      color: "#475569",
      borderRadius: "12px",
    },

    empty: {
      textAlign: "center",
      padding: "40px 15px",
      color: "#64748b",
    },

    taskList: {
      display: "grid",
      gap: "14px",
    },

    taskCard: {
      border: "1px solid #e2e8f0",
      borderRadius: "11px",
      padding: "17px",
      backgroundColor: "#ffffff",
    },

    taskTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "12px",
      marginBottom: "10px",
    },

    taskTitle: {
      margin: 0,
      color: "#0f172a",
      fontSize: "18px",
    },

    description: {
      color: "#475569",
      lineHeight: "1.6",
      margin: "0 0 14px 0",
    },

    badgeRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
      marginBottom: "14px",
    },

    badge: {
      padding: "6px 10px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "bold",
    },

    infoGrid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(150px, 1fr))",
      gap: "10px",
      fontSize: "14px",
      marginBottom: "14px",
    },

    infoLabel: {
      color: "#64748b",
      display: "block",
      marginBottom: "3px",
      fontWeight: "bold",
    },

    infoValue: {
      color: "#0f172a",
    },

    deleteButton: {
      border: "none",
      borderRadius: "7px",
      padding: "9px 13px",
      backgroundColor: "#dc2626",
      color: "#ffffff",
      fontWeight: "bold",
      cursor: "pointer",
    },

    overdueText: {
      color: "#b91c1c",
      fontWeight: "bold",
      fontSize: "13px",
    },
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.loading}>
            Loading task management...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.heading}>
            Admin Task Management
          </h1>

          <p style={styles.subtitle}>
            Create tasks, assign employees and monitor
            task progress.
          </p>
        </div>

        {message && (
          <div style={styles.alertSuccess}>
            {message}
          </div>
        )}

        {error && (
          <div style={styles.alertError}>
            {error}
          </div>
        )}

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>
              Total Tasks
            </p>

            <p style={styles.statValue}>
              {statistics.total}
            </p>
          </div>

          <div style={styles.statCard}>
            <p style={styles.statLabel}>Pending</p>

            <p style={styles.statValue}>
              {statistics.pending}
            </p>
          </div>

          <div style={styles.statCard}>
            <p style={styles.statLabel}>
              In Progress
            </p>

            <p style={styles.statValue}>
              {statistics.inProgress}
            </p>
          </div>

          <div style={styles.statCard}>
            <p style={styles.statLabel}>
              Completed
            </p>

            <p style={styles.statValue}>
              {statistics.completed}
            </p>
          </div>

          <div style={styles.statCard}>
            <p style={styles.statLabel}>Overdue</p>

            <p style={styles.statValue}>
              {statistics.overdue}
            </p>
          </div>
        </div>

        <div style={styles.contentGrid}>
          <div style={styles.panel}>
            <h2 style={styles.panelTitle}>
              Create New Task
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Task Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  style={styles.textarea}
                  placeholder="Enter task description"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Assign Employee
                </label>

                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                >
                  <option value="">
                    Select employee
                  </option>

                  {employees.map((employee) => (
                    <option
                      key={employee._id}
                      value={employee._id}
                    >
                      {employee.fullName ||
                        employee.email}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Priority
                </label>

                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  style={styles.input}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">
                    Medium
                  </option>
                  <option value="High">High</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Due Date
                </label>

                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  ...styles.submitButton,
                  opacity: creating ? 0.7 : 1,
                  cursor: creating
                    ? "not-allowed"
                    : "pointer",
                }}
                disabled={creating}
              >
                {creating
                  ? "Creating Task..."
                  : "Create and Assign Task"}
              </button>
            </form>
          </div>

          <div style={styles.panel}>
            <h2 style={styles.panelTitle}>
              All Tasks
            </h2>

            <div style={styles.filters}>
              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                style={styles.input}
                placeholder="Search tasks or employees"
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                style={styles.input}
              >
                <option value="All">
                  All Statuses
                </option>
                <option value="Pending">
                  Pending
                </option>
                <option value="In Progress">
                  In Progress
                </option>
                <option value="Completed">
                  Completed
                </option>
              </select>

              <select
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(
                    event.target.value
                  )
                }
                style={styles.input}
              >
                <option value="All">
                  All Priorities
                </option>
                <option value="Low">Low</option>
                <option value="Medium">
                  Medium
                </option>
                <option value="High">High</option>
              </select>
            </div>

            {filteredTasks.length === 0 ? (
              <div style={styles.empty}>
                No tasks found.
              </div>
            ) : (
              <div style={styles.taskList}>
                {filteredTasks.map((task) => (
                  <div
                    key={task._id}
                    style={styles.taskCard}
                  >
                    <div style={styles.taskTop}>
                      <h3 style={styles.taskTitle}>
                        {task.title}
                      </h3>

                      {isOverdue(task) && (
                        <span
                          style={styles.overdueText}
                        >
                          Overdue
                        </span>
                      )}
                    </div>

                    <p style={styles.description}>
                      {task.description}
                    </p>

                    <div style={styles.badgeRow}>
                      <span
                        style={{
                          ...styles.badge,
                          ...getStatusStyle(
                            task.status
                          ),
                        }}
                      >
                        {task.status}
                      </span>

                      <span
                        style={{
                          ...styles.badge,
                          ...getPriorityStyle(
                            task.priority
                          ),
                        }}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <div style={styles.infoGrid}>
                      <div>
                        <span
                          style={styles.infoLabel}
                        >
                          Employee
                        </span>

                        <span
                          style={styles.infoValue}
                        >
                          {task.assignedTo
                            ?.fullName ||
                            task.assignedTo
                              ?.email ||
                            "Unknown"}
                        </span>
                      </div>

                      <div>
                        <span
                          style={styles.infoLabel}
                        >
                          Due Date
                        </span>

                        <span
                          style={styles.infoValue}
                        >
                          {formatDate(
                            task.dueDate
                          )}
                        </span>
                      </div>

                      <div>
                        <span
                          style={styles.infoLabel}
                        >
                          Assigned By
                        </span>

                        <span
                          style={styles.infoValue}
                        >
                          {task.assignedBy
                            ?.fullName ||
                            task.assignedBy
                              ?.email ||
                            "Admin"}
                        </span>
                      </div>

                      <div>
                        <span
                          style={styles.infoLabel}
                        >
                          Created
                        </span>

                        <span
                          style={styles.infoValue}
                        >
                          {formatDate(
                            task.createdAt
                          )}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      style={{
                        ...styles.deleteButton,
                        opacity:
                          deletingId === task._id
                            ? 0.7
                            : 1,
                        cursor:
                          deletingId === task._id
                            ? "not-allowed"
                            : "pointer",
                      }}
                      disabled={
                        deletingId === task._id
                      }
                      onClick={() =>
                        handleDeleteTask(task._id)
                      }
                    >
                      {deletingId === task._id
                        ? "Deleting..."
                        : "Delete Task"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminTask;