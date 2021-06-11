const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  message: {
    type: String,
  },
  timeStamp: {
    type: Number,
    required: true,
    index:true
  }
});

module.exports = Message = mongoose.model("Message", MessageSchema);
