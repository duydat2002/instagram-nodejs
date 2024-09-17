require("module-alias/register");
const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const routes = require("./routes");
const socketHandle = require("./sockets");

dotenv.config();

const app = express();

app.use(function (req, res, next) {
  res.setHeader(
    "Content-Security-Policy-Report-Only",
    "default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; frame-src 'self'"
  );

  next();
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "https://admin.socket.io",
      "https://instagram-mevn.vercel.app",
      "http://localhost:5555",
      "http://localhost:5173",
    ],
    credentials: true,
  },
});

instrument(io, {
  auth: false,
  mode: "development",
});

app.use(
  cors({
    origin: ["https://instagram-mevn.vercel.app", "http://localhost:5173"],
  })
);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("GET request to homepage");
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

socketHandle(io);
global.io = io;

routes(app);

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING)
  .then(() => {
    console.log(`Connected to ${process.env.MONGODB_CONNECTION_STRING}`);
    server.listen(process.env.PORT, () => {
      console.log(`Instagram running onn PORT: ${process.env.PORT}`);
    });
  })
  .catch((err) => console.log(err));

mongoose.set("toJSON", { virtuals: true });
mongoose.set("toObject", { virtuals: true });
