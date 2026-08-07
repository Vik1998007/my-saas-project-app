const express = require("express");

const Customer = require("../models/Customer");
const User = require("../models/User");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Helper - Get Current User and Company
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
| Create Customer
|--------------------------------------------------------------------------
*/

router.post("/create", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      email,
      service,
      status = "Pending",
    } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !service?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and service are required.",
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

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const existingCustomer =
      await Customer.findOne({
        company: companyId,
        email: normalizedEmail,
      });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message:
          "A customer with this email already exists in your company.",
      });
    }

    const customer = await Customer.create({
      company: companyId,
      user: user._id,
      name: name.trim(),
      email: normalizedEmail,
      service: service.trim(),
      status,
    });

    return res.status(201).json({
      success: true,
      message:
        "Customer created successfully.",
      customer,
    });
  } catch (error) {
    console.error("Create customer error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to create customer.",
    });
  }
});

/*
|--------------------------------------------------------------------------
| Get All Customers
|--------------------------------------------------------------------------
*/

router.get("/", authMiddleware, async (req, res) => {
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

    const customers = await Customer.find({
      company: companyId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error("Get customers error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to load customers.",
    });
  }
});

/*
|--------------------------------------------------------------------------
| Get Single Customer
|--------------------------------------------------------------------------
*/

router.get("/:id", authMiddleware, async (req, res) => {
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

    const customer = await Customer.findOne({
      _id: req.params.id,
      company: companyId,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    return res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error("Get customer error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to load customer.",
    });
  }
});

/*
|--------------------------------------------------------------------------
| Update Customer
|--------------------------------------------------------------------------
*/

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      email,
      service,
      status,
    } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !service?.trim() ||
      !status
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, service and status are required.",
      });
    }

    const { companyId } =
      await getCurrentUserCompany(req);

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message:
          "Your account is not connected to an active company.",
      });
    }

    const customer = await Customer.findOne({
      _id: req.params.id,
      company: companyId,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const duplicateCustomer =
      await Customer.findOne({
        _id: {
          $ne: customer._id,
        },
        company: companyId,
        email: normalizedEmail,
      });

    if (duplicateCustomer) {
      return res.status(409).json({
        success: false,
        message:
          "Another customer with this email already exists in your company.",
      });
    }

    customer.name = name.trim();
    customer.email = normalizedEmail;
    customer.service = service.trim();
    customer.status = status;

    await customer.save();

    return res.status(200).json({
      success: true,
      message:
        "Customer updated successfully.",
      customer,
    });
  } catch (error) {
    console.error("Update customer error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to update customer.",
    });
  }
});

/*
|--------------------------------------------------------------------------
| Delete Customer
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  authMiddleware,
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

      const customer = await Customer.findOne({
        _id: req.params.id,
        company: companyId,
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found.",
        });
      }

      await customer.deleteOne();

      return res.status(200).json({
        success: true,
        message:
          "Customer deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete customer error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to delete customer.",
      });
    }
  }
);

module.exports = router;