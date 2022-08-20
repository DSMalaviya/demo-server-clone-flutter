//import from packages
const express = require("express");
const mongoose = require("mongoose");

//import from other files
const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin");
const productRouter = require("./routes/product");
const userRouter = require("./routes/user");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.get("/test-api", async (req, res) => {
  return res.json({ msg: "Test api is running fine" });
});
app.use(authRouter);
app.use(adminRouter);
app.use(productRouter);
app.use(userRouter);

//connections
mongoose.connect(
  "mongodb+srv://darshan:iKTpwwbmudczMDno@amazonclone.aaeq9ut.mongodb.net/?retryWrites=true&w=majority"
);

app.listen(PORT, "0.0.0.0", function () {
  console.log(`connected at port ${PORT}`);
});

// iKTpwwbmudczMDno
//darshan
