const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    payrollMonth: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
      index: true,
    },

    payrollYear: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100,
      index: true,
    },

    currency: {
      type: String,
      enum: ["GBP", "USD", "EUR", "CAD", "AUD", "INR"],
      default: "GBP",
      uppercase: true,
      trim: true,
    },

    basicSalary: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    allowances: {
      housingAllowance: {
        type: Number,
        min: 0,
        default: 0,
      },

      travelAllowance: {
        type: Number,
        min: 0,
        default: 0,
      },

      mealAllowance: {
        type: Number,
        min: 0,
        default: 0,
      },

      medicalAllowance: {
        type: Number,
        min: 0,
        default: 0,
      },

      otherAllowance: {
        type: Number,
        min: 0,
        default: 0,
      },
    },

    overtime: {
      hours: {
        type: Number,
        min: 0,
        default: 0,
      },

      hourlyRate: {
        type: Number,
        min: 0,
        default: 0,
      },

      amount: {
        type: Number,
        min: 0,
        default: 0,
      },
    },

    bonus: {
      type: Number,
      min: 0,
      default: 0,
    },

    commission: {
      type: Number,
      min: 0,
      default: 0,
    },

    deductions: {
      tax: {
        type: Number,
        min: 0,
        default: 0,
      },

      nationalInsurance: {
        type: Number,
        min: 0,
        default: 0,
      },

      pension: {
        type: Number,
        min: 0,
        default: 0,
      },

      loanDeduction: {
        type: Number,
        min: 0,
        default: 0,
      },

      unpaidLeaveDeduction: {
        type: Number,
        min: 0,
        default: 0,
      },

      absenceDeduction: {
        type: Number,
        min: 0,
        default: 0,
      },

      lateDeduction: {
        type: Number,
        min: 0,
        default: 0,
      },

      otherDeduction: {
        type: Number,
        min: 0,
        default: 0,
      },
    },

    workingDays: {
      type: Number,
      min: 0,
      default: 0,
    },

    presentDays: {
      type: Number,
      min: 0,
      default: 0,
    },

    absentDays: {
      type: Number,
      min: 0,
      default: 0,
    },

    paidLeaveDays: {
      type: Number,
      min: 0,
      default: 0,
    },

    unpaidLeaveDays: {
      type: Number,
      min: 0,
      default: 0,
    },

    grossSalary: {
      type: Number,
      min: 0,
      default: 0,
    },

    totalDeductions: {
      type: Number,
      min: 0,
      default: 0,
    },

    netSalary: {
      type: Number,
      min: 0,
      default: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["draft", "pending", "paid", "cancelled"],
      default: "draft",
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: [
        "not_selected",
        "bank_transfer",
        "cash",
        "cheque",
        "card",
        "other",
      ],
      default: "not_selected",
    },

    paymentDate: {
      type: Date,
      default: null,
    },

    transactionReference: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| Prevent duplicate payroll
|--------------------------------------------------------------------------
| एक employee का एक month और year में केवल एक payroll record बनेगा.
*/

payrollSchema.index(
  {
    company: 1,
    employee: 1,
    payrollMonth: 1,
    payrollYear: 1,
  },
  {
    unique: true,
  }
);

/*
|--------------------------------------------------------------------------
| Payroll calculation
|--------------------------------------------------------------------------
*/

payrollSchema.pre("save", function () {
  const allowances =
    Number(this.allowances?.housingAllowance || 0) +
    Number(this.allowances?.travelAllowance || 0) +
    Number(this.allowances?.mealAllowance || 0) +
    Number(this.allowances?.medicalAllowance || 0) +
    Number(this.allowances?.otherAllowance || 0);

  const overtimeHours = Number(
    this.overtime?.hours || 0
  );

  const overtimeRate = Number(
    this.overtime?.hourlyRate || 0
  );

  const overtimeAmount =
    overtimeHours * overtimeRate;

  this.overtime.amount = Number(
    overtimeAmount.toFixed(2)
  );

  const earnings =
    Number(this.basicSalary || 0) +
    allowances +
    overtimeAmount +
    Number(this.bonus || 0) +
    Number(this.commission || 0);

  const deductions =
    Number(this.deductions?.tax || 0) +
    Number(
      this.deductions?.nationalInsurance || 0
    ) +
    Number(this.deductions?.pension || 0) +
    Number(this.deductions?.loanDeduction || 0) +
    Number(
      this.deductions?.unpaidLeaveDeduction || 0
    ) +
    Number(
      this.deductions?.absenceDeduction || 0
    ) +
    Number(this.deductions?.lateDeduction || 0) +
    Number(
      this.deductions?.otherDeduction || 0
    );

  this.grossSalary = Number(
    earnings.toFixed(2)
  );

  this.totalDeductions = Number(
    deductions.toFixed(2)
  );

  this.netSalary = Number(
    Math.max(earnings - deductions, 0).toFixed(2)
  );

});

const Payroll = mongoose.model(
  "Payroll",
  payrollSchema
);

module.exports = Payroll;