const express = require("express");
const mongoose = require("mongoose");

const Subscription = require(
  "../models/Subscription"
);
const User = require("../models/User");
const Customer = require("../models/Customer");

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const router = express.Router();
const SUPPORTED_CURRENCIES = [
  "GBP",
  "USD",
  "EUR",
  "CAD",
  "AUD",
  "INR",
];

const CURRENCY_MULTIPLIERS = {
  GBP: 1,
  USD: 1.29,
  EUR: 1.18,
  CAD: 1.76,
  AUD: 1.96,
  INR: 112,
};

function getCurrencyPrice(price, currency) {
  const multiplier =
    CURRENCY_MULTIPLIERS[currency] || 1;

  return Number(
    (Number(price) * multiplier).toFixed(2)
  );
}

/*
|--------------------------------------------------------------------------
| Product and service catalogue
|--------------------------------------------------------------------------
| बाद में इन prices को Stripe Price IDs के साथ connect करेंगे.
*/

const PRODUCT_CATALOG = {
  /*
  |--------------------------------------------------------------------------
  | SaaS Software Plans
  |--------------------------------------------------------------------------
  */

  saas_founder_annual: {
    productType: "saas",
    serviceCategory: "software",
    productName: "Founder Annual Plan",
    planName: "Founder Annual",
    description:
      "Discounted SaaS plan with a 12-month minimum contract.",
    billingType: "recurring",
    billingCycle: "monthly",
    price: 35,
    setupFee: 0,
    firstPaymentAmount: null,
    currency: "GBP",
    trialDays: 15,
    minimumTermMonths: 12,
    employeeLimit: 10,
    userLimit: 3,
    storageLimitGB: 5,
    features: [
      "Employee Management",
      "Attendance Management",
      "Leave Management",
      "Task Management",
      "Customer Management",
      "Project Management",
      "Invoices",
      "Payroll",
      "Reports",
      "Notifications",
      "Email Support",
    ],
  },

  saas_flexible_monthly: {
    productType: "saas",
    serviceCategory: "software",
    productName: "Flexible Monthly Plan",
    planName: "Flexible Monthly",
    description:
      "Monthly SaaS plan without a minimum contract.",
    billingType: "recurring",
    billingCycle: "monthly",
    price: 45,
    setupFee: 99,
    firstPaymentAmount: null,
    currency: "GBP",
    trialDays: 15,
    minimumTermMonths: 0,
    employeeLimit: 10,
    userLimit: 3,
    storageLimitGB: 5,
    features: [
      "Employee Management",
      "Attendance Management",
      "Leave Management",
      "Task Management",
      "Customer Management",
      "Project Management",
      "Invoices",
      "Payroll",
      "Reports",
      "Notifications",
      "Email Support",
      "Cancel with Notice",
    ],
  },

  saas_business_monthly: {
    productType: "saas",
    serviceCategory: "software",
    productName: "Business Monthly Plan",
    planName: "Business Monthly",
    description:
      "Advanced SaaS plan for growing companies.",
    billingType: "recurring",
    billingCycle: "monthly",
    price: 99,
    setupFee: 0,
    firstPaymentAmount: null,
    currency: "GBP",
    trialDays: 15,
    minimumTermMonths: 0,
    employeeLimit: 75,
    userLimit: 15,
    storageLimitGB: 25,
    features: [
      "Everything in Flexible Monthly",
      "Up to 75 Employees",
      "Up to 15 Users",
      "Priority Support",
      "Advanced Reports",
      "Company Branding",
      "Data Import Support",
    ],
  },

  /*
  |--------------------------------------------------------------------------
  | Monthly Service Subscriptions
  |--------------------------------------------------------------------------
  */

  seo_monthly: {
    productType: "service_subscription",
    serviceCategory: "seo_services",
    productName: "SEO Monthly Service",
    planName: "SEO Monthly",
    description:
      "Monthly search-engine optimisation service.",
    billingType: "recurring",
    billingCycle: "monthly",
    price: 149,
    setupFee: 0,
    firstPaymentAmount: null,
    currency: "GBP",
    trialDays: 0,
    minimumTermMonths: 3,
    employeeLimit: 0,
    userLimit: 0,
    storageLimitGB: 0,
    features: [
      "Keyword Research",
      "On-Page SEO",
      "Technical SEO Checks",
      "Monthly SEO Report",
      "Google Business Profile Support",
    ],
  },

  digital_marketing_monthly: {
    productType: "service_subscription",
    serviceCategory: "digital_marketing",
    productName: "Digital Marketing Monthly Service",
    planName: "Digital Marketing Monthly",
    description:
      "Monthly digital marketing management service.",
    billingType: "recurring",
    billingCycle: "monthly",
    price: 199,
    setupFee: 0,
    firstPaymentAmount: null,
    currency: "GBP",
    trialDays: 0,
    minimumTermMonths: 3,
    employeeLimit: 0,
    userLimit: 0,
    storageLimitGB: 0,
    features: [
      "Social Media Strategy",
      "Campaign Management",
      "Content Planning",
      "Monthly Performance Report",
      "Lead Generation Support",
    ],
  },

  project_management_monthly: {
    productType: "service_subscription",
    serviceCategory: "project_management",
    productName: "Project Management Monthly Service",
    planName: "Project Management Monthly",
    description:
      "Professional monthly project-management support.",
    billingType: "recurring",
    billingCycle: "monthly",
    price: 249,
    setupFee: 0,
    firstPaymentAmount: null,
    currency: "GBP",
    trialDays: 0,
    minimumTermMonths: 3,
    employeeLimit: 0,
    userLimit: 0,
    storageLimitGB: 0,
    features: [
      "Project Planning",
      "Project Scheduling",
      "Progress Monitoring",
      "Risk Management",
      "Monthly Project Report",
    ],
  },

  website_maintenance_monthly: {
    productType: "service_subscription",
    serviceCategory: "web_development",
    productName: "Website Maintenance Monthly",
    planName: "Website Maintenance",
    description:
      "Monthly website maintenance and support.",
    billingType: "recurring",
    billingCycle: "monthly",
    price: 49,
    setupFee: 0,
    firstPaymentAmount: null,
    currency: "GBP",
    trialDays: 0,
    minimumTermMonths: 0,
    employeeLimit: 0,
    userLimit: 0,
    storageLimitGB: 0,
    features: [
      "Website Updates",
      "Security Checks",
      "Backup Support",
      "Minor Content Changes",
      "Email Support",
    ],
  },

  application_maintenance_monthly: {
    productType: "service_subscription",
    serviceCategory: "application_development",
    productName: "Application Maintenance Monthly",
    planName: "Application Maintenance",
    description:
      "Monthly application maintenance and support.",
    billingType: "recurring",
    billingCycle: "monthly",
    price: 79,
    setupFee: 0,
    firstPaymentAmount: null,
    currency: "GBP",
    trialDays: 0,
    minimumTermMonths: 0,
    employeeLimit: 0,
    userLimit: 0,
    storageLimitGB: 0,
    features: [
      "Bug Fixes",
      "Application Monitoring",
      "Security Checks",
      "Minor Updates",
      "Technical Support",
    ],
  },

  /*
  |--------------------------------------------------------------------------
  | One-Time Services
  |--------------------------------------------------------------------------
  */

  business_website_one_time: {
    productType: "one_time_service",
    serviceCategory: "web_development",
    productName: "Business Website Development",
    planName: "Business Website",
    description:
      "Professional business website development.",
    billingType: "one_time",
    billingCycle: "one_time",
    price: 499,
    setupFee: 0,
    firstPaymentAmount: null,
    currency: "GBP",
    trialDays: 0,
    minimumTermMonths: 0,
    employeeLimit: 0,
    userLimit: 0,
    storageLimitGB: 0,
    features: [
      "Responsive Website",
      "Contact Form",
      "Basic SEO Setup",
      "SSL Support",
      "Admin Handover",
    ],
  },

  ecommerce_website_one_time: {
    productType: "one_time_service",
    serviceCategory: "web_development",
    productName: "E-commerce Website Development",
    planName: "E-commerce Website",
    description:
      "Complete e-commerce website development.",
    billingType: "one_time",
    billingCycle: "one_time",
    price: 999,
    setupFee: 0,
    firstPaymentAmount: null,
    currency: "GBP",
    trialDays: 0,
    minimumTermMonths: 0,
    employeeLimit: 0,
    userLimit: 0,
    storageLimitGB: 0,
    features: [
      "Product Catalogue",
      "Shopping Cart",
      "Customer Accounts",
      "Payment Integration",
      "Order Management",
    ],
  },

  portfolio_website_one_time: {
    productType: "one_time_service",
    serviceCategory: "web_development",
    productName: "Portfolio Website Development",
    planName: "Portfolio Website",
    description:
      "Professional personal or business portfolio website.",
    billingType: "one_time",
    billingCycle: "one_time",
    price: 399,
    setupFee: 0,
    firstPaymentAmount: null,
    currency: "GBP",
    trialDays: 0,
    minimumTermMonths: 0,
    employeeLimit: 0,
    userLimit: 0,
    storageLimitGB: 0,
    features: [
      "Responsive Design",
      "Portfolio Gallery",
      "About Section",
      "Contact Form",
      "Basic SEO Setup",
    ],
  },

  blog_website_one_time: {
    productType: "one_time_service",
    serviceCategory: "web_development",
    productName: "Blog Website Development",
    planName: "Blog Website",
    description:
      "Responsive blog website with content-management support.",
    billingType: "one_time",
    billingCycle: "one_time",
    price: 349,
    setupFee: 0,
    firstPaymentAmount: null,
    currency: "GBP",
    trialDays: 0,
    minimumTermMonths: 0,
    employeeLimit: 0,
    userLimit: 0,
    storageLimitGB: 0,
    features: [
      "Blog Management",
      "Categories",
      "Responsive Design",
      "Contact Form",
      "Basic SEO Setup",
    ],
  },

  custom_website_one_time: {
    productType: "one_time_service",
    serviceCategory: "web_development",
    productName: "Custom Website Development",
    planName: "Custom Website",
    description:
      "Custom website development based on client requirements.",
    billingType: "one_time",
    billingCycle: "one_time",
    price: 1499,
    setupFee: 0,
    firstPaymentAmount: null,
    currency: "GBP",
    trialDays: 0,
    minimumTermMonths: 0,
    employeeLimit: 0,
    userLimit: 0,
    storageLimitGB: 0,
    features: [
      "Custom Design",
      "Custom Features",
      "Responsive Development",
      "API Integration",
      "Deployment Support",
    ],
  },

  custom_application_one_time: {
    productType: "one_time_service",
    serviceCategory: "application_development",
    productName: "Custom Application Development",
    planName: "Custom Application",
    description:
      "Custom web or business application development.",
    billingType: "one_time",
    billingCycle: "one_time",
    price: 1999,
    setupFee: 0,
    firstPaymentAmount: null,
    currency: "GBP",
    trialDays: 0,
    minimumTermMonths: 0,
    employeeLimit: 0,
    userLimit: 0,
    storageLimitGB: 0,
    features: [
      "Custom Application",
      "Secure Authentication",
      "Database Integration",
      "Admin Dashboard",
      "Deployment Support",
    ],
  },

  custom_project_setup_one_time: {
    productType: "one_time_service",
    serviceCategory: "project_management",
    productName: "Custom Project Setup",
    planName: "Project Setup",
    description:
      "Professional project planning and initial setup.",
    billingType: "one_time",
    billingCycle: "one_time",
    price: 499,
    setupFee: 0,
    firstPaymentAmount: null,
    currency: "GBP",
    trialDays: 0,
    minimumTermMonths: 0,
    employeeLimit: 0,
    userLimit: 0,
    storageLimitGB: 0,
    features: [
      "Project Plan",
      "Milestone Setup",
      "Resource Planning",
      "Risk Assessment",
      "Project Schedule",
    ],
  },
};

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const allowedAdminRoles = [
  "superadmin",
  "owner",
  "admin",
];

const getCurrentUserCompany = async (req) => {
  const userId =
    req.user?.id ||
    req.user?.userId ||
    req.user?._id;

  if (
    !userId ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    return {
      user: null,
      companyId: null,
    };
  }

  const user = await User.findById(userId).select(
    "company role isActive fullName email"
  );

  if (
    !user ||
    user.isActive === false ||
    !user.company
  ) {
    return {
      user,
      companyId: null,
    };
  }

  return {
    user,
    companyId: user.company,
  };
};

const checkSubscriptionAccess = async (
  req,
  res
) => {
  const { user, companyId } =
    await getCurrentUserCompany(req);

  if (!user || !companyId) {
    res.status(401).json({
      success: false,
      message:
        "Your account is not connected to an active company.",
    });

    return null;
  }

  if (!allowedAdminRoles.includes(user.role)) {
    res.status(403).json({
      success: false,
      message:
        "You do not have permission to manage subscriptions.",
    });

    return null;
  }

  return {
    user,
    companyId,
  };
};

const addDays = (date, days) => {
  const result = new Date(date);

  result.setDate(
    result.getDate() + Number(days || 0)
  );

  return result;
};

const addMonths = (date, months) => {
  const result = new Date(date);

  result.setMonth(
    result.getMonth() + Number(months || 0)
  );

  return result;
};

const buildCatalogResponse = () => {
  return Object.entries(PRODUCT_CATALOG).map(
    ([productCode, product]) => ({
      productCode,
      ...product,

      supportedCurrencies:
        SUPPORTED_CURRENCIES,

      prices:
        SUPPORTED_CURRENCIES.reduce(
          (result, currency) => {
            result[currency] = {
              price: getCurrencyPrice(
                product.price,
                currency
              ),

              setupFee: getCurrencyPrice(
                product.setupFee || 0,
                currency
              ),

              firstPaymentAmount:
                product.firstPaymentAmount ===
                  null ||
                product.firstPaymentAmount ===
                  undefined
                  ? null
                  : getCurrencyPrice(
                      product.firstPaymentAmount,
                      currency
                    ),
            };

            return result;
          },
          {}
        ),
    })
  );
};

/*
|--------------------------------------------------------------------------
| Get all available products and services
|--------------------------------------------------------------------------
*/

router.get("/catalog", (req, res) => {
  try {
    const products = buildCatalogResponse();

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(
      "Get subscription catalogue error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load products and services.",
    });
  }
});

/*
|--------------------------------------------------------------------------
| Backward-compatible SaaS plans endpoint
|--------------------------------------------------------------------------
*/

router.get("/plans", (req, res) => {
  try {
    const plans = buildCatalogResponse().filter(
      (product) =>
        product.productType === "saas"
    );

    return res.status(200).json({
      success: true,
      plans,
    });
  } catch (error) {
    console.error(
      "Get subscription plans error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load subscription plans.",
    });
  }
});

/*
|--------------------------------------------------------------------------
| Get current company SaaS subscription
|--------------------------------------------------------------------------
*/

router.get(
  "/my-subscription",
  authMiddleware,
  async (req, res) => {
    try {
      const access =
        await checkSubscriptionAccess(req, res);

      if (!access) {
        return;
      }

      const { companyId } = access;

      const subscription =
        await Subscription.findOne({
          company: companyId,
          productType: "saas",
          status: {
            $in: [
              "pending",
              "trialing",
              "active",
              "past_due",
              "unpaid",
              "paused",
              "incomplete",
            ],
          },
        })
          .populate(
            "createdBy",
            "fullName email role"
          )
          .sort({
            createdAt: -1,
          });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message:
            "No current SaaS subscription found.",
        });
      }

      return res.status(200).json({
        success: true,
        subscription,
      });
    } catch (error) {
      console.error(
        "Get current subscription error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to load subscription.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Get company subscription and service history
|--------------------------------------------------------------------------
*/

router.get(
  "/history/all",
  authMiddleware,
  async (req, res) => {
    try {
      const access =
        await checkSubscriptionAccess(req, res);

      if (!access) {
        return;
      }

      const { companyId } = access;

      const subscriptions =
        await Subscription.find({
          company: companyId,
        })
          .populate(
            "customer",
            "name email service status"
          )
          .populate(
            "createdBy",
            "fullName email role"
          )
          .populate(
            "assignedEmployees",
            "fullName name email employeeId"
          )
          .populate(
            "assignedProject",
            "title name status"
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,
        count: subscriptions.length,
        subscriptions,
      });
    } catch (error) {
      console.error(
        "Get subscription history error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to load subscription history.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Get all company products and services
|--------------------------------------------------------------------------
*/

router.get("/", authMiddleware, async (req, res) => {
  try {
    const access =
      await checkSubscriptionAccess(req, res);

    if (!access) {
      return;
    }

    const { companyId } = access;

    const filter = {
      company: companyId,
    };

    if (
      req.query.productType &&
      [
        "saas",
        "service_subscription",
        "one_time_service",
      ].includes(req.query.productType)
    ) {
      filter.productType =
        req.query.productType;
    }

    if (req.query.serviceCategory) {
      filter.serviceCategory =
        req.query.serviceCategory;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (
      req.query.customer &&
      mongoose.Types.ObjectId.isValid(
        req.query.customer
      )
    ) {
      filter.customer = req.query.customer;
    }

    const subscriptions =
      await Subscription.find(filter)
        .populate(
          "customer",
          "name email service status"
        )
        .populate(
          "createdBy",
          "fullName email role"
        )
        .populate(
          "assignedEmployees",
          "fullName name email employeeId"
        )
        .populate(
          "assignedProject",
          "title name status"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: subscriptions.length,
      subscriptions,
    });
  } catch (error) {
    console.error(
      "Get company subscriptions error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to load subscriptions.",
    });
  }
});

/*
|--------------------------------------------------------------------------
| Create SaaS subscription or service order
|--------------------------------------------------------------------------
*/

router.post("/", authMiddleware, async (req, res) => {
  try {
    const access =
      await checkSubscriptionAccess(req, res);

    if (!access) {
      return;
    }

    const { user, companyId } = access;

    const {
      productCode,
      currency = "GBP",
      customer = null,
      contractAccepted = false,
      contractAcceptedByName = "",
      contractAcceptedByEmail = "",
      termsVersion = "1.0",
      notes = "",
      deliverables = [],
      assignedEmployees = [],
      assignedProject = null,
    } = req.body;

    const product =
      PRODUCT_CATALOG[productCode];

    if (!product) {
      return res.status(400).json({
        success: false,
        message:
          "Please select a valid product or service.",
      });
    }

    if (
      product.minimumTermMonths > 0 &&
      contractAccepted !== true
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You must accept the minimum-term contract.",
      });
    }

    let customerRecord = null;

    if (customer) {
      if (
        !mongoose.Types.ObjectId.isValid(customer)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid customer selected.",
        });
      }

      customerRecord = await Customer.findOne({
        _id: customer,
        company: companyId,
      });

      if (!customerRecord) {
        return res.status(404).json({
          success: false,
          message:
            "Customer not found in your company.",
        });
      }
    }

    if (
      product.productType !== "saas" &&
      !customerRecord
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A customer is required for service subscriptions and one-time services.",
      });
    }

    if (product.productType === "saas") {
      const currentSaaS =
        await Subscription.findOne({
          company: companyId,
          productType: "saas",
          status: {
            $in: [
              "pending",
              "trialing",
              "active",
              "past_due",
              "unpaid",
              "paused",
              "incomplete",
            ],
          },
        });

      if (currentSaaS) {
        return res.status(409).json({
          success: false,
          message:
            "Your company already has a current SaaS subscription.",
        });
      }
    }

    const now = new Date();

    const trialStartAt =
      product.trialDays > 0 ? now : null;

    const trialEndsAt =
      product.trialDays > 0
        ? addDays(now, product.trialDays)
        : null;

    const contractStartDate =
      product.minimumTermMonths > 0
        ? now
        : null;

    const contractEndDate =
      product.minimumTermMonths > 0
        ? addMonths(
            now,
            product.minimumTermMonths
          )
        : null;

    const initialStatus =
      product.trialDays > 0
        ? "trialing"
        : "pending";

    const subscription =
      await Subscription.create({
        company: companyId,
        createdBy: user._id,
        customer:
          product.productType === "saas"
            ? null
            : customerRecord._id,

        productType: product.productType,
        serviceCategory:
          product.serviceCategory,
        productCode,
        productName: product.productName,
        planName: product.planName,
        description: product.description,

        billingType: product.billingType,
        billingCycle: product.billingCycle,
        price: product.price,
        setupFee: product.setupFee,
        firstPaymentAmount:
          product.firstPaymentAmount,
        currency: product.currency,

        employeeLimit:
          product.employeeLimit,
        userLimit: product.userLimit,
        storageLimitGB:
          product.storageLimitGB,
        features: product.features,

        deliverables: Array.isArray(
          deliverables
        )
          ? deliverables
          : [],

        assignedEmployees: Array.isArray(
          assignedEmployees
        )
          ? assignedEmployees.filter((id) =>
              mongoose.Types.ObjectId.isValid(
                id
              )
            )
          : [],

        assignedProject:
          assignedProject &&
          mongoose.Types.ObjectId.isValid(
            assignedProject
          )
            ? assignedProject
            : null,

        serviceStartDate:
          product.productType === "saas"
            ? null
            : now,

        trialDays: product.trialDays,
        trialStartAt,
        trialEndsAt,

        minimumTermMonths:
          product.minimumTermMonths,
        contractStartDate,
        contractEndDate,
        contractAccepted,
        contractAcceptedAt:
          contractAccepted ? now : null,
        contractAcceptedByName: String(
          contractAcceptedByName || ""
        ).trim(),
        contractAcceptedByEmail: String(
          contractAcceptedByEmail || ""
        )
          .trim()
          .toLowerCase(),
        termsVersion,

        status: initialStatus,
        startDate: now,
        autoRenew:
          product.billingType ===
          "recurring",

        paymentProvider: "none",
        notes: String(notes || "").trim(),
      });

    await subscription.populate(
      "customer",
      "name email service status"
    );

    return res.status(201).json({
      success: true,
      message:
        product.productType === "saas"
          ? "SaaS subscription created successfully."
          : "Service order created successfully.",
      subscription,
    });
  } catch (error) {
    console.error(
      "Create subscription error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to create subscription or service.",
    });
  }
});

/*
|--------------------------------------------------------------------------
| Get one subscription or service order
|--------------------------------------------------------------------------
*/

router.get(
  "/:subscriptionId",
  authMiddleware,
  async (req, res) => {
    try {
      const access =
        await checkSubscriptionAccess(req, res);

      if (!access) {
        return;
      }

      const { companyId } = access;

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.subscriptionId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid subscription ID.",
        });
      }

      const subscription =
        await Subscription.findOne({
          _id: req.params.subscriptionId,
          company: companyId,
        })
          .populate(
            "customer",
            "name email service status"
          )
          .populate(
            "createdBy",
            "fullName email role"
          )
          .populate(
            "assignedEmployees",
            "fullName name email employeeId"
          )
          .populate(
            "assignedProject",
            "title name status"
          );

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message:
            "Subscription or service not found.",
        });
      }

      return res.status(200).json({
        success: true,
        subscription,
      });
    } catch (error) {
      console.error(
        "Get subscription error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to load subscription.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Activate manually
|--------------------------------------------------------------------------
| Stripe payment के बाद webhook यही fields automatically update करेगा.
*/

router.put(
  "/:subscriptionId/activate",
  authMiddleware,
  async (req, res) => {
    try {
      const access =
        await checkSubscriptionAccess(req, res);

      if (!access) {
        return;
      }

      const { companyId } = access;

      const subscription =
        await Subscription.findOne({
          _id: req.params.subscriptionId,
          company: companyId,
        });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message:
            "Subscription or service not found.",
        });
      }

      if (
        subscription.status === "cancelled"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Cancelled subscription cannot be activated.",
        });
      }

      const now = new Date();

      subscription.status = "active";
      subscription.startDate =
        subscription.startDate || now;
      subscription.lastPaymentDate = now;

      subscription.paymentProvider =
        req.body.paymentProvider ||
        "manual";

      subscription.lastPaymentAmount =
        Number(
          req.body.paymentAmount ??
            subscription.firstPaymentAmount ??
            subscription.price
        ) || 0;

      subscription.totalPaidAmount =
        Number(
          subscription.totalPaidAmount || 0
        ) +
        subscription.lastPaymentAmount;

      if (
        subscription.billingType ===
        "recurring"
      ) {
        const nextDate = new Date(now);

        if (
          subscription.billingCycle ===
          "yearly"
        ) {
          nextDate.setFullYear(
            nextDate.getFullYear() + 1
          );
        } else {
          nextDate.setMonth(
            nextDate.getMonth() + 1
          );
        }

        subscription.currentPeriodStart =
          now;
        subscription.currentPeriodEnd =
          nextDate;
        subscription.nextBillingDate =
          nextDate;
      }

      await subscription.save();

      return res.status(200).json({
        success: true,
        message:
          "Subscription or service activated successfully.",
        subscription,
      });
    } catch (error) {
      console.error(
        "Activate subscription error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to activate subscription.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Change SaaS plan
|--------------------------------------------------------------------------
*/

router.put(
  "/:subscriptionId/change-plan",
  authMiddleware,
  async (req, res) => {
    try {
      const access =
        await checkSubscriptionAccess(req, res);

      if (!access) {
        return;
      }

      const { companyId } = access;

      const { productCode } = req.body;

      const newProduct =
        PRODUCT_CATALOG[productCode];

      if (
        !newProduct ||
        newProduct.productType !== "saas"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please select a valid SaaS plan.",
        });
      }

      const subscription =
        await Subscription.findOne({
          _id: req.params.subscriptionId,
          company: companyId,
          productType: "saas",
        });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message:
            "SaaS subscription not found.",
        });
      }

      subscription.productCode =
        productCode;
      subscription.productName =
        newProduct.productName;
      subscription.planName =
        newProduct.planName;
      subscription.description =
        newProduct.description;

      subscription.billingType =
        newProduct.billingType;
      subscription.billingCycle =
        newProduct.billingCycle;
      subscription.price =
        newProduct.price;
      subscription.setupFee =
        newProduct.setupFee;
      subscription.firstPaymentAmount =
        newProduct.firstPaymentAmount;

      subscription.employeeLimit =
        newProduct.employeeLimit;
      subscription.userLimit =
        newProduct.userLimit;
      subscription.storageLimitGB =
        newProduct.storageLimitGB;
      subscription.features =
        newProduct.features;

      subscription.minimumTermMonths =
        newProduct.minimumTermMonths;

      if (
        newProduct.minimumTermMonths > 0
      ) {
        subscription.contractStartDate =
          new Date();

        subscription.contractEndDate =
          addMonths(
            new Date(),
            newProduct.minimumTermMonths
          );
      } else {
        subscription.contractStartDate =
          null;
        subscription.contractEndDate =
          null;
      }

      await subscription.save();

      return res.status(200).json({
        success: true,
        message:
          "SaaS plan changed successfully.",
        subscription,
      });
    } catch (error) {
      console.error(
        "Change plan error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to change SaaS plan.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Update auto-renew
|--------------------------------------------------------------------------
*/

router.put(
  "/:subscriptionId/auto-renew",
  authMiddleware,
  async (req, res) => {
    try {
      const access =
        await checkSubscriptionAccess(req, res);

      if (!access) {
        return;
      }

      const { companyId } = access;
      const { autoRenew } = req.body;

      if (typeof autoRenew !== "boolean") {
        return res.status(400).json({
          success: false,
          message:
            "autoRenew must be true or false.",
        });
      }

      const subscription =
        await Subscription.findOne({
          _id: req.params.subscriptionId,
          company: companyId,
          billingType: "recurring",
        });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message:
            "Recurring subscription not found.",
        });
      }

      subscription.autoRenew = autoRenew;
      subscription.cancelAtPeriodEnd =
        !autoRenew;

      await subscription.save();

      return res.status(200).json({
        success: true,
        message: autoRenew
          ? "Auto-renew enabled successfully."
          : "Auto-renew disabled. The service will end at the current period end.",
        subscription,
      });
    } catch (error) {
      console.error(
        "Update auto-renew error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to update auto-renew.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Cancel subscription or service
|--------------------------------------------------------------------------
*/

router.put(
  "/:subscriptionId/cancel",
  authMiddleware,
  async (req, res) => {
    try {
      const access =
        await checkSubscriptionAccess(req, res);

      if (!access) {
        return;
      }

      const { companyId } = access;

      const {
        cancellationReason = "",
        cancelImmediately = false,
      } = req.body;

      const subscription =
        await Subscription.findOne({
          _id: req.params.subscriptionId,
          company: companyId,
        });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message:
            "Subscription or service not found.",
        });
      }

      if (
        subscription.status === "cancelled"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Subscription is already cancelled.",
        });
      }

      if (
        subscription.isInsideMinimumTerm() &&
        cancelImmediately === true
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This subscription is inside its minimum contract term. Early termination must be reviewed before immediate cancellation.",
          contractEndDate:
            subscription.contractEndDate,
        });
      }

      subscription.cancellationReason =
        String(
          cancellationReason || ""
        ).trim();

      subscription.autoRenew = false;

      if (
        cancelImmediately ||
        subscription.billingType ===
          "one_time"
      ) {
        subscription.status = "cancelled";
        subscription.cancelledAt =
          new Date();
        subscription.cancelAtPeriodEnd =
          false;
        subscription.nextBillingDate =
          null;
      } else {
        subscription.cancelAtPeriodEnd =
          true;
      }

      await subscription.save();

      return res.status(200).json({
        success: true,
        message:
          subscription.cancelAtPeriodEnd
            ? "Cancellation scheduled for the end of the current billing period."
            : "Subscription or service cancelled successfully.",
        subscription,
      });
    } catch (error) {
      console.error(
        "Cancel subscription error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to cancel subscription.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Complete one-time service
|--------------------------------------------------------------------------
*/

router.put(
  "/:subscriptionId/complete",
  authMiddleware,
  async (req, res) => {
    try {
      const access =
        await checkSubscriptionAccess(req, res);

      if (!access) {
        return;
      }

      const { companyId } = access;

      const subscription =
        await Subscription.findOne({
          _id: req.params.subscriptionId,
          company: companyId,
          productType: "one_time_service",
        });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message:
            "One-time service not found.",
        });
      }

      if (
        subscription.status === "cancelled"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Cancelled service cannot be completed.",
        });
      }

      subscription.status = "completed";
      subscription.completedAt =
        new Date();
      subscription.serviceEndDate =
        new Date();

      await subscription.save();

      return res.status(200).json({
        success: true,
        message:
          "Service marked as completed.",
        subscription,
      });
    } catch (error) {
      console.error(
        "Complete service error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to complete service.",
      });
    }
  }
);

module.exports = router;