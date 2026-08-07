import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const API_BASE_URL = "http://localhost:5000/api";

const CURRENCY_OPTIONS = [
  { code: "GBP", label: "GBP (£)" },
  { code: "USD", label: "USD ($)" },
  { code: "EUR", label: "EUR (€)" },
  { code: "CAD", label: "CAD (C$)" },
  { code: "AUD", label: "AUD (A$)" },
  { code: "INR", label: "INR (₹)" },
];

const CURRENCY_MULTIPLIERS = {
  GBP: 1,
  USD: 1.29,
  EUR: 1.18,
  CAD: 1.76,
  AUD: 1.96,
  INR: 112,
};

function Subscription() {
  const [products, setProducts] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [category, setCategory] = useState("all");
  const [selectedCurrency, setSelectedCurrency] = useState("GBP");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [customerId, setCustomerId] = useState("");
  const [contractAccepted, setContractAccepted] = useState(false);
  const [contractName, setContractName] = useState("");
  const [contractEmail, setContractEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
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
      throw new Error("Unexpected server response. Check backend.");
    }
    return response.json();
  };

  const loadData = async () => {
    if (!token) {
      setLoading(false);
      setError("Please login again.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [catalogResponse, subscriptionsResponse, customersResponse] =
        await Promise.all([
          fetch(`${API_BASE_URL}/subscriptions/catalog`),
          fetch(`${API_BASE_URL}/subscriptions`, { headers: authHeaders }),
          fetch(`${API_BASE_URL}/customers`, { headers: authHeaders }),
        ]);

      const [catalogData, subscriptionsData, customersData] =
        await Promise.all([
          safeJson(catalogResponse),
          safeJson(subscriptionsResponse),
          safeJson(customersResponse),
        ]);

      if (!catalogResponse.ok || !catalogData.success) {
        throw new Error(catalogData.message || "Unable to load catalogue.");
      }
      if (!subscriptionsResponse.ok || !subscriptionsData.success) {
        throw new Error(
          subscriptionsData.message || "Unable to load subscriptions."
        );
      }
      if (!customersResponse.ok || !customersData.success) {
        throw new Error(customersData.message || "Unable to load customers.");
      }

      setProducts(catalogData.products || []);
      setSubscriptions(subscriptionsData.subscriptions || []);
      setCustomers(customersData.customers || []);
    } catch (loadError) {
      console.error(loadError);
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
  const params = new URLSearchParams(
    window.location.search
  );

  const paymentStatus =
    params.get("payment");

  if (paymentStatus === "success") {
    setSuccess(
      "Stripe payment completed successfully."
    );

    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );
  }

  if (paymentStatus === "cancelled") {
    setError(
      "Stripe payment was cancelled."
    );

    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );
  }
}, []);

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

  const getDisplayPrice = (amount) => {
    const baseAmount = Number(amount) || 0;
    const multiplier =
      CURRENCY_MULTIPLIERS[selectedCurrency] || 1;

    return Number((baseAmount * multiplier).toFixed(2));
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "-"
      : date.toLocaleDateString("en-GB");
  };

  const customerName = (customer) =>
    customer?.name ||
    customer?.fullName ||
    customer?.companyName ||
    "Unknown customer";

  const filteredProducts =
    category === "all"
      ? products
      : products.filter((product) => product.serviceCategory === category);

  const resetForm = () => {
    setSelectedProduct(null);
    setCustomerId("");
    setContractAccepted(false);
    setContractName("");
    setContractEmail("");
    setNotes("");
  };

  const createOrder = async (event) => {
    event.preventDefault();

    if (!selectedProduct) return;

    if (selectedProduct.productType !== "saas" && !customerId) {
      setError("Please select a customer.");
      return;
    }

    if (
      selectedProduct.minimumTermMonths > 0 &&
      (!contractAccepted || !contractName.trim() || !contractEmail.trim())
    ) {
      setError("Accept the contract and enter contract name and email.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(`${API_BASE_URL}/subscriptions`, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          productCode: selectedProduct.productCode,
          customer:
            selectedProduct.productType === "saas" ? null : customerId,
          contractAccepted,
          contractAcceptedByName: contractName.trim(),
          contractAcceptedByEmail: contractEmail.trim(),
          termsVersion: "1.0",
          notes: notes.trim(),
          currency: selectedCurrency,
        }),
      });

      const data = await safeJson(response);
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to create order.");
      }

      setSuccess(data.message || "Order created successfully.");
      resetForm();
      await loadData();
    } catch (createError) {
      setError(createError.message);
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (subscriptionId, path, body, message) => {
    try {
      setActionId(subscriptionId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_BASE_URL}/subscriptions/${subscriptionId}${path}`,
        {
          method: "PUT",
          headers: body ? jsonHeaders : authHeaders,
          ...(body ? { body: JSON.stringify(body) } : {}),
        }
      );

      const data = await safeJson(response);
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update record.");
      }

      setSuccess(message || data.message);
      await loadData();
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setActionId("");
    }
  };

  const handleStripePayment = async (subscriptionId) => {
    try {
      setActionId(subscriptionId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_BASE_URL}/stripe/create-checkout-session`,
        {
          method: "POST",
          headers: jsonHeaders,
          body: JSON.stringify({
            subscriptionId,
            currency: selectedCurrency,
          }),
        }
      );

      const data = await safeJson(response);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to open Stripe Checkout."
        );
      }

      if (!data.checkoutUrl) {
        throw new Error(
          "Stripe Checkout URL was not received."
        );
      }

      window.location.href = data.checkoutUrl;
    } catch (paymentError) {
      console.error("Stripe payment error:", paymentError);
      setError(paymentError.message);
      setActionId("");
    }
  };

  const handleCustomerPortal = async (subscriptionId) => {
  try {
    setActionId(subscriptionId);
    setError("");
    setSuccess("");

    const response = await fetch(
      `${API_BASE_URL}/stripe/create-customer-portal`,
      {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          subscriptionId,
        }),
      }
    );

    const data = await safeJson(response);

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
          "Unable to open billing portal."
      );
    }

    if (!data.portalUrl) {
      throw new Error(
        "Stripe Customer Portal URL was not received."
      );
    }

    window.location.href = data.portalUrl;
  } catch (portalError) {
    console.error(
      "Stripe Customer Portal error:",
      portalError
    );

    setError(portalError.message);
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
    content: { flex: 1, padding: "30px", minWidth: 0, overflowX: "auto" },
    topBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "15px",
      flexWrap: "wrap",
      marginBottom: "22px",
    },
    heading: { margin: 0, color: "#1c2536", fontSize: "30px" },
    subHeading: { margin: "7px 0 0", color: "#77808f" },
    back: {
      textDecoration: "none",
      background: "#334155",
      color: "#fff",
      padding: "11px 17px",
      borderRadius: "8px",
      fontWeight: "700",
    },
    message: { padding: "14px", borderRadius: "9px", marginBottom: "18px" },
    filters: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
      marginBottom: "22px",
    },
    currencyBox: {
      background: "#ffffff",
      border: "1px solid #e4e9f1",
      borderRadius: "12px",
      padding: "16px",
      marginBottom: "18px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      flexWrap: "wrap",
    },
    filterButton: {
      border: "1px solid #cfd8e6",
      padding: "10px 14px",
      borderRadius: "999px",
      cursor: "pointer",
      fontWeight: "700",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(285px, 1fr))",
      gap: "20px",
      marginBottom: "28px",
    },
    card: {
      background: "#fff",
      border: "1px solid #e4e9f1",
      borderRadius: "14px",
      padding: "22px",
      display: "flex",
      flexDirection: "column",
    },
    type: {
      color: "#0f62fe",
      fontSize: "12px",
      fontWeight: "700",
      textTransform: "uppercase",
    },
    price: { color: "#0f62fe", fontSize: "29px", fontWeight: "700" },
    featureList: { color: "#475467", lineHeight: "1.7", flex: 1 },
    button: {
      border: "none",
      borderRadius: "8px",
      padding: "12px 16px",
      background: "#0f62fe",
      color: "#fff",
      cursor: "pointer",
      fontWeight: "700",
    },
   form: {
      background: "#fff",
      border: "1px solid #e4e9f1",
      borderRadius: "14px",
      padding: "24px",
      marginBottom: "28px",
      maxWidth: "700px",
      marginLeft: "auto",
      marginRight: "auto",
      boxSizing: "border-box",
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "16px",
    },
    field: { display: "flex", flexDirection: "column", gap: "7px" },
    label: { color: "#344054", fontWeight: "700", fontSize: "14px" },
    input: {
      width: "100%",
      padding: "11px",
      border: "1px solid #cfd5df",
      borderRadius: "8px",
      boxSizing: "border-box",
    },
    tableWrapper: {
      background: "#fff",
      border: "1px solid #e4e9f1",
      borderRadius: "12px",
      overflowX: "auto",
    },
    table: { width: "100%", minWidth: "1250px", borderCollapse: "collapse" },
    th: {
      padding: "14px",
      background: "#0f62fe",
      color: "#fff",
      textAlign: "left",
    },
    td: { padding: "14px", borderBottom: "1px solid #edf0f5", color: "#4b5563" },
    badge: {
      display: "inline-block",
      padding: "5px 9px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "700",
      textTransform: "capitalize",
    },
    actions: { display: "flex", gap: "7px", flexWrap: "wrap" },
    smallButton: {
      border: "none",
      color: "#fff",
      padding: "8px 10px",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "700",
    },
    empty: {
      background: "#fff",
      padding: "28px",
      textAlign: "center",
      borderRadius: "12px",
      color: "#667085",
    },
  };

  const categories = [
    ["all", "All"],
    ["software", "SaaS Software"],
    ["web_development", "Web Development"],
    ["seo_services", "SEO Services"],
    ["digital_marketing", "Digital Marketing"],
    ["project_management", "Project Management"],
    ["application_development", "Application Development"],
  ];

  const statusStyles = {
    pending: { background: "#fef3c7", color: "#92400e" },
    trialing: { background: "#dbeafe", color: "#1d4ed8" },
    active: { background: "#dcfce7", color: "#166534" },
    completed: { background: "#dcfce7", color: "#166534" },
    past_due: { background: "#fee2e2", color: "#991b1b" },
    cancelled: { background: "#f3f4f6", color: "#6b7280" },
    expired: { background: "#fee2e2", color: "#991b1b" },
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <Sidebar />
        <main style={styles.content}>
          <div style={styles.empty}>Loading products and subscriptions...</div>
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
            <h1 style={styles.heading}>Products & Subscriptions</h1>
            <p style={styles.subHeading}>
              SaaS plans, recurring services and one-time projects.
            </p>
          </div>

          <Link to="/dashboard" style={styles.back}>
            Back to Dashboard
          </Link>
        </div>

        {error && (
          <div style={{ ...styles.message, background: "#fee2e2", color: "#991b1b" }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ ...styles.message, background: "#dcfce7", color: "#166534" }}>
            {success}
          </div>
        )}


        <div style={styles.currencyBox}>
          <label
            htmlFor="currency"
            style={{
              fontWeight: "700",
              color: "#344054",
            }}
          >
            Select Currency
          </label>

          <select
            id="currency"
            value={selectedCurrency}
            onChange={(event) =>
              setSelectedCurrency(event.target.value)
            }
            style={{
              ...styles.input,
              width: "180px",
            }}
          >
            {CURRENCY_OPTIONS.map((currency) => (
              <option
                key={currency.code}
                value={currency.code}
              >
                {currency.label}
              </option>
            ))}
          </select>

          <span
            style={{
              color: "#667085",
              fontSize: "13px",
            }}
          >
            Prices shown below use the selected currency.
          </span>
        </div>

        <div style={styles.filters}>
          {categories.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setCategory(value)}
              style={{
                ...styles.filterButton,
                background: category === value ? "#0f62fe" : "#fff",
                color: category === value ? "#fff" : "#344054",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={styles.grid}>
          {filteredProducts.map((product) => (
            <div key={product.productCode} style={styles.card}>
              <div style={styles.type}>{product.productType.replaceAll("_", " ")}</div>
              <h2>{product.productName}</h2>

              <div style={styles.price}>
                {formatMoney(getDisplayPrice(product.price), selectedCurrency)}
                <span style={{ fontSize: "14px", color: "#667085" }}>
                  {product.billingCycle === "monthly"
                    ? " / month"
                    : product.billingCycle === "yearly"
                    ? " / year"
                    : " one time"}
                </span>
              </div>

              {product.setupFee > 0 && (
                <p>Setup fee: {formatMoney(getDisplayPrice(product.setupFee), selectedCurrency)}</p>
              )}
              {product.trialDays > 0 && (
                <p style={{ color: "#166534", fontWeight: "700" }}>
                  {product.trialDays}-day free trial
                </p>
              )}
              {product.minimumTermMonths > 0 && (
                <p style={{ color: "#92400e" }}>
                  Minimum term: {product.minimumTermMonths} months
                </p>
              )}

              <p style={{ color: "#667085" }}>{product.description}</p>

              <ul style={styles.featureList}>
                {(product.features || []).map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <button
                type="button"
                style={styles.button}
                onClick={() => {
                  setSelectedProduct(product);
                  setError("");
                  setSuccess("");

                  setTimeout(() => {
                    window.scrollTo({
                      top: document.body.scrollHeight,
                      behavior: "smooth",
                    });
                  }, 100);
                }}
              >
                Select
              </button>
            </div>
          ))}
        </div>

        {selectedProduct && (
          <form onSubmit={createOrder} style={styles.form}>
            <h2 style={{ marginTop: 0 }}>Confirm: {selectedProduct.productName}</h2>

            <div style={styles.formGrid}>
              {selectedProduct.productType !== "saas" && (
                <div style={styles.field}>
                  <label style={styles.label}>Customer</label>
                  <select
                    value={customerId}
                    onChange={(event) => setCustomerId(event.target.value)}
                    style={styles.input}
                    required
                  >
                    <option value="">Select customer</option>
                    {customers.map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {customerName(customer)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedProduct.minimumTermMonths > 0 && (
                <>
                  <div style={styles.field}>
                    <label style={styles.label}>Contract Name</label>
                    <input
                      value={contractName}
                      onChange={(event) => setContractName(event.target.value)}
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Contract Email</label>
                    <input
                      type="email"
                      value={contractEmail}
                      onChange={(event) => setContractEmail(event.target.value)}
                      style={styles.input}
                      required
                    />
                  </div>
                </>
              )}
            </div>

            <div style={{ ...styles.field, marginTop: "16px" }}>
              <label style={styles.label}>Notes</label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                style={{ ...styles.input, minHeight: "90px" }}
              />
            </div>

            {selectedProduct.minimumTermMonths > 0 && (
              <label style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                <input
                  type="checkbox"
                  checked={contractAccepted}
                  onChange={(event) => setContractAccepted(event.target.checked)}
                />
                <span>
                  I accept the {selectedProduct.minimumTermMonths}-month minimum-term contract.
                </span>
              </label>
            )}

            <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
              <button type="submit" disabled={saving} style={styles.button}>
                {saving ? "Creating..." : "Create Order"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{ ...styles.button, background: "#64748b" }}
              >
                Close
              </button>
            </div>
          </form>
        )}

        <h2>Company Subscriptions & Services</h2>

        {subscriptions.length === 0 ? (
          <div style={styles.empty}>No records found.</div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Product</th>
                  <th style={styles.th}>Customer</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Price</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Started</th>
                  <th style={styles.th}>Next Billing</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {subscriptions.map((subscription) => {
                  const busy = actionId === subscription._id;

                  return (
                    <tr key={subscription._id}>
                      <td style={styles.td}>{subscription.productName}</td>
                      <td style={styles.td}>
                        {subscription.customer
                          ? customerName(subscription.customer)
                          : "Own company"}
                      </td>
                      <td style={styles.td}>
                        {String(subscription.productType || "-").replaceAll("_", " ")}
                      </td>
                      <td style={styles.td}>
                        {formatMoney(subscription.price, subscription.currency)}
                      </td>
                      <td style={styles.td}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                          }}
                        >
                          <span
                            style={{
                              ...styles.badge,
                              ...(statusStyles[subscription.status] || {
                                background: "#e2e8f0",
                                color: "#334155",
                              }),
                            }}
                          >
                            {String(
                              subscription.status || "pending"
                            ).replaceAll("_", " ")}
                          </span>

                          {subscription.cancelAtPeriodEnd && (
                            <span
                              style={{
                                color: "#b45309",
                                fontSize: "12px",
                                fontWeight: "700",
                              }}
                            >
                              Will cancel on{" "}
                              {formatDate(
                                subscription.currentPeriodEnd ||
                                  subscription.nextBillingDate
                              )}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={styles.td}>{formatDate(subscription.startDate)}</td>
                      <td style={styles.td}>{formatDate(subscription.nextBillingDate)}</td>
                      <td style={styles.td}>
                        <div style={styles.actions}>
                          {[
                            "pending",
                            "incomplete",
                            "past_due",
                            "unpaid",
                          ].includes(subscription.status) && (
                            <button
                              type="button"
                              disabled={busy}
                              style={{
                                ...styles.smallButton,
                                background: "#635bff",
                              }}
                              onClick={() =>
                                handleStripePayment(subscription._id)
                              }
                            >
                              {busy ? "Opening..." : "Pay with Stripe"}
                            </button>
                          )}

                          {["pending","incomplete"].includes(
                            subscription.status
                          ) && (
                            <button
                              type="button"
                              disabled={busy}
                              style={{ ...styles.smallButton, background: "#198754" }}
                              onClick={() => {
                                const amount = window.prompt(
                                  "Payment amount:",
                                  String(
                                    subscription.firstPaymentAmount ??
                                      subscription.price ??
                                      0
                                  )
                                );

                                if (amount !== null) {
                                  runAction(
                                    subscription._id,
                                    "/activate",
                                    {
                                      paymentProvider: "manual",
                                      paymentAmount: Number(amount),
                                    },
                                    "Activated successfully."
                                  );
                                }
                              }}
                            >
                              Activate
                            </button>
                          )}

                          {subscription.productType === "one_time_service" &&
                            !["completed", "cancelled"].includes(
                              subscription.status
                            ) && (
                              <button
                                type="button"
                                disabled={busy}
                                style={{ ...styles.smallButton, background: "#7c3aed" }}
                                onClick={() =>
                                  runAction(
                                    subscription._id,
                                    "/complete",
                                    null,
                                    "Service completed."
                                  )
                                }
                              >
                                Complete
                              </button>
                            )}
                            {subscription.stripeCustomerId &&
                                  ["trialing", "active", "past_due", "unpaid"].includes(
                                    subscription.status
                                  ) && (
                                    <button
                                      type="button"
                                      disabled={busy}
                                      style={{
                                        ...styles.smallButton,
                                        background: "#334155",
                                      }}
                                      onClick={() =>
                                        handleCustomerPortal(subscription._id)
                                      }
                                    >
                                      {busy ? "Opening..." : "Manage Billing"}
                                    </button>
                                )}

                          {!['completed', 'cancelled', 'expired'].includes(
                            subscription.status
                          ) && (
                            <button
                              type="button"
                              disabled={busy}
                              style={{ ...styles.smallButton, background: "#dc3545" }}
                              onClick={() => {
                                const reason = window.prompt(
                                  "Cancellation reason:",
                                  ""
                                );

                                if (reason !== null) {
                                  runAction(
                                    subscription._id,
                                    "/cancel",
                                    {
                                      cancellationReason: reason,
                                      cancelImmediately: false,
                                    },
                                    "Cancellation scheduled."
                                  );
                                }
                              }}
                            >
                              Cancel
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

export default Subscription;