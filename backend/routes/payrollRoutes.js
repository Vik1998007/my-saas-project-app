const express = require("express");
const mongoose = require("mongoose");

const Payroll = require("../models/Payroll");
const Employee = require("../models/Employee");
const User = require("../models/User");

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const allowedRoles = [
  "superadmin",
  "owner",
  "admin",
];

const allowedCurrencies = [
  "GBP",
  "USD",
  "EUR",
  "CAD",
  "AUD",
  "INR",
];

const allowedStatuses = [
  "draft",
  "pending",
  "paid",
  "cancelled",
];

const allowedPaymentMethods = [
  "not_selected",
  "bank_transfer",
  "cash",
  "cheque",
  "card",
  "other",
];

const toNumber = (value, defaultValue = 0) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : defaultValue;
};

const nonNegativeNumber = (
  value,
  defaultValue = 0
) => {
  return Math.max(
    toNumber(value, defaultValue),
    0
  );
};

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
    "company role isActive"
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

const checkPayrollAccess = async (req, res) => {
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

  if (!allowedRoles.includes(user.role)) {
    res.status(403).json({
      success: false,
      message:
        "You do not have permission to manage payroll.",
    });

    return null;
  }

  return {
    user,
    companyId,
  };
};

const buildPayrollData = (body) => {
  return {
    payrollMonth: toNumber(body.payrollMonth),
    payrollYear: toNumber(body.payrollYear),

    currency: String(
      body.currency || "GBP"
    ).toUpperCase(),

    basicSalary: nonNegativeNumber(
      body.basicSalary
    ),

    allowances: {
      housingAllowance: nonNegativeNumber(
        body.allowances?.housingAllowance
      ),

      travelAllowance: nonNegativeNumber(
        body.allowances?.travelAllowance
      ),

      mealAllowance: nonNegativeNumber(
        body.allowances?.mealAllowance
      ),

      medicalAllowance: nonNegativeNumber(
        body.allowances?.medicalAllowance
      ),

      otherAllowance: nonNegativeNumber(
        body.allowances?.otherAllowance
      ),
    },

    overtime: {
      hours: nonNegativeNumber(
        body.overtime?.hours
      ),

      hourlyRate: nonNegativeNumber(
        body.overtime?.hourlyRate
      ),
    },

    bonus: nonNegativeNumber(body.bonus),

    commission: nonNegativeNumber(
      body.commission
    ),

    deductions: {
      tax: nonNegativeNumber(
        body.deductions?.tax
      ),

      nationalInsurance: nonNegativeNumber(
        body.deductions?.nationalInsurance
      ),

      pension: nonNegativeNumber(
        body.deductions?.pension
      ),

      loanDeduction: nonNegativeNumber(
        body.deductions?.loanDeduction
      ),

      unpaidLeaveDeduction:
        nonNegativeNumber(
          body.deductions
            ?.unpaidLeaveDeduction
        ),

      absenceDeduction:
        nonNegativeNumber(
          body.deductions?.absenceDeduction
        ),

      lateDeduction: nonNegativeNumber(
        body.deductions?.lateDeduction
      ),

      otherDeduction: nonNegativeNumber(
        body.deductions?.otherDeduction
      ),
    },

    workingDays: nonNegativeNumber(
      body.workingDays
    ),

    presentDays: nonNegativeNumber(
      body.presentDays
    ),

    absentDays: nonNegativeNumber(
      body.absentDays
    ),

    paidLeaveDays: nonNegativeNumber(
      body.paidLeaveDays
    ),

    unpaidLeaveDays: nonNegativeNumber(
      body.unpaidLeaveDays
    ),

    paymentStatus:
      body.paymentStatus || "draft",

    paymentMethod:
      body.paymentMethod || "not_selected",

    paymentDate: body.paymentDate || null,

    transactionReference: String(
      body.transactionReference || ""
    ).trim(),

    notes: String(body.notes || "").trim(),
  };
};

/*
|--------------------------------------------------------------------------
| Create Payroll
|--------------------------------------------------------------------------
*/

router.post("/", authMiddleware, async (req, res) => {
  try {
    const access = await checkPayrollAccess(
      req,
      res
    );

    if (!access) {
      return;
    }

    const { user, companyId } = access;

    const { employee } = req.body;

    if (
      !employee ||
      !mongoose.Types.ObjectId.isValid(employee)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please select a valid employee.",
      });
    }

    const employeeRecord =
      await Employee.findOne({
        _id: employee,
        company: companyId,
      });

    if (!employeeRecord) {
      return res.status(404).json({
        success: false,
        message:
          "Employee not found in your company.",
      });
    }

    const payrollData = buildPayrollData(
      req.body
    );

    if (
      payrollData.payrollMonth < 1 ||
      payrollData.payrollMonth > 12
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payroll month must be between 1 and 12.",
      });
    }

    if (
      payrollData.payrollYear < 2000 ||
      payrollData.payrollYear > 2100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid payroll year.",
      });
    }

    if (
      !allowedCurrencies.includes(
        payrollData.currency
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid currency selected.",
      });
    }

    if (
      !allowedStatuses.includes(
        payrollData.paymentStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payroll status selected.",
      });
    }

    if (
      !allowedPaymentMethods.includes(
        payrollData.paymentMethod
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment method selected.",
      });
    }

    const existingPayroll =
      await Payroll.findOne({
        company: companyId,
        employee,
        payrollMonth:
          payrollData.payrollMonth,
        payrollYear:
          payrollData.payrollYear,
      });

    if (existingPayroll) {
      return res.status(409).json({
        success: false,
        message:
          "Payroll already exists for this employee and month.",
      });
    }

    const payroll = await Payroll.create({
      company: companyId,
      employee,
      createdBy: user._id,
      ...payrollData,
    });

    await payroll.populate(
      "employee",
      "fullName name email employeeId department designation"
    );

    return res.status(201).json({
      success: true,
      message:
        "Payroll created successfully.",
      payroll,
    });
  } catch (error) {
    console.error(
      "Create payroll error:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Payroll already exists for this employee and month.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to create payroll.",
    });
  }
});

/*
|--------------------------------------------------------------------------
| Payroll Summary
|--------------------------------------------------------------------------
*/

router.get(
  "/summary",
  authMiddleware,
  async (req, res) => {
    try {
      const access =
        await checkPayrollAccess(req, res);

      if (!access) {
        return;
      }

      const { companyId } = access;

      const filter = {
        company: companyId,
      };

      if (req.query.month) {
        filter.payrollMonth = toNumber(
          req.query.month
        );
      }

      if (req.query.year) {
        filter.payrollYear = toNumber(
          req.query.year
        );
      }

      const result = await Payroll.aggregate([
        {
          $match: filter,
        },
        {
          $group: {
            _id: null,

            totalPayrolls: {
              $sum: 1,
            },

            totalGrossSalary: {
              $sum: "$grossSalary",
            },

            totalDeductions: {
              $sum: "$totalDeductions",
            },

            totalNetSalary: {
              $sum: "$netSalary",
            },

            paidPayrolls: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$paymentStatus",
                      "paid",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            pendingPayrolls: {
              $sum: {
                $cond: [
                  {
                    $in: [
                      "$paymentStatus",
                      ["draft", "pending"],
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            cancelledPayrolls: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$paymentStatus",
                      "cancelled",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);

      const summary = result[0] || {
        totalPayrolls: 0,
        totalGrossSalary: 0,
        totalDeductions: 0,
        totalNetSalary: 0,
        paidPayrolls: 0,
        pendingPayrolls: 0,
        cancelledPayrolls: 0,
      };

      delete summary._id;

      return res.status(200).json({
        success: true,
        summary,
      });
    } catch (error) {
      console.error(
        "Payroll summary error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to load payroll summary.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Get All Payroll Records
|--------------------------------------------------------------------------
*/

router.get("/", authMiddleware, async (req, res) => {
  try {
    const access = await checkPayrollAccess(
      req,
      res
    );

    if (!access) {
      return;
    }

    const { companyId } = access;

    const filter = {
      company: companyId,
    };

    if (req.query.month) {
      filter.payrollMonth = toNumber(
        req.query.month
      );
    }

    if (req.query.year) {
      filter.payrollYear = toNumber(
        req.query.year
      );
    }

    if (
      req.query.status &&
      allowedStatuses.includes(
        req.query.status
      )
    ) {
      filter.paymentStatus =
        req.query.status;
    }

    if (
      req.query.employee &&
      mongoose.Types.ObjectId.isValid(
        req.query.employee
      )
    ) {
      filter.employee = req.query.employee;
    }

    const payrolls = await Payroll.find(
      filter
    )
      .populate(
        "employee",
        "fullName name email employeeId department designation"
      )
      .populate(
        "createdBy",
        "fullName name email"
      )
      .sort({
        payrollYear: -1,
        payrollMonth: -1,
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: payrolls.length,
      payrolls,
    });
  } catch (error) {
    console.error(
      "Get payrolls error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to load payroll records.",
    });
  }
});

/*
|--------------------------------------------------------------------------
| Get Single Payroll
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const access =
        await checkPayrollAccess(req, res);

      if (!access) {
        return;
      }

      const { companyId } = access;

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid payroll ID.",
        });
      }

      const payroll = await Payroll.findOne({
        _id: req.params.id,
        company: companyId,
      })
        .populate(
          "employee",
          "fullName name email employeeId department designation"
        )
        .populate(
          "createdBy",
          "fullName name email"
        );

      if (!payroll) {
        return res.status(404).json({
          success: false,
          message: "Payroll not found.",
        });
      }

      return res.status(200).json({
        success: true,
        payroll,
      });
    } catch (error) {
      console.error(
        "Get payroll error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to load payroll.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Update Payroll
|--------------------------------------------------------------------------
*/

router.put(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const access =
        await checkPayrollAccess(req, res);

      if (!access) {
        return;
      }

      const { companyId } = access;

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid payroll ID.",
        });
      }

      const payroll = await Payroll.findOne({
        _id: req.params.id,
        company: companyId,
      });

      if (!payroll) {
        return res.status(404).json({
          success: false,
          message: "Payroll not found.",
        });
      }

      if (
        ["paid", "cancelled"].includes(
          payroll.paymentStatus
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Paid or cancelled payroll cannot be edited.",
        });
      }

      const payrollData = buildPayrollData(
        req.body
      );

      if (
        payrollData.payrollMonth < 1 ||
        payrollData.payrollMonth > 12
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Payroll month must be between 1 and 12.",
        });
      }

      if (
        payrollData.payrollYear < 2000 ||
        payrollData.payrollYear > 2100
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a valid payroll year.",
        });
      }

      payroll.payrollMonth =
        payrollData.payrollMonth;

      payroll.payrollYear =
        payrollData.payrollYear;

      payroll.currency =
        payrollData.currency;

      payroll.basicSalary =
        payrollData.basicSalary;

      payroll.allowances =
        payrollData.allowances;

      payroll.overtime =
        payrollData.overtime;

      payroll.bonus = payrollData.bonus;

      payroll.commission =
        payrollData.commission;

      payroll.deductions =
        payrollData.deductions;

      payroll.workingDays =
        payrollData.workingDays;

      payroll.presentDays =
        payrollData.presentDays;

      payroll.absentDays =
        payrollData.absentDays;

      payroll.paidLeaveDays =
        payrollData.paidLeaveDays;

      payroll.unpaidLeaveDays =
        payrollData.unpaidLeaveDays;

      payroll.notes = payrollData.notes;

      await payroll.save();

      await payroll.populate(
        "employee",
        "fullName name email employeeId department designation"
      );

      return res.status(200).json({
        success: true,
        message:
          "Payroll updated successfully.",
        payroll,
      });
    } catch (error) {
      console.error(
        "Update payroll error:",
        error
      );

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message:
            "Payroll already exists for this employee and month.",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to update payroll.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Mark Payroll as Pending
|--------------------------------------------------------------------------
*/

router.put(
  "/:id/pending",
  authMiddleware,
  async (req, res) => {
    try {
      const access =
        await checkPayrollAccess(req, res);

      if (!access) {
        return;
      }

      const { companyId } = access;

      const payroll = await Payroll.findOne({
        _id: req.params.id,
        company: companyId,
      });

      if (!payroll) {
        return res.status(404).json({
          success: false,
          message: "Payroll not found.",
        });
      }

      if (payroll.paymentStatus === "paid") {
        return res.status(400).json({
          success: false,
          message:
            "Paid payroll cannot be changed to pending.",
        });
      }

      if (
        payroll.paymentStatus ===
        "cancelled"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Cancelled payroll cannot be changed.",
        });
      }

      payroll.paymentStatus = "pending";

      await payroll.save();

      return res.status(200).json({
        success: true,
        message:
          "Payroll marked as pending.",
        payroll,
      });
    } catch (error) {
      console.error(
        "Payroll pending error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to update payroll.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Mark Payroll as Paid
|--------------------------------------------------------------------------
*/

router.put(
  "/:id/pay",
  authMiddleware,
  async (req, res) => {
    try {
      const access =
        await checkPayrollAccess(req, res);

      if (!access) {
        return;
      }

      const { companyId } = access;

      const {
        paymentMethod = "bank_transfer",
        paymentDate = new Date(),
        transactionReference = "",
      } = req.body;

      if (
        !allowedPaymentMethods.includes(
          paymentMethod
        ) ||
        paymentMethod === "not_selected"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please select a valid payment method.",
        });
      }

      const payroll = await Payroll.findOne({
        _id: req.params.id,
        company: companyId,
      });

      if (!payroll) {
        return res.status(404).json({
          success: false,
          message: "Payroll not found.",
        });
      }

      if (
        payroll.paymentStatus ===
        "cancelled"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Cancelled payroll cannot be paid.",
        });
      }

      payroll.paymentStatus = "paid";
      payroll.paymentMethod = paymentMethod;
      payroll.paymentDate = paymentDate;
      payroll.transactionReference =
        String(
          transactionReference || ""
        ).trim();

      await payroll.save();

      return res.status(200).json({
        success: true,
        message:
          "Payroll marked as paid successfully.",
        payroll,
      });
    } catch (error) {
      console.error(
        "Payroll payment error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to mark payroll as paid.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Cancel Payroll
|--------------------------------------------------------------------------
*/

router.put(
  "/:id/cancel",
  authMiddleware,
  async (req, res) => {
    try {
      const access =
        await checkPayrollAccess(req, res);

      if (!access) {
        return;
      }

      const { companyId } = access;

      const payroll = await Payroll.findOne({
        _id: req.params.id,
        company: companyId,
      });

      if (!payroll) {
        return res.status(404).json({
          success: false,
          message: "Payroll not found.",
        });
      }

      if (payroll.paymentStatus === "paid") {
        return res.status(400).json({
          success: false,
          message:
            "Paid payroll cannot be cancelled.",
        });
      }

      payroll.paymentStatus = "cancelled";

      await payroll.save();

      return res.status(200).json({
        success: true,
        message:
          "Payroll cancelled successfully.",
        payroll,
      });
    } catch (error) {
      console.error(
        "Cancel payroll error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to cancel payroll.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Delete Payroll
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const access =
        await checkPayrollAccess(req, res);

      if (!access) {
        return;
      }

      const { companyId } = access;

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid payroll ID.",
        });
      }

      const payroll = await Payroll.findOne({
        _id: req.params.id,
        company: companyId,
      });

      if (!payroll) {
        return res.status(404).json({
          success: false,
          message: "Payroll not found.",
        });
      }

      if (payroll.paymentStatus === "paid") {
        return res.status(400).json({
          success: false,
          message:
            "Paid payroll cannot be deleted.",
        });
      }

      await payroll.deleteOne();

      return res.status(200).json({
        success: true,
        message:
          "Payroll deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete payroll error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to delete payroll.",
      });
    }
  }
);

module.exports = router;