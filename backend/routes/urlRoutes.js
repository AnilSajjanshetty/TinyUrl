import express from "express";
import {
  createLink,
  listLinks,
  getLinkStats,
  deleteLink,
  redirectLink,
} from "../controllers/urlController.js";

const router = express.Router();

// Assignment-required API routes
router.post("/links", createLink);
router.get("/links", listLinks);
router.get("/links/:code", getLinkStats);
router.delete("/links/:code", deleteLink);

// Public redirect route (must be last)
router.get("/:code", redirectLink);

export default router;
