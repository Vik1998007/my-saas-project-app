const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    rate: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  {
    _id: true,
  }
);

const invoiceSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    invoiceNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    items: {
      type: [invoiceItemSchema],
      required: true,
      validate: {
        validator(items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: "At least one invoice item is required.",
      },
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    taxRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    taxAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    discountType: {
      type: String,
      enum: ["none", "fixed", "percentage"],
      default: "none",
    },

    discountValue: {
      type: Number,
      min: 0,
      default: 0,
    },

    discountAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    paidAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    balanceAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    currency: {
      type: String,
      trim: true,
      uppercase: true,
      default: "GBP",
    },

    status: {
      type: String,
      enum: [
        "draft",
        "sent",
        "partially_paid",
        "paid",
        "overdue",
        "cancelled",
      ],
      default: "draft",
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: [
        "not_selected",
        "cash",
        "bank_transfer",
        "card",
        "paypal",
        "stripe",
        "other",
      ],
      default: "not_selected",
    },

    paymentDate: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    terms: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    sentAt: {
      type: Date,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

invoiceSchema.index(
  {
    company: 1,
    invoiceNumber: 1,
  },
  {
    unique: true,
  }
);

invoiceSchema.index({
  company: 1,
  customer: 1,
  createdAt: -1,
});

invoiceSchema.pre("validate", function () {
  if (this.dueDate && this.issueDate) {
    const issueDate = new Date(this.issueDate);
    const dueDate = new Date(this.dueDate);

    issueDate.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate < issueDate) {
      throw new Error(
        "Due date cannot be before issue date."
      );
    }
  }

  this.items = this.items.map((item) => {
    const quantity = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;

    item.amount = Number(
      (quantity * rate).toFixed(2)
    );

    return item;
  });

  this.subtotal = Number(
    this.items
      .reduce(
        (total, item) => total + Number(item.amount || 0),
        0
      )
      .toFixed(2)
  );

  const taxRate = Number(this.taxRate) || 0;

  this.taxAmount = Number(
    ((this.subtotal * taxRate) / 100).toFixed(2)
  );

  const discountValue =
    Number(this.discountValue) || 0;

  if (this.discountType === "percentage") {
    this.discountAmount = Number(
      (
        (this.subtotal * discountValue) /
        100
      ).toFixed(2)
    );
  } else if (this.discountType === "fixed") {
    this.discountAmount = Number(
      discountValue.toFixed(2)
    );
  } else {
    this.discountAmount = 0;
  }

  const calculatedTotal =
    this.subtotal +
    this.taxAmount -
    this.discountAmount;

  this.totalAmount = Number(
    Math.max(calculatedTotal, 0).toFixed(2)
  );

  this.paidAmount = Number(
    Math.max(Number(this.paidAmount) || 0, 0).toFixed(2)
  );

  this.balanceAmount = Number(
    Math.max(
      this.totalAmount - this.paidAmount,
      0
    ).toFixed(2)
  );

  if (this.paidAmount >= this.totalAmount) {
    this.status = "paid";

    if (!this.paidAt) {
      this.paidAt = new Date();
    }
  } else if (this.paidAmount > 0) {
    this.status = "partially_paid";
  } else if (
    this.status !== "draft" &&
    this.status !== "cancelled" &&
    this.dueDate &&
    new Date(this.dueDate) < new Date()
  ) {
    this.status = "overdue";
  }
});

const Invoice = mongoose.model(
  "Invoice",
  invoiceSchema
);

module.exports = Invoice;