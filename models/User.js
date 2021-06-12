const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    index:true
  },
  dob: {
    type: Date,
  },
  address: {
    type: String,
  },
  phone: {
    type: String,
  },
  state: {
    type: String,
  },
  zip: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
  },
  userType: {
    type: String,
  },
  agentId: {
    type: Schema.Types.ObjectId,
  },
});

module.exports = User = mongoose.model("User", UserSchema);
