const jwt = require("jsonwebtoken");
const User = require("@/models/user");
const Token = require("@/models/token");

const responseToken = async (req, res, { user, message }) => {
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
      message: message,
    });
};

const authController = {
  register: async (req, res) => {
    const { email, fullname, username, password } = req.body;

    const user = await new User({
      email,
      fullname,
      username,
      password,
    }).save();

    return await responseToken(req, res, {
      user,
      message: "Successfully register.",
    });
  },

  login: async (req, res) => {
    const { email, password } = req.body;

    const user = await User.login(email, password);

    return await responseToken(req, res, {
      user,
      message: "Successfully login.",
    });
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

      if (token.expiryAt > new Date()) {
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
              message: "Successfully refresh AccessToken.",
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
