const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const userRouter = require("./Router/UserRoute");
const authRoute = require("./Router/AuthRoute");
const documentRoute = require("./Router/DocumentRoute");
const personalRoute = require("./Router/PersonalRoute");

//cors middleware for all request
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

//connect database
const connectDb = require("./Services/ConnectDbService");
connectDb();

//middleware router
app.use("/auth/admin", userRouter);
app.use("/api/personal", personalRoute);
app.use("/api/auth", authRoute);
app.use("/api/documents", documentRoute);

app.listen(process.env.PORT, function () {
  console.log("server is running");
});
