const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | Company and ownership
    |--------------------------------------------------------------------------
    */

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Product category
    |--------------------------------------------------------------------------
    */

    productType: {
      type: String,
      enum: [
        "saas",
        "service_subscription",
        "one_time_service",
      ],
      required: true,
      index: true,
    },

    serviceCategory: {
      type: String,
      enum: [
        "software",
        "web_development",
        "seo_services",
        "digital_marketing",
        "project_management",
        "application_development",
      ],
      required: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Product and plan
    |--------------------------------------------------------------------------
    */

    productCode: {
      type: String,
      required: true,
      enum: [
        "saas_founder_annual",
        "saas_flexible_monthly",
        "saas_business_monthly",

        "seo_monthly",
        "digital_marketing_monthly",
        "project_management_monthly",
        "website_maintenance_monthly",
        "application_maintenance_monthly",

        "business_website_one_time",
        "ecommerce_website_one_time",
        "portfolio_website_one_time",
        "blog_website_one_time",
        "custom_website_one_time",
        "custom_application_one_time",
        "custom_project_setup_one_time",
      ],
      trim: true,
      index: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    planName: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | Billing
    |--------------------------------------------------------------------------
    */

    billingType: {
      type: String,
      enum: ["recurring", "one_time"],
      required: true,
      index: true,
    },

    billingCycle: {
      type: String,
      enum: [
        "monthly",
        "yearly",
        "one_time",
      ],
      required: true,
      index: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    setupFee: {
      type: Number,
      min: 0,
      default: 0,
    },

    firstPaymentAmount: {
      type: Number,
      min: 0,
      default: null,
    },

    currency: {
      type: String,
      enum: [
        "GBP",
        "USD",
        "EUR",
        "CAD",
        "AUD",
        "INR",
      ],
      default: "GBP",
      uppercase: true,
      trim: true,
    },

    vatRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | SaaS plan limits
    |--------------------------------------------------------------------------
    */

    employeeLimit: {
      type: Number,
      min: 0,
      default: 0,
    },

    userLimit: {
      type: Number,
      min: 0,
      default: 0,
    },

    storageLimitGB: {
      type: Number,
      min: 0,
      default: 0,
    },

    features: [
      {
        type: String,
        trim: true,
        maxlength: 300,
      },
    ],

    /*
    |--------------------------------------------------------------------------
    | Service details
    |--------------------------------------------------------------------------
    */

    deliverables: [
      {
        title: {
          type: String,
          trim: true,
          maxlength: 300,
        },

        description: {
          type: String,
          trim: true,
          maxlength: 1000,
          default: "",
        },

        status: {
          type: String,
          enum: [
            "pending",
            "in_progress",
            "completed",
            "cancelled",
          ],
          default: "pending",
        },

        dueDate: {
          type: Date,
          default: null,
        },

        completedAt: {
          type: Date,
          default: null,
        },
      },
    ],

    assignedEmployees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],

    assignedProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },

    serviceStartDate: {
      type: Date,
      default: null,
    },

    serviceEndDate: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | Trial
    |--------------------------------------------------------------------------
    */

    trialDays: {
      type: Number,
      min: 0,
      max: 90,
      default: 0,
    },

    trialStartAt: {
      type: Date,
      default: null,
    },

    trialEndsAt: {
      type: Date,
      default: null,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Contract
    |--------------------------------------------------------------------------
    */

    minimumTermMonths: {
      type: Number,
      min: 0,
      max: 60,
      default: 0,
    },

    contractStartDate: {
      type: Date,
      default: null,
    },

    contractEndDate: {
      type: Date,
      default: null,
      index: true,
    },

    contractAccepted: {
      type: Boolean,
      default: false,
    },

    contractAcceptedAt: {
      type: Date,
      default: null,
    },

    contractAcceptedByName: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    contractAcceptedByEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 254,
      default: "",
    },

    termsVersion: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | Subscription and service status
    |--------------------------------------------------------------------------
    */

    status: {
      type: String,
      enum: [
        "draft",
        "pending",
        "trialing",
        "active",
        "past_due",
        "unpaid",
        "paused",
        "completed",
        "cancelled",
        "expired",
        "incomplete",
        "incomplete_expired",
      ],
      default: "pending",
      index: true,
    },

    startDate: {
      type: Date,
      default: null,
    },

    endDate: {
      type: Date,
      default: null,
    },

    currentPeriodStart: {
      type: Date,
      default: null,
    },

    currentPeriodEnd: {
      type: Date,
      default: null,
      index: true,
    },

    autoRenew: {
      type: Boolean,
      default: false,
    },

    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    cancellationReason: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    completedAt: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | Stripe
    |--------------------------------------------------------------------------
    */

    paymentProvider: {
      type: String,
      enum: [
        "stripe",
        "manual",
        "bank_transfer",
        "none",
      ],
      default: "none",
    },

    stripeCustomerId: {
      type: String,
      trim: true,
      default: "",
      
    },

    stripeSubscriptionId: {
      type: String,
      trim: true,
      default: "",
    },

    stripePriceId: {
      type: String,
      trim: true,
      default: "",
    },

    stripeProductId: {
      type: String,
      trim: true,
      default: "",
    },

    stripeCheckoutSessionId: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },

    stripeLatestInvoiceId: {
      type: String,
      trim: true,
      default: "",
    },

    stripePaymentIntentId: {
      type: String,
      trim: true,
      default: "",
    },
    processedStripeEventIds: [
    {
      type: String,
      trim: true,
    },
    ],

    /*
    |--------------------------------------------------------------------------
    | Payment tracking
    |--------------------------------------------------------------------------
    */

    lastPaymentDate: {
      type: Date,
      default: null,
    },

    nextBillingDate: {
      type: Date,
      default: null,
      index: true,
    },

    lastPaymentAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    totalPaidAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    outstandingAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    failedPaymentCount: {
      type: Number,
      min: 0,
      default: 0,
    },

    gracePeriodEndsAt: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | Additional details
    |--------------------------------------------------------------------------
    */

    notes: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| Indexes
|--------------------------------------------------------------------------
*/

subscriptionSchema.index({
  company: 1,
  status: 1,
});

subscriptionSchema.index({
  company: 1,
  productType: 1,
  serviceCategory: 1,
});

subscriptionSchema.index({
  company: 1,
  customer: 1,
  createdAt: -1,
});

subscriptionSchema.index({
  company: 1,
  productCode: 1,
  createdAt: -1,
});

/*
|--------------------------------------------------------------------------
| Unique Stripe subscription index
|--------------------------------------------------------------------------
*/

subscriptionSchema.index(
  {
    stripeSubscriptionId: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      stripeSubscriptionId: {
        $type: "string",
        $ne: "",
      },
    },
  }
);

/*
|--------------------------------------------------------------------------
| Automatic validation
|--------------------------------------------------------------------------
*/

subscriptionSchema.pre(
  "validate",
  function () {
    if (this.billingType === "one_time") {
      this.billingCycle = "one_time";
      this.autoRenew = false;
      this.minimumTermMonths = 0;
      this.currentPeriodStart = null;
      this.currentPeriodEnd = null;
      this.nextBillingDate = null;
    }

    if (
      this.billingType === "recurring" &&
      this.billingCycle === "one_time"
    ) {
      this.invalidate(
        "billingCycle",
        "Recurring products cannot use one-time billing."
      );
    }

    if (
      this.productType === "saas" &&
      this.serviceCategory !== "software"
    ) {
      this.invalidate(
        "serviceCategory",
        "SaaS plans must use the software category."
      );
    }

    if (
      this.productType ===
        "one_time_service" &&
      this.billingType !== "one_time"
    ) {
      this.invalidate(
        "billingType",
        "One-time services must use one-time billing."
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| Automatically update dates and status
|--------------------------------------------------------------------------
*/

subscriptionSchema.pre(
  "save",
  function () {
    const now = new Date();

    if (
      this.trialDays > 0 &&
      this.trialStartAt &&
      !this.trialEndsAt
    ) {
      const trialEnd = new Date(
        this.trialStartAt
      );

      trialEnd.setDate(
        trialEnd.getDate() +
          this.trialDays
      );

      this.trialEndsAt = trialEnd;
    }

    if (
      this.minimumTermMonths > 0 &&
      this.contractStartDate &&
      !this.contractEndDate
    ) {
      const contractEnd = new Date(
        this.contractStartDate
      );

      contractEnd.setMonth(
        contractEnd.getMonth() +
          this.minimumTermMonths
      );

      this.contractEndDate =
        contractEnd;
    }

    if (
      this.status === "trialing" &&
      this.trialEndsAt &&
      this.trialEndsAt <= now
    ) {
      this.status = "expired";
    }

    if (
      this.status === "active" &&
      this.billingType === "recurring" &&
      this.currentPeriodEnd &&
      this.currentPeriodEnd <= now &&
      !this.autoRenew
    ) {
      this.status = "expired";
    }

    if (
      this.cancelAtPeriodEnd &&
      this.currentPeriodEnd &&
      this.currentPeriodEnd <= now
    ) {
      this.status = "cancelled";
      this.cancelledAt =
        this.cancelledAt || now;
      this.autoRenew = false;
    }

    if (
      this.productType ===
        "one_time_service" &&
      this.status === "completed" &&
      !this.completedAt
    ) {
      this.completedAt = now;
    }

    const totalCost =
      Number(this.price || 0) +
      Number(this.setupFee || 0);

    this.outstandingAmount = Number(
      Math.max(
        totalCost -
          Number(
            this.totalPaidAmount || 0
          ),
        0
      ).toFixed(2)
    );
  }
);

/*
|--------------------------------------------------------------------------
| Check access
|--------------------------------------------------------------------------
*/

subscriptionSchema.methods.hasAccess =
  function () {
    const now = new Date();

    if (
      this.status === "trialing" &&
      this.trialEndsAt &&
      this.trialEndsAt > now
    ) {
      return true;
    }

    if (
      this.status === "active" &&
      (!this.currentPeriodEnd ||
        this.currentPeriodEnd > now)
    ) {
      return true;
    }

    if (
      this.status === "past_due" &&
      this.gracePeriodEndsAt &&
      this.gracePeriodEndsAt > now
    ) {
      return true;
    }

    return false;
  };

/*
|--------------------------------------------------------------------------
| Check minimum contract term
|--------------------------------------------------------------------------
*/

subscriptionSchema.methods.isInsideMinimumTerm =
  function () {
    return Boolean(
      this.minimumTermMonths > 0 &&
        this.contractEndDate &&
        this.contractEndDate >
          new Date()
    );
  };

/*
|--------------------------------------------------------------------------
| Check recurring service
|--------------------------------------------------------------------------
*/

subscriptionSchema.methods.isRecurring =
  function () {
    return (
      this.billingType === "recurring"
    );
  };

/*
|--------------------------------------------------------------------------
| Check one-time service
|--------------------------------------------------------------------------
*/

subscriptionSchema.methods.isOneTimeService =
  function () {
    return (
      this.productType ===
        "one_time_service" &&
      this.billingType === "one_time"
    );
  };

const Subscription = mongoose.model(
  "Subscription",
  subscriptionSchema
);

module.exports = Subscription;