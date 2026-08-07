const express = require("express");

const Leave = require("../models/Leave");
const User = require("../models/User");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Helper - Get Current User Company
|--------------------------------------------------------------------------
*/

const getCurrentUserCompany = async (req) => {
  const userId =
    req.user?.id ||
    req.user?.userId ||
    req.user?._id;

  if (!userId) {
    return {
      user: null,
      companyId: null,
    };
  }

  const user = await User.findById(userId).select(
    "company isActive role"
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

/*
|--------------------------------------------------------------------------
| Employee - Apply Leave
|--------------------------------------------------------------------------
*/

router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      leaveType,
      startDate,
      endDate,
      reason,
      attachment = "",
    } = req.body;

    if (
      !leaveType ||
      !startDate ||
      !endDate ||
      !reason
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Leave type, start date, end date and reason are required.",
      });
    }

    const { user, companyId } =
      await getCurrentUserCompany(req);

    if (!user || !companyId) {
      return res.status(400).json({
        success: false,
        message:
          "Your account is not connected to an active company.",
      });
    }

    const leave = await Leave.create({
      company: companyId,
      employee: user._id,
      leaveType,
      startDate,
      endDate,
      reason: reason.trim(),
      attachment: attachment || "",
    });

    return res.status(201).json({
      success: true,
      message: "Leave request submitted successfully.",
      leave,
    });
  } catch (error) {
    console.error("Apply leave error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to submit leave request.",
    });
  }
});

/*
|--------------------------------------------------------------------------
| Employee - My Leave History
|--------------------------------------------------------------------------
*/

router.get("/my", authMiddleware, async (req, res) => {
  try {
    const { user, companyId } =
      await getCurrentUserCompany(req);

    if (!user || !companyId) {
      return res.status(400).json({
        success: false,
        message:
          "Your account is not connected to an active company.",
      });
    }

    const leaves = await Leave.find({
      company: companyId,
      employee: user._id,
    })
      .populate(
        "reviewedBy",
        "fullName email role"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: leaves.length,
      leaves,
    });
  } catch (error) {
    console.error("My leave history error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to load leave history.",
    });
  }
});

/*
|--------------------------------------------------------------------------
| Admin - Get All Leave Requests
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { companyId } =
        await getCurrentUserCompany(req);

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message:
            "Your account is not connected to an active company.",
        });
      }

      const leaves = await Leave.find({
        company: companyId,
      })
        .populate(
          "employee",
          "fullName email role isActive"
        )
        .populate(
          "reviewedBy",
          "fullName email role"
        )
        .sort({
          createdAt: -1,
        });

      return res.status(200).json({
        success: true,
        total: leaves.length,
        leaves,
      });
    } catch (error) {
      console.error("Get all leaves error:", error);

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to load leave requests.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Admin - Approve Leave
|--------------------------------------------------------------------------
*/

router.put(
  "/approve/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { user, companyId } =
        await getCurrentUserCompany(req);

      if (!user || !companyId) {
        return res.status(400).json({
          success: false,
          message:
            "Your account is not connected to an active company.",
        });
      }

      const leave = await Leave.findOne({
        _id: req.params.id,
        company: companyId,
      });

      if (!leave) {
        return res.status(404).json({
          success: false,
          message: "Leave request not found.",
        });
      }

      if (leave.status === "approved") {
        return res.status(400).json({
          success: false,
          message:
            "Leave request is already approved.",
        });
      }

      leave.status = "approved";
      leave.reviewedBy = user._id;
      leave.reviewedAt = new Date();
      leave.adminComment =
        req.body.adminComment?.trim() || "";

      await leave.save();

      return res.status(200).json({
        success: true,
        message: "Leave approved successfully.",
        leave,
      });
    } catch (error) {
      console.error("Approve leave error:", error);

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to approve leave request.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Admin - Reject Leave
|--------------------------------------------------------------------------
*/

router.put(
  "/reject/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { user, companyId } =
        await getCurrentUserCompany(req);

      if (!user || !companyId) {
        return res.status(400).json({
          success: false,
          message:
            "Your account is not connected to an active company.",
        });
      }

      const leave = await Leave.findOne({
        _id: req.params.id,
        company: companyId,
      });

      if (!leave) {
        return res.status(404).json({
          success: false,
          message: "Leave request not found.",
        });
      }

      if (leave.status === "rejected") {
        return res.status(400).json({
          success: false,
          message:
            "Leave request is already rejected.",
        });
      }

      leave.status = "rejected";
      leave.reviewedBy = user._id;
      leave.reviewedAt = new Date();
      leave.adminComment =
        req.body.adminComment?.trim() || "";

      await leave.save();

      return res.status(200).json({
        success: true,
        message: "Leave rejected successfully.",
        leave,
      });
    } catch (error) {
      console.error("Reject leave error:", error);

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to reject leave request.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Admin - Delete Leave
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { companyId } =
        await getCurrentUserCompany(req);

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message:
            "Your account is not connected to an active company.",
        });
      }

      const leave = await Leave.findOne({
        _id: req.params.id,
        company: companyId,
      });

      if (!leave) {
        return res.status(404).json({
          success: false,
          message: "Leave request not found.",
        });
      }

      await leave.deleteOne();

      return res.status(200).json({
        success: true,
        message: "Leave deleted successfully.",
      });
    } catch (error) {
      console.error("Delete leave error:", error);

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to delete leave request.",
      });
    }
  }
);

module.exports = router;