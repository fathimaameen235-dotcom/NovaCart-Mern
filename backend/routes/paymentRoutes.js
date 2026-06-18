const express = require("express");
const router  = express.Router();

const {
  createRazorpayOrder,
  verifyPayment,
  getMyPayments,
  getAllPayments,
} = require("../controllers/paymentController");

const { protect, admin } = require("../middleware/authMiddleware");

router.post("/create-order", protect, createRazorpayOrder);
router.post("/verify",       protect, verifyPayment);
router.get("/my",            protect, getMyPayments);
router.get("/all",           protect, admin, getAllPayments);

module.exports = router;