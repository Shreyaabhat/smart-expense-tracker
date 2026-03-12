const express = require("express");
const router = express.Router();
const { upsertBudget, getBudgets, deleteBudget } = require("../controllers/budgetController");
const { protect } = require("../middleware/auth");
const { validateBudget } = require("../middleware/validate");

router.use(protect);
router.route("/").get(getBudgets).post(validateBudget, upsertBudget);
router.delete("/:id", deleteBudget);

module.exports = router;