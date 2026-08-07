const express = require("express");

const User = require("../models/User");
const Company = require("../models/Company");
const CompanyMember = require("../models/CompanyMember");
const Task = require("../models/Task");
const Subscription = require("../models/Subscription");
const Project = require("../models/Project");
const Customer = require("../models/Customer");


const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Company Dashboard Summary
|--------------------------------------------------------------------------
*/

router.get("/summary", authMiddleware, async (req, res) => {
  try {
    const userId =
      req.user?.id ||
      req.user?.userId ||
      req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid user authentication.",
      });
    }

    const user = await User.findById(userId).select(
      "fullName email role company isActive"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled.",
      });
    }

    if (!user.company) {
      return res.status(400).json({
        success: false,
        message: "No company is connected to this user.",
      });
    }

    const companyId = user.company;

   const [
      company,
      totalMembers,
      totalProjects,
      totalCustomers,
      totalTasks,
      currentSubscription,
    ] = await Promise.all([
      Company.findById(companyId),

      CompanyMember.countDocuments({
        company: companyId,
        isActive: true,
      }),

      Project.countDocuments({
        company: companyId,
      }),

      Customer.countDocuments({
        company: companyId,
      }),

      Task.countDocuments({
        company: companyId,
      }),
      Subscription.findOne({
        company: companyId,
        productType: "saas",
        status: {
          $in: [
            "pending",
            "trialing",
            "active",
            "past_due",
            "unpaid",
            "paused",
            "incomplete",
          ],
        },
      }).sort({
        createdAt: -1,
      }),
    ]);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Dashboard summary fetched successfully.",

      company: {
  id: company._id,
  companyName: company.companyName,
  companyEmail: company.companyEmail,

  subscriptionPlan:
    currentSubscription?.planName ||
    currentSubscription?.productName ||
    company.subscriptionPlan ||
    "Basic",

  subscriptionStatus:
    currentSubscription?.status ||
    company.subscriptionStatus ||
    "inactive",

  subscription: currentSubscription
    ? {
        id: currentSubscription._id,
        productCode:
          currentSubscription.productCode,
        productName:
          currentSubscription.productName,
        planName:
          currentSubscription.planName,
        status:
          currentSubscription.status,
        trialEndsAt:
          currentSubscription.trialEndsAt,
        currentPeriodEnd:
          currentSubscription.currentPeriodEnd,
        nextBillingDate:
          currentSubscription.nextBillingDate,
        autoRenew:
          currentSubscription.autoRenew,
        cancelAtPeriodEnd:
          currentSubscription.cancelAtPeriodEnd,
        currency:
          currentSubscription.currency,
        price:
          currentSubscription.price,
      }
    : null,

  isActive: company.isActive,
},

      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },

      summary: {
        totalMembers,
        totalProjects,
        totalCustomers,
        totalTasks,
      },
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load dashboard summary.",
      error: error.message,
    });
  }
});

module.exports = router;