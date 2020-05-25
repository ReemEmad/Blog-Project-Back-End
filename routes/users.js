const express = require("express");
const user = require("../models/userModel");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const verify = require("../routes/verifyToken");
const router = express.Router();

// db.getCollection('feed').find({"_id" : {"$in" : [ObjectId("55880c251df42d0466919268"), ObjectId("55bf528e69b70ae79be35006")]}});

//return name of followers
router.get("/following/:id", verify, async (req, res, next) => {
  const found = await user.findOne({ _id: req.params.id }, "following");

  var ids = [];
  found.following.forEach((item) => {
    ids.push(item._id.toString());
  });

  var names = [];
  user.find({ _id: { $in: ids } }).then((u) => {
    u.forEach((item) => {
      names.push({ name: item.fullname, _id: item._id });
      return names;
    });
    res.send(names);
  });
});

//get by id
router.get("/:id", verify, async (req, res, next) => {
  try {
    const found = await user.findOne({ _id: req.params.id });
    res.send(found);
  } catch (err) {
    next(err);
  }
});

//getall
router.get("/", verify, async (req, res, next) => {
  try {
    const found = await user.find();
    res.send(found);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/Register",
  check("password").isLength({ min: 8 }),
  check("username").isEmail(),
  check("fullname").isLength({ min: 8 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      //check if user is already in the database
      const emailExist = await user.findOne({ username: req.body.username });
      if (emailExist) return res.status(400).send("Email already exists");

      const userFound = new user({
        username: req.body.username,
        password: req.body.password,
        fullname: req.body.fullname,
      });
      await userFound.save();
      const token = jwt.sign({ userFound }, process.env.TOKEN_SECRET);
      res
        .header("x-auth-token", token)
        .header("access-control-expose-headers", "x-auth-token")
        .send("user was added successfully");
    } catch (e) {
      next(e);
    }
  }
);

router.get("/blog", verify, async (req, res, next) => {
  try {
    const user = req.user;
    console.log(user);
    // const artcilaya = await article.findOne({ _id: req.params.id });

    // res.send(artcilaya);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/login",
  check("password").isLength({ min: 8 }),
  check("username").isEmail(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const userFound = await user.findOne({ username: req.body.username });
      if (!userFound) return res.status(400).send("Email doesn't exist");

      const isMatch = userFound.isValidPassword(req.body.password);
      if (!isMatch) return res.status(400).send("Password is not correct");

      const token = jwt.sign({ userFound }, process.env.TOKEN_SECRET);
      res.header("auth-token", token).send(token);
    } catch (e) {
      next(e);
    }
  }
);

router.patch("/", verify, async (req, res, next) => {
  try {
    const idFound = req.user._id;
    const found = await user.findOne({ _id: idFound });
    if (!found) return res.send("not found");

    Object.keys(req.body).forEach((key) => {
      found[key] = req.body[key];
    });

    await found.save();
    res.send(found.folllowing);
  } catch (e) {
    next(e);
  }
});

router.post("/:userId/follow-user", verify, (req, res, next) => {
  if (req.user._id == req.params.userId)
    return res.status(400).send("you cannot follow yourself dummy!!");

  user.findOne({ _id: req.user._id }).then((userItem) => {
    const myArr = userItem.following.filter((follower) => {
      return follower._id.toString() == req.params.userId.toString();
    });

    if (myArr.length !== 0)
      return res.status(400).send("you already follow them");
    userItem.following.push(req.params.userId);
    userItem.save();
    console.log(userItem);
    user
      .findOne({ _id: req.params.userId })
      .then((u) => {
        u.followers.push(req.user._id);
        u.save();
      })
      .catch((e) => res.send(e));
    res.send("you followed them");
  });
});

router.post("/:userId/unfollow-user", verify, (req, res, next) => {
  if (req.user._id == req.params.userId)
    return res.status(400).send("you cannot unfollow yourself dummy!!");

  user.findOne({ _id: req.user._id }).then((userItem) => {
    const myArr = userItem.following.filter((follower) => {
      return follower._id.toString() !== req.params.userId.toString();
    });

    if (myArr.length === 0)
      return res.status(400).send("you already don't follow them");

    const index = userItem.following.findIndex(
      ({ _id }) => _id == req.params.userId
    );
    userItem.following.splice(index, 1);
    userItem.save();
    user
      .findOne({ _id: req.params.userId })
      .then((u) => {
        const index = u.followers.indexOf(req.user._id);
        u.followers.splice(index, 1);
        u.save();
      })
      .catch((e) => res.send(e));
    res.send("you unfollowed them");
  });
});

module.exports = router;
