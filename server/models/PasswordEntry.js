const mongoose = require("mongoose");

const encryptedSchema = new mongoose.Schema(
  {
    iv: { type: String, required: true },
    tag: { type: String, required: true },
    data: { type: String, required: true },
  },
  { _id: false }
);

const passwordEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    siteName: { type: String, required: true, trim: true, maxlength: 120 },
    siteUrl: { type: String, trim: true, maxlength: 500 },
    username: { type: String, required: true, trim: true, maxlength: 120 },
    passwordEnc: { type: encryptedSchema, required: true },
    notesEnc: { type: encryptedSchema },
  },
  { timestamps: true }
);

passwordEntrySchema.index({ user: 1, siteName: 1 });

module.exports = mongoose.model("PasswordEntry", passwordEntrySchema);

