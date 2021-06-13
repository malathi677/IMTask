const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserAccountSchema = new Schema({
  accountName: {
    type: String,
  }
},{
  versionKey: false 
});

module.exports = UserAccount = mongoose.model("UserAccount", UserAccountSchema);