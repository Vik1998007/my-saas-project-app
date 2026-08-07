import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import * as XLSX from "xlsx";

import Sidebar from "../components/Sidebar";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL;

function Reports() {
  const [summary, setSummary] = useState({
    totalMembers: 0,
    totalEmployees: 0,
    totalCustomers: 0,
    totalProjects: 0,
    totalTasks: 0,
    totalAttendanceRecords: 0,
  });

  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [leaveSummary, setLeaveSummary] = useState({
    totalLeaves: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
  });

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        setError("");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [
          summaryResponse,
          employeesResponse,
          customersResponse,
          projectsResponse,
          tasksResponse,
          attendanceResponse,
          leavesResponse,
        ] = await Promise.all([
          fetch(
           `${API_BASE_URL}/api/reports/summary`,
            {
              headers,
            }
          ),
          fetch(
            `${API_BASE_URL}/api/reports/employees`,
            {
              headers,
            }
          ),
          fetch(
           `${API_BASE_URL}/api/reports/customers`,
            {
              headers,
            }
          ),
          fetch(
           `${API_BASE_URL}/api/reports/projects`,
            {
              headers,
            }
          ),
          fetch(
            `${API_BASE_URL}/api/reports/tasks`,
            {
              headers,
            }
          ),
          fetch(
            `${API_BASE_URL}/api/reports/attendance`,
            {
              headers,
            }
          ),
          fetch(
            `${API_BASE_URL}/api/reports/leaves`,
            {
              headers,
            }
          ),
        ]);

        const [
          summaryData,
          employeesData,
          customersData,
          projectsData,
          tasksData,
          attendanceData,
          leavesData,
        ] = await Promise.all([
          summaryResponse.json(),
          employeesResponse.json(),
          customersResponse.json(),
          projectsResponse.json(),
          tasksResponse.json(),
          attendanceResponse.json(),
          leavesResponse.json(),
        ]);

        if (!summaryResponse.ok) {
          throw new Error(
            summaryData.message ||
              "Unable to load report summary."
          );
        }

        if (!employeesResponse.ok) {
          throw new Error(
            employeesData.message ||
              "Unable to load employee report."
          );
        }

        if (!customersResponse.ok) {
          throw new Error(
            customersData.message ||
              "Unable to load customer report."
          );
        }

        if (!projectsResponse.ok) {
          throw new Error(
            projectsData.message ||
              "Unable to load project report."
          );
        }

        if (!tasksResponse.ok) {
          throw new Error(
            tasksData.message ||
              "Unable to load task report."
          );
        }

        if (!attendanceResponse.ok) {
          throw new Error(
            attendanceData.message ||
              "Unable to load attendance report."
          );
        }

        if (!leavesResponse.ok) {
          throw new Error(
            leavesData.message ||
              "Unable to load leave report."
          );
        }

        setSummary(summaryData.summary || {});
        setEmployees(employeesData.employees || []);
        setCustomers(customersData.customers || []);
        setProjects(projectsData.projects || []);
        setTasks(tasksData.tasks || []);
        setAttendance(attendanceData.attendance || []);
        setLeaves(leavesData.leaves || []);
        setLeaveSummary(
          leavesData.summary || {
            totalLeaves: 0,
            pendingLeaves: 0,
            approvedLeaves: 0,
            rejectedLeaves: 0,
          }
        );
      } catch (error) {
        console.error("Reports loading error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadReports();
    } else {
      setLoading(false);
      setError(
        "Authentication token not found. Please login again."
      );
    }
  }, [token]);

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "-";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("en-GB");
  };

  const getEmployeeName = (employee) => {
    return (
      employee?.user?.fullName ||
      employee?.fullName ||
      "-"
    );
  };

  const getEmployeeEmail = (employee) => {
    return (
      employee?.user?.email ||
      employee?.email ||
      "-"
    );
  };

  const getEmployeeRole = (employee) => {
    return employee?.user?.role || "-";
  };

  const getAttendanceEmployeeName = (record) => {
    return (
      record?.employee?.fullName ||
      record?.employee?.email ||
      "-"
    );
  };

  const getLeaveEmployeeName = (leave) => {
    return (
      leave?.employee?.fullName ||
      leave?.employee?.email ||
      "-"
    );
  };

  const getCurrentDateForFile = () => {
    return new Date().toISOString().split("T")[0];
  };

  const exportPDF = () => {
    try {
      setExporting(true);
      setError("");

      const document = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const reportDate =
        new Date().toLocaleDateString("en-GB");

      document.setFontSize(20);
      document.text(
        "Global Digital Solutions",
        14,
        16
      );

      document.setFontSize(15);
      document.text(
        "Reports & Analytics",
        14,
        25
      );

      document.setFontSize(10);
      document.text(
        `Generated: ${reportDate}`,
        14,
        32
      );

      autoTable(document, {
        startY: 38,
        head: [["Report Category", "Total Records"]],
        body: [
          [
            "Company Members",
            summary.totalMembers || 0,
          ],
          [
            "Employees",
            summary.totalEmployees || 0,
          ],
          [
            "Customers",
            summary.totalCustomers || 0,
          ],
          [
            "Projects",
            summary.totalProjects || 0,
          ],
          [
            "Tasks",
            summary.totalTasks || 0,
          ],
          [
            "Attendance Records",
            summary.totalAttendanceRecords || 0,
          ],
          [
            "Leave Requests",
            leaveSummary.totalLeaves || 0,
          ],
        ],
        theme: "grid",
        headStyles: {
          fillColor: [15, 98, 254],
          textColor: [255, 255, 255],
        },
      });

      const summaryTableEnd =
        document.lastAutoTable?.finalY || 85;

      document.setFontSize(14);
      document.text(
        "Employee Report",
        14,
        summaryTableEnd + 12
      );

      const employeeRows = employees.map(
        (employee, index) => [
          index + 1,
          getEmployeeName(employee),
          getEmployeeEmail(employee),
          getEmployeeRole(employee),
          employee.department || "-",
          employee.designation || "-",
          employee.isActive
            ? "Active"
            : "Inactive",
          formatDate(employee.joiningDate),
        ]
      );

      autoTable(document, {
        startY: summaryTableEnd + 17,
        head: [
          [
            "No.",
            "Name",
            "Email",
            "Role",
            "Department",
            "Designation",
            "Status",
            "Joining Date",
          ],
        ],
        body:
          employeeRows.length > 0
            ? employeeRows
            : [
                [
                  "-",
                  "No employee records found",
                  "-",
                  "-",
                  "-",
                  "-",
                  "-",
                  "-",
                ],
              ],
        theme: "striped",
        headStyles: {
          fillColor: [51, 65, 85],
          textColor: [255, 255, 255],
        },
        styles: {
          fontSize: 8,
        },
      });

      const employeeTableEnd =
        document.lastAutoTable?.finalY || 150;

      document.setFontSize(14);
      document.text(
        "Other Report Totals",
        14,
        employeeTableEnd + 12
      );

      autoTable(document, {
        startY: employeeTableEnd + 17,
        head: [
          [
            "Customers",
            "Projects",
            "Tasks",
            "Attendance",
            "Leaves",
          ],
        ],
        body: [
          [
            customers.length,
            projects.length,
            tasks.length,
            attendance.length,
            leaves.length,
          ],
        ],
        theme: "grid",
        headStyles: {
          fillColor: [15, 98, 254],
          textColor: [255, 255, 255],
        },
      });

      document.save(
        `business-report-${getCurrentDateForFile()}.pdf`
      );
    } catch (error) {
      console.error("PDF export error:", error);

      setError(
        error.message ||
          "Unable to export PDF report."
      );
    } finally {
      setExporting(false);
    }
  };

  const exportExcel = () => {
    try {
      setExporting(true);
      setError("");

      const workbook = XLSX.utils.book_new();

      const summaryRows = [
        {
          Category: "Company Members",
          Total: summary.totalMembers || 0,
        },
        {
          Category: "Employees",
          Total: summary.totalEmployees || 0,
        },
        {
          Category: "Customers",
          Total: summary.totalCustomers || 0,
        },
        {
          Category: "Projects",
          Total: summary.totalProjects || 0,
        },
        {
          Category: "Tasks",
          Total: summary.totalTasks || 0,
        },
        {
          Category: "Attendance Records",
          Total:
            summary.totalAttendanceRecords || 0,
        },
        {
          Category: "Leave Requests",
          Total: leaveSummary.totalLeaves || 0,
        },
      ];

      const employeeRows = employees.map(
        (employee, index) => ({
          Number: index + 1,
          Name: getEmployeeName(employee),
          Email: getEmployeeEmail(employee),
          Role: getEmployeeRole(employee),
          Phone: employee.phone || "-",
          Department: employee.department || "-",
          Designation:
            employee.designation || "-",
          Salary: employee.salary || 0,
          Status: employee.isActive
            ? "Active"
            : "Inactive",
          JoiningDate: formatDate(
            employee.joiningDate
          ),
        })
      );

      const customerRows = customers.map(
        (customer, index) => ({
          Number: index + 1,
          Name:
            customer.name ||
            customer.fullName ||
            customer.companyName ||
            "-",
          Email: customer.email || "-",
          Phone: customer.phone || "-",
          Status: customer.status || "-",
          CreatedDate: formatDate(
            customer.createdAt
          ),
        })
      );

      const projectRows = projects.map(
        (project, index) => ({
          Number: index + 1,
          ProjectName:
            project.title ||
            project.name ||
            "-",
          Status: project.status || "-",
          Priority: project.priority || "-",
          StartDate: formatDate(
            project.startDate
          ),
          EndDate: formatDate(
            project.endDate
          ),
          CreatedDate: formatDate(
            project.createdAt
          ),
        })
      );

      const taskRows = tasks.map(
        (task, index) => ({
          Number: index + 1,
          TaskTitle:
            task.title ||
            task.name ||
            "-",
          Status: task.status || "-",
          Priority: task.priority || "-",
          DueDate: formatDate(task.dueDate),
          CreatedDate: formatDate(
            task.createdAt
          ),
        })
      );

      const attendanceRows = attendance.map(
        (record, index) => ({
          Number: index + 1,
          Employee:
            getAttendanceEmployeeName(record),
          Date: formatDate(record.date),
          Status: record.status || "-",
          CheckIn:
            record.checkIn ||
            record.clockIn ||
            "-",
          CheckOut:
            record.checkOut ||
            record.clockOut ||
            "-",
          WorkingHours:
            record.workingHours || 0,
        })
      );

      const leaveRows = leaves.map(
        (leave, index) => ({
          Number: index + 1,
          Employee: getLeaveEmployeeName(leave),
          LeaveType: leave.leaveType || "-",
          StartDate: formatDate(leave.startDate),
          EndDate: formatDate(leave.endDate),
          TotalDays: leave.totalDays || 0,
          Reason: leave.reason || "-",
          Status: leave.status || "-",
          AdminComment: leave.adminComment || "-",
          ReviewedBy:
            leave.reviewedBy?.fullName ||
            leave.reviewedBy?.email ||
            "-",
          ReviewedAt: formatDate(leave.reviewedAt),
          CreatedDate: formatDate(leave.createdAt),
        })
      );

      const summarySheet =
        XLSX.utils.json_to_sheet(summaryRows);

      const employeeSheet =
        XLSX.utils.json_to_sheet(
          employeeRows.length > 0
            ? employeeRows
            : [
                {
                  Message:
                    "No employee records found",
                },
              ]
        );

      const customerSheet =
        XLSX.utils.json_to_sheet(
          customerRows.length > 0
            ? customerRows
            : [
                {
                  Message:
                    "No customer records found",
                },
              ]
        );

      const projectSheet =
        XLSX.utils.json_to_sheet(
          projectRows.length > 0
            ? projectRows
            : [
                {
                  Message:
                    "No project records found",
                },
              ]
        );

      const taskSheet =
        XLSX.utils.json_to_sheet(
          taskRows.length > 0
            ? taskRows
            : [
                {
                  Message:
                    "No task records found",
                },
              ]
        );

      const attendanceSheet =
        XLSX.utils.json_to_sheet(
          attendanceRows.length > 0
            ? attendanceRows
            : [
                {
                  Message:
                    "No attendance records found",
                },
              ]
        );

      const leaveSheet =
        XLSX.utils.json_to_sheet(
          leaveRows.length > 0
            ? leaveRows
            : [
                {
                  Message:
                    "No leave records found",
                },
              ]
        );

      summarySheet["!cols"] = [
        { wch: 25 },
        { wch: 15 },
      ];

      employeeSheet["!cols"] = [
        { wch: 10 },
        { wch: 22 },
        { wch: 30 },
        { wch: 15 },
        { wch: 18 },
        { wch: 20 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
      ];

      customerSheet["!cols"] = [
        { wch: 10 },
        { wch: 25 },
        { wch: 30 },
        { wch: 18 },
        { wch: 15 },
        { wch: 15 },
      ];

      projectSheet["!cols"] = [
        { wch: 10 },
        { wch: 30 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
      ];

      taskSheet["!cols"] = [
        { wch: 10 },
        { wch: 30 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
      ];

      attendanceSheet["!cols"] = [
        { wch: 10 },
        { wch: 25 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 18 },
      ];

      XLSX.utils.book_append_sheet(
        workbook,
        summarySheet,
        "Summary"
      );

      XLSX.utils.book_append_sheet(
        workbook,
        employeeSheet,
        "Employees"
      );

      XLSX.utils.book_append_sheet(
        workbook,
        customerSheet,
        "Customers"
      );

      XLSX.utils.book_append_sheet(
        workbook,
        projectSheet,
        "Projects"
      );

      XLSX.utils.book_append_sheet(
        workbook,
        taskSheet,
        "Tasks"
      );

      XLSX.utils.book_append_sheet(
        workbook,
        attendanceSheet,
        "Attendance"
      );

      XLSX.utils.book_append_sheet(
        workbook,
        leaveSheet,
        "Leaves"
      );

      XLSX.writeFile(
        workbook,
        `business-report-${getCurrentDateForFile()}.xlsx`
      );
    } catch (error) {
      console.error("Excel export error:", error);

      setError(
        error.message ||
          "Unable to export Excel report."
      );
    } finally {
      setExporting(false);
    }
  };

  const reportCards = [
    {
      title: "Company Members",
      value: summary.totalMembers || 0,
      icon: "👥",
    },
    {
      title: "Employees",
      value: summary.totalEmployees || 0,
      icon: "👨‍💼",
    },
    {
      title: "Customers",
      value: summary.totalCustomers || 0,
      icon: "🤝",
    },
    {
      title: "Projects",
      value: summary.totalProjects || 0,
      icon: "📁",
    },
    {
      title: "Tasks",
      value: summary.totalTasks || 0,
      icon: "✅",
    },
    {
      title: "Attendance Records",
      value:
        summary.totalAttendanceRecords || 0,
      icon: "📅",
    },
    {
      title: "Leave Requests",
      value: leaveSummary.totalLeaves || 0,
      icon: "🏖️",
    },
  ];

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

    actionButtons: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      flexWrap: "wrap",
    },

    button: {
      border: "none",
      color: "#ffffff",
      padding: "11px 17px",
      borderRadius: "8px",
      fontWeight: "700",
      cursor: "pointer",
      fontSize: "14px",
    },

    pdfButton: {
      background: "#dc2626",
    },

    excelButton: {
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

    cardGrid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(210px, 1fr))",
      gap: "18px",
      marginBottom: "25px",
    },

    summaryCard: {
      background: "#ffffff",
      borderRadius: "14px",
      padding: "22px",
      boxShadow:
        "0 8px 24px rgba(33,45,72,0.06)",
      border: "1px solid #edf0f5",
    },

    icon: {
      fontSize: "28px",
      marginBottom: "12px",
    },

    label: {
      color: "#77808f",
      fontSize: "14px",
      marginBottom: "8px",
    },

    value: {
      color: "#1c2536",
      fontSize: "28px",
      fontWeight: "700",
    },

    section: {
      background: "#ffffff",
      borderRadius: "14px",
      padding: "24px",
      marginBottom: "22px",
      boxShadow:
        "0 8px 24px rgba(33,45,72,0.06)",
      border: "1px solid #edf0f5",
    },

    sectionTitle: {
      marginTop: 0,
      color: "#1c2536",
      fontSize: "21px",
    },

    tableWrapper: {
      overflowX: "auto",
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "700px",
    },

    th: {
      textAlign: "left",
      padding: "13px",
      background: "#edf4ff",
      color: "#1c2536",
      borderBottom:
        "1px solid #dfe6ef",
      fontSize: "14px",
    },

    td: {
      padding: "13px",
      borderBottom:
        "1px solid #edf0f5",
      color: "#4b5563",
      fontSize: "14px",
    },

    message: {
      background: "#ffffff",
      padding: "25px",
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
          <div style={styles.message}>
            Loading reports...
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
              Reports & Analytics
            </h1>

            <p style={styles.subHeading}>
              View and export your company reports.
            </p>
          </div>

          <div style={styles.actionButtons}>
            <button
              type="button"
              onClick={exportPDF}
              disabled={exporting}
              style={{
                ...styles.button,
                ...styles.pdfButton,
                opacity: exporting ? 0.6 : 1,
              }}
            >
              📄 Export PDF
            </button>

            <button
              type="button"
              onClick={exportExcel}
              disabled={exporting}
              style={{
                ...styles.button,
                ...styles.excelButton,
                opacity: exporting ? 0.6 : 1,
              }}
            >
              📊 Export Excel
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

        <div style={styles.cardGrid}>
          {reportCards.map((card) => (
            <div
              key={card.title}
              style={styles.summaryCard}
            >
              <div style={styles.icon}>
                {card.icon}
              </div>

              <div style={styles.label}>
                {card.title}
              </div>

              <div style={styles.value}>
                {card.value}
              </div>
            </div>
          ))}
        </div>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            Employee Report
          </h2>

          {employees.length === 0 ? (
            <div style={styles.message}>
              No employee records found.
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>
                      Department
                    </th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee._id}>
                      <td style={styles.td}>
                        {getEmployeeName(employee)}
                      </td>

                      <td style={styles.td}>
                        {getEmployeeEmail(employee)}
                      </td>

                      <td style={styles.td}>
                        {getEmployeeRole(employee)}
                      </td>

                      <td style={styles.td}>
                        {employee.department || "-"}
                      </td>

                      <td style={styles.td}>
                        {employee.isActive
                          ? "Active"
                          : "Inactive"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            Leave Report
          </h2>

          <div style={styles.cardGrid}>
            <div style={styles.summaryCard}>
              <div style={styles.label}>
                Pending Leaves
              </div>
              <div style={styles.value}>
                {leaveSummary.pendingLeaves || 0}
              </div>
            </div>

            <div style={styles.summaryCard}>
              <div style={styles.label}>
                Approved Leaves
              </div>
              <div style={styles.value}>
                {leaveSummary.approvedLeaves || 0}
              </div>
            </div>

            <div style={styles.summaryCard}>
              <div style={styles.label}>
                Rejected Leaves
              </div>
              <div style={styles.value}>
                {leaveSummary.rejectedLeaves || 0}
              </div>
            </div>
          </div>

          {leaves.length === 0 ? (
            <div style={styles.message}>
              No leave records found.
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Employee</th>
                    <th style={styles.th}>Leave Type</th>
                    <th style={styles.th}>Start Date</th>
                    <th style={styles.th}>End Date</th>
                    <th style={styles.th}>Days</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave._id}>
                      <td style={styles.td}>
                        {getLeaveEmployeeName(leave)}
                      </td>
                      <td style={styles.td}>
                        {leave.leaveType || "-"}
                      </td>
                      <td style={styles.td}>
                        {formatDate(leave.startDate)}
                      </td>
                      <td style={styles.td}>
                        {formatDate(leave.endDate)}
                      </td>
                      <td style={styles.td}>
                        {leave.totalDays || 0}
                      </td>
                      <td style={styles.td}>
                        {leave.status || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            Other Reports
          </h2>

          <div style={styles.cardGrid}>
            <div style={styles.summaryCard}>
              <div style={styles.label}>
                Customer Records
              </div>

              <div style={styles.value}>
                {customers.length}
              </div>
            </div>

            <div style={styles.summaryCard}>
              <div style={styles.label}>
                Project Records
              </div>

              <div style={styles.value}>
                {projects.length}
              </div>
            </div>

            <div style={styles.summaryCard}>
              <div style={styles.label}>
                Task Records
              </div>

              <div style={styles.value}>
                {tasks.length}
              </div>
            </div>

            <div style={styles.summaryCard}>
              <div style={styles.label}>
                Attendance Records
              </div>

              <div style={styles.value}>
                {attendance.length}
              </div>
            </div>

            <div style={styles.summaryCard}>
              <div style={styles.label}>
                Leave Records
              </div>

              <div style={styles.value}>
                {leaves.length}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Reports;