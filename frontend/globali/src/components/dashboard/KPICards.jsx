import React from "react";

function KPICards({ statCards, navigate }) {
  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "18px",
        marginTop: "24px",
      }}
    >
      {statCards.map((card) => (
        <div
          key={card.title}
          onClick={() => navigate(card.route)}
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "22px",
            border: "1px solid #edf0f5",
            boxShadow:
              "0 8px 24px rgba(33,45,72,0.06)",
            cursor: "pointer",
            transition:
              "transform 0.25s ease, box-shadow 0.25s ease",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform =
              "translateY(-6px)";
            e.currentTarget.style.boxShadow =
              "0 16px 35px rgba(33,45,72,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform =
              "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 8px 24px rgba(33,45,72,0.06)";
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color: "#6c757d",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              {card.title}
            </p>

            <h2
              style={{
                margin: "10px 0 8px",
                fontSize: "34px",
                color: "#1c2536",
              }}
            >
              {card.value}
            </h2>

            <p
              style={{
                margin: 0,
                color: "#8a94a3",
                fontSize: "12px",
              }}
            >
              {card.subtitle}
            </p>
          </div>

          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "16px",
              background: card.background,
              color: card.accent,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "30px",
            }}
          >
            {card.icon}
          </div>
        </div>
      ))}
    </section>
  );
}

export default KPICards;