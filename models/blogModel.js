const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const blogSchema = new Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "users",
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

var Blog = mongoose.model("blogs", blogSchema);

module.exports = Blog;
