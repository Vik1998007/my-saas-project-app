const express = require("express");
const Company = require("../models/Company");
const CompanyMember = require("../models/CompanyMember");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/*
CREATE COMPANY
*/
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      companyName,
      companyEmail,
      companyPhone,
      companyAddress,
      website,
      subscriptionPlan,
    } = req.body;

    if (!companyName || !companyEmail) {
      return res.status(400).json({
        success: false,
        message: "Company name and company email are required.",
      });
    }

    const existingCompany = await Company.findOne({
      companyEmail: companyEmail.toLowerCase(),
    });

    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: "Company already exists with this email.",
      });
    }

    const company = await Company.create({
      companyName,
      companyEmail,
      companyPhone,
      companyAddress,
      website,
      subscriptionPlan,
    });

    await CompanyMember.create({
      company: company._id,
      user: req.user.id,
      role: "owner",
    });

    await User.findByIdAndUpdate(req.user.id, {
      company: company._id,
      role: "admin",
    });

    res.status(201).json({
      success: true,
      message: "Company created successfully.",
      company,
    });
  } catch (error) {
    console.error("Create company error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create company.",
    });
  }
});

/*
GET ALL COMPANIES
*/
router.get("/", authMiddleware, async (req, res) => {
  try {
    const companies = await Company.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      companies,
    });
  } catch (error) {
    console.error("Get companies error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load companies.",
    });
  }
});

module.exports = router;