const express = require("express");
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/*
GET ALL NOTIFICATIONS
*/
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to load notifications.",
    });
  }
});

/*
MARK AS READ
*/
router.put("/:id/read", authMiddleware, async (req, res) => {
  try {
    const notification =
      await Notification.findOneAndUpdate(
        {
          _id: req.params.id,
          user: req.user.id,
        },
        {
          isRead: true,
        },
        {
          new: true,
        }
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    res.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to update notification.",
    });
  }
});

/*
MARK ALL AS READ
*/
router.put("/read-all", authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      {
        user: req.user.id,
        isRead: false,
      },
      {
        isRead: true,
      }
    );

    res.json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to update notifications.",
    });
  }
});
/*
CREATE TEST NOTIFICATION
*/
router.post("/test", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.create({
      user: req.user.id,
      title: "Welcome to Global Digital Solutions",
      message:
        "Your notification system is working successfully.",
      type: "system",
    });

    res.status(201).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to create test notification.",
    });
  }
});

module.exports = router;