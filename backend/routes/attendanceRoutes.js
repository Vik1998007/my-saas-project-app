const express = require("express");
const Attendance = require("../models/Attendance");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Check in
router.post("/check-in", authMiddleware, async (req, res) => {
  try {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      employee: req.user.id,
      date: today,
    });

    if (existingAttendance) {
      return res.status(400).json({
        message: "Attendance already marked for today.",
      });
    }

    const attendance = await Attendance.create({
      employee: req.user.id,
      date: today,
      checkIn: new Date(),
      status: "present",
    });

    res.status(201).json({
      message: "Check-in successful.",
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
});

// Check out
router.put("/check-out", authMiddleware, async (req, res) => {
  try {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: req.user.id,
      date: today,
    });

    if (!attendance) {
      return res.status(404).json({
        message: "Please check in first.",
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        message: "You have already checked out.",
      });
    }

    const checkOutTime = new Date();

    const workingMilliseconds =
      checkOutTime.getTime() - attendance.checkIn.getTime();

    const workingHours = workingMilliseconds / (1000 * 60 * 60);

    attendance.checkOut = checkOutTime;
    attendance.workingHours = Number(workingHours.toFixed(2));

    await attendance.save();

    res.status(200).json({
      message: "Check-out successful.",
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
});

// Get logged-in employee attendance
router.get("/my-attendance", authMiddleware, async (req, res) => {
  try {
    const attendance = await Attendance.find({
      employee: req.user.id,
    }).sort({
      date: -1,
    });

    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
});

module.exports = router;