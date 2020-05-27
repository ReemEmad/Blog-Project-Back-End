const mongoose = require("mongoose");
var Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const saltRounds = 10;

var userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    min: 7,
  },
  fullname: {
    type: String,
    min: 8,
  },
  following: {
    type: [{ _Id: mongoose.Types.ObjectId }],
  },
  followers: {
    type: [{ follower_Id: mongoose.Types.ObjectId }],
  },
});

userSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashed = await bcrypt.hash(this.password, salt);
    this.password = hashed;
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.isValidPassword = async function (newPassword) {
  try {
    return await bcrypt.compare(newPassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};
var users = mongoose.model("Users", userSchema,"Users");

module.exports = users;
