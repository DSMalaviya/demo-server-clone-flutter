const express = require("express");
const adminRouter = express.Router();
const admin = require("../middleware/admin");
const Product = require("../models/product");
const Order = require("../models/order");

//add product
adminRouter.post("/admin/add-product", admin, async (req, res, next) => {
  try {
    const { name, description, images, quantity, price, category } = req.body;
    let product = new Product({
      name,
      description,
      images,
      quantity,
      price,
      category,
    });
    product = await product.save();
    return res.json(product._doc);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//get all the products
// /admin/get-products

adminRouter.get("/admin/get-products", admin, async (req, res, next) => {
  try {
    const products = await Product.find();
    return res.json(products._doc);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//delete the product
adminRouter.post("/admin/delete-product", admin, async (req, res, next) => {
  try {
    const { id } = req.body;
    let product = await Product.findByIdAndDelete(id);
    return res.status(200).json(product._doc);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//change status of order
adminRouter.post(
  "/admin/change-order-status",
  admin,
  async (req, res, next) => {
    try {
      const { id, status } = req.body;
      let order = await Order.findById(id);
      order.status = status;
      order = await order.save();
      return res.json(order._doc);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
);

adminRouter.get("/admin/analytics", admin, async (req, res) => {
  const orders = Order.find({});
  let totalEarnings = 0;

  for (let i = 0; i < orders.length; i++) {
    for (let j = 0; j < orders[i].products.length; j++) {
      totalEarnings +=
        orders[i].products[j].quantity * orders[i].products[j].product.price;
    }
  }

  let mobileEarnings = await fetchCategoryWiseProduct("Mobiles");
  let essentialEarnings = await fetchCategoryWiseProduct("Essentials");
  let applianceEarnings = await fetchCategoryWiseProduct("Appliances");
  let booksEarnings = await fetchCategoryWiseProduct("Books");
  let fashionEarnings = await fetchCategoryWiseProduct("Fashion");

  let earnings = {
    totalEarnings,
    mobileEarnings,
    essentialEarnings,
    applianceEarnings,
    booksEarnings,
    fashionEarnings,
  };

  return res.json(earnings);
});

async function fetchCategoryWiseProduct(category) {
  let earnings = 0;
  let catgoryOrders = await Order.find({
    "products.product.category": category,
  });

  for (let i = 0; i < catgoryOrders.length; i++) {
    for (let j = 0; j < catgoryOrders[i].products.length; j++) {
      earnings +=
        catgoryOrders[i].products[j].quantity *
        catgoryOrders[i].products[j].product.price;
    }
  }

  return earnings;
}

module.exports = adminRouter;
