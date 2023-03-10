// const port = 8000;
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const bodyParser = require("body-parser");

const app = express();
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to mongodb");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ credentials: true, origin: true }));
app.use(bodyParser.json());

app.use("/auth", authRoute);
app.use("/user", userRoute);

app.get("/", (req, res) => {
  res.send("t-movie API");
});

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`sever is running at ${process.env.PORT}`);
  });
});
