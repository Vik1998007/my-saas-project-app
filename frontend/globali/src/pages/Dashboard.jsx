import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


import { getNotifications } from "../services/notificationService";
import { getDashboardSummary } from "../services/dashboardService";

import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import KPICards from "../components/dashboard/KPICards";
import AnalyticsChart from "../components/dashboard/AnalyticsChart";
import RecentActivity from "../components/dashboard/RecentActivity";
import OverviewWidget from "../components/dashboard/OverviewWidget";
import QuickActions from "../components/dashboard/QuickActions";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL;

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);

  const [dashboardSummary, setDashboardSummary] = useState({
    totalMembers: 0,
    totalProjects: 0,
    totalCustomers: 0,
    totalTasks: 0,
  });

  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  const [currentDateTime, setCurrentDateTime] = useState(
    new Date()
  );

  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] =
    useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | Current Date and Time
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Load Notifications
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    const loadNotifications = async () => {
      try {
        setLoadingNotifications(true);

        const data = await getNotifications();

        if (Array.isArray(data)) {
          setNotifications(data);
        } else if (
          data &&
          Array.isArray(data.notifications)
        ) {
          setNotifications(data.notifications);
        } else {
          setNotifications([]);
        }
      } catch (error) {
        console.error(
          "Failed to load notifications:",
          error
        );

        setNotifications([]);
      } finally {
        setLoadingNotifications(false);
      }
    };

    loadNotifications();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Load Dashboard Data
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    const requestOptions = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setDashboardError("");

        const [
          summaryData,
          projectsResponse,
          customersResponse,
          enquiriesResponse,
          employeesResponse,
        ] = await Promise.all([
          getDashboardSummary(),

          fetch(
            `${API_BASE_URL}/api/projects`,
            requestOptions
          ),

          fetch(
            `${API_BASE_URL}/api/projects`,
            requestOptions
          ),

         fetch(
            `${API_BASE_URL}/api/projects`,
            requestOptions
          ),

          fetch(
            `${API_BASE_URL}/api/projects`,
            requestOptions
          ),
        ]);

        if (
          projectsResponse.status === 401 ||
          customersResponse.status === 401 ||
          enquiriesResponse.status === 401 ||
          employeesResponse.status === 401
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          navigate("/login", {
            replace: true,
          });

          return;
        }

        const [
          projectsData,
          customersData,
          enquiriesData,
          employeesData,
        ] = await Promise.all([
          projectsResponse.json(),
          customersResponse.json(),
          enquiriesResponse.json(),
          employeesResponse.json(),
        ]);

        if (summaryData.success) {
          setUser(summaryData.user || null);
          setCompany(summaryData.company || null);

          setDashboardSummary({
            totalMembers:
              summaryData.summary?.totalMembers || 0,

            totalProjects:
              summaryData.summary?.totalProjects || 0,

            totalCustomers:
              summaryData.summary?.totalCustomers || 0,

            totalTasks:
              summaryData.summary?.totalTasks || 0,
          });

          if (summaryData.user) {
            localStorage.setItem(
              "user",
              JSON.stringify(summaryData.user)
            );
          }
        }

        if (projectsData.success) {
          setProjects(projectsData.projects || []);
        } else {
          setProjects([]);
        }

        if (customersData.success) {
          setCustomers(customersData.customers || []);
        } else {
          setCustomers([]);
        }

        if (enquiriesData.success) {
          setEnquiries(enquiriesData.enquiries || []);
        } else {
          setEnquiries([]);
        }

        if (employeesData.success) {
          setEmployees(employeesData.employees || []);
        } else {
          setEmployees([]);
        }
      } catch (error) {
        console.error(
          "Unable to load dashboard data:",
          error
        );

        if (
          error.message === "Login token not found." ||
          error.message
            .toLowerCase()
            .includes("token")
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          navigate("/login", {
            replace: true,
          });

          return;
        }

        setDashboardError(
          error.message ||
            "Unable to load dashboard data."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  /*
  |--------------------------------------------------------------------------
  | Helper Functions
  |--------------------------------------------------------------------------
  */

  const formatRole = (role) => {
    if (!role) {
      return "User";
    }

    return (
      role.charAt(0).toUpperCase() +
      role.slice(1)
    );
  };

  const getGreeting = () => {
    const currentHour = currentDateTime.getHours();

    if (currentHour < 12) {
      return "Good Morning";
    }

    if (currentHour < 18) {
      return "Good Afternoon";
    }

    return "Good Evening";
  };

  /*
  |--------------------------------------------------------------------------
  | Dashboard Calculations
  |--------------------------------------------------------------------------
  */

  const activeProjects = projects.filter((project) => {
    const status = String(
      project.status || ""
    ).toLowerCase();

    return (
      status === "active" ||
      status === "in progress" ||
      status === "ongoing"
    );
  }).length;

  const newEnquiries = enquiries.filter((enquiry) => {
    return (
      String(
        enquiry.status || "New"
      ).toLowerCase() === "new"
    );
  }).length;

 

  const notificationCount = notifications.filter(
    (notification) => notification.isRead !== true
  ).length;

  /*
  |--------------------------------------------------------------------------
  | KPI Cards
  |--------------------------------------------------------------------------
  */

  const statCards = [
    {
      title: "Total Members",
      value: dashboardSummary.totalMembers,
      subtitle: "Company Members",
      icon: "👥",
      accent: "#6f42c1",
      background: "#f3edff",
      route: "/employees",
    },
    {
      title: "Total Projects",
      value: dashboardSummary.totalProjects,
      subtitle: `${activeProjects} Active Projects`,
      icon: "📁",
      accent: "#0f62fe",
      background: "#eaf2ff",
      route: "/projects",
    },
    {
      title: "Total Customers",
      value: dashboardSummary.totalCustomers,
      subtitle: "CRM Customers",
      icon: "🤝",
      accent: "#198754",
      background: "#e9f8f0",
      route: "/customers",
    },
    {
      title: "Total Tasks",
      value: dashboardSummary.totalTasks,
      subtitle: "Company Tasks",
      icon: "✅",
      accent: "#0aa2c0",
      background: "#e8f8fb",
      route: "/tasks",
    },
    {
      title: "New Enquiries",
      value: newEnquiries,
      subtitle: `${enquiries.length} Total Enquiries`,
      icon: "📩",
      accent: "#fd7e14",
      background: "#fff4e8",
      route: "/enquiries",
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | Loading Screen
  |--------------------------------------------------------------------------
  */

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          fontFamily: "Arial, sans-serif",
          background: "#f4f7fc",
        }}
      >
        <Sidebar />

        <main
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#0f62fe",
            fontSize: "18px",
            fontWeight: "600",
          }}
        >
          Loading dashboard...
        </main>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Dashboard Page
  |--------------------------------------------------------------------------
  */

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
        background: "#f4f7fc",
      }}
    >
      <Sidebar />

      <main
        style={{
          flex: 1,
          padding: "30px",
          minWidth: 0,
        }}
      >
        <DashboardHeader
          user={user}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          notificationCount={notificationCount}
          notifications={notifications}
          loadingNotifications={loadingNotifications}
          showProfileMenu={showProfileMenu}
          setShowProfileMenu={setShowProfileMenu}
          formatRole={formatRole}
          navigate={navigate}
        />

        {dashboardError && (
          <div
            style={{
              marginBottom: "20px",
              padding: "14px 18px",
              borderRadius: "10px",
              background: "#fff0f0",
              color: "#b42318",
              border: "1px solid #ffc9c9",
              fontWeight: "600",
            }}
          >
            {dashboardError}
          </div>
        )}

        <section
          style={{
            background:
              "linear-gradient(135deg, #0f62fe 0%, #0847b8 100%)",
            color: "#ffffff",
            padding: "28px",
            borderRadius: "16px",
            boxShadow:
              "0 12px 30px rgba(15, 98, 254, 0.22)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "22px",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 8px",
                color: "rgba(255,255,255,0.82)",
                fontSize: "15px",
              }}
            >
              {getGreeting()}
            </p>

            <h2
              style={{
                margin: "0 0 10px",
                fontSize: "27px",
              }}
            >
              Welcome,{" "}
              {user?.fullName ||
                user?.name ||
                "Administrator"}
            </h2>

            <h3
              style={{
                margin: "0 0 10px",
                fontSize: "19px",
                fontWeight: "600",
                color: "rgba(255,255,255,0.95)",
              }}
            >
              {company?.companyName ||
                "Your Company"}
            </h3>

            <p
              style={{
                margin: 0,
                color: "rgba(255,255,255,0.82)",
                lineHeight: "1.6",
                maxWidth: "620px",
              }}
            >
              Manage your company members, customers,
              projects, tasks, enquiries and daily
              business operations from one central
              dashboard.
            </p>
          </div>

          <div
            style={{
              minWidth: "235px",
              background: "rgba(255,255,255,0.13)",
              border:
                "1px solid rgba(255,255,255,0.18)",
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.75)",
                marginBottom: "6px",
              }}
            >
              Signed in as
            </div>

            <div
              style={{
                fontWeight: "700",
                fontSize: "15px",
                wordBreak: "break-word",
              }}
            >
              {user?.email || "Loading..."}
            </div>

            <div
              style={{
                marginTop: "9px",
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  background: "#ffffff",
                  color: "#0f62fe",
                  padding: "5px 10px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "700",
                }}
              >
                {formatRole(user?.role)}
              </span>

              <span
                style={{
                  display: "inline-block",
                  background: "#dff7e8",
                  color: "#157347",
                  padding: "5px 10px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "700",
                }}
              >
                {company?.subscriptionPlan || "Basic"} Plan
              </span>
            </div>

            <div
              style={{
                marginTop: "12px",
                paddingTop: "12px",
                borderTop:
                  "1px solid rgba(255,255,255,0.18)",
                fontSize: "13px",
                color: "rgba(255,255,255,0.85)",
              }}
            >
              Subscription:{" "}
              <strong>
                {company?.subscriptionStatus ||
                  "Active"}
              </strong>
            </div>
          </div>
        </section>

        <QuickActions navigate={navigate} />

        <KPICards
          statCards={statCards}
          navigate={navigate}
        />

        <AnalyticsChart
          projects={projects}
          customers={customers}
          enquiries={enquiries}
          employees={employees}
        />

        <RecentActivity
          projects={projects}
          customers={customers}
          enquiries={enquiries}
          employees={employees}
        />

        <OverviewWidget
          projects={projects}
          customers={customers}
          enquiries={enquiries}
          employees={employees}
          totalMembers={dashboardSummary.totalMembers}
          currentDateTime={currentDateTime}
        />

        
      </main>
    </div>
  );
}

export default Dashboard;