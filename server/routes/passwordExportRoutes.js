const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { exportVault, generatePassword } = require("../controllers/exportController");

router.get("/export", protect, exportVault);
router.get("/generate", protect, generatePassword);

module.exports = router;
