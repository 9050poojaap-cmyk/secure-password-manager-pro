const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { addPassword, getPasswords, deletePassword } = require("../controllers/passwordController");

router.use(protect);

router.get("/", getPasswords);
router.post("/", addPassword);
router.delete("/:id", deletePassword);

module.exports = router;

