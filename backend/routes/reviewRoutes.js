const express = require("express");
const router = express.Router();

const {
  addReview,
  getReviews,
  getAllReviews,
  deleteReview,
} = require("../controllers/reviewController");

const {
  protect,
  admin,
} = require("../middleware/authMiddleware");

router.get("/all", protect, admin, getAllReviews);

router.post("/:productId", protect, addReview);

router.get("/:productId", getReviews);

router.delete("/:id", protect, admin, deleteReview);

module.exports = router;