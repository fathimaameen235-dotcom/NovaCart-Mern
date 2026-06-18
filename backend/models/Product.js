const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [120, "Title cannot exceed 120 characters"],
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      set: (value) => Math.round(value * 100) / 100,
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Electronics",
        "Fashion",
        "Home & Living",
        "Sports",
        "Beauty",
        "Books",
        "Gaming",
        "Accessories",
      ],
    },

    // ── NEW: Sub-category (dependent on category) ──────────────────────
    subCategory: {
      type: String,
      trim: true,
      default: "",
    },

    // Multiple product images support
    images: [
      {
        type: String,
        trim: true,
      },
    ],

    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    averageRating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be below 0"],
      max: [5, "Rating cannot exceed 5"],
      set: (v) => Math.round(v * 10) / 10, // round to 1 decimal
    },

    reviewCount: {
      type: Number,
      default: 0,
      min: [0, "Review count cannot be negative"],
    },

    // SEO friendly URL slug
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Soft delete support
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster search/filtering
productSchema.index({ category: 1 });
productSchema.index({ subCategory: 1 });
productSchema.index({ price: 1 });
productSchema.index({ title: "text", description: "text" });

// Auto-generate slug before saving
productSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .replace(/\s+/g, "-");
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);