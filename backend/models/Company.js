const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    companyEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    companyPhone: {
      type: String,
      default: "",
    },

    companyAddress: {
      type: String,
      default: "",
    },

    website: {
      type: String,
      default: "",
    },

    subscriptionPlan: {
      type: String,
      enum: ["Basic", "Professional", "Enterprise"],
      default: "Basic",
    },

    subscriptionStatus: {
      type: String,
      enum: ["Active", "Expired", "Cancelled"],
      default: "Active",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Company", companySchema);