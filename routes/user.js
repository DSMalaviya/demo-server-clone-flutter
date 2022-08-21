const express = require("express");
const userRouter = express.Router();
const auth = require("../middleware/auth");
const { Product } = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");

userRouter.post("/api/add-to-cart", auth, async (req, res) => {
  try {
    const { id } = req.body;
    const product = await Product.findById(id);
    let user = await User.findById(req.user);

    if (user.cart === null || user.cart === undefined) {
      user.cart = [];
    }

    if (user.cart.length == 0) {
      console.log("ghy");
      user.cart.push({ product, quantity: 1 });
    } else {
      let isProductFound = false;
      for (let i = 0; i < user.cart.length; i++) {
        if (user.cart[i].product._id.toString() === id) {
          isProductFound = true;
          user.cart[i].quantity += 1;
          break;
        }
      }
      if (!isProductFound) {
        user.cart.push({ product, quantity: 1 });
      }
    }
    user = await user.save();
    return res.json(user._doc);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

userRouter.delete("/api/remove-from-cart/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    let user = await User.findById(req.user);

    for (let i = 0; i < user.cart.length; i++) {
      if (user.cart[i].product._id.toString() === id) {
        if (user.cart[i].quantity > 1) {
          user.cart[i].quantity -= 1;
        } else {
          user.cart.splice(i, 1);
        }
      }
    }

    user = await user.save();
    return res.json(user._doc);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//save user address
userRouter.post("/api/save-user-address", auth, async (req, res) => {
  try {
    const { address } = req.body;
    let user = await User.findById(req.user);
    user.address = address;
    user = await user.save();
    return res.json(user._doc);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//order product
userRouter.post("/api/order", auth, async (req, res) => {
  try {
    const { cart, totalPrice, address } = req.body;
    let products = [];

    for (let i = 0; i < cart.length; i++) {
      let product = await Product.findById(cart[i].product._id);
      if (product.quantity >= cart[i].quantity) {
        product.quantity -= cart[i].quantity;
        products.push({ product, quantity: cart[i].quantity });
        await product.save();
      } else {
        return res
          .status(400)
          .json({ msg: "product is out of stock right now" });
      }
    }

    let user = await User.findById(req.user);
    user.cart = [];
    await user.save();

    let order = new Order({
      products,
      totalPrice,
      address,
      userId: req.user,
      orderedAt: new Date().getTime(),
    });

    order = await order.save();

    return res.json(order._doc);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//get order list
userRouter.get("api/get-order-list", auth, async (req, res) => {
  try {
    let orders = await Order.find({ userId: req.user });
    return res.json(orders._doc);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = userRouter;
