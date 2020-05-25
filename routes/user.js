const express = require("express");
const user = require("../models/userModel");
const article = require("../models/blogModel");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const verify = require("../routes/verifyToken");
const router = express.Router();

router.get("/blog/", verify, async (req, res, next) => {
  try {
    const artcilaya = await article.find({ userId: req.user.id });
    if (artcilaya) {
      res.send(artcilaya);
    } else {
      res.send("no articles found for this user");
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
