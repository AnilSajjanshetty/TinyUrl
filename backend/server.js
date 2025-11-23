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
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

// Health Check Endpoint
app.get("/healthz", (req, res) => {
  res.status(200).json({
    ok: true,
    version: "1.0",
    timestamp: new Date().toISOString(), // optional
  });
});

// Example route
app.get("/", (req, res) => res.send("Hello from TinyURL API"));
// Routes
app.use("/api", urlRoutes);

// Sequelize DB connection
sequelize
  .authenticate()
  .then(() => console.log("Connected to Neon PostgreSQL"))
  .catch((err) => console.error("DB connection error:", err));

sequelize
  .sync({ alter: true })
  .then(() => console.log("Models synced"))
  .catch(console.error);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
