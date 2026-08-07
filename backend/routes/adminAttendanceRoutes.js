const express = require("express");

const Attendance = require("../models/Attendance");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Get All Attendance (Admin)
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const attendance = await Attendance.find()
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
        total: attendance.length,
        attendance,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error.",
        error: error.message,
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Get Attendance By Employee
|--------------------------------------------------------------------------
*/

router.get(
  "/employee/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const attendance = await Attendance.find({
        employee: req.params.id,
      })
        .populate(
          "employee",
          "fullName email role"
        )
        .sort({
          date: -1,
        });

      return res.status(200).json({
        success: true,
        attendance,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error.",
        error: error.message,
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Get Attendance By Date
|--------------------------------------------------------------------------
*/

router.get(
  "/date/:date",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const selectedDate = new Date(req.params.date);

      selectedDate.setHours(0, 0, 0, 0);

      const nextDate = new Date(selectedDate);

      nextDate.setDate(nextDate.getDate() + 1);

      const attendance = await Attendance.find({
        date: {
          $gte: selectedDate,
          $lt: nextDate,
        },
      })
        .populate(
          "employee",
          "fullName email role"
        )
        .sort({
          createdAt: -1,
        });

      return res.status(200).json({
        success: true,
        total: attendance.length,
        attendance,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error.",
        error: error.message,
      });
    }
  }
);

module.exports = router;