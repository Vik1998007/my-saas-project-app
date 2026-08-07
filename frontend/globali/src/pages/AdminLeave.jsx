import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL;

function AdminLeave() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token");

  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/api/leaves`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load leave requests."
        );
      }

      setLeaves(data.leaves || []);
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const updateLeaveStatus = async (
    leaveId,
    status
  ) => {
    const actionText =
      status === "approved" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} this leave request?`
    );

    if (!confirmed) {
      return;
    }

    const adminComment = window.prompt(
      "Enter an admin comment. This is optional."
    );

    if (adminComment === null) {
      return;
    }

    try {
      setUpdatingId(leaveId);
      setMessage("");

      const endpoint =
        status === "approved"
          ? `${API_BASE_URL}/api/leaves/approve/${leaveId}`
          : `${API_BASE_URL}/api/leaves/reject/${leaveId}`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          adminComment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Unable to ${actionText} leave request.`
        );
      }

      setMessage(data.message);
      setMessageType("success");

      await fetchLeaves();
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setUpdatingId("");
    }
  };

  const deleteLeave = async (leaveId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this leave request?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(leaveId);
      setMessage("");

     const response = await fetch(
        `${API_BASE_URL}/api/leaves/${leaveId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete leave request."
        );
      }

      setMessage(data.message);
      setMessageType("success");

      await fetchLeaves();
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setUpdatingId("");
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "-";
    }

    return new Date(dateValue).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getStatusStyle = (status) => {
    if (status === "approved") {
      return {
        backgroundColor: "#dcfce7",
        color: "#166534",
      };
    }

    if (status === "rejected") {
      return {
        backgroundColor: "#fee2e2",
        color: "#991b1b",
      };
    }

    return {
      backgroundColor: "#fef3c7",
      color: "#92400e",
    };
  };

  const filteredLeaves = leaves.filter((leave) => {
    const employeeName =
      leave.employee?.fullName?.toLowerCase() || "";

    const employeeEmail =
      leave.employee?.email?.toLowerCase() || "";

    const searchValue = searchTerm.toLowerCase();

    const matchesSearch =
      employeeName.includes(searchValue) ||
      employeeEmail.includes(searchValue);

    const matchesStatus =
      statusFilter === "all" ||
      leave.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalRequests = leaves.length;

  const pendingRequests = leaves.filter(
    (leave) => leave.status === "pending"
  ).length;

  const approvedRequests = leaves.filter(
    (leave) => leave.status === "approved"
  ).length;

  const rejectedRequests = leaves.filter(
    (leave) => leave.status === "rejected"
  ).length;

  const styles = {
    page: {
      minHeight: "100vh",
      backgroundColor: "#f4f7fb",
      padding: "30px",
      fontFamily: "Arial, sans-serif",
    },

    container: {
      maxWidth: "1400px",
      margin: "0 auto",
    },

    heading: {
      margin: "0 0 8px",
      color: "#172554",
      fontSize: "30px",
    },

    subtitle: {
      margin: "0 0 28px",
      color: "#64748b",
      fontSize: "15px",
    },

    message: {
      marginBottom: "20px",
      padding: "13px 15px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "600",
    },

    summaryGrid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(210px, 1fr))",
      gap: "18px",
      marginBottom: "24px",
    },

    summaryCard: {
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      padding: "20px",
      boxShadow:
        "0 6px 18px rgba(15, 23, 42, 0.07)",
      border: "1px solid #e2e8f0",
    },

    summaryLabel: {
      margin: "0 0 10px",
      color: "#64748b",
      fontSize: "14px",
      fontWeight: "600",
    },

    summaryNumber: {
      margin: 0,
      color: "#1e3a8a",
      fontSize: "29px",
      fontWeight: "700",
    },

    card: {
      backgroundColor: "#ffffff",
      borderRadius: "14px",
      padding: "24px",
      boxShadow:
        "0 8px 24px rgba(15, 23, 42, 0.08)",
      border: "1px solid #e2e8f0",
    },

    filterRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: "14px",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "22px",
    },

    filterGroup: {
      display: "flex",
      flexWrap: "wrap",
      gap: "12px",
    },

    input: {
      minWidth: "240px",
      padding: "11px 13px",
      border: "1px solid #cbd5e1",
      borderRadius: "8px",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
    },

    select: {
      padding: "11px 13px",
      border: "1px solid #cbd5e1",
      borderRadius: "8px",
      fontSize: "14px",
      outline: "none",
      backgroundColor: "#ffffff",
    },

    refreshButton: {
      border: "none",
      borderRadius: "8px",
      padding: "11px 17px",
      backgroundColor: "#2563eb",
      color: "#ffffff",
      fontSize: "14px",
      fontWeight: "700",
      cursor: "pointer",
    },

    tableWrapper: {
      overflowX: "auto",
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "1250px",
    },

    tableHead: {
      backgroundColor: "#eff6ff",
    },

    th: {
      padding: "13px",
      textAlign: "left",
      color: "#1e3a8a",
      fontSize: "13px",
      borderBottom: "1px solid #dbeafe",
      whiteSpace: "nowrap",
    },

    td: {
      padding: "13px",
      color: "#475569",
      fontSize: "13px",
      borderBottom: "1px solid #e2e8f0",
      verticalAlign: "top",
    },

    employeeName: {
      color: "#0f172a",
      fontWeight: "700",
      marginBottom: "4px",
    },

    email: {
      color: "#64748b",
      fontSize: "12px",
    },

    status: {
      display: "inline-block",
      padding: "6px 10px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "700",
      textTransform: "capitalize",
    },

    actionGroup: {
      display: "flex",
      flexWrap: "wrap",
      gap: "7px",
    },

    approveButton: {
      border: "none",
      borderRadius: "6px",
      padding: "8px 11px",
      backgroundColor: "#16a34a",
      color: "#ffffff",
      fontSize: "12px",
      fontWeight: "700",
      cursor: "pointer",
    },

    rejectButton: {
      border: "none",
      borderRadius: "6px",
      padding: "8px 11px",
      backgroundColor: "#dc2626",
      color: "#ffffff",
      fontSize: "12px",
      fontWeight: "700",
      cursor: "pointer",
    },

    deleteButton: {
      border: "none",
      borderRadius: "6px",
      padding: "8px 11px",
      backgroundColor: "#475569",
      color: "#ffffff",
      fontSize: "12px",
      fontWeight: "700",
      cursor: "pointer",
    },

    disabledButton: {
      opacity: 0.55,
      cursor: "not-allowed",
    },

    empty: {
      padding: "40px 10px",
      textAlign: "center",
      color: "#64748b",
      fontSize: "15px",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.heading}>
          Admin Leave Management
        </h1>

        <p style={styles.subtitle}>
          Review, approve, reject and manage employee
          leave requests.
        </p>

        {message && (
          <div
            style={{
              ...styles.message,
              backgroundColor:
                messageType === "success"
                  ? "#dcfce7"
                  : "#fee2e2",
              color:
                messageType === "success"
                  ? "#166534"
                  : "#991b1b",
            }}
          >
            {message}
          </div>
        )}

        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <p style={styles.summaryLabel}>
              Total Requests
            </p>
            <p style={styles.summaryNumber}>
              {totalRequests}
            </p>
          </div>

          <div style={styles.summaryCard}>
            <p style={styles.summaryLabel}>
              Pending Requests
            </p>
            <p style={styles.summaryNumber}>
              {pendingRequests}
            </p>
          </div>

          <div style={styles.summaryCard}>
            <p style={styles.summaryLabel}>
              Approved Requests
            </p>
            <p style={styles.summaryNumber}>
              {approvedRequests}
            </p>
          </div>

          <div style={styles.summaryCard}>
            <p style={styles.summaryLabel}>
              Rejected Requests
            </p>
            <p style={styles.summaryNumber}>
              {rejectedRequests}
            </p>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search employee name or email"
                style={styles.input}
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                style={styles.select}
              >
                <option value="all">
                  All Status
                </option>
                <option value="pending">
                  Pending
                </option>
                <option value="approved">
                  Approved
                </option>
                <option value="rejected">
                  Rejected
                </option>
              </select>
            </div>

            <button
              type="button"
              onClick={fetchLeaves}
              style={styles.refreshButton}
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div style={styles.empty}>
              Loading leave requests...
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div style={styles.empty}>
              No leave requests found.
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead style={styles.tableHead}>
                  <tr>
                    <th style={styles.th}>Employee</th>
                    <th style={styles.th}>Leave Type</th>
                    <th style={styles.th}>Start Date</th>
                    <th style={styles.th}>End Date</th>
                    <th style={styles.th}>Days</th>
                    <th style={styles.th}>Reason</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>
                      Admin Comment
                    </th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLeaves.map((leave) => {
                    const isUpdating =
                      updatingId === leave._id;

                    return (
                      <tr key={leave._id}>
                        <td style={styles.td}>
                          <div
                            style={styles.employeeName}
                          >
                            {leave.employee?.fullName ||
                              "Unknown Employee"}
                          </div>

                          <div style={styles.email}>
                            {leave.employee?.email || "-"}
                          </div>
                        </td>

                        <td
                          style={{
                            ...styles.td,
                            textTransform: "capitalize",
                          }}
                        >
                          {leave.leaveType}
                        </td>

                        <td style={styles.td}>
                          {formatDate(leave.startDate)}
                        </td>

                        <td style={styles.td}>
                          {formatDate(leave.endDate)}
                        </td>

                        <td style={styles.td}>
                          {leave.totalDays}
                        </td>

                        <td style={styles.td}>
                          {leave.reason}
                        </td>

                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.status,
                              ...getStatusStyle(
                                leave.status
                              ),
                            }}
                          >
                            {leave.status}
                          </span>
                        </td>

                        <td style={styles.td}>
                          {leave.adminComment || "-"}
                        </td>

                        <td style={styles.td}>
                          <div style={styles.actionGroup}>
                            <button
                              type="button"
                              disabled={
                                isUpdating ||
                                leave.status ===
                                  "approved"
                              }
                              onClick={() =>
                                updateLeaveStatus(
                                  leave._id,
                                  "approved"
                                )
                              }
                              style={{
                                ...styles.approveButton,
                                ...(isUpdating ||
                                leave.status ===
                                  "approved"
                                  ? styles.disabledButton
                                  : {}),
                              }}
                            >
                              Approve
                            </button>

                            <button
                              type="button"
                              disabled={
                                isUpdating ||
                                leave.status ===
                                  "rejected"
                              }
                              onClick={() =>
                                updateLeaveStatus(
                                  leave._id,
                                  "rejected"
                                )
                              }
                              style={{
                                ...styles.rejectButton,
                                ...(isUpdating ||
                                leave.status ===
                                  "rejected"
                                  ? styles.disabledButton
                                  : {}),
                              }}
                            >
                              Reject
                            </button>

                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() =>
                                deleteLeave(leave._id)
                              }
                              style={{
                                ...styles.deleteButton,
                                ...(isUpdating
                                  ? styles.disabledButton
                                  : {}),
                              }}
                            >
                              {isUpdating
                                ? "Please Wait"
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminLeave;