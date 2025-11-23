import express from "express";
import dotenv from "dotenv";
import sequelize from "./config/db.js";
import urlRoutes from "./routes/urlRoutes.js";
import cors from "cors";

dotenv.config();
const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

// Health Check Endpoint
app.get("/healthz", (req, res) => {
  res.status(200).json({
    ok: true,
    version: "1.0",
    timestamp: new Date().toISOString(),
  });
});

// Example route
app.get("/", (req, res) => res.send("Hello from TinyURL API"));

// Routes
app.use("/api", urlRoutes);

// Initialize database connection
let dbInitialized = false;

async function initializeDatabase() {
  if (!dbInitialized) {
    try {
      await sequelize.authenticate();
      console.log("Connected to Neon PostgreSQL");
      await sequelize.sync({ alter: false });
      console.log("Models synced");
      dbInitialized = true;
    } catch (err) {
      console.error("DB connection error:", err);
      throw err;
    }
  }
}

app.use(async (req, res, next) => {
  try {
    await initializeDatabase();
    next();
  } catch (err) {
    res.status(500).json({ error: "Database initialization failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Export for Vercel
export default app;
