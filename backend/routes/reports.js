console.log("NEW REPORTS ROUTES FILE LOADED");
const express = require("express");

const User = require("../models/User");
const CompanyMember = require("../models/CompanyMember");
const Employee = require("../models/Employee");
const Customer = require("../models/Customer");
const Project = require("../models/Project");
const Task = require("../models/Task");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const getCurrentCompanyId = async (req) => {
  const userId =
    req.user?.id ||
    req.user?.userId ||
    req.user?._id;

  if (!userId) {
    return null;
  }

  const user = await User.findById(userId).select(
    "company isActive"
  );

  if (!user || user.isActive === false) {
    return null;
  }

  return user.company || null;
};

/*
|--------------------------------------------------------------------------
| Reports API Test
|--------------------------------------------------------------------------
*/

router.get("/", authMiddleware, async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Reports API is working.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to load reports.",
    });
  }
});

/*
|--------------------------------------------------------------------------
| Company Report Summary
|--------------------------------------------------------------------------
*/

router.get("/summary", authMiddleware, async (req, res) => {
  try {
    const companyId = await getCurrentCompanyId(req);

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message:
          "Your account is not connected to an active company.",
      });
    }

    const [
      totalMembers,
      totalEmployees,
      totalCustomers,
      totalProjects,
      totalTasks,
      totalAttendanceRecords,
    ] = await Promise.all([
      CompanyMember.countDocuments({
        company: companyId,
        isActive: true,
      }),

      Employee.countDocuments({
        company: companyId,
        isActive: true,
      }),

      Customer.countDocuments({
        company: companyId,
      }),

      Project.countDocuments({
        company: companyId,
      }),

      Task.countDocuments({
        company: companyId,
      }),

      Attendance.countDocuments({
        company: companyId,
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Report summary fetched successfully.",
      summary: {
        totalMembers,
        totalEmployees,
        totalCustomers,
        totalProjects,
        totalTasks,
        totalAttendanceRecords,
      },
    });
  } catch (error) {
    console.error("Report summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load report summary.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| Employee Report
|--------------------------------------------------------------------------
*/

router.get("/employees", authMiddleware, async (req, res) => {
  try {
    const companyId = await getCurrentCompanyId(req);

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message:
          "Your account is not connected to an active company.",
      });
    }

    const employees = await Employee.find({
      company: companyId,
    })
      .populate(
        "user",
        "fullName email role isActive"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      message: "Employee report fetched successfully.",
      count: employees.length,
      employees,
    });
  } catch (error) {
    console.error("Employee report error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load employee report.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| Customer Report
|--------------------------------------------------------------------------
*/

router.get("/customers", authMiddleware, async (req, res) => {
  try {
    const companyId = await getCurrentCompanyId(req);

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message:
          "Your account is not connected to an active company.",
      });
    }

    const customers = await Customer.find({
      company: companyId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      message: "Customer report fetched successfully.",
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error("Customer report error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load customer report.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| Project Report
|--------------------------------------------------------------------------
*/

router.get("/projects", authMiddleware, async (req, res) => {
  try {
    const companyId = await getCurrentCompanyId(req);

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message:
          "Your account is not connected to an active company.",
      });
    }

    const projects = await Project.find({
      company: companyId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      message: "Project report fetched successfully.",
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Project report error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load project report.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| Task Report
|--------------------------------------------------------------------------
*/

router.get("/tasks", authMiddleware, async (req, res) => {
  try {
    const companyId = await getCurrentCompanyId(req);

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message:
          "Your account is not connected to an active company.",
      });
    }

    const tasks = await Task.find({
      company: companyId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      message: "Task report fetched successfully.",
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Task report error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load task report.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| Attendance Report
|--------------------------------------------------------------------------
*/

router.get("/attendance", authMiddleware, async (req, res) => {
  try {
    const companyId = await getCurrentCompanyId(req);

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message:
          "Your account is not connected to an active company.",
      });
    }

    const attendance = await Attendance.find({
      company: companyId,
    })
      .populate(
        "employee",
        "fullName email role isActive"
      )
      .sort({
        date: -1,
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      message: "Attendance report fetched successfully.",
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    console.error("Attendance report error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load attendance report.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| Leave Report
|--------------------------------------------------------------------------
*/

router.get("/leaves", authMiddleware, async (req, res) => {
  try {
    const companyId = await getCurrentCompanyId(req);

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

    const pendingLeaves = leaves.filter(
      (leave) => leave.status === "pending"
    ).length;

    const approvedLeaves = leaves.filter(
      (leave) => leave.status === "approved"
    ).length;

    const rejectedLeaves = leaves.filter(
      (leave) => leave.status === "rejected"
    ).length;

    return res.status(200).json({
      success: true,
      message: "Leave report fetched successfully.",
      count: leaves.length,
      summary: {
        totalLeaves: leaves.length,
        pendingLeaves,
        approvedLeaves,
        rejectedLeaves,
      },
      leaves,
    });
  } catch (error) {
    console.error("Leave report error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load leave report.",
      error: error.message,
    });
  }
});

module.exports = router;