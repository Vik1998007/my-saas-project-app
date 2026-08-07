const jwt = require("jsonwebtoken");
const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Register
|--------------------------------------------------------------------------
| अगर database में कोई user नहीं है तो पहला user Admin बनेगा।
| इसके बाद register होने वाला user Employee बनेगा।
*/

router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists.",
      });
    }

    const totalUsers = await User.countDocuments();

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,

      // First account becomes Admin
      role: totalUsers === 0 ? "admin" : "employee",

      isActive: true,
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    /*
      पुराने account के लिए:
      अगर database में कोई Admin नहीं है,
      तो login करने वाला valid user Admin बन जाएगा।
    */

    const existingAdmin = await User.findOne({
      role: "admin",
    });

    if (!existingAdmin) {
      user.role = "admin";
      user.isActive = true;
      await user.save();
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been disabled. Please contact the administrator.",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| Profile
|--------------------------------------------------------------------------
*/

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-password -resetPasswordToken -resetPasswordExpire"
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

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully.",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| Forgot Password
|--------------------------------------------------------------------------
*/

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "This account has been disabled.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetLink =
      `http://localhost:3000/reset-password/${resetToken}`;

    await sendEmail({
      email: user.email,
      subject: "Password Reset",
      message: `Click the link below to reset your password: ${resetLink}`,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset email sent successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| Reset Password
|--------------------------------------------------------------------------
*/

router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "New password is required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const hashedResetToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedResetToken,
      resetPasswordExpire: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset token is invalid or expired.",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "This account has been disabled.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
});

module.exports = router;