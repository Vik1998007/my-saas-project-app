import React, { useState } from "react";
import {
  NavLink,
  useNavigate,
} from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const [showAdminMenu, setShowAdminMenu] =
    useState(false);

  const [showWebsiteMenu, setShowWebsiteMenu] =
    useState(false);

  let loggedInUser = null;

  try {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      loggedInUser = JSON.parse(savedUser);
    }
  } catch (error) {
    console.error(
      "Unable to read logged-in user.",
      error
    );
  }

  const isAdmin = loggedInUser?.role === "admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  const formatRole = (role) => {
    if (!role) {
      return "User";
    }

    return (
      role.charAt(0).toUpperCase() +
      role.slice(1)
    );
  };

  const linkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 14px",
    marginBottom: "7px",
    borderRadius: "8px",
    textDecoration: "none",
    color: "#ffffff",
    backgroundColor: isActive
      ? "#0847b8"
      : "transparent",
    fontSize: "15px",
    fontWeight: "500",
    transition: "background-color 0.2s ease",
  });

  const dropdownButtonStyle = (isOpen) => ({
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 14px",
    marginBottom: "7px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: isOpen
      ? "#0847b8"
      : "transparent",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    textAlign: "left",
    transition: "background-color 0.2s ease",
  });

  const dropdownMenuStyle = {
    backgroundColor: "#0847b8",
    padding: "8px",
    borderRadius: "8px",
    marginBottom: "10px",
  };

  const dropdownLinkStyle = ({
    isActive,
  }) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px",
    marginBottom: "4px",
    borderRadius: "6px",
    textDecoration: "none",
    color: "#ffffff",
    backgroundColor: isActive
      ? "rgba(255,255,255,0.22)"
      : "transparent",
    fontSize: "14px",
  });

  return (
    <aside
      style={{
        width: "260px",
        minWidth: "260px",
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(180deg, #0f62fe 0%, #0847b8 100%)",
        color: "#ffffff",
        padding: "20px 16px",
        boxSizing: "border-box",
        overflowY: "auto",
        flexShrink: 0,
        boxShadow:
          "4px 0 18px rgba(0,0,0,0.08)",
      }}
    >
      {/* Company Branding */}
      <div
        style={{
          padding: "5px 8px 22px",
          borderBottom:
            "1px solid rgba(255,255,255,0.2)",
          marginBottom: "18px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            margin: "0 auto 12px",
            borderRadius: "12px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#ffffff",
            color: "#0f62fe",
            fontSize: "20px",
            fontWeight: "bold",
          }}
        >
          GDS
        </div>

        <h2
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: "19px",
            lineHeight: "1.3",
          }}
        >
          Global Digital Solutions
        </h2>
      </div>

      {/* Logged-in User */}
      <div
        style={{
          backgroundColor:
            "rgba(255,255,255,0.12)",
          borderRadius: "10px",
          padding: "12px",
          marginBottom: "18px",
        }}
      >
        <div
          style={{
            fontWeight: "600",
            fontSize: "15px",
            marginBottom: "4px",
            wordBreak: "break-word",
          }}
        >
          {loggedInUser?.fullName ||
            loggedInUser?.name ||
            "User"}
        </div>

        <div
          style={{
            fontSize: "13px",
            color: "rgba(255,255,255,0.8)",
          }}
        >
          {formatRole(loggedInUser?.role)}
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1 }}>
        {isAdmin ? (
          <NavLink
            to="/dashboard"
            style={linkStyle}
          >
            <span>🏠</span>
            <span>Dashboard</span>
          </NavLink>
        ) : (
          <NavLink to="/tasks" style={linkStyle}>
            <span>🏠</span>
            <span>My Dashboard</span>
          </NavLink>
        )}

        <NavLink
          to="/profile"
          style={linkStyle}
        >
          <span>👤</span>
          <span>Profile</span>
        </NavLink>

        <NavLink
          to="/attendance"
          style={linkStyle}
        >
          <span>🕒</span>
          <span>My Attendance</span>
        </NavLink>

        <NavLink to="/leave" style={linkStyle}>
          <span>📝</span>
          <span>My Leave</span>
        </NavLink>

        <NavLink to="/tasks" style={linkStyle}>
          <span>✅</span>
          <span>My Tasks</span>
        </NavLink>

        {/* Admin Navigation */}
        {isAdmin && (
          <>
            <NavLink
              to="/customers"
              style={linkStyle}
            >
              <span>👥</span>
              <span>Customers</span>
            </NavLink>

            <NavLink
              to="/projects"
              style={linkStyle}
            >
              <span>📂</span>
              <span>Projects</span>
            </NavLink>

            <NavLink
              to="/enquiries"
              style={linkStyle}
            >
              <span>📩</span>
              <span>Enquiries</span>
            </NavLink>

            <div
              style={{
                marginTop: "5px",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setShowAdminMenu(
                    !showAdminMenu
                  )
                }
                style={dropdownButtonStyle(
                  showAdminMenu
                )}
              >
                <span>⚙️ Admin Panel</span>

                <span>
                  {showAdminMenu ? "▲" : "▼"}
                </span>
              </button>

              {showAdminMenu && (
                <div style={dropdownMenuStyle}>
                  <NavLink
                    to="/employees"
                    style={dropdownLinkStyle}
                  >
                    <span>👨‍💼</span>
                    <span>Employees</span>
                  </NavLink>

                  <NavLink
                    to="/add-employee"
                    style={dropdownLinkStyle}
                  >
                    <span>➕</span>
                    <span>Add Employee</span>
                  </NavLink>

                  <NavLink
                    to="/add-customer"
                    style={dropdownLinkStyle}
                  >
                    <span>➕</span>
                    <span>Add Customer</span>
                  </NavLink>

                  <NavLink
                    to="/add-project"
                    style={dropdownLinkStyle}
                  >
                    <span>➕</span>
                    <span>Add Project</span>
                  </NavLink>

                  <NavLink
                    to="/add-enquiry"
                    style={dropdownLinkStyle}
                  >
                    <span>➕</span>
                    <span>Add Enquiry</span>
                  </NavLink>

                  <NavLink
                    to="/admin-attendance"
                    style={dropdownLinkStyle}
                  >
                    <span>📅</span>
                    <span>
                      Attendance Management
                    </span>
                  </NavLink>

                  <NavLink
                    to="/admin-leave"
                    style={dropdownLinkStyle}
                  >
                    <span>📝</span>
                    <span>Leave Management</span>
                  </NavLink>

                  <NavLink
                    to="/admin-tasks"
                    style={dropdownLinkStyle}
                  >
                    <span>✅</span>
                    <span>Task Management</span>
                  </NavLink>

                  <NavLink
                    to="/payroll"
                    style={dropdownLinkStyle}
                  >
                    <span>💰</span>
                    <span>Payroll</span>
                  </NavLink>

                  <NavLink
                      to="/invoices"
                      style={dropdownLinkStyle}
                    >
                      <span>📄</span>
                      <span>Invoices</span>
                    </NavLink>

                  <NavLink
                    to="/reports"
                    style={dropdownLinkStyle}
                  >
                    <span>📊</span>
                    <span>Reports</span>
                  </NavLink>

                  <NavLink
                    to="/subscription"
                    style={dropdownLinkStyle}
                  >
                    <span>💳</span>
                    <span>Subscriptions</span>
                  </NavLink>

                  <NavLink
                    to="/notifications"
                    style={dropdownLinkStyle}
                  >
                    <span>🔔</span>
                    <span>Notifications</span>
                  </NavLink>
                </div>
              )}
            </div>
          </>
        )}

        {/* Website Services */}
        <div
          style={{
            marginTop: "5px",
          }}
        >
          <button
            type="button"
            onClick={() =>
              setShowWebsiteMenu(
                !showWebsiteMenu
              )
            }
            style={dropdownButtonStyle(
              showWebsiteMenu
            )}
          >
            <span>🌐 Website Services</span>

            <span>
              {showWebsiteMenu ? "▲" : "▼"}
            </span>
          </button>

          {showWebsiteMenu && (
            <div style={dropdownMenuStyle}>
              <NavLink
                to="/"
                style={dropdownLinkStyle}
              >
                <span>🌐</span>
                <span>Home</span>
              </NavLink>

              <NavLink
                to="/web-development"
                style={dropdownLinkStyle}
              >
                <span>💻</span>
                <span>Web Development</span>
              </NavLink>

              <NavLink
                to="/application-development"
                style={dropdownLinkStyle}
              >
                <span>📱</span>
                <span>
                  Application Development
                </span>
              </NavLink>

              <NavLink
                to="/seo-services"
                style={dropdownLinkStyle}
              >
                <span>📈</span>
                <span>SEO Services</span>
              </NavLink>

              <NavLink
                to="/digital-marketing"
                style={dropdownLinkStyle}
              >
                <span>📣</span>
                <span>Digital Marketing</span>
              </NavLink>

              <NavLink
                to="/project-management"
                style={dropdownLinkStyle}
              >
                <span>📂</span>
                <span>Project Management</span>
              </NavLink>
            </div>
          )}
        </div>
      </nav>

      {/* Logout */}
      <button
        type="button"
        onClick={handleLogout}
        style={{
          width: "100%",
          padding: "12px",
          marginTop: "18px",
          backgroundColor: "#dc3545",
          color: "#ffffff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "15px",
          fontWeight: "600",
        }}
      >
        🚪 Logout
      </button>
    </aside>
  );
}

export default Sidebar;