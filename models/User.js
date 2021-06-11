const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  first_name: {
    type: String,
    required:true
  },
  dob: {
    type: Date,
  },
  address: {
    type: String,
  },
  phone_number: {
    type: Number,
  },
  state: {
    type: String,
  },
  zipcode: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
  },
  user_type: {
    type: String,
  },
  policy_number: {
    type: String
  }
});


UserSchema.index({ first_name: 1 }, { unique: true });
module.exports = User = mongoose.model("User", UserSchema);
