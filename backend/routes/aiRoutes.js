const express = require("express");
const router = express.Router();
const { getPrediction, getInsights } = require("../controllers/aiController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.get("/prediction", getPrediction);
router.get("/insights", getInsights);


module.exports = router;