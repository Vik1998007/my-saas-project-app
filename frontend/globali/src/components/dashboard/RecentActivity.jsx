import React from "react";

function RecentActivity({
  projects = [],
  customers = [],
  enquiries = [],
  employees = [],
}) {
  const getLatestItem = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      return null;
    }

    return [...items].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.updatedAt || 0);
      const dateB = new Date(b.createdAt || b.updatedAt || 0);

      return dateB - dateA;
    })[0];
  };

  const latestProject = getLatestItem(projects);
  const latestCustomer = getLatestItem(customers);
  const latestEnquiry = getLatestItem(enquiries);
  const latestEmployee = getLatestItem(employees);

  const formatDate = (date) => {
    if (!date) {
      return "Recently added";
    }

    const formattedDate = new Date(date);

    if (Number.isNaN(formattedDate.getTime())) {
      return "Recently added";
    }

    return formattedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const activities = [
    {
      id: "customer",
      icon: "👥",
      title: "Latest Customer",
      name:
        latestCustomer?.name ||
        latestCustomer?.fullName ||
        latestCustomer?.companyName ||
        "No customer added",
      date: formatDate(
        latestCustomer?.createdAt || latestCustomer?.updatedAt
      ),
      available: Boolean(latestCustomer),
      background: "#e8f8f0",
    },
    {
      id: "project",
      icon: "📁",
      title: "Latest Project",
      name:
        latestProject?.projectName ||
        latestProject?.name ||
        latestProject?.title ||
        "No project added",
      date: formatDate(
        latestProject?.createdAt || latestProject?.updatedAt
      ),
      available: Boolean(latestProject),
      background: "#eaf2ff",
    },
    {
      id: "enquiry",
      icon: "📩",
      title: "Latest Enquiry",
      name:
        latestEnquiry?.name ||
        latestEnquiry?.customerName ||
        latestEnquiry?.subject ||
        latestEnquiry?.email ||
        "No enquiry added",
      date: formatDate(
        latestEnquiry?.createdAt || latestEnquiry?.updatedAt
      ),
      available: Boolean(latestEnquiry),
      background: "#fff3e8",
    },
    {
      id: "employee",
      icon: "👨‍💼",
      title: "Latest Employee",
      name:
        latestEmployee?.fullName ||
        latestEmployee?.name ||
        latestEmployee?.email ||
        "No employee added",
      date: formatDate(
        latestEmployee?.createdAt || latestEmployee?.updatedAt
      ),
      available: Boolean(latestEmployee),
      background: "#f2eaff",
    },
  ];

  return (
    <section
      style={{
        background: "#ffffff",
        marginTop: "24px",
        borderRadius: "14px",
        padding: "24px",
        border: "1px solid #edf0f5",
        boxShadow: "0 8px 24px rgba(33, 45, 72, 0.06)",
      }}
    >
      <div
        style={{
          marginBottom: "22px",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#1c2536",
            fontSize: "22px",
          }}
        >
          Recent Activity
        </h2>

        <p
          style={{
            marginTop: "7px",
            marginBottom: 0,
            color: "#77808f",
            fontSize: "14px",
          }}
        >
          Latest updates from your business records.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "16px",
        }}
      >
        {activities.map((activity) => (
          <div
            key={activity.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "18px",
              borderRadius: "12px",
              border: "1px solid #edf0f5",
              background: "#ffffff",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                minWidth: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "12px",
                background: activity.background,
                fontSize: "22px",
              }}
            >
              {activity.icon}
            </div>

            <div
              style={{
                minWidth: 0,
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#77808f",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                {activity.title}
              </p>

              <h3
                style={{
                  marginTop: "5px",
                  marginBottom: "5px",
                  color: "#1c2536",
                  fontSize: "15px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={activity.name}
              >
                {activity.name}
              </h3>

              <span
                style={{
                  color: activity.available ? "#8a93a3" : "#b0b6c0",
                  fontSize: "12px",
                }}
              >
                {activity.available ? activity.date : "No activity yet"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default RecentActivity;