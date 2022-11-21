const { validationResult } = require("express-validator/check");
const bcrypt = require("bcrypt");
const User = require("../models/users");

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  const { email, name, password } = req.body;
  try {
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed.");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const hashedPw = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      password: hashedPw,
      name: name,
    });
    await user.save();
    res.status(201).json({
      message: "User created  successfully.",
    });
  } catch (err) {
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
    console.log(user)
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
    res.status(201).json({
      message: "User logged in successfully",
      user: user.name,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
