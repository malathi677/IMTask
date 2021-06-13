const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let PolicyCategorySchema = new Schema({
  categoryName: {
    type: String,
  }
},{
  versionKey: false 
});


module.exports = Category = mongoose.model("LOB", PolicyCategorySchema);