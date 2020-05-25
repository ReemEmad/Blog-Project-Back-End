const express = require("express");
const article = require("../models/blogModel");
const verify = require("../routes/verifyToken");

const router = express.Router();

router.get("/", paginatedResults(article), async (req, res, next) => {
  res.json(res.paginated);
});

router.get("/user/:uid", async (req, res, next) => {
  const articles = await article.find({ userId: req.params.uid });
  res.json(articles);
});

router.get("/:id", async (req, res, next) => {
  try {
    const artcilaya = await article
      .findOne({ _id: req.params.id })
      .populate("userId");
    res.send(artcilaya);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", verify, async (req, res, next) => {
  try {
    const found = await article.findOne({ _id: req.params.id });
    if (!found) return res.send("not found");

    Object.keys(req.body).forEach((key) => {
      found[key] = req.body[key];
    });

    await found.save();
    res.send(found);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", verify, async (req, res, next) => {
  try {
    const id = req.user._id;
    const deleted = await article.deleteOne({ _id: req.params.id });
    if (!deleted) return res.send("no articles found");
    res.send("article deleted");
  } catch (e) {
    next(e);
  }
});

router.post("/", verify, async (req, res, next) => {
  try {
    const id = req.user._id;
    const articleCreated = new article({
      title: req.body.title,
      body: req.body.body,
      imgUrl: req.body.imgUrl,
      tags: req.body.tags,
      userId: req.body.userId,
    });
    await articleCreated.save();

    res.send("article was added successfully");
  } catch (e) {
    next(e);
  }
});

// router.put("/", verify, async (req, res, next) => {
//   try {
//     const id = req.user._id;
//     const found = await user.findOne({ _id: id });
//     if (!found) return res.send("errrr");
//     found.title = req.body.title;

//     await found.save();
//     res.send("edited successfully");
//   } catch (e) {
//     next(e);
//   }
// });

function paginatedResults(model) {
  return async (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};
    if (endIndex < (await model.countDocuments().exec())) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }
    if (startIndex > 0) {
      results.prev = {
        page: page - 1,
        limit: limit,
      };
    }
    try {
      results.results = await model.find().limit(limit).skip(startIndex);

      res.paginated = results;
      next();
    } catch (e) {
      next(e);
    }
  };
}

module.exports = router;
