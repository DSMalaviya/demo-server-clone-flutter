const express = require("express");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const auth = require("../middleware/auth");

const authRouter = express.Router();

//SIGNUP
authRouter.post("/api/signup", async (req, res, next) => {
  try {
    console.log(req.body);
    //get the data from client
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ msg: "User with same email already exists" });
    }

    const hashedpassword = await bcryptjs.hash(password, 8);

    let user = new User({
      name,
      email,
      password: hashedpassword,
    });

    user = await user.save();
    return res.json(user);
    //_v
    //id

    //post the data in database
    //return the data to the user
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

//signIn route
authRouter.post("/api/signin", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res
        .status(400)
        .json({ msg: "User with this email is not exists" });
    }
    const ismatch = await bcryptjs.compare(password, user.password);
    if (!ismatch) {
      return res.status(400).json({ msg: "Incorrect password" });
    }
    const token = jwt.sign({ id: user._id }, "dummySecretKey", {
      expiresIn: "90 days",
    });
    return res.json({ token, ...user._doc });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

authRouter.post("/tokenIsValid", async (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) {
      return res.json(false);
    }
    const verified = jwt.verify(token, "dummySecretKey");
    if (!verified) {
      return res.json(false);
    }

    const user = await User.findById(verified.id);
    if (!user) {
      return res.json(false);
    }
    return res.json(true);
  } catch (error) {
    return res.status(500).json({ error: e.message });
  }
});

//get user data
authRouter.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user);
  res.json({ ...user._doc, token: req.token });
});

module.exports = authRouter;
