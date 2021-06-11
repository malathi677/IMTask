const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let PolicyCategorySchema = new Schema({
  category_name: {
    type: String,
  }
});

PolicyCategorySchema.index({ category_name: 1 }, { unique: true });

module.exports = User = mongoose.model("LOB", PolicyCategorySchema);