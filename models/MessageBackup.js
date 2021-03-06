const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageBackUpSchema = new Schema({
  message: {
    type: String,
  },
  timeStamp: {
    type: Number,
      required: true,
    index:true
  }
},{
  versionKey: false 
});

module.exports = MessageBackup = mongoose.model("MessageBackup", MessageBackUpSchema);
