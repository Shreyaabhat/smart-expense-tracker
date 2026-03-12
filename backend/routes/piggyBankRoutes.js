const express = require("express");
const router = express.Router();
const {
  getPiggyBank,
  addDeposit,
  deleteDeposit,
  updateSettings,
  getCurrencies,
  convertCurrency,
} = require("../controllers/piggyBankController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/", getPiggyBank);
router.post("/deposit", addDeposit);
router.delete("/deposit/:depositId", deleteDeposit);
router.put("/settings", updateSettings);
router.get("/currencies", getCurrencies);
router.post("/convert", convertCurrency);

module.exports = router;