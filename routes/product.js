const express = require("express");
const auth = require("../middleware/auth");
const { Product } = require("../models/product");

const productRouter = express.Router();

productRouter.get("/api/products", auth, async (req, res, next) => {
  try {
    console.log(req.query.category);
    const products = await Product.find({ category: req.query.category });
    return res.json(products._doc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//search api
productRouter.get("/api/search/:query", auth, async (req, res, next) => {
  try {
    const products = await Product.find({
      name: {
        $regex: req.params.query,
        $options: "i",
      },
    });
    return res.json(products._doc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//rate the product
productRouter.post("/api/rate-product", auth, async (req, res) => {
  try {
    const { id, rating } = req.body;
    let product = await Product.findById(id);

    for (let i = 0; i < product.ratings.length; i++) {
      if (product.ratings[i].userId == req.user) {
        product.ratings.splice(i, 1);
        break;
      }
    }

    const ratingSchema = {
      userId: req.user,
      rating,
    };

    product.ratings.push(ratingSchema);

    product = await product.save();

    return res.json(product._doc);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//deal of the day
productRouter.get("/api/deal-of-day", auth, async (req, res) => {
  try {
    let products = await Product.find({});

    products = products.sort((a, b) => {
      let aSum = 0;
      let bSum = 0;

      if (a.ratings) {
        for (let i = 0; i < a.ratings.length; i++) {
          aSum += a.ratings[i].rating;
        }
      }

      if (b.ratings) {
        for (let i = 0; i < b.ratings.length; i++) {
          bSum += b.ratings[i].rating;
        }
      }

      return aSum < bSum ? 1 : -1;
    });

    return res.json(products[0]._doc);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = productRouter;
