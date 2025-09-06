const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
const allowedOrigins = [
  "http://localhost:3000", // Local development
  process.env.FRONTEND_URL,
];
app.use(
  cors({
    origin: allowedOrigins, // or whatever port your React app runs on
    credentials: true,
  })
);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cart: [
    {
      item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
      quantity: { type: Number, default: 1 },
    },
  ],
});

const User = mongoose.model("User", userSchema);

// Item Schema
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, default: "https://via.placeholder.com/400x400" },
  stock: { type: Number, default: 10 },
});

const Item = mongoose.model("Item", itemSchema);

// JWT Middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Item Routes
app.get("/api/items", async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search } = req.query;
    let filter = {};

    if (category && category !== "all") filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (search) filter.name = { $regex: search, $options: "i" };

    const items = await Item.find(filter);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Cart Routes
app.get("/api/cart", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("cart.item");
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/api/cart/add", authenticateToken, async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;
    const user = await User.findById(req.user._id);
    const existingCartItem = user.cart.find(
      (item) => item.item.toString() === itemId
    );

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
    } else {
      user.cart.push({ item: itemId, quantity });
    }

    await user.save();
    await user.populate("cart.item");
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.put("/api/cart/update", authenticateToken, async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const user = await User.findById(req.user._id);
    const cartItem = user.cart.find((item) => item.item.toString() === itemId);

    if (cartItem) {
      cartItem.quantity = quantity;
      await user.save();
      await user.populate("cart.item");
    }
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.delete("/api/cart/remove/:itemId", authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    const user = await User.findById(req.user._id);
    user.cart = user.cart.filter((item) => item.item.toString() !== itemId);
    await user.save();
    await user.populate("cart.item");
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Seed sample data
const seedData = async () => {
  try {
    const itemCount = await Item.countDocuments();
    if (itemCount === 0) {
      const sampleItems = [
        {
          name: "MacBook Pro M2",
          description: "Latest MacBook Pro with M2 chip",
          price: 1299,
          category: "Electronics",
          image:
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
          stock: 5,
        },
        {
          name: "iPhone 14",
          description: "Latest iPhone with advanced camera",
          price: 999,
          category: "Electronics",
          image:
            "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
          stock: 10,
        },
        {
          name: "Nike Air Jordan",
          description: "Classic basketball shoes",
          price: 150,
          category: "Clothing",
          image:
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
          stock: 20,
        },
        {
          name: "Levi's Jeans",
          description: "Classic denim jeans",
          price: 80,
          category: "Clothing",
          image:
            "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400",
          stock: 15,
        },
        {
          name: "The Great Gatsby",
          description: "Classic American novel",
          price: 15,
          category: "Books",
          image:
            "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
          stock: 30,
        },
        {
          name: "Sony Headphones",
          description: "Noise cancelling headphones",
          price: 200,
          category: "Electronics",
          image:
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
          stock: 8,
        },
      ];
      await Item.insertMany(sampleItems);
      console.log("Sample data inserted");
    }
  } catch (error) {
    console.error("Error seeding data:", error);
  }
};

const PORT = process.env.PORT || 8000;
mongoose.connection.once("open", async () => {
  console.log("Connected to MongoDB");
  await seedData();
  app.listen(8000, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
