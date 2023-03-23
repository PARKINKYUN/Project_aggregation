const express = require("express");
const router = express.Router();

const swapController = require("../controllers/swap.controller");

router.post("/swap", swapController.executeSwap);
router.post("/quoteSwap", swapController.quoteSwap);
router.post("/quoteSwapFor", swapController.quoteSwapFor);

module.exports = router;