import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import { Link } from "react-router-dom";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL;

function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
       `${API_BASE_URL}/api/attendance/my-attendance`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load attendance.");
      }

      setAttendance(data);

      const today = new Date().toDateString();

      const todayRecord = data.find(
        (record) => new Date(record.date).toDateString() === today
      );

      setTodayAttendance(todayRecord || null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/attendance/check-in`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Check-in failed.");
      }

      setMessage(data.message);
      await fetchAttendance();
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/attendance/check-out`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Check-out failed.");
      }

      setMessage(data.message);
      await fetchAttendance();
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date) => {
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
      maxWidth: "1200px",
      margin: "0 auto",
    },
    topBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "15px",
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
    card: {
      backgroundColor: "#ffffff",
      borderRadius: "14px",
      padding: "25px",
      boxShadow: "0 6px 20px rgba(15, 23, 42, 0.08)",
      marginBottom: "25px",
    },
    cardTitle: {
      marginTop: 0,
      color: "#1e293b",
      fontSize: "22px",
    },
    statusGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "15px",
      marginTop: "20px",
    },
    statusBox: {
      backgroundColor: "#f8fafc",
      border: "1px solid #e2e8f0",
      borderRadius: "10px",
      padding: "18px",
    },
    label: {
      color: "#64748b",
      fontSize: "14px",
      marginBottom: "8px",
    },
    value: {
      color: "#0f172a",
      fontSize: "18px",
      fontWeight: "bold",
      textTransform: "capitalize",
    },
    buttonRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: "12px",
      marginTop: "22px",
    },
    checkInButton: {
      border: "none",
      backgroundColor: "#16a34a",
      color: "#ffffff",
      padding: "12px 22px",
      borderRadius: "8px",
      fontSize: "15px",
      fontWeight: "bold",
      cursor: "pointer",
    },
    checkOutButton: {
      border: "none",
      backgroundColor: "#dc2626",
      color: "#ffffff",
      padding: "12px 22px",
      borderRadius: "8px",
      fontSize: "15px",
      fontWeight: "bold",
      cursor: "pointer",
    },
    disabledButton: {
      opacity: 0.55,
      cursor: "not-allowed",
    },
    success: {
      backgroundColor: "#dcfce7",
      color: "#166534",
      padding: "12px",
      borderRadius: "8px",
      marginTop: "18px",
    },
    error: {
      backgroundColor: "#fee2e2",
      color: "#991b1b",
      padding: "12px",
      borderRadius: "8px",
      marginTop: "18px",
    },
    tableWrapper: {
      overflowX: "auto",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "700px",
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
    empty: {
      textAlign: "center",
      padding: "25px",
      color: "#64748b",
    },
  };

  const hasCheckedIn = Boolean(todayAttendance?.checkIn);
  const hasCheckedOut = Boolean(todayAttendance?.checkOut);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <h1 style={styles.heading}>Attendance Management</h1>
          <Link to="/dashboard" style={styles.backButton}>
            Back to Dashboard
          </Link>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Today&apos;s Attendance</h2>

          <div style={styles.statusGrid}>
            <div style={styles.statusBox}>
              <div style={styles.label}>Date</div>
              <div style={styles.value}>
                {new Date().toLocaleDateString("en-GB")}
              </div>
            </div>

            <div style={styles.statusBox}>
              <div style={styles.label}>Status</div>
              <div style={styles.value}>
                {todayAttendance?.status || "Not Marked"}
              </div>
            </div>

            <div style={styles.statusBox}>
              <div style={styles.label}>Check In</div>
              <div style={styles.value}>
                {formatTime(todayAttendance?.checkIn)}
              </div>
            </div>

            <div style={styles.statusBox}>
              <div style={styles.label}>Check Out</div>
              <div style={styles.value}>
                {formatTime(todayAttendance?.checkOut)}
              </div>
            </div>

            <div style={styles.statusBox}>
              <div style={styles.label}>Working Hours</div>
              <div style={styles.value}>
                {todayAttendance?.workingHours || 0} Hours
              </div>
            </div>
          </div>

          <div style={styles.buttonRow}>
            <button
              type="button"
              onClick={handleCheckIn}
              disabled={actionLoading || hasCheckedIn}
              style={{
                ...styles.checkInButton,
                ...(actionLoading || hasCheckedIn
                  ? styles.disabledButton
                  : {}),
              }}
            >
              {actionLoading ? "Please Wait..." : "Check In"}
            </button>

            <button
              type="button"
              onClick={handleCheckOut}
              disabled={actionLoading || !hasCheckedIn || hasCheckedOut}
              style={{
                ...styles.checkOutButton,
                ...(actionLoading || !hasCheckedIn || hasCheckedOut
                  ? styles.disabledButton
                  : {}),
              }}
            >
              {actionLoading ? "Please Wait..." : "Check Out"}
            </button>
          </div>

          {message && <div style={styles.success}>{message}</div>}
          {error && <div style={styles.error}>{error}</div>}
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Attendance History</h2>

          {loading ? (
            <div style={styles.empty}>Loading attendance...</div>
          ) : attendance.length === 0 ? (
            <div style={styles.empty}>No attendance records found.</div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Check In</th>
                    <th style={styles.th}>Check Out</th>
                    <th style={styles.th}>Working Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr key={record._id}>
                      <td style={styles.td}>{formatDate(record.date)}</td>
                      <td style={{ ...styles.td, textTransform: "capitalize" }}>
                        {record.status}
                      </td>
                      <td style={styles.td}>{formatTime(record.checkIn)}</td>
                      <td style={styles.td}>{formatTime(record.checkOut)}</td>
                      <td style={styles.td}>
                        {record.workingHours || 0} Hours
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

export default Attendance;