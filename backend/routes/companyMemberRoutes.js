const express = require("express");
const CompanyMember = require("../models/CompanyMember");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/*
GET MEMBERS OF A COMPANY
*/
router.get("/:companyId", authMiddleware, async (req, res) => {
  try {
    const members = await CompanyMember.find({
      company: req.params.companyId,
    })
      .populate("user", "fullName email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      members,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to load company members.",
    });
  }
});

module.exports = router;