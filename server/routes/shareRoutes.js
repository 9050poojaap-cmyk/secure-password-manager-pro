const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { createShare, redeemShare } = require("../controllers/shareController");

router.post("/", protect, createShare);
router.get("/:token", redeemShare);

module.exports = router;

