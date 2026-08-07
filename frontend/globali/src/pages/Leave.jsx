import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL;

function Leave() {
  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
    attachment: "",
  });

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const token = localStorage.getItem("token");

  const fetchMyLeaves = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(
  `${API_BASE_URL}/api/leaves/my`,
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
          data.message || "Unable to load leave history."
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
    fetchMyLeaves();
  }, [fetchMyLeaves]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const calculateTotalDays = () => {
    if (!formData.startDate || !formData.endDate) {
      return 0;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (end < start) {
      return 0;
    }

    const difference =
      end.getTime() - start.getTime();

    return (
      Math.floor(
        difference / (1000 * 60 * 60 * 24)
      ) + 1
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (
      !formData.leaveType ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.reason.trim()
    ) {
      setMessage("Please complete all required fields.");
      setMessageType("error");
      return;
    }

    if (
      new Date(formData.endDate) <
      new Date(formData.startDate)
    ) {
      setMessage(
        "End date cannot be before start date."
      );
      setMessageType("error");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
      `${API_BASE_URL}/api/leaves`,
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

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to submit leave request."
        );
      }

      setMessage(
        "Leave request submitted successfully."
      );
      setMessageType("success");

      setFormData({
        leaveType: "",
        startDate: "",
        endDate: "",
        reason: "",
        attachment: "",
      });

      fetchMyLeaves();
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setSubmitting(false);
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

  const styles = {
    page: {
      minHeight: "100vh",
      backgroundColor: "#f4f7fb",
      padding: "30px",
      fontFamily: "Arial, sans-serif",
    },

    container: {
      maxWidth: "1200px",
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

    grid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(340px, 1fr))",
      gap: "24px",
      alignItems: "start",
    },

    card: {
      backgroundColor: "#ffffff",
      borderRadius: "14px",
      padding: "24px",
      boxShadow:
        "0 8px 24px rgba(15, 23, 42, 0.08)",
      border: "1px solid #e2e8f0",
    },

    cardTitle: {
      margin: "0 0 22px",
      color: "#1e3a8a",
      fontSize: "21px",
    },

    formGroup: {
      marginBottom: "17px",
    },

    label: {
      display: "block",
      marginBottom: "7px",
      color: "#334155",
      fontSize: "14px",
      fontWeight: "600",
    },

    input: {
      width: "100%",
      padding: "12px 13px",
      border: "1px solid #cbd5e1",
      borderRadius: "8px",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
      backgroundColor: "#ffffff",
    },

    textarea: {
      width: "100%",
      minHeight: "115px",
      padding: "12px 13px",
      border: "1px solid #cbd5e1",
      borderRadius: "8px",
      fontSize: "14px",
      outline: "none",
      resize: "vertical",
      boxSizing: "border-box",
      fontFamily: "Arial, sans-serif",
    },

    dateGrid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(150px, 1fr))",
      gap: "14px",
    },

    daysBox: {
      marginBottom: "17px",
      padding: "12px",
      backgroundColor: "#eff6ff",
      borderRadius: "8px",
      color: "#1e40af",
      fontWeight: "600",
      fontSize: "14px",
    },

    button: {
      width: "100%",
      border: "none",
      borderRadius: "8px",
      padding: "13px 18px",
      backgroundColor: "#2563eb",
      color: "#ffffff",
      fontSize: "15px",
      fontWeight: "700",
      cursor: submitting
        ? "not-allowed"
        : "pointer",
      opacity: submitting ? 0.7 : 1,
    },

    message: {
      marginBottom: "18px",
      padding: "12px 14px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "600",
    },

    tableWrapper: {
      overflowX: "auto",
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "760px",
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
    },

    td: {
      padding: "13px",
      color: "#475569",
      fontSize: "13px",
      borderBottom: "1px solid #e2e8f0",
      verticalAlign: "top",
    },

    status: {
      display: "inline-block",
      padding: "6px 10px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "700",
      textTransform: "capitalize",
    },

    empty: {
      padding: "30px 10px",
      textAlign: "center",
      color: "#64748b",
    },

    historyCard: {
      marginTop: "25px",
      backgroundColor: "#ffffff",
      borderRadius: "14px",
      padding: "24px",
      boxShadow:
        "0 8px 24px rgba(15, 23, 42, 0.08)",
      border: "1px solid #e2e8f0",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.heading}>
          Leave Management
        </h1>

        <p style={styles.subtitle}>
          Apply for leave and view your leave request
          history.
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

        <div style={styles.grid}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              Apply for Leave
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Leave Type *
                </label>

                <select
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="">
                    Select leave type
                  </option>
                  <option value="casual">
                    Casual Leave
                  </option>
                  <option value="sick">
                    Sick Leave
                  </option>
                  <option value="annual">
                    Annual Leave
                  </option>
                  <option value="emergency">
                    Emergency Leave
                  </option>
                </select>
              </div>

              <div style={styles.dateGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Start Date *
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    End Date *
                  </label>

                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    min={formData.startDate}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.daysBox}>
                Total Leave Days:{" "}
                {calculateTotalDays()}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Reason *
                </label>

                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Enter the reason for your leave"
                  style={styles.textarea}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Attachment URL
                </label>

                <input
                  type="text"
                  name="attachment"
                  value={formData.attachment}
                  onChange={handleChange}
                  placeholder="Optional document URL"
                  style={styles.input}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={styles.button}
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Leave Request"}
              </button>
            </form>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              Leave Summary
            </h2>

            <div style={styles.daysBox}>
              Total Requests: {leaves.length}
            </div>

            <div style={styles.daysBox}>
              Pending Requests:{" "}
              {
                leaves.filter(
                  (leave) =>
                    leave.status === "pending"
                ).length
              }
            </div>

            <div style={styles.daysBox}>
              Approved Requests:{" "}
              {
                leaves.filter(
                  (leave) =>
                    leave.status === "approved"
                ).length
              }
            </div>

            <div style={styles.daysBox}>
              Rejected Requests:{" "}
              {
                leaves.filter(
                  (leave) =>
                    leave.status === "rejected"
                ).length
              }
            </div>
          </div>
        </div>

        <div style={styles.historyCard}>
          <h2 style={styles.cardTitle}>
            My Leave History
          </h2>

          {loading ? (
            <div style={styles.empty}>
              Loading leave history...
            </div>
          ) : leaves.length === 0 ? (
            <div style={styles.empty}>
              No leave requests found.
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead style={styles.tableHead}>
                  <tr>
                    <th style={styles.th}>
                      Leave Type
                    </th>
                    <th style={styles.th}>
                      Start Date
                    </th>
                    <th style={styles.th}>
                      End Date
                    </th>
                    <th style={styles.th}>
                      Days
                    </th>
                    <th style={styles.th}>
                      Reason
                    </th>
                    <th style={styles.th}>
                      Status
                    </th>
                    <th style={styles.th}>
                      Admin Comment
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave._id}>
                      <td
                        style={{
                          ...styles.td,
                          textTransform:
                            "capitalize",
                        }}
                      >
                        {leave.leaveType}
                      </td>

                      <td style={styles.td}>
                        {formatDate(
                          leave.startDate
                        )}
                      </td>

                      <td style={styles.td}>
                        {formatDate(
                          leave.endDate
                        )}
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
                        {leave.adminComment ||
                          "-"}
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

export default Leave;