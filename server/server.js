const express = require("express");
const app = express();
require("dotenv").config();
const userRouter = require("./Router/UserRoute");
const userControlleer = require("./Controllers/UserController");

const port = 5000;

//connect database
const connectDb = require("./Services/ConnectDbService");
connectDb();

//middleware router
app.use("/users", userRouter);

//router

app.listen(process.env.PORT, function () {
  console.log("server is running");
});
