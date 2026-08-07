import React from "react";

function OverviewWidget({
  projects = [],
  customers = [],
  enquiries = [],
  employees = [],
  totalMembers = 0,
  currentDateTime,
}) {
  const activeProjects = projects.filter((project) => {
    const status = String(project.status || "").toLowerCase();

    return (
      status === "active" ||
      status === "in progress" ||
      status === "ongoing"
    );
  }).length;

  const pendingEnquiries = enquiries.filter((enquiry) => {
    const status = String(
      enquiry.status || "New"
    ).toLowerCase();

    return (
      status === "new" ||
      status === "pending" ||
      status === "contacted"
    );
  }).length;

  const totalRecords =
    projects.length +
    customers.length +
    enquiries.length +
    employees.length;

  const formatLastUpdated = () => {
    const date = currentDateTime
      ? new Date(currentDateTime)
      : new Date();

    if (Number.isNaN(date.getTime())) {
      return "Just now";
    }

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const overviewItems = [
    {
      id: "total-records",
      title: "Total Records",
      value: totalRecords,
      icon: "📊",
      background: "#eaf2ff",
      accent: "#0f62fe",
    },
    {
      id: "total-members",
      title: "Company Members",
      value: totalMembers,
      icon: "👥",
      background: "#e9f8f0",
      accent: "#198754",
    },
    {
      id: "active-projects",
      title: "Active Projects",
      value: activeProjects,
      icon: "📁",
      background: "#f3edff",
      accent: "#6f42c1",
    },
    {
      id: "pending-enquiries",
      title: "Pending Enquiries",
      value: pendingEnquiries,
      icon: "📩",
      background: "#fff4e8",
      accent: "#fd7e14",
    },
    {
      id: "total-customers",
      title: "Total Customers",
      value: customers.length,
      icon: "👥",
      background: "#e8f8fb",
      accent: "#0aa2c0",
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
        boxShadow:
          "0 8px 24px rgba(33, 45, 72, 0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "22px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: "#1c2536",
              fontSize: "22px",
            }}
          >
            Today&apos;s Overview
          </h2>

          <p
            style={{
              marginTop: "7px",
              marginBottom: 0,
              color: "#77808f",
              fontSize: "14px",
            }}
          >
            Quick summary of your current business activity.
          </p>
        </div>

        <div
          style={{
            background: "#f8faff",
            border: "1px solid #edf0f5",
            borderRadius: "10px",
            padding: "10px 13px",
            color: "#667085",
            fontSize: "12px",
          }}
        >
          Last updated: {formatLastUpdated()}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
        }}
      >
        {overviewItems.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #edf0f5",
              borderRadius: "12px",
              padding: "18px",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                minWidth: "48px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: item.background,
                fontSize: "22px",
              }}
            >
              {item.icon}
            </div>

            <div>
              <p
                style={{
                  margin: 0,
                  color: "#77808f",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                {item.title}
              </p>

              <h3
                style={{
                  marginTop: "6px",
                  marginBottom: 0,
                  color: item.accent,
                  fontSize: "24px",
                }}
              >
                {item.value}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default OverviewWidget;