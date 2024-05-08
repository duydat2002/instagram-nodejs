require("module-alias/register");
const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const routes = require("./routes");

dotenv.config();

const app = express();

app.use(function (req, res, next) {
  res.setHeader(
    "Content-Security-Policy-Report-Only",
    "default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; frame-src 'self'"
  );

  next();
});

app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("GET request to homepage");
});

routes(app);

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING)
  .then(() => {
    console.log(`Connected to ${process.env.MONGODB_CONNECTION_STRING}`);
    app.listen(process.env.PORT, () => {
      console.log(`Instagram running onn PORT: ${process.env.PORT}`);
    });
  })
  .catch((err) => console.log(err));

mongoose.set("toJSON", { virtuals: true });
