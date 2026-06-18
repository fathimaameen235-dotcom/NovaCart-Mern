const Product = require("../models/Product");

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, subCategory, search, sort } = req.query;

    // ✅ FIX: $ne:true handles both explicit false AND missing/undefined isDeleted
    let query = {
      isDeleted: { $ne: true },
    };

    if (category && category !== "All") {
      query.category = category;
    }

    // ── NEW: filter by subCategory when provided ──────────────────────
    if (subCategory && subCategory !== "All") {
      query.subCategory = subCategory;
    }

    if (search) {
      query.$or = [
        { title:       { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === "price_asc")  sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };
    if (sort === "rating")     sortOption = { averageRating: -1 };

    const products = await Product.find(query)
      .populate("createdBy", "name email")
      .sort(sortOption);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isDeleted: { $ne: true }, // ✅ FIX
    }).populate("createdBy", "name email");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, product });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res) => {
  try {
    // ── NEW: destructure subCategory and averageRating alongside existing fields
    const { title, description, price, category, subCategory, images, stock, averageRating } = req.body;

    if (!title || !description || price === undefined || !category || !images || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const product = await Product.create({
      title,
      description,
      price,
      category,
      subCategory: subCategory || "",          // ── NEW
      images,
      stock: stock || 0,
      createdBy: req.user._id,
      // ── NEW: allow seeding an initial averageRating (e.g. from admin form)
      averageRating: averageRating !== undefined ? Number(averageRating) : 0,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || product.isDeleted) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // ── NEW: include subCategory and averageRating in destructure
    const { title, description, price, category, subCategory, images, stock, averageRating } = req.body;

    product.title       = title       || product.title;
    product.description = description || product.description;
    product.price       = price       !== undefined ? price       : product.price;
    product.category    = category    || product.category;
    product.subCategory = subCategory !== undefined ? subCategory : product.subCategory; // ── NEW
    product.images      = images      || product.images;
    product.stock       = stock       !== undefined ? stock       : product.stock;
    // ── NEW: update averageRating only when explicitly provided
    if (averageRating !== undefined) {
      product.averageRating = Number(averageRating);
    }

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || product.isDeleted) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    product.isDeleted = true;
    await product.save();

    res.status(200).json({ success: true, message: "Product deleted successfully" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};