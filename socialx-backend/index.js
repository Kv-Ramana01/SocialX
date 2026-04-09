const express = require("express");
const cors    = require("cors");
const dotenv  = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// CORS
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// IMPORTANT: increase limit to 10mb to support base64 image uploads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

if (process.env.NODE_ENV === "development") {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
}

// Routes
app.use("/api/auth",     require("./routes/auth"));
app.use("/api/posts",    require("./routes/posts"));
app.use("/api/friends",  require("./routes/friends"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/users",    require("./routes/users"));

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "SocialX API is running 🚀" });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 SocialX server running on http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV}`);
  console.log(`   MongoDB     : ${process.env.MONGO_URI}\n`);
});