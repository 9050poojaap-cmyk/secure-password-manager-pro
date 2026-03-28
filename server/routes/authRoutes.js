const router = require("express").Router();
const { signup, login, me, verifyReauth, loginActivity } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, me);
router.post("/verify-reauth", protect, verifyReauth);
router.get("/login-activity", protect, loginActivity);

module.exports = router;

