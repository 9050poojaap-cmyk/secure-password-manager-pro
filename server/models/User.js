const mongoose = require("mongoose");

const keystrokeBaselineSchema = new mongoose.Schema(
  {
    avgFlightMs: { type: Number, default: 0 },
    flightVariance: { type: Number, default: 0 },
    avgDwellMs: { type: Number, default: 0 },
    dwellVariance: { type: Number, default: 0 },
    sampleCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const engagementSchema = new mongoose.Schema(
  {
    streakCount: { type: Number, default: 0 },
    lastStreakDate: { type: String, default: "" },
    achievements: { type: [String], default: [] },
    completedChallengeIds: { type: [String], default: [] },
    lastChallengeDay: { type: String, default: "" },
    awarenessScore: { type: Number, default: 0 },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["citizen", "organization", "admin"],
      default: "citizen",
      index: true,
    },
    keystrokeBaseline: { type: keystrokeBaselineSchema },
    lastLoginLocationKey: { type: String, default: "" },
    engagement: { type: engagementSchema, default: () => ({}) },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

