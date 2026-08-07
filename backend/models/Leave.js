const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    leaveType: {
      type: String,
      enum: [
        "casual",
        "sick",
        "annual",
        "emergency",
      ],
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    totalDays: {
      type: Number,
      required: true,
      min: 1,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    attachment: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
      ],
      default: "pending",
    },

    adminComment: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

leaveSchema.pre("validate", function () {
  if (!this.startDate || !this.endDate) {
    return;
  }

  const start = new Date(this.startDate);
  const end = new Date(this.endDate);

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (end < start) {
    throw new Error(
      "End date cannot be before start date."
    );
  }

  const differenceInMilliseconds =
    end.getTime() - start.getTime();

  this.totalDays =
    Math.floor(
      differenceInMilliseconds /
        (1000 * 60 * 60 * 24)
    ) + 1;
});

const Leave = mongoose.model(
  "Leave",
  leaveSchema
);

module.exports = Leave;