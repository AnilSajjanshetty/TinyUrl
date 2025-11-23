// // routes/urlRoutes.js
// import express from "express";
// import {
//   createShortUrl,
//   getAllUrls,
//   getUrlDetails,
//   deleteUrl,
//   redirectShortUrl,
// } from "../controllers/urlController.js";

// const router = express.Router();

// // CRUD API
// router.post("/create", createShortUrl);
// router.get("/all", getAllUrls);
// router.get("/details/:code", getUrlDetails);
// router.delete("/delete/:code", deleteUrl);

// // Redirect route (should be last)
// router.get("/:code", redirectShortUrl);

// export default router;

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
