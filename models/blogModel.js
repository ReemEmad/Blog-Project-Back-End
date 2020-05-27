const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const blogSchema = new Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "Users",
  },
  title: {
    type: String,
    minlength: 2,
    maxlength: 60,
  },
  body: {
    type: String,
    minlength: 300,
    maxlength: 1000,
  },
  imgUrl: {
    type: String,
  },
  tags: {
    type: [String],
    maxlength: 100,
  },
});

var Blog = mongoose.model("Blogs", blogSchema,"Blogs");

module.exports = Blog;
