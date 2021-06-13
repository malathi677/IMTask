const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let PolicyCarrierSchema = new Schema({
  companyName: {
    type: String,
  },
},{
  versionKey: false 
});

module.exports = Carrier = mongoose.model("Carrier", PolicyCarrierSchema);
