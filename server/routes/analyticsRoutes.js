const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const {
  community,
  riskReport,
  organizationDashboard,
  adminStats,
} = require("../controllers/analyticsController");

router.get("/community", protect, community);
router.get("/risk-report", protect, riskReport);
router.get("/org-dashboard", protect, requireRole("organization", "admin"), organizationDashboard);
router.get("/admin-stats", protect, requireRole("admin"), adminStats);

module.exports = router;
