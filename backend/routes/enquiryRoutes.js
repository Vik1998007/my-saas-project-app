const express = require("express");
const router = express.Router();

const Enquiry = require("../models/Enquiry");
const authMiddleware = require("../middleware/authMiddleware");

// Create Enquiry
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, service, message, status } = req.body;

    if (!name || !email || !phone || !service || !message) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled.",
      });
    }

    const enquiry = new Enquiry({
      name,
      email,
      phone,
      service,
      message,
      status: status || "New",
      user: req.user.userId,
    });

    await enquiry.save();

    res.status(201).json({
      success: true,
      message: "Enquiry created successfully.",
      enquiry,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// Get All Enquiries
router.get("/", authMiddleware, async (req, res) => {
  try {
    const enquiries = await Enquiry.find({
      user: req.user.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      enquiries,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// Update Enquiry
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, service, message, status } = req.body;

    const enquiry = await Enquiry.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found.",
      });
    }

    enquiry.name = name;
    enquiry.email = email;
    enquiry.phone = phone;
    enquiry.service = service;
    enquiry.message = message;
    enquiry.status = status;

    await enquiry.save();

    res.status(200).json({
      success: true,
      message: "Enquiry updated successfully.",
      enquiry,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// Delete Enquiry
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const enquiry = await Enquiry.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found.",
      });
    }

    await Enquiry.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Enquiry deleted successfully.",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

module.exports = router;