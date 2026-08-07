const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address.",
      ],
    },

    service: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },

    status: {
      type: String,
      enum: ["Active", "Pending", "Inactive"],
      default: "Pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

customerSchema.index({
  company: 1,
  createdAt: -1,
});

customerSchema.index({
  company: 1,
  email: 1,
});

const Customer = mongoose.model(
  "Customer",
  customerSchema
);

module.exports = Customer;