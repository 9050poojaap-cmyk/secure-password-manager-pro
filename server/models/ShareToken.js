const mongoose = require("mongoose");

const shareTokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true, unique: true, index: true },
    passwordEntry: { type: mongoose.Schema.Types.ObjectId, ref: "PasswordEntry", required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    oneTime: { type: Boolean, default: true },
    usedAt: { type: Date },
  },
  { timestamps: true }
);

shareTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("ShareToken", shareTokenSchema);

