const express = require("express");
const app = express();
const cors = require("cors");
const port = 3001;
require("./db");
const articlesRoute = require("../routes/articles");
const usersRoute = require("../routes/users");
const userRouter = require("../routes/user");

//Middlewares
app.use(cors());
app.use(express.json());
app.use("/user", userRouter);
app.use("/users", usersRoute);
app.use("/articles", articlesRoute);
//Routes

app.get("/", (req, res) => {
  res.send("we are on home");
});

app.use((err, req, res, next) => {
  res.send(err);
});
app.listen(process.env.PORT || port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
