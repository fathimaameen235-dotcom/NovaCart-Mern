const Review = require("../models/Review");
const Product = require("../models/Product");

// ================= ADD REVIEW =================
// @route   POST /api/reviews/:productId
// @access  Private
const addReview = async (req, res) => {
  try {
    const { comment } = req.body;
    const rating = Number(req.body.rating);
    const { productId } = req.params;

    if (!rating || rating < 1 || rating > 5 || !comment) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid rating (1–5) and comment",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      isDeleted: { $ne: true },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const existingReview = await Review.findOne({ productId, userId: req.user._id });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    const review = await Review.create({
      productId,
      userId: req.user._id,
      rating,
      comment,
    });

    const allReviews = await Review.find({ productId });
    const totalRating = allReviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = totalRating / allReviews.length;

    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: allReviews.length,
    });

    const populatedReview = await Review.findById(review._id).populate("userId", "name avatar");

    res.status(201).json(populatedReview);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET REVIEWS FOR PRODUCT =================
// @route   GET /api/reviews/:productId
// @access  Public
const getReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOne({
      _id: productId,
      isDeleted: { $ne: true },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const reviews = await Review.find({ productId })
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET ALL REVIEWS (ADMIN) =================
// @route   GET /api/reviews/all
// @access  Private/Admin
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate("userId", "name email avatar")
      .populate("productId", "title image")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= DELETE REVIEW (ADMIN) =================
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    const productId = review.productId;

    await Review.findByIdAndDelete(req.params.id);

    // Recalculate product rating after deletion
    const remaining = await Review.find({ productId });

    let averageRating = 0;
    if (remaining.length > 0) {
      const totalRating = remaining.reduce((acc, r) => acc + r.rating, 0);
      averageRating = totalRating / remaining.length;
    }

    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: remaining.length,
    });

    res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addReview,
  getReviews,
  getAllReviews,
  deleteReview,
};