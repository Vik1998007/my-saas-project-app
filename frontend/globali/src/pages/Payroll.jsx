import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import Sidebar from "../components/Sidebar";

const API_BASE_URL =
  `${process.env.REACT_APP_API_BASE_URL}/api`;

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const currentDate = new Date();

const createInitialForm = () => ({
  employee: "",
  payrollMonth: currentDate.getMonth() + 1,
  payrollYear: currentDate.getFullYear(),
  currency: "GBP",
  basicSalary: 0,
  housingAllowance: 0,
  travelAllowance: 0,
  mealAllowance: 0,
  medicalAllowance: 0,
  otherAllowance: 0,
  overtimeHours: 0,
  overtimeHourlyRate: 0,
  bonus: 0,
  commission: 0,
  tax: 0,
  nationalInsurance: 0,
  pension: 0,
  loanDeduction: 0,
  unpaidLeaveDeduction: 0,
  absenceDeduction: 0,
  lateDeduction: 0,
  otherDeduction: 0,
  workingDays: 0,
  presentDays: 0,
  absentDays: 0,
  paidLeaveDays: 0,
  unpaidLeaveDays: 0,
  notes: "",
});

function Payroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [summary, setSummary] = useState({
    totalPayrolls: 0,
    totalGrossSalary: 0,
    totalDeductions: 0,
    totalNetSalary: 0,
    paidPayrolls: 0,
    pendingPayrolls: 0,
  });

  const [form, setForm] = useState(createInitialForm());
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState(
    String(currentDate.getFullYear())
  );
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const jsonHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const safeJson = async (response) => {
    const type = response.headers.get("content-type") || "";

    if (!type.includes("application/json")) {
      throw new Error(
        "Unexpected server response. Check backend."
      );
    }

    return response.json();
  };

  const loadPayrolls = useCallback(async () => {
    const query = new URLSearchParams();

    if (monthFilter) {
      query.set("month", monthFilter);
    }

    if (yearFilter) {
      query.set("year", yearFilter);
    }

    if (statusFilter) {
      query.set("status", statusFilter);
    }

    const response = await fetch(
      `${API_BASE_URL}/payroll${
        query.toString() ? `?${query.toString()}` : ""
      }`,
      {
        headers: authHeaders,
      }
    );

    const data = await safeJson(response);

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Unable to load payroll."
      );
    }

    setPayrolls(data.payrolls || []);
  }, [
    authHeaders,
    monthFilter,
    yearFilter,
    statusFilter,
  ]);

  const loadSummary = useCallback(async () => {
    const query = new URLSearchParams();

    if (monthFilter) {
      query.set("month", monthFilter);
    }

    if (yearFilter) {
      query.set("year", yearFilter);
    }

    const response = await fetch(
      `${API_BASE_URL}/payroll/summary${
        query.toString() ? `?${query.toString()}` : ""
      }`,
      {
        headers: authHeaders,
      }
    );

    const data = await safeJson(response);

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Unable to load summary."
      );
    }

    setSummary(data.summary || {});
  }, [authHeaders, monthFilter, yearFilter]);

  const loadEmployees = useCallback(async () => {
    const response = await fetch(
      `${API_BASE_URL}/employees`,
      {
        headers: authHeaders,
      }
    );

    const data = await safeJson(response);

    if (!response.ok || data.success === false) {
      throw new Error(
        data.message || "Unable to load employees."
      );
    }

    const list =
      data.employees ||
      data.data ||
      (Array.isArray(data) ? data : []);

    setEmployees(Array.isArray(list) ? list : []);
  }, [authHeaders]);

  const loadPage = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setError("Please login again.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await Promise.all([
        loadPayrolls(),
        loadSummary(),
        loadEmployees(),
      ]);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [
    token,
    loadPayrolls,
    loadSummary,
    loadEmployees,
  ]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const setField = (name, value) => {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const toNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  };

  const totalAllowances =
    toNumber(form.housingAllowance) +
    toNumber(form.travelAllowance) +
    toNumber(form.mealAllowance) +
    toNumber(form.medicalAllowance) +
    toNumber(form.otherAllowance);

  const overtimeAmount =
    toNumber(form.overtimeHours) *
    toNumber(form.overtimeHourlyRate);

  const grossSalary =
    toNumber(form.basicSalary) +
    totalAllowances +
    overtimeAmount +
    toNumber(form.bonus) +
    toNumber(form.commission);

  const totalDeductions =
    toNumber(form.tax) +
    toNumber(form.nationalInsurance) +
    toNumber(form.pension) +
    toNumber(form.loanDeduction) +
    toNumber(form.unpaidLeaveDeduction) +
    toNumber(form.absenceDeduction) +
    toNumber(form.lateDeduction) +
    toNumber(form.otherDeduction);

  const netSalary = Math.max(
    grossSalary - totalDeductions,
    0
  );

  const formatMoney = (amount, currency = "GBP") => {
    try {
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency,
      }).format(Number(amount) || 0);
    } catch {
      return `${currency} ${Number(amount || 0).toFixed(2)}`;
    }
  };

  const getEmployeeName = (employee) =>
    employee?.fullName ||
    employee?.name ||
    employee?.email ||
    "Unknown employee";

  const handleCreate = async (event) => {
    event.preventDefault();

    if (!form.employee) {
      setError("Please select an employee.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_BASE_URL}/payroll`,
        {
          method: "POST",
          headers: jsonHeaders,
          body: JSON.stringify({
            employee: form.employee,
            payrollMonth: toNumber(form.payrollMonth),
            payrollYear: toNumber(form.payrollYear),
            currency: form.currency,
            basicSalary: toNumber(form.basicSalary),

            allowances: {
              housingAllowance: toNumber(
                form.housingAllowance
              ),
              travelAllowance: toNumber(
                form.travelAllowance
              ),
              mealAllowance: toNumber(
                form.mealAllowance
              ),
              medicalAllowance: toNumber(
                form.medicalAllowance
              ),
              otherAllowance: toNumber(
                form.otherAllowance
              ),
            },

            overtime: {
              hours: toNumber(form.overtimeHours),
              hourlyRate: toNumber(
                form.overtimeHourlyRate
              ),
            },

            bonus: toNumber(form.bonus),
            commission: toNumber(form.commission),

            deductions: {
              tax: toNumber(form.tax),
              nationalInsurance: toNumber(
                form.nationalInsurance
              ),
              pension: toNumber(form.pension),
              loanDeduction: toNumber(
                form.loanDeduction
              ),
              unpaidLeaveDeduction: toNumber(
                form.unpaidLeaveDeduction
              ),
              absenceDeduction: toNumber(
                form.absenceDeduction
              ),
              lateDeduction: toNumber(
                form.lateDeduction
              ),
              otherDeduction: toNumber(
                form.otherDeduction
              ),
            },

            workingDays: toNumber(form.workingDays),
            presentDays: toNumber(form.presentDays),
            absentDays: toNumber(form.absentDays),
            paidLeaveDays: toNumber(
              form.paidLeaveDays
            ),
            unpaidLeaveDays: toNumber(
              form.unpaidLeaveDays
            ),
            notes: form.notes.trim(),
          }),
        }
      );

      const data = await safeJson(response);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to create payroll."
        );
      }

      setSuccess("Payroll created successfully.");
      setShowForm(false);
      setForm(createInitialForm());

      await Promise.all([
        loadPayrolls(),
        loadSummary(),
      ]);
    } catch (createError) {
      setError(createError.message);
    } finally {
      setSaving(false);
    }
  };


  const downloadPayslipPDF = (payroll) => {
    try {
      setError("");
      setSuccess("");

      const document = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const employee = payroll.employee || {};
      const currency = payroll.currency || "GBP";
      const payrollMonthName =
        months[Number(payroll.payrollMonth) - 1] || "-";

      document.setFontSize(20);
      document.text("Global Digital Solutions", 14, 18);

      document.setFontSize(15);
      document.text("PAYSLIP", 14, 28);

      document.setFontSize(10);
      document.text(
        `Employee: ${getEmployeeName(employee)}`,
        14,
        40
      );
      document.text(
        `Email: ${employee.email || "-"}`,
        14,
        46
      );
      document.text(
        `Employee ID: ${employee.employeeId || "-"}`,
        14,
        52
      );
      document.text(
        `Department: ${employee.department || "-"}`,
        14,
        58
      );
      document.text(
        `Designation: ${employee.designation || "-"}`,
        14,
        64
      );

      document.text(
        `Payroll Period: ${payrollMonthName} ${payroll.payrollYear}`,
        110,
        40
      );
      document.text(
        `Status: ${payroll.paymentStatus || "draft"}`,
        110,
        46
      );
      document.text(
        `Payment Method: ${String(
          payroll.paymentMethod || "not_selected"
        ).replaceAll("_", " ")}`,
        110,
        52
      );
      document.text(
        `Transaction Ref: ${
          payroll.transactionReference || "-"
        }`,
        110,
        58
      );

      autoTable(document, {
        startY: 76,
        head: [["Earnings", "Amount"]],
        body: [
          [
            "Basic Salary",
            formatMoney(payroll.basicSalary, currency),
          ],
          [
            "Housing Allowance",
            formatMoney(
              payroll.allowances?.housingAllowance,
              currency
            ),
          ],
          [
            "Travel Allowance",
            formatMoney(
              payroll.allowances?.travelAllowance,
              currency
            ),
          ],
          [
            "Meal Allowance",
            formatMoney(
              payroll.allowances?.mealAllowance,
              currency
            ),
          ],
          [
            "Medical Allowance",
            formatMoney(
              payroll.allowances?.medicalAllowance,
              currency
            ),
          ],
          [
            "Other Allowance",
            formatMoney(
              payroll.allowances?.otherAllowance,
              currency
            ),
          ],
          [
            "Overtime",
            formatMoney(
              payroll.overtime?.amount,
              currency
            ),
          ],
          [
            "Bonus",
            formatMoney(payroll.bonus, currency),
          ],
          [
            "Commission",
            formatMoney(payroll.commission, currency),
          ],
          [
            "Gross Salary",
            formatMoney(payroll.grossSalary, currency),
          ],
        ],
        theme: "grid",
        headStyles: {
          fillColor: [15, 98, 254],
          textColor: [255, 255, 255],
        },
      });

      const earningsEndY =
        document.lastAutoTable?.finalY || 140;

      autoTable(document, {
        startY: earningsEndY + 8,
        head: [["Deductions", "Amount"]],
        body: [
          [
            "Tax",
            formatMoney(payroll.deductions?.tax, currency),
          ],
          [
            "National Insurance",
            formatMoney(
              payroll.deductions?.nationalInsurance,
              currency
            ),
          ],
          [
            "Pension",
            formatMoney(
              payroll.deductions?.pension,
              currency
            ),
          ],
          [
            "Loan Deduction",
            formatMoney(
              payroll.deductions?.loanDeduction,
              currency
            ),
          ],
          [
            "Unpaid Leave Deduction",
            formatMoney(
              payroll.deductions?.unpaidLeaveDeduction,
              currency
            ),
          ],
          [
            "Absence Deduction",
            formatMoney(
              payroll.deductions?.absenceDeduction,
              currency
            ),
          ],
          [
            "Late Deduction",
            formatMoney(
              payroll.deductions?.lateDeduction,
              currency
            ),
          ],
          [
            "Other Deduction",
            formatMoney(
              payroll.deductions?.otherDeduction,
              currency
            ),
          ],
          [
            "Total Deductions",
            formatMoney(
              payroll.totalDeductions,
              currency
            ),
          ],
        ],
        theme: "grid",
        headStyles: {
          fillColor: [51, 65, 85],
          textColor: [255, 255, 255],
        },
      });

      const deductionsEndY =
        document.lastAutoTable?.finalY || 210;

      document.setFontSize(13);
      document.text(
        `Net Salary: ${formatMoney(
          payroll.netSalary,
          currency
        )}`,
        14,
        deductionsEndY + 12
      );

      document.setFontSize(10);
      document.text(
        `Working Days: ${payroll.workingDays || 0}`,
        14,
        deductionsEndY + 22
      );
      document.text(
        `Present Days: ${payroll.presentDays || 0}`,
        70,
        deductionsEndY + 22
      );
      document.text(
        `Absent Days: ${payroll.absentDays || 0}`,
        125,
        deductionsEndY + 22
      );

      if (payroll.notes) {
        document.setFontSize(11);
        document.text(
          "Notes",
          14,
          deductionsEndY + 34
        );

        document.setFontSize(9);
        const noteLines = document.splitTextToSize(
          payroll.notes,
          175
        );

        document.text(
          noteLines,
          14,
          deductionsEndY + 40
        );
      }

      document.save(
        `payslip-${getEmployeeName(employee)
          .replace(/[^a-z0-9]+/gi, "-")
          .toLowerCase()}-${payrollMonthName}-${payroll.payrollYear}.pdf`
      );

      setSuccess("Payslip PDF downloaded successfully.");
    } catch (pdfError) {
      console.error("Payslip PDF error:", pdfError);
      setError(
        pdfError.message ||
          "Unable to download payslip PDF."
      );
    }
  };

  const runAction = async (
    payrollId,
    path,
    method,
    body,
    message
  ) => {
    try {
      setActionId(payrollId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_BASE_URL}/payroll/${payrollId}${path}`,
        {
          method,
          headers: body ? jsonHeaders : authHeaders,
          ...(body
            ? { body: JSON.stringify(body) }
            : {}),
        }
      );

      const data = await safeJson(response);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to update payroll."
        );
      }

      setSuccess(message);

      await Promise.all([
        loadPayrolls(),
        loadSummary(),
      ]);
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setActionId("");
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      background: "#f4f7fc",
      fontFamily: "Arial, sans-serif",
    },
    content: {
      flex: 1,
      padding: "32px",
      minWidth: 0,
      overflowX: "auto",
    },
    topBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "14px",
      flexWrap: "wrap",
      marginBottom: "22px",
    },
    heading: {
      margin: 0,
      color: "#1c2536",
      fontSize: "30px",
    },
    subHeading: {
      margin: "7px 0 0",
      color: "#77808f",
      fontSize: "14px",
    },
    actionArea: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
    },
    primaryButton: {
      border: "none",
      background: "#0f62fe",
      color: "#ffffff",
      padding: "11px 17px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "700",
    },
    secondaryLink: {
      textDecoration: "none",
      background: "#334155",
      color: "#ffffff",
      padding: "11px 17px",
      borderRadius: "8px",
      fontWeight: "700",
    },
    cards: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(190px, 1fr))",
      gap: "16px",
      marginBottom: "22px",
    },
    card: {
      background: "#ffffff",
      padding: "20px",
      borderRadius: "12px",
      border: "1px solid #edf0f5",
    },
    cardLabel: {
      color: "#667085",
      fontSize: "13px",
      marginBottom: "8px",
    },
    cardValue: {
      color: "#1c2536",
      fontSize: "24px",
      fontWeight: "700",
    },
    formSection: {
      background: "#ffffff",
      padding: "24px",
      borderRadius: "14px",
      border: "1px solid #edf0f5",
      marginBottom: "22px",
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(210px, 1fr))",
      gap: "16px",
    },
    field: {
      display: "flex",
      flexDirection: "column",
      gap: "7px",
    },
    label: {
      color: "#344054",
      fontSize: "14px",
      fontWeight: "700",
    },
    input: {
      width: "100%",
      padding: "11px",
      border: "1px solid #cfd5df",
      borderRadius: "8px",
      boxSizing: "border-box",
      background: "#ffffff",
    },
    sectionTitle: {
      margin: "24px 0 12px",
      color: "#1c2536",
    },
    totalsBox: {
      background: "#eef4ff",
      padding: "18px",
      borderRadius: "10px",
      marginTop: "20px",
      display: "grid",
      gap: "8px",
    },
    filters: {
      display: "flex",
      gap: "12px",
      flexWrap: "wrap",
      marginBottom: "16px",
    },
    tableWrapper: {
      background: "#ffffff",
      borderRadius: "12px",
      overflowX: "auto",
      border: "1px solid #edf0f5",
    },
    table: {
      width: "100%",
      minWidth: "1100px",
      borderCollapse: "collapse",
    },
    th: {
      padding: "14px",
      background: "#0f62fe",
      color: "#ffffff",
      textAlign: "left",
    },
    td: {
      padding: "14px",
      borderBottom: "1px solid #edf0f5",
      color: "#4b5563",
    },
    buttonRow: {
      display: "flex",
      gap: "7px",
      flexWrap: "wrap",
    },
    smallButton: {
      border: "none",
      color: "#ffffff",
      padding: "8px 10px",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "700",
      fontSize: "12px",
    },
    badge: {
      display: "inline-block",
      padding: "5px 9px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "700",
      textTransform: "capitalize",
    },
    message: {
      padding: "14px",
      borderRadius: "9px",
      marginBottom: "18px",
    },
    empty: {
      background: "#ffffff",
      padding: "28px",
      textAlign: "center",
      borderRadius: "12px",
      color: "#667085",
    },
  };

  const earningFields = [
    ["basicSalary", "Basic Salary"],
    ["housingAllowance", "Housing Allowance"],
    ["travelAllowance", "Travel Allowance"],
    ["mealAllowance", "Meal Allowance"],
    ["medicalAllowance", "Medical Allowance"],
    ["otherAllowance", "Other Allowance"],
    ["overtimeHours", "Overtime Hours"],
    ["overtimeHourlyRate", "Overtime Hourly Rate"],
    ["bonus", "Bonus"],
    ["commission", "Commission"],
  ];

  const deductionFields = [
    ["tax", "Tax"],
    ["nationalInsurance", "National Insurance"],
    ["pension", "Pension"],
    ["loanDeduction", "Loan Deduction"],
    [
      "unpaidLeaveDeduction",
      "Unpaid Leave Deduction",
    ],
    ["absenceDeduction", "Absence Deduction"],
    ["lateDeduction", "Late Deduction"],
    ["otherDeduction", "Other Deduction"],
  ];

  const attendanceFields = [
    ["workingDays", "Working Days"],
    ["presentDays", "Present Days"],
    ["absentDays", "Absent Days"],
    ["paidLeaveDays", "Paid Leave Days"],
    ["unpaidLeaveDays", "Unpaid Leave Days"],
  ];

  const statusStyles = {
    draft: {
      background: "#e2e8f0",
      color: "#334155",
    },
    pending: {
      background: "#fef3c7",
      color: "#92400e",
    },
    paid: {
      background: "#dcfce7",
      color: "#166534",
    },
    cancelled: {
      background: "#fee2e2",
      color: "#991b1b",
    },
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <Sidebar />
        <main style={styles.content}>
          <div style={styles.empty}>
            Loading payroll...
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
            <h1 style={styles.heading}>Payroll</h1>
            <p style={styles.subHeading}>
              Create and manage company payroll.
            </p>
          </div>

          <div style={styles.actionArea}>
            <button
              type="button"
              onClick={() =>
                setShowForm((current) => !current)
              }
              style={styles.primaryButton}
            >
              {showForm
                ? "Close Form"
                : "Create Payroll"}
            </button>

            <Link
              to="/dashboard"
              style={styles.secondaryLink}
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {error && (
          <div
            style={{
              ...styles.message,
              background: "#fee2e2",
              color: "#991b1b",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              ...styles.message,
              background: "#dcfce7",
              color: "#166534",
            }}
          >
            {success}
          </div>
        )}

        <div style={styles.cards}>
          {[
            ["Total Payrolls", summary.totalPayrolls || 0],
            [
              "Gross Salary",
              formatMoney(summary.totalGrossSalary),
            ],
            [
              "Deductions",
              formatMoney(summary.totalDeductions),
            ],
            [
              "Net Salary",
              formatMoney(summary.totalNetSalary),
            ],
            ["Paid", summary.paidPayrolls || 0],
            ["Pending", summary.pendingPayrolls || 0],
          ].map(([label, value]) => (
            <div key={label} style={styles.card}>
              <div style={styles.cardLabel}>{label}</div>
              <div style={styles.cardValue}>{value}</div>
            </div>
          ))}
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            style={styles.formSection}
          >
            <h2 style={{ marginTop: 0 }}>
              Create New Payroll
            </h2>

            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>
                  Employee
                </label>
                <select
                  value={form.employee}
                  onChange={(event) =>
                    setField(
                      "employee",
                      event.target.value
                    )
                  }
                  style={styles.input}
                  required
                >
                  <option value="">
                    Select employee
                  </option>
                  {employees.map((employee) => (
                    <option
                      key={employee._id}
                      value={employee._id}
                    >
                      {getEmployeeName(employee)}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Month
                </label>
                <select
                  value={form.payrollMonth}
                  onChange={(event) =>
                    setField(
                      "payrollMonth",
                      event.target.value
                    )
                  }
                  style={styles.input}
                >
                  {months.map((month, index) => (
                    <option
                      key={month}
                      value={index + 1}
                    >
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Year
                </label>
                <input
                  type="number"
                  min="2000"
                  max="2100"
                  value={form.payrollYear}
                  onChange={(event) =>
                    setField(
                      "payrollYear",
                      event.target.value
                    )
                  }
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Currency
                </label>
                <select
                  value={form.currency}
                  onChange={(event) =>
                    setField(
                      "currency",
                      event.target.value
                    )
                  }
                  style={styles.input}
                >
                  {["GBP", "USD", "EUR", "CAD", "AUD", "INR"].map(
                    (currency) => (
                      <option
                        key={currency}
                        value={currency}
                      >
                        {currency}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            <h3 style={styles.sectionTitle}>
              Earnings
            </h3>

            <div style={styles.formGrid}>
              {earningFields.map(([field, label]) => (
                <div key={field} style={styles.field}>
                  <label style={styles.label}>
                    {label}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form[field]}
                    onChange={(event) =>
                      setField(
                        field,
                        event.target.value
                      )
                    }
                    style={styles.input}
                  />
                </div>
              ))}
            </div>

            <h3 style={styles.sectionTitle}>
              Deductions
            </h3>

            <div style={styles.formGrid}>
              {deductionFields.map(([field, label]) => (
                <div key={field} style={styles.field}>
                  <label style={styles.label}>
                    {label}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form[field]}
                    onChange={(event) =>
                      setField(
                        field,
                        event.target.value
                      )
                    }
                    style={styles.input}
                  />
                </div>
              ))}
            </div>

            <h3 style={styles.sectionTitle}>
              Attendance
            </h3>

            <div style={styles.formGrid}>
              {attendanceFields.map(([field, label]) => (
                <div key={field} style={styles.field}>
                  <label style={styles.label}>
                    {label}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={form[field]}
                    onChange={(event) =>
                      setField(
                        field,
                        event.target.value
                      )
                    }
                    style={styles.input}
                  />
                </div>
              ))}
            </div>

            <h3 style={styles.sectionTitle}>Notes</h3>

            <textarea
              value={form.notes}
              onChange={(event) =>
                setField("notes", event.target.value)
              }
              maxLength={2000}
              style={{
                ...styles.input,
                minHeight: "90px",
              }}
            />

            <div style={styles.totalsBox}>
              <div>
                Gross Salary:{" "}
                <strong>
                  {formatMoney(
                    grossSalary,
                    form.currency
                  )}
                </strong>
              </div>
              <div>
                Total Deductions:{" "}
                <strong>
                  {formatMoney(
                    totalDeductions,
                    form.currency
                  )}
                </strong>
              </div>
              <div style={{ fontSize: "19px" }}>
                Net Salary:{" "}
                <strong>
                  {formatMoney(
                    netSalary,
                    form.currency
                  )}
                </strong>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                ...styles.primaryButton,
                marginTop: "18px",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving
                ? "Creating..."
                : "Create Payroll"}
            </button>
          </form>
        )}

        <div style={styles.filters}>
          <select
            value={monthFilter}
            onChange={(event) =>
              setMonthFilter(event.target.value)
            }
            style={{
              ...styles.input,
              width: "180px",
            }}
          >
            <option value="">All months</option>
            {months.map((month, index) => (
              <option
                key={month}
                value={index + 1}
              >
                {month}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="2000"
            max="2100"
            value={yearFilter}
            onChange={(event) =>
              setYearFilter(event.target.value)
            }
            style={{
              ...styles.input,
              width: "150px",
            }}
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            style={{
              ...styles.input,
              width: "180px",
            }}
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="cancelled">
              Cancelled
            </option>
          </select>
        </div>

        {payrolls.length === 0 ? (
          <div style={styles.empty}>
            No payroll records found.
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Employee</th>
                  <th style={styles.th}>Period</th>
                  <th style={styles.th}>Gross</th>
                  <th style={styles.th}>
                    Deductions
                  </th>
                  <th style={styles.th}>Net</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {payrolls.map((payroll) => {
                  const busy =
                    actionId === payroll._id;

                  return (
                    <tr key={payroll._id}>
                      <td style={styles.td}>
                        {getEmployeeName(
                          payroll.employee
                        )}
                      </td>
                      <td style={styles.td}>
                        {months[
                          Number(
                            payroll.payrollMonth
                          ) - 1
                        ] || "-"}{" "}
                        {payroll.payrollYear}
                      </td>
                      <td style={styles.td}>
                        {formatMoney(
                          payroll.grossSalary,
                          payroll.currency
                        )}
                      </td>
                      <td style={styles.td}>
                        {formatMoney(
                          payroll.totalDeductions,
                          payroll.currency
                        )}
                      </td>
                      <td style={styles.td}>
                        <strong>
                          {formatMoney(
                            payroll.netSalary,
                            payroll.currency
                          )}
                        </strong>
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.badge,
                            ...(statusStyles[
                              payroll.paymentStatus
                            ] ||
                              statusStyles.draft),
                          }}
                        >
                          {payroll.paymentStatus ||
                            "draft"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.buttonRow}>
                          <button
                            type="button"
                            onClick={() =>
                              downloadPayslipPDF(payroll)
                            }
                            disabled={busy}
                            style={{
                              ...styles.smallButton,
                              background: "#7c3aed",
                            }}
                          >
                            Payslip PDF
                          </button>

                          {payroll.paymentStatus ===
                            "draft" && (
                            <button
                              type="button"
                              onClick={() =>
                                runAction(
                                  payroll._id,
                                  "/pending",
                                  "PUT",
                                  null,
                                  "Payroll marked as pending."
                                )
                              }
                              disabled={busy}
                              style={{
                                ...styles.smallButton,
                                background: "#0f62fe",
                              }}
                            >
                              Pending
                            </button>
                          )}

                          {![
                            "paid",
                            "cancelled",
                          ].includes(
                            payroll.paymentStatus
                          ) && (
                            <button
                              type="button"
                              onClick={() => {
                                const reference =
                                  window.prompt(
                                    "Transaction reference:",
                                    ""
                                  );

                                if (
                                  reference !== null
                                ) {
                                  runAction(
                                    payroll._id,
                                    "/pay",
                                    "PUT",
                                    {
                                      paymentMethod:
                                        "bank_transfer",
                                      paymentDate:
                                        new Date().toISOString(),
                                      transactionReference:
                                        reference,
                                    },
                                    "Payroll marked as paid."
                                  );
                                }
                              }}
                              disabled={busy}
                              style={{
                                ...styles.smallButton,
                                background: "#198754",
                              }}
                            >
                              Pay
                            </button>
                          )}

                          {![
                            "paid",
                            "cancelled",
                          ].includes(
                            payroll.paymentStatus
                          ) && (
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "Cancel this payroll?"
                                  )
                                ) {
                                  runAction(
                                    payroll._id,
                                    "/cancel",
                                    "PUT",
                                    null,
                                    "Payroll cancelled."
                                  );
                                }
                              }}
                              disabled={busy}
                              style={{
                                ...styles.smallButton,
                                background: "#f59e0b",
                              }}
                            >
                              Cancel
                            </button>
                          )}

                          {payroll.paymentStatus !==
                            "paid" && (
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "Delete this payroll permanently?"
                                  )
                                ) {
                                  runAction(
                                    payroll._id,
                                    "",
                                    "DELETE",
                                    null,
                                    "Payroll deleted."
                                  );
                                }
                              }}
                              disabled={busy}
                              style={{
                                ...styles.smallButton,
                                background: "#dc3545",
                              }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default Payroll;