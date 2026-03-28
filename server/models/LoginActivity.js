const mongoose = require("mongoose");

const loginActivitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
    ip: { type: String, default: "" },
    device: { type: String, default: "" },
    suspicious: { type: Boolean, default: false },
    fakeSession: { type: Boolean, default: false },
  },
  { timestamps: false }
);

module.exports = mongoose.model("LoginActivity", loginActivitySchema);
