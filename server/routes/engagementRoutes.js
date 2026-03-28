const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { getState, completeChallenge, submitAwareness } = require("../controllers/engagementController");

router.get("/state", protect, getState);
router.post("/challenge/complete", protect, completeChallenge);
router.post("/awareness", protect, submitAwareness);

module.exports = router;
