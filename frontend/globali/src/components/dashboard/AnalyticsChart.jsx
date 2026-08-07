import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

function AnalyticsChart({
  projects = [],
  customers = [],
  enquiries = [],
  employees = [],
}) {
  const analyticsData = [
    {
      name: "Projects",
      total: projects.length,
    },
    {
      name: "Customers",
      total: customers.length,
    },
    {
      name: "Enquiries",
      total: enquiries.length,
    },
    {
      name: "Employees",
      total: employees.length,
    },
  ];

  const monthlyGrowthData = useMemo(() => {
    const currentDate = new Date();
    const months = [];

    for (let index = 5; index >= 0; index -= 1) {
      const monthDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - index,
        1
      );

      months.push({
        year: monthDate.getFullYear(),
        month: monthDate.getMonth(),
        name: monthDate.toLocaleString("en-GB", {
          month: "short",
        }),
        Projects: 0,
        Customers: 0,
        Enquiries: 0,
        Employees: 0,
      });
    }

    const countRecordsByMonth = (
      records,
      dataKey
    ) => {
      records.forEach((record) => {
        if (!record.createdAt) {
          return;
        }

        const createdDate = new Date(record.createdAt);

        if (Number.isNaN(createdDate.getTime())) {
          return;
        }

        const matchingMonth = months.find(
          (monthItem) =>
            monthItem.year ===
              createdDate.getFullYear() &&
            monthItem.month === createdDate.getMonth()
        );

        if (matchingMonth) {
          matchingMonth[dataKey] += 1;
        }
      });
    };

    countRecordsByMonth(projects, "Projects");
    countRecordsByMonth(customers, "Customers");
    countRecordsByMonth(enquiries, "Enquiries");
    countRecordsByMonth(employees, "Employees");

    return months;
  }, [projects, customers, enquiries, employees]);

  const styles = {
    section: {
      marginTop: "24px",
    },

    grid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(420px, 1fr))",
      gap: "22px",
    },

    card: {
      background: "#ffffff",
      borderRadius: "14px",
      padding: "24px",
      boxShadow:
        "0 8px 24px rgba(33, 45, 72, 0.06)",
      border: "1px solid #edf0f5",
      minWidth: 0,
    },

    heading: {
      marginTop: 0,
      marginBottom: "8px",
      color: "#1c2536",
      fontSize: "22px",
    },

    description: {
      color: "#77808f",
      marginTop: 0,
      marginBottom: "25px",
      fontSize: "14px",
    },

    chart: {
      width: "100%",
      height: "350px",
    },
  };

  return (
    <section style={styles.section}>
      <div style={styles.grid}>
        <div style={styles.card}>
          <h2 style={styles.heading}>
            Business Overview
          </h2>

          <p style={styles.description}>
            Total company records by category.
          </p>

          <div style={styles.chart}>
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart data={analyticsData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  tick={{
                    fill: "#6c757d",
                    fontSize: 13,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{
                    fill: "#6c757d",
                    fontSize: 13,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  cursor={{
                    fill: "rgba(15, 98, 254, 0.06)",
                  }}
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid #edf0f5",
                    boxShadow:
                      "0 8px 20px rgba(33,45,72,0.1)",
                  }}
                />

                <Bar
                  dataKey="total"
                  name="Total Records"
                  fill="#0f62fe"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={65}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.heading}>
            Six-Month Growth
          </h2>

          <p style={styles.description}>
            New business records created during the
            last six months.
          </p>

          <div style={styles.chart}>
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart data={monthlyGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="name"
                  tick={{
                    fill: "#6c757d",
                    fontSize: 13,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{
                    fill: "#6c757d",
                    fontSize: 13,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid #edf0f5",
                    boxShadow:
                      "0 8px 20px rgba(33,45,72,0.1)",
                  }}
                />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="Projects"
                  stroke="#0f62fe"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                />

                <Line
                  type="monotone"
                  dataKey="Customers"
                  stroke="#198754"
                  strokeWidth={3}
                />

                <Line
                  type="monotone"
                  dataKey="Enquiries"
                  stroke="#fd7e14"
                  strokeWidth={3}
                />

                <Line
                  type="monotone"
                  dataKey="Employees"
                  stroke="#6f42c1"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AnalyticsChart;