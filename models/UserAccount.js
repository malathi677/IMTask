const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserAccountSchema = new Schema({
  accountName: {
    type: String,
  }
});

module.exports = UserAccount = mongoose.model("UserAccount", UserAccountSchema);