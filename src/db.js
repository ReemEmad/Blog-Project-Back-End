const mongoose = require("mongoose");
require("dotenv/config");

var mongoDB = process.env.DB_CONNECTION;
mongoose.connect(
  mongoDB,
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
  () => {
    console.log("connected to db!");
  }
);

var db = mongoose.connection;
