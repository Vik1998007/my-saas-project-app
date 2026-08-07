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
  process.env.REACT_APP_API_BASE_URL;



const createEmptyItem = () => ({
  description: "",
  quantity: 1,
  rate: 0,
});

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [summary, setSummary] = useState({
    totalInvoices: 0,
    draftInvoices: 0,
    sentInvoices: 0,
    partiallyPaidInvoices: 0,
    paidInvoices: 0,
    overdueInvoices: 0,
    cancelledInvoices: 0,
    totalAmount: 0,
    totalPaid: 0,
    totalOutstanding: 0,
  });

  const [customerId, setCustomerId] = useState("");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState([createEmptyItem()]);
  const [taxRate, setTaxRate] = useState(0);
  const [discountType, setDiscountType] =
    useState("none");
  const [discountValue, setDiscountValue] =
    useState(0);
  const [currency, setCurrency] = useState("GBP");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState("");
  const [showForm, setShowForm] = useState(false);

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
    const contentType =
      response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      throw new Error(
        "Unexpected server response. Please check the backend."
      );
    }

    return response.json();
  };

  const loadInvoices = useCallback(async () => {
    const query = new URLSearchParams();

    if (statusFilter) {
      query.set("status", statusFilter);
    }

    if (search.trim()) {
      query.set("search", search.trim());
    }

    const url = `${API_BASE_URL}/invoices${
      query.toString() ? `?${query.toString()}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: authHeaders,
    });

    const data = await safeJson(response);

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Unable to load invoices."
      );
    }

    setInvoices(data.invoices || []);
  }, [authHeaders, search, statusFilter]);

  const loadSummary = useCallback(async () => {
    const response = await fetch(
      `${API_BASE_URL}/invoices/summary`,
      {
        method: "GET",
        headers: authHeaders,
      }
    );

    const data = await safeJson(response);

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
          "Unable to load invoice summary."
      );
    }

    setSummary(data.summary || {});
  }, [authHeaders]);

  const loadCustomers = useCallback(async () => {
    const response = await fetch(
      `${API_BASE_URL}/customers`,
      {
        method: "GET",
        headers: authHeaders,
      }
    );

    const data = await safeJson(response);

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Unable to load customers."
      );
    }

    setCustomers(data.customers || []);
  }, [authHeaders]);

  const loadPageData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setError("Please login again.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await Promise.all([
        loadInvoices(),
        loadSummary(),
        loadCustomers(),
      ]);
    } catch (loadError) {
      console.error("Invoice page loading error:", loadError);
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [
    token,
    loadInvoices,
    loadSummary,
    loadCustomers,
  ]);

  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  const resetForm = () => {
    setCustomerId("");
    setIssueDate(
      new Date().toISOString().split("T")[0]
    );
    setDueDate("");
    setItems([createEmptyItem()]);
    setTaxRate(0);
    setDiscountType("none");
    setDiscountValue(0);
    setCurrency("GBP");
    setNotes("");
    setTerms("");
  };

  const updateItem = (index, field, value) => {
    setItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const addItem = () => {
    setItems((currentItems) => [
      ...currentItems,
      createEmptyItem(),
    ]);
  };

  const removeItem = (index) => {
    setItems((currentItems) => {
      if (currentItems.length === 1) {
        return currentItems;
      }

      return currentItems.filter(
        (_, itemIndex) => itemIndex !== index
      );
    });
  };

  const subtotal = useMemo(
    () =>
      items.reduce((total, item) => {
        const quantity = Number(item.quantity) || 0;
        const rate = Number(item.rate) || 0;

        return total + quantity * rate;
      }, 0),
    [items]
  );

  const taxAmount =
    subtotal * ((Number(taxRate) || 0) / 100);

  const discountAmount =
    discountType === "percentage"
      ? subtotal *
        ((Number(discountValue) || 0) / 100)
      : discountType === "fixed"
      ? Number(discountValue) || 0
      : 0;

  const grandTotal = Math.max(
    subtotal + taxAmount - discountAmount,
    0
  );

  const validateForm = () => {
    if (!customerId) {
      return "Please select a customer.";
    }

    if (!issueDate || !dueDate) {
      return "Issue date and due date are required.";
    }

    if (
      new Date(dueDate).setHours(0, 0, 0, 0) <
      new Date(issueDate).setHours(0, 0, 0, 0)
    ) {
      return "Due date cannot be before issue date.";
    }

    if (
      items.some(
        (item) =>
          !item.description.trim() ||
          Number(item.quantity) <= 0 ||
          Number(item.rate) < 0
      )
    ) {
      return "Every item needs a description, quantity above 0, and a valid rate.";
    }

    if (
      Number(taxRate) < 0 ||
      Number(taxRate) > 100
    ) {
      return "Tax rate must be between 0 and 100.";
    }

    if (Number(discountValue) < 0) {
      return "Discount cannot be negative.";
    }

    if (
      discountType === "percentage" &&
      Number(discountValue) > 100
    ) {
      return "Percentage discount cannot exceed 100.";
    }

    return "";
  };

  const handleCreateInvoice = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      setSuccess("");
      return;
    }

    if (!token) {
      setError("Please login again.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_BASE_URL}/invoices`,
        {
          method: "POST",
          headers: jsonHeaders,
          body: JSON.stringify({
            customer: customerId,
            issueDate,
            dueDate,
            items: items.map((item) => ({
              description: item.description.trim(),
              quantity: Number(item.quantity),
              rate: Number(item.rate),
            })),
            taxRate: Number(taxRate) || 0,
            discountType,
            discountValue:
              Number(discountValue) || 0,
            currency,
            notes: notes.trim(),
            terms: terms.trim(),
          }),
        }
      );

      const data = await safeJson(response);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to create invoice."
        );
      }

      setSuccess("Invoice created successfully.");
      setShowForm(false);
      resetForm();

      await Promise.all([
        loadInvoices(),
        loadSummary(),
      ]);
    } catch (createError) {
      console.error(
        "Create invoice frontend error:",
        createError
      );
      setError(createError.message);
    } finally {
      setSaving(false);
    }
  };

  const runInvoiceAction = async (
    invoiceId,
    path,
    method,
    body,
    successMessage
  ) => {
    if (!token) {
      setError("Please login again.");
      return;
    }

    try {
      setActionId(invoiceId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_BASE_URL}/invoices/${invoiceId}${path}`,
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
          data.message ||
            "Unable to update invoice."
        );
      }

      setSuccess(successMessage);

      await Promise.all([
        loadInvoices(),
        loadSummary(),
      ]);
    } catch (actionError) {
      console.error(
        "Invoice action frontend error:",
        actionError
      );
      setError(actionError.message);
    } finally {
      setActionId("");
    }
  };

  const handleMarkSent = (invoiceId) => {
    runInvoiceAction(
      invoiceId,
      "/send",
      "PUT",
      null,
      "Invoice marked as sent."
    );
  };

  const handleRecordPayment = (invoice) => {
    const input = window.prompt(
      `Enter total paid amount for ${invoice.invoiceNumber}:`,
      String(invoice.paidAmount || 0)
    );

    if (input === null) {
      return;
    }

    const paidAmount = Number(input);

    if (
      !Number.isFinite(paidAmount) ||
      paidAmount < 0 ||
      paidAmount > Number(invoice.totalAmount)
    ) {
      setError(
        "Paid amount must be between 0 and the invoice total."
      );
      return;
    }

    runInvoiceAction(
      invoice._id,
      "/payment",
      "PUT",
      {
        paidAmount,
        paymentMethod: "bank_transfer",
        paymentDate: new Date().toISOString(),
      },
      "Invoice payment updated successfully."
    );
  };

  const handleCancel = (invoiceId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this invoice?"
    );

    if (!confirmed) {
      return;
    }

    runInvoiceAction(
      invoiceId,
      "/cancel",
      "PUT",
      null,
      "Invoice cancelled successfully."
    );
  };

  const handleDelete = (invoiceId) => {
    const confirmed = window.confirm(
      "Delete this invoice permanently?"
    );

    if (!confirmed) {
      return;
    }

    runInvoiceAction(
      invoiceId,
      "",
      "DELETE",
      null,
      "Invoice deleted successfully."
    );
  };

  const downloadInvoicePDF = (invoice) => {
    try {
      setError("");
      setSuccess("");

      const document = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const customer = invoice.customer || {};
      const invoiceCurrency = invoice.currency || "GBP";

      document.setFontSize(20);
      document.text("Global Digital Solutions", 14, 18);

      document.setFontSize(15);
      document.text("INVOICE", 14, 28);

      document.setFontSize(10);
      document.text(
        `Invoice Number: ${invoice.invoiceNumber || "-"}`,
        14,
        38
      );
      document.text(
        `Issue Date: ${formatDate(invoice.issueDate)}`,
        14,
        44
      );
      document.text(
        `Due Date: ${formatDate(invoice.dueDate)}`,
        14,
        50
      );
      document.text(
        `Status: ${String(
          invoice.status || "draft"
        ).replaceAll("_", " ")}`,
        14,
        56
      );

      document.setFontSize(12);
      document.text("Bill To", 14, 68);

      document.setFontSize(10);
      document.text(
        getCustomerName(customer),
        14,
        75
      );

      if (customer.email) {
        document.text(customer.email, 14, 81);
      }

      if (customer.phone) {
        document.text(customer.phone, 14, 87);
      }

      const invoiceRows = (invoice.items || []).map(
        (item, index) => [
          index + 1,
          item.description || "-",
          Number(item.quantity) || 0,
          formatMoney(
            item.rate,
            invoiceCurrency
          ),
          formatMoney(
            item.amount ??
              (Number(item.quantity) || 0) *
                (Number(item.rate) || 0),
            invoiceCurrency
          ),
        ]
      );

      autoTable(document, {
        startY: 96,
        head: [
          [
            "No.",
            "Description",
            "Quantity",
            "Rate",
            "Amount",
          ],
        ],
        body:
          invoiceRows.length > 0
            ? invoiceRows
            : [["-", "No invoice items", "-", "-", "-"]],
        theme: "grid",
        headStyles: {
          fillColor: [15, 98, 254],
          textColor: [255, 255, 255],
        },
        styles: {
          fontSize: 9,
        },
        columnStyles: {
          0: { cellWidth: 14 },
          1: { cellWidth: 80 },
          2: { cellWidth: 22 },
          3: { cellWidth: 30 },
          4: { cellWidth: 32 },
        },
      });

      const tableEndY =
        document.lastAutoTable?.finalY || 130;

      const totalsStartY = tableEndY + 10;

      document.setFontSize(10);
      document.text(
        `Subtotal: ${formatMoney(
          invoice.subtotal,
          invoiceCurrency
        )}`,
        130,
        totalsStartY
      );
      document.text(
        `Tax: ${formatMoney(
          invoice.taxAmount,
          invoiceCurrency
        )}`,
        130,
        totalsStartY + 6
      );
      document.text(
        `Discount: ${formatMoney(
          invoice.discountAmount,
          invoiceCurrency
        )}`,
        130,
        totalsStartY + 12
      );

      document.setFontSize(12);
      document.text(
        `Total: ${formatMoney(
          invoice.totalAmount,
          invoiceCurrency
        )}`,
        130,
        totalsStartY + 20
      );

      document.setFontSize(10);
      document.text(
        `Paid: ${formatMoney(
          invoice.paidAmount,
          invoiceCurrency
        )}`,
        130,
        totalsStartY + 27
      );
      document.text(
        `Balance: ${formatMoney(
          invoice.balanceAmount,
          invoiceCurrency
        )}`,
        130,
        totalsStartY + 33
      );

      let notesY = totalsStartY + 48;

      if (invoice.notes) {
        document.setFontSize(11);
        document.text("Notes", 14, notesY);

        document.setFontSize(9);
        const noteLines = document.splitTextToSize(
          invoice.notes,
          175
        );

        document.text(noteLines, 14, notesY + 6);
        notesY += noteLines.length * 5 + 12;
      }

      if (invoice.terms) {
        document.setFontSize(11);
        document.text("Terms", 14, notesY);

        document.setFontSize(9);
        const termLines = document.splitTextToSize(
          invoice.terms,
          175
        );

        document.text(termLines, 14, notesY + 6);
      }

      document.save(
        `${invoice.invoiceNumber || "invoice"}.pdf`
      );

      setSuccess("Invoice PDF downloaded successfully.");
    } catch (pdfError) {
      console.error("Invoice PDF error:", pdfError);
      setError(
        pdfError.message ||
          "Unable to download invoice PDF."
      );
    }
  };

  const formatMoney = (amount, invoiceCurrency = "GBP") => {
    try {
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: invoiceCurrency || "GBP",
      }).format(Number(amount) || 0);
    } catch {
      return `${invoiceCurrency || "GBP"} ${Number(
        amount || 0
      ).toFixed(2)}`;
    }
  };

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

  const getCustomerName = (customer) =>
    customer?.name ||
    customer?.fullName ||
    customer?.companyName ||
    "Unknown customer";

  const statusStyles = {
    draft: {
      background: "#e2e8f0",
      color: "#334155",
    },
    sent: {
      background: "#dbeafe",
      color: "#1d4ed8",
    },
    partially_paid: {
      background: "#fef3c7",
      color: "#92400e",
    },
    paid: {
      background: "#dcfce7",
      color: "#166534",
    },
    overdue: {
      background: "#fee2e2",
      color: "#991b1b",
    },
    cancelled: {
      background: "#f3f4f6",
      color: "#6b7280",
    },
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
      boxShadow:
        "0 6px 18px rgba(33,45,72,0.05)",
    },

    cardLabel: {
      color: "#667085",
      fontSize: "13px",
      marginBottom: "8px",
    },

    cardValue: {
      color: "#1c2536",
      fontSize: "25px",
      fontWeight: "700",
    },

    formSection: {
      background: "#ffffff",
      padding: "24px",
      borderRadius: "14px",
      border: "1px solid #edf0f5",
      boxShadow:
        "0 8px 24px rgba(33,45,72,0.06)",
      marginBottom: "22px",
    },

    formGrid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(220px, 1fr))",
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

    itemCard: {
      display: "grid",
      gridTemplateColumns:
        "minmax(250px, 2fr) 110px 140px auto",
      gap: "10px",
      alignItems: "end",
      marginTop: "12px",
      padding: "14px",
      background: "#f8fafc",
      borderRadius: "10px",
      border: "1px solid #e5e7eb",
    },

    tableWrapper: {
      background: "#ffffff",
      borderRadius: "12px",
      overflowX: "auto",
      boxShadow:
        "0 6px 18px rgba(33,45,72,0.05)",
      border: "1px solid #edf0f5",
    },

    table: {
      width: "100%",
      minWidth: "1250px",
      borderCollapse: "collapse",
    },

    th: {
      padding: "14px",
      background: "#0f62fe",
      color: "#ffffff",
      textAlign: "left",
      fontSize: "14px",
    },

    td: {
      padding: "14px",
      borderBottom: "1px solid #edf0f5",
      color: "#4b5563",
      fontSize: "14px",
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

  const summaryCards = [
    {
      label: "Total Invoices",
      value: summary.totalInvoices || 0,
    },
    {
      label: "Total Amount",
      value: formatMoney(summary.totalAmount),
    },
    {
      label: "Total Paid",
      value: formatMoney(summary.totalPaid),
    },
    {
      label: "Outstanding",
      value: formatMoney(
        summary.totalOutstanding
      ),
    },
    {
      label: "Paid Invoices",
      value: summary.paidInvoices || 0,
    },
    {
      label: "Overdue Invoices",
      value: summary.overdueInvoices || 0,
    },
  ];

  if (loading) {
    return (
      <div style={styles.page}>
        <Sidebar />

        <main style={styles.content}>
          <div style={styles.empty}>
            Loading invoices...
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
              Invoices
            </h1>

            <p style={styles.subHeading}>
              Create and manage secure company invoices.
            </p>
          </div>

          <div style={styles.actionArea}>
            <button
              type="button"
              onClick={() => {
                setShowForm((current) => !current);
                setError("");
                setSuccess("");
              }}
              style={styles.primaryButton}
            >
              {showForm
                ? "Close Form"
                : "Create Invoice"}
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
          {summaryCards.map((card) => (
            <div key={card.label} style={styles.card}>
              <div style={styles.cardLabel}>
                {card.label}
              </div>

              <div style={styles.cardValue}>
                {card.value}
              </div>
            </div>
          ))}
        </div>

        {showForm && (
          <form
            onSubmit={handleCreateInvoice}
            style={styles.formSection}
            autoComplete="off"
          >
            <h2
              style={{
                marginTop: 0,
                color: "#1c2536",
              }}
            >
              Create New Invoice
            </h2>

            {customers.length === 0 ? (
              <div style={styles.empty}>
                No customers found.{" "}
                <Link to="/add-customer">
                  Add a customer first
                </Link>
                .
              </div>
            ) : (
              <>
                <div style={styles.formGrid}>
                  <div style={styles.field}>
                    <label style={styles.label}>
                      Customer
                    </label>

                    <select
                      value={customerId}
                      onChange={(event) =>
                        setCustomerId(
                          event.target.value
                        )
                      }
                      style={styles.input}
                      required
                    >
                      <option value="">
                        Select customer
                      </option>

                      {customers.map((customer) => (
                        <option
                          key={customer._id}
                          value={customer._id}
                        >
                          {getCustomerName(customer)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>
                      Issue Date
                    </label>

                    <input
                      type="date"
                      value={issueDate}
                      onChange={(event) =>
                        setIssueDate(
                          event.target.value
                        )
                      }
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>
                      Due Date
                    </label>

                    <input
                      type="date"
                      value={dueDate}
                      min={issueDate}
                      onChange={(event) =>
                        setDueDate(
                          event.target.value
                        )
                      }
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>
                      Currency
                    </label>

                    <select
                      value={currency}
                      onChange={(event) =>
                        setCurrency(
                          event.target.value
                        )
                      }
                      style={styles.input}
                    >
                      <option value="GBP">GBP</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="CAD">CAD</option>
                      <option value="AUD">AUD</option>
                      <option value="INR">INR</option>
                    </select>
                  </div>
                </div>

                <h3 style={{ color: "#1c2536" }}>
                  Invoice Items
                </h3>

                {items.map((item, index) => (
                  <div
                    key={`invoice-item-${index}`}
                    style={styles.itemCard}
                  >
                    <div style={styles.field}>
                      <label style={styles.label}>
                        Description
                      </label>

                      <input
                        type="text"
                        maxLength={500}
                        value={item.description}
                        onChange={(event) =>
                          updateItem(
                            index,
                            "description",
                            event.target.value
                          )
                        }
                        style={styles.input}
                        required
                      />
                    </div>

                    <div style={styles.field}>
                      <label style={styles.label}>
                        Quantity
                      </label>

                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(event) =>
                          updateItem(
                            index,
                            "quantity",
                            event.target.value
                          )
                        }
                        style={styles.input}
                        required
                      />
                    </div>

                    <div style={styles.field}>
                      <label style={styles.label}>
                        Rate
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(event) =>
                          updateItem(
                            index,
                            "rate",
                            event.target.value
                          )
                        }
                        style={styles.input}
                        required
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      style={{
                        ...styles.smallButton,
                        background: "#dc3545",
                        opacity:
                          items.length === 1
                            ? 0.5
                            : 1,
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addItem}
                  style={{
                    ...styles.smallButton,
                    background: "#334155",
                    marginTop: "12px",
                  }}
                >
                  Add Item
                </button>

                <div
                  style={{
                    ...styles.formGrid,
                    marginTop: "20px",
                  }}
                >
                  <div style={styles.field}>
                    <label style={styles.label}>
                      Tax Rate (%)
                    </label>

                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={taxRate}
                      onChange={(event) =>
                        setTaxRate(
                          event.target.value
                        )
                      }
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>
                      Discount Type
                    </label>

                    <select
                      value={discountType}
                      onChange={(event) =>
                        setDiscountType(
                          event.target.value
                        )
                      }
                      style={styles.input}
                    >
                      <option value="none">
                        None
                      </option>
                      <option value="fixed">
                        Fixed
                      </option>
                      <option value="percentage">
                        Percentage
                      </option>
                    </select>
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>
                      Discount Value
                    </label>

                    <input
                      type="number"
                      min="0"
                      max={
                        discountType ===
                        "percentage"
                          ? 100
                          : undefined
                      }
                      step="0.01"
                      value={discountValue}
                      disabled={
                        discountType === "none"
                      }
                      onChange={(event) =>
                        setDiscountValue(
                          event.target.value
                        )
                      }
                      style={styles.input}
                    />
                  </div>
                </div>

                <div
                  style={{
                    ...styles.formGrid,
                    marginTop: "16px",
                  }}
                >
                  <div style={styles.field}>
                    <label style={styles.label}>
                      Notes
                    </label>

                    <textarea
                      value={notes}
                      maxLength={2000}
                      onChange={(event) =>
                        setNotes(event.target.value)
                      }
                      style={{
                        ...styles.input,
                        minHeight: "90px",
                      }}
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>
                      Terms
                    </label>

                    <textarea
                      value={terms}
                      maxLength={2000}
                      onChange={(event) =>
                        setTerms(event.target.value)
                      }
                      style={{
                        ...styles.input,
                        minHeight: "90px",
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "20px",
                    background: "#eef4ff",
                    padding: "16px",
                    borderRadius: "10px",
                    color: "#1c2536",
                  }}
                >
                  <div>
                    Subtotal:{" "}
                    <strong>
                      {formatMoney(
                        subtotal,
                        currency
                      )}
                    </strong>
                  </div>
                  <div>
                    Tax:{" "}
                    <strong>
                      {formatMoney(
                        taxAmount,
                        currency
                      )}
                    </strong>
                  </div>
                  <div>
                    Discount:{" "}
                    <strong>
                      {formatMoney(
                        discountAmount,
                        currency
                      )}
                    </strong>
                  </div>
                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "19px",
                    }}
                  >
                    Total:{" "}
                    <strong>
                      {formatMoney(
                        grandTotal,
                        currency
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
                    : "Create Invoice"}
                </button>
              </>
            )}
          </form>
        )}

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "16px",
          }}
        >
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search invoice number"
            maxLength={100}
            style={{
              ...styles.input,
              width: "260px",
            }}
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            style={{
              ...styles.input,
              width: "220px",
            }}
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="partially_paid">
              Partially Paid
            </option>
            <option value="paid">Paid</option>
            <option value="overdue">
              Overdue
            </option>
            <option value="cancelled">
              Cancelled
            </option>
          </select>
        </div>

        {invoices.length === 0 ? (
          <div style={styles.empty}>
            No invoices found.
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>
                    Invoice
                  </th>
                  <th style={styles.th}>
                    Customer
                  </th>
                  <th style={styles.th}>
                    Issue Date
                  </th>
                  <th style={styles.th}>
                    Due Date
                  </th>
                  <th style={styles.th}>
                    Total
                  </th>
                  <th style={styles.th}>
                    Paid
                  </th>
                  <th style={styles.th}>
                    Balance
                  </th>
                  <th style={styles.th}>
                    Status
                  </th>
                  <th style={styles.th}>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {invoices.map((invoice) => {
                  const busy =
                    actionId === invoice._id;

                  return (
                    <tr key={invoice._id}>
                      <td style={styles.td}>
                        <strong>
                          {invoice.invoiceNumber}
                        </strong>
                      </td>

                      <td style={styles.td}>
                        {getCustomerName(
                          invoice.customer
                        )}
                      </td>

                      <td style={styles.td}>
                        {formatDate(
                          invoice.issueDate
                        )}
                      </td>

                      <td style={styles.td}>
                        {formatDate(
                          invoice.dueDate
                        )}
                      </td>

                      <td style={styles.td}>
                        {formatMoney(
                          invoice.totalAmount,
                          invoice.currency
                        )}
                      </td>

                      <td style={styles.td}>
                        {formatMoney(
                          invoice.paidAmount,
                          invoice.currency
                        )}
                      </td>

                      <td style={styles.td}>
                        {formatMoney(
                          invoice.balanceAmount,
                          invoice.currency
                        )}
                      </td>

                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.badge,
                            ...(statusStyles[
                              invoice.status
                            ] ||
                              statusStyles.draft),
                          }}
                        >
                          {String(
                            invoice.status ||
                              "draft"
                          ).replaceAll("_", " ")}
                        </span>
                      </td>

                      <td style={styles.td}>
                        <div
                          style={styles.buttonRow}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              downloadInvoicePDF(
                                invoice
                              )
                            }
                            disabled={busy}
                            style={{
                              ...styles.smallButton,
                              background: "#7c3aed",
                              opacity: busy
                                ? 0.6
                                : 1,
                            }}
                          >
                            PDF
                          </button>

                          {invoice.status ===
                            "draft" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleMarkSent(
                                  invoice._id
                                )
                              }
                              disabled={busy}
                              style={{
                                ...styles.smallButton,
                                background: "#0f62fe",
                                opacity: busy
                                  ? 0.6
                                  : 1,
                              }}
                            >
                              Send
                            </button>
                          )}

                          {![
                            "paid",
                            "cancelled",
                          ].includes(
                            invoice.status
                          ) && (
                            <button
                              type="button"
                              onClick={() =>
                                handleRecordPayment(
                                  invoice
                                )
                              }
                              disabled={busy}
                              style={{
                                ...styles.smallButton,
                                background: "#198754",
                                opacity: busy
                                  ? 0.6
                                  : 1,
                              }}
                            >
                              Payment
                            </button>
                          )}

                          {invoice.status !==
                            "cancelled" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleCancel(
                                  invoice._id
                                )
                              }
                              disabled={busy}
                              style={{
                                ...styles.smallButton,
                                background: "#f59e0b",
                                opacity: busy
                                  ? 0.6
                                  : 1,
                              }}
                            >
                              Cancel
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                invoice._id
                              )
                            }
                            disabled={busy}
                            style={{
                              ...styles.smallButton,
                              background: "#dc3545",
                              opacity: busy
                                ? 0.6
                                : 1,
                            }}
                          >
                            Delete
                          </button>
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

export default Invoices;