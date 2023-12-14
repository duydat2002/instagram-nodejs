const { validate } = require("deep-email-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("@/models/user");
const Token = require("@/models/token");
const { handleErrors } = require("@/handlers/errorHandlers");

const authController = {
  register: async (req, res) => {
    try {
      const { email, fullname, username, password } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          result: null,
          message: "Email is required.",
        });
      }
      const validateEmail = await validate(email);
      if (!validateEmail.valid) {
        return res.status(400).json({
          success: false,
          result: null,
          message: validateEmail.validators[validateEmail.reason].reason,
        });
      }

      if (!username) {
        return res.status(400).json({
          success: false,
          result: null,
          message: "Username is required.",
        });
      }

      if (!password) {
        return res.status(400).json({
          success: false,
          result: null,
          message: "Password is required.",
        });
      }
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          result: null,
          message: "Password must be greater than 8 characters.",
        });
      }

      const user = await new User({
        email,
        fullname,
        username,
        password,
      }).save();

      const accessToken = jwt.sign(
        { id: user._id, username: user.username },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_LIFE }
      );
      const refreshToken = jwt.sign(
        { id: user._id, username: user.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_LIFE }
      );

      await new Token({
        user: user._id,
        token: refreshToken,
      }).save();

      return res
        .status(200)
        .cookie("access_token", accessToken, {
          maxAge: process.env.ACCESS_TOKEN_LIFE,
          sameSite: "Lax",
          httpOnly: true,
          secure: false,
          domain: req.hostname,
          path: "/",
          Partitioned: true,
        })
        .cookie("refresh_token", refreshToken, {
          maxAge: process.env.REFRESH_TOKEN_LIFE,
          sameSite: "Lax",
          httpOnly: true,
          secure: false,
          domain: req.hostname,
          path: "/",
          Partitioned: true,
        })
        .json({
          success: true,
          result: { accessToken, refreshToken },
          message: "Successfully register.",
        });
    } catch (error) {
      const errors = handleErrors(error);
      console.log(errors);
      let message = "Something went wrong.";
      if (error.code == 11000) {
        message = `This ${Object.keys(error.keyValue || {})[0]} already exists`;
      }

      return res.status(500).json({
        success: false,
        result: null,
        message,
      });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          result: null,
          message: "Email is required.",
        });
      }

      if (!password) {
        return res.status(400).json({
          success: false,
          result: null,
          message: "Password is required.",
        });
      }

      const user = await User.findOne({ email: email });

      if (!user) {
        return res.status(404).json({
          success: false,
          result: null,
          message: "No account with this email has been registered.",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(403).json({
          success: false,
          result: null,
          message: "Invalid credentials.",
        });
      } else {
        const accessToken = jwt.sign(
          { id: user._id, username: user.username },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: process.env.ACCESS_TOKEN_LIFE }
        );
        const refreshToken = jwt.sign(
          { id: user._id, username: user.username },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: process.env.REFRESH_TOKEN_LIFE }
        );

        await new Token({
          user: user._id,
          token: refreshToken,
        }).save();

        return res
          .status(200)
          .cookie("access_token", accessToken, {
            maxAge: process.env.ACCESS_TOKEN_LIFE,
            sameSite: "Lax",
            httpOnly: true,
            secure: false,
            domain: req.hostname,
            path: "/",
            Partitioned: true,
          })
          .cookie("refresh_token", refreshToken, {
            maxAge: process.env.REFRESH_TOKEN_LIFE,
            sameSite: "Lax",
            httpOnly: true,
            secure: false,
            domain: req.hostname,
            path: "/",
            Partitioned: true,
          })
          .json({
            success: true,
            result: { accessToken, refreshToken },
            message: "Successfully login.",
          });
      }
    } catch (error) {
      const errors = handleErrors(error);
      console.log(errors);
      return res.status(500).json({
        success: false,
        result: null,
        message: "Something went wrong.",
      });
    }
  },

  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(403).json({
          success: false,
          result: null,
          message: "Refresh token is required.",
        });
      }

      const token = await Token.findOne({ token: refreshToken });

      if (!token) {
        return res.status(403).json({
          success: false,
          result: null,
          message: "Refresh token does not exist.",
        });
      }

      const expiryDate = new Date(
        new Date(token.createdAt) + process.env.REFRESH_TOKEN_LIFE
      );
      if (expiryDate > new Date()) {
        await Token.findOneAndDelete({ token: token.token });
        return res.status(403).json({
          success: false,
          result: null,
          message:
            "Refresh token was expired. Please make a new signin request.",
        });
      }

      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
          if (err) {
            return res.status(403).json({
              success: false,
              result: null,
              message: "Refresh token is invalid.",
            });
          }

          const newAccessToken = jwt.sign(
            { id: decoded.id, username: decoded.username },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_LIFE }
          );

          return res
            .status(200)
            .cookie("access_token", newAccessToken, {
              maxAge: process.env.ACCESS_TOKEN_LIFE,
              sameSite: "Lax",
              httpOnly: true,
              secure: false,
              domain: req.hostname,
              path: "/",
              Partitioned: true,
            })
            .json({
              success: true,
              result: { accessToken: newAccessToken, refreshToken },
              message: "Successfully login.",
            });
        }
      );
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        result: null,
        message: "Something went wrong.",
        error,
      });
    }
  },

  logout: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(500).json({
          success: false,
          result: null,
          message: "Refresh token is invalid.",
        });
      }
      await Token.findOneAndDelete({ token: refreshToken });

      return res
        .clearCookie("access_token")
        .clearCookie("refresh_token")
        .status(200)
        .json({
          success: true,
          result: null,
          message: "Successfully logout.",
        });
    } catch (error) {
      return res.status(500).json({
        success: false,
        result: null,
        message: "Something went wrong.",
      });
    }
  },
};

module.exports = authController;
