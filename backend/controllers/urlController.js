import Url from "../models/Url.js";
import { generateShortCode } from "../utils/generateShortUrl.js";

/* --------------------------------------------------------
   CREATE LINK (POST /api/links)
   - 201 success
   - 409 if custom code already exists
-------------------------------------------------------- */
export const createLink = async (req, res) => {
  try {
    const { longUrl, code } = req.body;

    if (!longUrl) {
      return res.status(400).json({ error: "longUrl is required" });
    }

    // Validate custom code
    if (code && !/^[A-Za-z0-9]{6,8}$/.test(code)) {
      return res
        .status(400)
        .json({ error: "Custom code must be 6-8 alphanumeric characters." });
    }

    let shortCode = code || generateShortCode();

    // Check duplicate if custom code
    if (code) {
      const exists = await Url.findOne({ where: { shortUrl: shortCode } });
      if (exists) return res.status(409).json({ error: "Code already exists" });
    }

    // Auto-generate → ensure unique
    if (!code) {
      let exists = await Url.findOne({ where: { shortUrl: shortCode } });
      while (exists) {
        shortCode = generateShortCode();
        exists = await Url.findOne({ where: { shortUrl: shortCode } });
      }
    }

    const newLink = await Url.create({
      longUrl,
      shortUrl: shortCode,
      clickCount: 0,
      clickTimestamps: [],
    });

    return res.status(201).json(newLink);
  } catch (err) {
    console.error("Create Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/* --------------------------------------------------------
   LIST ALL LINKS (GET /api/links)
-------------------------------------------------------- */
export const listLinks = async (req, res) => {
  try {
    const links = await Url.findAll({ order: [["createdAt", "DESC"]] });

    // Add lastClicked for each link
    const linksWithLastClicked = links.map((link) => {
      const lastClicked =
        link.clickTimestamps && link.clickTimestamps.length > 0
          ? link.clickTimestamps[link.clickTimestamps.length - 1]
          : null;

      return {
        ...link.toJSON(), // convert Sequelize model to plain object
        lastClicked,
      };
    });

    return res.status(200).json(linksWithLastClicked);
  } catch (err) {
    console.error("List Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/* --------------------------------------------------------
   STATS FOR ONE CODE (GET /api/links/:code)
-------------------------------------------------------- */
export const getLinkStats = async (req, res) => {
  try {
    const { code } = req.params;

    const link = await Url.findOne({ where: { shortUrl: code } });

    if (!link) return res.status(404).json({ error: "Link not found" });

    return res.status(200).json(link);
  } catch (err) {
    console.error("Stats Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/* --------------------------------------------------------
   DELETE LINK (DELETE /api/links/:code)
-------------------------------------------------------- */
export const deleteLink = async (req, res) => {
  try {
    const { code } = req.params;

    const link = await Url.findOne({ where: { shortUrl: code } });

    if (!link) return res.status(404).json({ error: "Link not found" });

    await link.destroy();
    return res.status(200).json({ message: "Link deleted" });
  } catch (err) {
    console.error("Delete Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/* --------------------------------------------------------
   PUBLIC REDIRECT (GET /:code)
-------------------------------------------------------- */
export const redirectLink = async (req, res) => {
  try {
    const { code } = req.params;

    const link = await Url.findOne({ where: { shortUrl: code } });

    if (!link) return res.status(404).send("Not found");

    await link.update({
      clickCount: link.clickCount + 1,
      clickTimestamps: [...link.clickTimestamps, new Date()],
    });

    return res.redirect(link.longUrl);
  } catch (err) {
    console.error("Redirect Error:", err);
    return res.status(500).send("Server error");
  }
};
