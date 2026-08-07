require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projectRoutes");
const customerRoutes = require("./routes/customerRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");
const employeeRoutes = require("./routes/employees");
const attendanceRoutes = require("./routes/attendanceRoutes");

const adminAttendanceRoutes = require(
  "./routes/adminAttendanceRoutes"
);

const leaveRoutes = require("./routes/leaveRoutes");
const taskRoutes = require("./routes/taskRoutes");
const companyRoutes = require("./routes/companyRoutes");

const companyMemberRoutes = require(
  "./routes/companyMemberRoutes"
);

const dashboardRoutes = require(
  "./routes/dashboardRoutes"
);

const subscriptionRoutes = require(
  "./routes/subscriptions"
);

const notificationRoutes = require(
  "./routes/notifications"
);

const invoiceRoutes = require(
  "./routes/invoiceRoutes"
);

const reportRoutes = require("./routes/reports");

const payrollRoutes = require(
  "./routes/payrollRoutes"
);

const stripeRoutes = require(
  "./routes/stripeRoutes"
);

const stripeWebhookRoutes = require(
  "./routes/stripeWebhookRoutes"
);

const app = express();

// Connect to MongoDB
connectDB();

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:3000",
  })
);

/*
|--------------------------------------------------------------------------
| Stripe Webhook
|--------------------------------------------------------------------------
| This route must be placed before express.json()
| because Stripe signature verification requires the raw request body.
*/

app.use(
  "/api/stripe/webhook",
  stripeWebhookRoutes
);

// JSON middleware for all other routes
app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

/*
|--------------------------------------------------------------------------
| Test Routes
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working!",
  });
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use("/api/auth", authRoutes);

app.use(
  "/api/projects",
  projectRoutes
);

app.use(
  "/api/customers",
  customerRoutes
);

app.use(
  "/api/reports",
  reportRoutes
);

app.use(
  "/api/enquiries",
  enquiryRoutes
);

app.use(
  "/api/employees",
  employeeRoutes
);

app.use(
  "/api/attendance",
  attendanceRoutes
);

app.use(
  "/api/admin-attendance",
  adminAttendanceRoutes
);

app.use(
  "/api/leaves",
  leaveRoutes
);

app.use(
  "/api/tasks",
  taskRoutes
);

app.use(
  "/api/companies",
  companyRoutes
);

app.use(
  "/api/company-members",
  companyMemberRoutes
);

app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use(
  "/api/subscriptions",
  subscriptionRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/invoices",
  invoiceRoutes
);

app.use(
  "/api/payroll",
  payrollRoutes
);

app.use(
  "/api/stripe",
  stripeRoutes
);

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `Server running on port ${PORT}`
    );

    console.log(
      `http://localhost:${PORT}`
    );
  }
);