const bcrypt = require("bcrypt");
const User = require("../users/users.model");
const jwt = require("jsonwebtoken");
const { authSchema } = require("../helper/validation_schema");
const config = require("../config");

exports.signup = async (req, res, next) => {
  try {
    const result = await authSchema.validateAsync(req.body);
    const duplicate = await User.findOne({ email: result.email });
    if (duplicate) {
      const error = new Error("Email already in use!");
      error.statusCode = 422;
      throw error;
    }
    const hashedPw = await bcrypt.hash(result.password, 12);
    const user = new User({
      email: result.email,
      password: hashedPw,
      name: result.name,
    });
    await user.save();
    res.status(201).json({
      message: "User created  successfully.",
    });
  } catch (err) {
    if (err.isJoi === true) {
      err.statusCode = 422;
    }
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("A user with this email could not be found");
      error.statusCode = 401;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (isEqual !== true) {
      const error = new Error("Wrong password!");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        userId: user._id.toString(),
      },
      `${config.app.secret}`,
      { expiresIn: "1h" }
    );
    res.status(200).json({
      message: "User logged in successfully",
      username: user.name,
      token: token,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.userVerification = (creator, loggedInUser) => {
  if (creator !== loggedInUser) {
    const error = new Error("Could not find post.");
    error.statusCode = 403;
    throw error;
  }
}