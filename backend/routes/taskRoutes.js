const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Task = require("../models/Task");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

// ========================================
// Admin Permission Check
// ========================================
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access is required.",
    });
  }

  next();
};

// ========================================
// Get Employee List for Task Assignment
// GET /api/tasks/employees
// Admin only
// ========================================
router.get(
  "/employees",
  authMiddleware,
  requireAdmin,
  async (req, res) => {
    try {
      const employees = await User.find({
        role: {
          $in: ["admin", "employee", "manager"],
        },
        isActive: {
          $ne: false,
        },
      })
        .select("_id fullName email role isActive")
        .sort({
          fullName: 1,
        });

      return res.status(200).json({
        success: true,
        employees,
      });
    } catch (error) {
      console.error("Get employees error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to load employees.",
      });
    }
  }
);

// ========================================
// Get Logged-in Employee Tasks
// GET /api/tasks/my
// ========================================
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user.id,
    })
      .populate(
        "assignedTo",
        "fullName email role isActive"
      )
      .populate(
        "assignedBy",
        "fullName email role isActive"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error("Get employee tasks error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load tasks.",
    });
  }
});

// ========================================
// Create Task
// POST /api/tasks
// Admin only
// ========================================
router.post(
  "/",
  authMiddleware,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        title,
        description,
        assignedTo,
        priority,
        dueDate,
      } = req.body;

      if (
        !title?.trim() ||
        !description?.trim() ||
        !assignedTo ||
        !dueDate
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Title, description, employee and due date are required.",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
        return res.status(400).json({
          success: false,
          message: "Invalid employee ID.",
        });
      }

      const employee = await User.findById(
        assignedTo
      ).select(
        "_id fullName email role isActive"
      );

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found.",
        });
      }

     

      if (employee.isActive === false) {
        return res.status(400).json({
          success: false,
          message:
            "Task cannot be assigned to a disabled employee.",
        });
      }

      const validPriorities = [
        "Low",
        "Medium",
        "High",
      ];

      if (
        priority &&
        !validPriorities.includes(priority)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid task priority.",
        });
      }

      const parsedDueDate = new Date(dueDate);

      if (Number.isNaN(parsedDueDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid due date.",
        });
      }

      const task = await Task.create({
        title: title.trim(),
        description: description.trim(),
        assignedTo,
        assignedBy: req.user.id,
        priority: priority || "Medium",
        dueDate: parsedDueDate,
      });

      const populatedTask = await Task.findById(
        task._id
      )
        .populate(
          "assignedTo",
          "fullName email role isActive"
        )
        .populate(
          "assignedBy",
          "fullName email role isActive"
        );

      return res.status(201).json({
        success: true,
        message: "Task created successfully.",
        task: populatedTask,
      });
    } catch (error) {
      console.error("Create task error:", error);

      return res.status(500).json({
        success: false,
        message:
          error.message || "Unable to create task.",
      });
    }
  }
);

// ========================================
// Get All Tasks
// GET /api/tasks
// Admin only
// ========================================
router.get(
  "/",
  authMiddleware,
  requireAdmin,
  async (req, res) => {
    try {
      const tasks = await Task.find()
        .populate(
          "assignedTo",
          "fullName email role isActive"
        )
        .populate(
          "assignedBy",
          "fullName email role isActive"
        )
        .sort({
          createdAt: -1,
        });

      return res.status(200).json({
        success: true,
        tasks,
      });
    } catch (error) {
      console.error("Get all tasks error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to load tasks.",
      });
    }
  }
);

// ========================================
// Update Complete Task Details
// PUT /api/tasks/:id
// Admin only
// ========================================
router.put(
  "/:id",
  authMiddleware,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task ID.",
        });
      }

      const task = await Task.findById(id);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found.",
        });
      }

      const {
        title,
        description,
        assignedTo,
        priority,
        dueDate,
      } = req.body;

      if (assignedTo) {
        if (
          !mongoose.Types.ObjectId.isValid(
            assignedTo
          )
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid employee ID.",
          });
        }

        const employee = await User.findById(
          assignedTo
        ).select(
          "_id fullName email role isActive"
        );

        if (!employee) {
          return res.status(404).json({
            success: false,
            message: "Employee not found.",
          });
        }

        if (employee.role === "admin") {
          return res.status(400).json({
            success: false,
            message:
              "Task must be assigned to an employee or manager.",
          });
        }

        if (employee.isActive === false) {
          return res.status(400).json({
            success: false,
            message:
              "Task cannot be assigned to a disabled employee.",
          });
        }

        task.assignedTo = assignedTo;
      }

      if (title !== undefined) {
        if (!title.trim()) {
          return res.status(400).json({
            success: false,
            message: "Task title cannot be empty.",
          });
        }

        task.title = title.trim();
      }

      if (description !== undefined) {
        if (!description.trim()) {
          return res.status(400).json({
            success: false,
            message:
              "Task description cannot be empty.",
          });
        }

        task.description = description.trim();
      }

      if (priority !== undefined) {
        const validPriorities = [
          "Low",
          "Medium",
          "High",
        ];

        if (
          !validPriorities.includes(priority)
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid task priority.",
          });
        }

        task.priority = priority;
      }

      if (dueDate !== undefined) {
        const parsedDueDate = new Date(dueDate);

        if (
          Number.isNaN(parsedDueDate.getTime())
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid due date.",
          });
        }

        task.dueDate = parsedDueDate;
      }

      await task.save();

      const updatedTask = await Task.findById(
        task._id
      )
        .populate(
          "assignedTo",
          "fullName email role isActive"
        )
        .populate(
          "assignedBy",
          "fullName email role isActive"
        );

      return res.status(200).json({
        success: true,
        message: "Task updated successfully.",
        task: updatedTask,
      });
    } catch (error) {
      console.error("Update task error:", error);

      return res.status(500).json({
        success: false,
        message:
          error.message || "Unable to update task.",
      });
    }
  }
);

// ========================================
// Update Task Status
// PUT /api/tasks/:id/status
// Admin or Assigned Employee
// ========================================
router.put(
  "/:id/status",
  authMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task ID.",
        });
      }

      const validStatuses = [
        "Pending",
        "In Progress",
        "Completed",
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task status.",
        });
      }

      const task = await Task.findById(id);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found.",
        });
      }

      const isAssignedEmployee =
        task.assignedTo.toString() ===
        req.user.id.toString();

      const isAdmin =
        req.user.role === "admin";

      if (!isAssignedEmployee && !isAdmin) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to update this task.",
        });
      }

      task.status = status;

      if (status === "Completed") {
        task.completedAt = new Date();
      } else {
        task.completedAt = null;
      }

      await task.save();

      const updatedTask = await Task.findById(
        task._id
      )
        .populate(
          "assignedTo",
          "fullName email role isActive"
        )
        .populate(
          "assignedBy",
          "fullName email role isActive"
        );

      return res.status(200).json({
        success: true,
        message:
          "Task status updated successfully.",
        task: updatedTask,
      });
    } catch (error) {
      console.error(
        "Update task status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to update task status.",
      });
    }
  }
);

// ========================================
// Delete Task
// DELETE /api/tasks/:id
// Admin only
// ========================================
router.delete(
  "/:id",
  authMiddleware,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task ID.",
        });
      }

      const task = await Task.findByIdAndDelete(id);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Task deleted successfully.",
      });
    } catch (error) {
      console.error("Delete task error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to delete task.",
      });
    }
  }
);

module.exports = router;