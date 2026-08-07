import React from "react";

function QuickActions({ navigate }) {
  const actions = [
    {
      id: 1,
      title: "Add Customer",
      icon: "👥",
      color: "#0f62fe",
      background: "#eaf2ff",
      route: "/add-customer",
    },
    {
      id: 2,
      title: "Add Project",
      icon: "📁",
      color: "#198754",
      background: "#e9f8f0",
      route: "/add-project",
    },
    {
      id: 3,
      title: "Add Enquiry",
      icon: "📩",
      color: "#fd7e14",
      background: "#fff4e8",
      route: "/add-enquiry",
    },
    {
      id: 4,
      title: "Add Employee",
      icon: "👨‍💼",
      color: "#6f42c1",
      background: "#f3edff",
      route: "/add-employee",
    },
  ];

  return (
    <section
      style={{
        marginTop: "24px",
      }}
    >
      <h2
        style={{
          marginBottom: "18px",
          color: "#1c2536",
          fontSize: "22px",
        }}
      >
        Quick Actions
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "18px",
        }}
      >
        {actions.map((action) => (
          <div
            key={action.id}
            onClick={() => navigate(action.route)}
            style={{
              cursor: "pointer",
              background: "#ffffff",
              borderRadius: "14px",
              border: "1px solid #edf0f5",
              padding: "22px",
              transition: "0.25s",
              boxShadow:
                "0 8px 24px rgba(33,45,72,0.06)",
            }}
          >
            <div
              style={{
                width: "58px",
                height: "58px",
                borderRadius: "14px",
                background: action.background,
                color: action.color,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "28px",
                marginBottom: "18px",
              }}
            >
              {action.icon}
            </div>

            <h3
              style={{
                margin: 0,
                color: "#1c2536",
                fontSize: "18px",
              }}
            >
              {action.title}
            </h3>

            <p
              style={{
                marginTop: "8px",
                marginBottom: 0,
                color: "#77808f",
                fontSize: "14px",
                lineHeight: "1.5",
              }}
            >
              Click here to create a new {action.title.toLowerCase()}.
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default QuickActions;