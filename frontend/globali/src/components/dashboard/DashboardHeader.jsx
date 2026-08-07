import {
  markAsRead,
  markAllAsRead,
} from "../../services/notificationService";
import React, { useState } from "react";

function DashboardHeader({
  user,
  searchTerm,
  setSearchTerm,
  notificationCount,
  notifications = [],
  loadingNotifications = false,
  showProfileMenu,
  setShowProfileMenu,
  formatRole,
  navigate,
}) {
  const [showNotificationMenu, setShowNotificationMenu] =
    useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const formatNotificationDate = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleString();
  };

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        flexWrap: "wrap",
        marginBottom: "25px",
      }}
    >
      <div>
        <p
          style={{
            margin: "0 0 6px",
            color: "#6c757d",
            fontSize: "14px",
          }}
        >
          Welcome Back 👋
        </p>

        <h1
          style={{
            margin: 0,
            color: "#1c2536",
            fontSize: "30px",
            fontWeight: "700",
          }}
        >
          Dashboard
        </h1>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(event.target.value)
          }
          style={{
            width: "260px",
            padding: "12px 16px",
            borderRadius: "10px",
            border: "1px solid #dce3ee",
            outline: "none",
            fontSize: "14px",
            background: "#ffffff",
          }}
        />

        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() =>
              setShowNotificationMenu(
                (previousValue) => !previousValue
              )
            }
            style={{
              position: "relative",
              width: "45px",
              height: "45px",
              borderRadius: "50%",
              border: "none",
              background: "#ffffff",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              fontSize: "19px",
              boxShadow:
                "0 5px 15px rgba(0, 0, 0, 0.08)",
            }}
          >
            🔔

            {notificationCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-3px",
                  right: "-3px",
                  background: "#ff3b30",
                  color: "#ffffff",
                  borderRadius: "50%",
                  minWidth: "18px",
                  height: "18px",
                  padding: "0 4px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "11px",
                  fontWeight: "700",
                }}
              >
                {notificationCount > 99
                  ? "99+"
                  : notificationCount}
              </span>
            )}
          </button>

          {showNotificationMenu && (
            <div
              style={{
                position: "absolute",
                top: "58px",
                right: 0,
                width: "340px",
                maxHeight: "420px",
                overflowY: "auto",
                background: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #edf0f5",
                boxShadow:
                  "0 10px 25px rgba(0, 0, 0, 0.15)",
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  padding: "15px",
                  borderBottom: "1px solid #edf0f5",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  }}
>
  <strong
    style={{
      color: "#1c2536",
      fontSize: "16px",
    }}
  >
    Notifications
  </strong>

  <button
    type="button"
    onClick={async () => {
      try {
        await markAllAsRead();
        window.location.reload();
      } catch (error) {
        console.error(error);
      }
    }}
    style={{
      border: "none",
      background: "transparent",
      color: "#0f62fe",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "600",
    }}
  >
    Mark All Read
  </button>
</div>

                <span
                  style={{
                    fontSize: "12px",
                    color: "#6c757d",
                  }}
                >
                  {notifications.length} total
                </span>
              </div>

              {loadingNotifications ? (
                <p
                  style={{
                    padding: "20px",
                    margin: 0,
                    textAlign: "center",
                    color: "#6c757d",
                  }}
                >
                  Loading notifications...
                </p>
              ) : notifications.length === 0 ? (
                <p
                  style={{
                    padding: "20px",
                    margin: 0,
                    textAlign: "center",
                    color: "#6c757d",
                  }}
                >
                  No notifications found.
                </p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    style={{
                      padding: "14px 15px",
                      borderBottom:
                        "1px solid #edf0f5",
                      background: notification.isRead
                        ? "#ffffff"
                        : "#f4f8ff",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: notification.isRead
                          ? "500"
                          : "700",
                        color: "#1c2536",
                        fontSize: "14px",
                        marginBottom: "5px",
                      }}
                    >
                      {notification.title ||
                        "New Notification"}
                    </div>

                    <div
                      style={{
                        color: "#5f6b7a",
                        fontSize: "13px",
                        lineHeight: "1.5",
                      }}
                    >
                      {notification.message}
                    </div>

                    <div
                      style={{
                        marginTop: "7px",
                        color: "#8a94a3",
                        fontSize: "11px",
                      }}
                    >
                      {formatNotificationDate(
                        notification.createdAt
                      )}
                    </div>
                    {!notification.isRead && (
  <button
    type="button"
    onClick={async () => {
      try {
        await markAsRead(notification._id);
        window.location.reload();
      } catch (error) {
        console.error(
          "Failed to mark notification as read:",
          error
        );
      }
    }}
    style={{
      marginTop: "10px",
      border: "none",
      background: "#0f62fe",
      color: "#ffffff",
      padding: "7px 10px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "600",
    }}
  >
    Mark as Read
  </button>
)}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => navigate("/settings")}
          style={{
            width: "45px",
            height: "45px",
            borderRadius: "50%",
            border: "none",
            background: "#ffffff",
            cursor: "pointer",
            fontSize: "20px",
            boxShadow:
              "0 5px 15px rgba(0, 0, 0, 0.08)",
          }}
        >
          ⚙️
        </button>

        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() =>
              setShowProfileMenu(
                (previousValue) => !previousValue
              )
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              border: "none",
              background: "#ffffff",
              borderRadius: "12px",
              padding: "8px 14px",
              cursor: "pointer",
              boxShadow:
                "0 5px 15px rgba(0, 0, 0, 0.08)",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "#0f62fe",
                color: "#ffffff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "700",
                fontSize: "16px",
              }}
            >
              {user?.fullName
                ? user.fullName.charAt(0).toUpperCase()
                : "A"}
            </div>

            <div style={{ textAlign: "left" }}>
              <div
                style={{
                  fontWeight: "600",
                  fontSize: "14px",
                  color: "#1c2536",
                }}
              >
                {user?.fullName ||
                  user?.name ||
                  "Administrator"}
              </div>

              <div
                style={{
                  color: "#6c757d",
                  fontSize: "12px",
                }}
              >
                {formatRole(user?.role)}
              </div>
            </div>

            <span
              style={{
                color: "#6c757d",
                fontSize: "12px",
              }}
            >
              ▼
            </span>
          </button>

          {showProfileMenu && (
            <div
              style={{
                position: "absolute",
                top: "60px",
                right: 0,
                width: "210px",
                background: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #edf0f5",
                boxShadow:
                  "0 10px 25px rgba(0, 0, 0, 0.15)",
                overflow: "hidden",
                zIndex: 1000,
              }}
            >
              <button
                type="button"
                onClick={() => navigate("/profile")}
                style={menuButtonStyle}
              >
                👤 My Profile
              </button>

              <button
                type="button"
                onClick={() => navigate("/settings")}
                style={menuButtonStyle}
              >
                ⚙️ Settings
              </button>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  ...menuButtonStyle,
                  color: "#dc3545",
                  borderBottom: "none",
                  fontWeight: "600",
                }}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const menuButtonStyle = {
  width: "100%",
  padding: "14px",
  background: "#ffffff",
  border: "none",
  borderBottom: "1px solid #edf0f5",
  textAlign: "left",
  cursor: "pointer",
  color: "#303846",
  fontSize: "14px",
};

export default DashboardHeader;