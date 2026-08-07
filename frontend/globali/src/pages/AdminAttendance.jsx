import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL;

function AdminAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const url = selectedDate
  ? `${API_BASE_URL}/api/admin-attendance/date/${selectedDate}`
  : `${API_BASE_URL}/api/admin-attendance`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load attendance records."
        );
      }

      setAttendance(data.attendance || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, token]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const filteredAttendance = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) {
      return attendance;
    }

    return attendance.filter((record) => {
      const fullName =
        record.employee?.fullName?.toLowerCase() || "";

      const email =
        record.employee?.email?.toLowerCase() || "";

      const role =
        record.employee?.role?.toLowerCase() || "";

      return (
        fullName.includes(searchValue) ||
        email.includes(searchValue) ||
        role.includes(searchValue)
      );
    });
  }, [attendance, search]);

  const totalPresent = filteredAttendance.filter(
    (record) => record.status === "present"
  ).length;

  const totalLate = filteredAttendance.filter(
    (record) => record.status === "late"
  ).length;

  const totalWorkingHours = filteredAttendance.reduce(
    (total, record) =>
      total + Number(record.workingHours || 0),
    0
  );

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const styles = {
    page: {
      minHeight: "100vh",
      backgroundColor: "#f4f7fb",
      fontFamily: "Arial, sans-serif",
      padding: "30px",
    },

    container: {
      maxWidth: "1250px",
      margin: "0 auto",
    },

    topBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "15px",
      flexWrap: "wrap",
      marginBottom: "25px",
    },

    heading: {
      margin: 0,
      color: "#1e293b",
      fontSize: "32px",
    },

    backButton: {
      textDecoration: "none",
      backgroundColor: "#334155",
      color: "#ffffff",
      padding: "11px 18px",
      borderRadius: "8px",
      fontWeight: "bold",
    },

    summaryGrid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "18px",
      marginBottom: "25px",
    },

    summaryCard: {
      backgroundColor: "#ffffff",
      borderRadius: "14px",
      padding: "22px",
      boxShadow: "0 6px 20px rgba(15, 23, 42, 0.08)",
    },

    summaryLabel: {
      color: "#64748b",
      fontSize: "14px",
      marginBottom: "10px",
    },

    summaryValue: {
      color: "#0f172a",
      fontSize: "28px",
      fontWeight: "bold",
    },

    card: {
      backgroundColor: "#ffffff",
      borderRadius: "14px",
      padding: "25px",
      boxShadow: "0 6px 20px rgba(15, 23, 42, 0.08)",
    },

    filters: {
      display: "flex",
      flexWrap: "wrap",
      gap: "15px",
      marginBottom: "22px",
    },

    input: {
      flex: "1 1 260px",
      padding: "12px",
      border: "1px solid #cbd5e1",
      borderRadius: "8px",
      fontSize: "15px",
      outline: "none",
    },

    dateInput: {
      padding: "12px",
      border: "1px solid #cbd5e1",
      borderRadius: "8px",
      fontSize: "15px",
      outline: "none",
    },

    clearButton: {
      border: "none",
      backgroundColor: "#ef4444",
      color: "#ffffff",
      padding: "12px 18px",
      borderRadius: "8px",
      fontWeight: "bold",
      cursor: "pointer",
    },

    tableWrapper: {
      overflowX: "auto",
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "950px",
    },

    th: {
      textAlign: "left",
      padding: "14px",
      backgroundColor: "#0f62fe",
      color: "#ffffff",
      fontSize: "14px",
    },

    td: {
      padding: "14px",
      borderBottom: "1px solid #e2e8f0",
      color: "#334155",
      fontSize: "14px",
    },

    status: {
      display: "inline-block",
      padding: "6px 10px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "bold",
      textTransform: "capitalize",
    },

    loading: {
      textAlign: "center",
      padding: "30px",
      color: "#64748b",
    },

    error: {
      backgroundColor: "#fee2e2",
      color: "#991b1b",
      padding: "12px",
      borderRadius: "8px",
      marginBottom: "20px",
    },

    empty: {
      textAlign: "center",
      padding: "30px",
      color: "#64748b",
    },
  };

  const getStatusStyle = (status) => {
    if (status === "present") {
      return {
        backgroundColor: "#dcfce7",
        color: "#166534",
      };
    }

    if (status === "late") {
      return {
        backgroundColor: "#fef3c7",
        color: "#92400e",
      };
    }

    if (status === "absent") {
      return {
        backgroundColor: "#fee2e2",
        color: "#991b1b",
      };
    }

    if (status === "leave") {
      return {
        backgroundColor: "#dbeafe",
        color: "#1e40af",
      };
    }

    return {
      backgroundColor: "#e2e8f0",
      color: "#334155",
    };
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <h1 style={styles.heading}>
            Admin Attendance Management
          </h1>

          <Link to="/dashboard" style={styles.backButton}>
            Back to Dashboard
          </Link>
        </div>

        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>
              Total Records
            </div>

            <div style={styles.summaryValue}>
              {filteredAttendance.length}
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>
              Present
            </div>

            <div style={styles.summaryValue}>
              {totalPresent}
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>
              Late
            </div>

            <div style={styles.summaryValue}>
              {totalLate}
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>
              Total Working Hours
            </div>

            <div style={styles.summaryValue}>
              {totalWorkingHours.toFixed(2)}
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.filters}>
            <input
              type="text"
              placeholder="Search by employee name, email, or role"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              style={styles.input}
            />

            <input
              type="date"
              value={selectedDate}
              onChange={(event) =>
                setSelectedDate(event.target.value)
              }
              style={styles.dateInput}
            />

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedDate("");
              }}
              style={styles.clearButton}
            >
              Clear Filters
            </button>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          {loading ? (
            <div style={styles.loading}>
              Loading attendance records...
            </div>
          ) : filteredAttendance.length === 0 ? (
            <div style={styles.empty}>
              No attendance records found.
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Employee</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Check In</th>
                    <th style={styles.th}>Check Out</th>
                    <th style={styles.th}>
                      Working Hours
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAttendance.map((record) => (
                    <tr key={record._id}>
                      <td style={styles.td}>
                        {record.employee?.fullName ||
                          "Deleted Employee"}
                      </td>

                      <td style={styles.td}>
                        {record.employee?.email || "-"}
                      </td>

                      <td
                        style={{
                          ...styles.td,
                          textTransform: "capitalize",
                        }}
                      >
                        {record.employee?.role || "-"}
                      </td>

                      <td style={styles.td}>
                        {formatDate(record.date)}
                      </td>

                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.status,
                            ...getStatusStyle(record.status),
                          }}
                        >
                          {record.status || "unknown"}
                        </span>
                      </td>

                      <td style={styles.td}>
                        {formatTime(record.checkIn)}
                      </td>

                      <td style={styles.td}>
                        {formatTime(record.checkOut)}
                      </td>

                      <td style={styles.td}>
                        {Number(
                          record.workingHours || 0
                        ).toFixed(2)}{" "}
                        Hours
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminAttendance;