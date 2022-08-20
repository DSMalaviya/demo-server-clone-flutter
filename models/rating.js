const mongoose = require("mongoose");

const ratingsSchema = mongoose.Schema({
  userId: {
    type: String,
    require: true,
  },
  rating: {
    type: Number,
    require: true,
  },
});

module.exports = ratingsSchema;
