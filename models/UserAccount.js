const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserAccountSchema = new Schema({
  account_name: {
    type: String,
  }
});


UserAccountSchema.index({ account_name: 1 }, { unique: true });
module.exports = User = mongoose.model("UserAccount", UserAccountSchema);