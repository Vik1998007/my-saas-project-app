import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL;

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

     const response = await fetch(
  `${API_BASE_URL}/api/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load notifications."
        );
      }

      setNotifications(data.notifications || []);
    } catch (loadError) {
      console.error("Notifications loading error:", loadError);
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadNotifications();
    } else {
      setLoading(false);
      setError(
        "Authentication token not found. Please login again."
      );
    }
  }, [token, loadNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      setUpdating(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update notification."
        );
      }

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );
    } catch (updateError) {
      console.error("Mark notification error:", updateError);
      setError(updateError.message);
    } finally {
      setUpdating(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      setUpdating(true);
      setError("");

     const response = await fetch(
    `${API_BASE_URL}/api/notifications/read-all`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update notifications."
        );
      }

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (updateError) {
      console.error("Mark all notifications error:", updateError);
      setError(updateError.message);
    } finally {
      setUpdating(false);
    }
  };

  const createTestNotification = async () => {
    try {
      setUpdating(true);
      setError("");

     const response = await fetch(
    `${API_BASE_URL}/api/notifications/test`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to create test notification."
        );
      }

      setNotifications((currentNotifications) => [
        data.notification,
        ...currentNotifications,
      ]);
    } catch (createError) {
      console.error("Create notification error:", createError);
      setError(createError.message);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "-";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleString("en-GB");
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      background: "#f4f7fc",
      fontFamily: "Arial, sans-serif",
    },

    content: {
      flex: 1,
      padding: "30px",
      minWidth: 0,
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
      color: "#1c2536",
      fontSize: "30px",
    },

    subHeading: {
      marginTop: "7px",
      marginBottom: 0,
      color: "#77808f",
      fontSize: "14px",
    },

    actions: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
    },

    button: {
      border: "none",
      color: "#ffffff",
      padding: "11px 16px",
      borderRadius: "8px",
      fontWeight: "700",
      cursor: "pointer",
      fontSize: "14px",
    },

    markAllButton: {
      background: "#0f62fe",
    },

    testButton: {
      background: "#15803d",
    },

    backButton: {
      textDecoration: "none",
      background: "#334155",
      color: "#ffffff",
      padding: "11px 18px",
      borderRadius: "8px",
      fontWeight: "700",
      fontSize: "14px",
    },

    summaryCard: {
      background: "#ffffff",
      borderRadius: "14px",
      padding: "20px",
      marginBottom: "22px",
      boxShadow: "0 8px 24px rgba(33,45,72,0.06)",
      border: "1px solid #edf0f5",
    },

    list: {
      display: "grid",
      gap: "14px",
    },

    notificationCard: {
      background: "#ffffff",
      borderRadius: "12px",
      padding: "18px",
      border: "1px solid #edf0f5",
      boxShadow: "0 6px 18px rgba(33,45,72,0.05)",
    },

    unreadCard: {
      borderLeft: "5px solid #0f62fe",
      background: "#f8fbff",
    },

    cardTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "15px",
      flexWrap: "wrap",
    },

    title: {
      margin: 0,
      color: "#1c2536",
      fontSize: "17px",
    },

    message: {
      color: "#667085",
      marginTop: "8px",
      marginBottom: "10px",
      lineHeight: "1.5",
    },

    date: {
      color: "#98a2b3",
      fontSize: "13px",
    },

    badge: {
      display: "inline-block",
      padding: "5px 10px",
      borderRadius: "999px",
      background: "#dbeafe",
      color: "#1d4ed8",
      fontSize: "12px",
      fontWeight: "700",
    },

    readBadge: {
      background: "#dcfce7",
      color: "#166534",
    },

    readButton: {
      border: "none",
      background: "#0f62fe",
      color: "#ffffff",
      padding: "8px 12px",
      borderRadius: "7px",
      cursor: "pointer",
      fontWeight: "700",
    },

    emptyMessage: {
      background: "#ffffff",
      padding: "30px",
      borderRadius: "12px",
      textAlign: "center",
      color: "#667085",
    },

    error: {
      background: "#fee2e2",
      color: "#991b1b",
      padding: "14px",
      borderRadius: "10px",
      marginBottom: "20px",
    },
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <Sidebar />

        <main style={styles.content}>
          <div style={styles.emptyMessage}>
            Loading notifications...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Sidebar />

      <main style={styles.content}>
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.heading}>
              Notifications
            </h1>

            <p style={styles.subHeading}>
              View and manage your account notifications.
            </p>
          </div>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={createTestNotification}
              disabled={updating}
              style={{
                ...styles.button,
                ...styles.testButton,
                opacity: updating ? 0.6 : 1,
              }}
            >
              Create Test Notification
            </button>

            <button
              type="button"
              onClick={markAllAsRead}
              disabled={updating || unreadCount === 0}
              style={{
                ...styles.button,
                ...styles.markAllButton,
                opacity:
                  updating || unreadCount === 0 ? 0.6 : 1,
              }}
            >
              Mark All as Read
            </button>

            <Link
              to="/dashboard"
              style={styles.backButton}
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <div style={styles.summaryCard}>
          <strong>Total Notifications:</strong>{" "}
          {notifications.length}
          {" | "}
          <strong>Unread:</strong> {unreadCount}
        </div>

        {notifications.length === 0 ? (
          <div style={styles.emptyMessage}>
            No notifications found.
          </div>
        ) : (
          <div style={styles.list}>
            {notifications.map((notification) => (
              <div
                key={notification._id}
                style={{
                  ...styles.notificationCard,
                  ...(!notification.isRead
                    ? styles.unreadCard
                    : {}),
                }}
              >
                <div style={styles.cardTop}>
                  <div>
                    <h3 style={styles.title}>
                      {notification.title ||
                        "Notification"}
                    </h3>

                    <p style={styles.message}>
                      {notification.message || "-"}
                    </p>

                    <div style={styles.date}>
                      {formatDate(
                        notification.createdAt
                      )}
                    </div>
                  </div>

                  <div>
                    <span
                      style={{
                        ...styles.badge,
                        ...(notification.isRead
                          ? styles.readBadge
                          : {}),
                      }}
                    >
                      {notification.isRead
                        ? "Read"
                        : "Unread"}
                    </span>
                  </div>
                </div>

                {!notification.isRead && (
                  <button
                    type="button"
                    onClick={() =>
                      markAsRead(notification._id)
                    }
                    disabled={updating}
                    style={{
                      ...styles.readButton,
                      marginTop: "14px",
                      opacity: updating ? 0.6 : 1,
                    }}
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Notifications;