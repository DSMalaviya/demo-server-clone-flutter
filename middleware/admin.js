const jwt = require("jsonwebtoken");
const User = require("../models/user");

const admin = async (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) {
      return req.status(401).json({ msg: "No auth token,access denied" });
    }
    const verified = jwt.verify(token, "dummySecretKey");
    if (!verified)
      return res
        .status(401)
        .json({ msg: "Token verification failed,access denied" });
    const user = await User.findById(verified.id);
    if (user.type == "user" || user.type == "seller") {
      return res.status(401).json({ msg: "You are not an admin" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

module.exports = admin;
