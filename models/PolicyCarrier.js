const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let PolicyCarrierSchema = new Schema({
  company_name: {
    type: String,
  },
});


PolicyCarrierSchema.index({ company_name: 1 }, { unique: true });

module.exports = User = mongoose.model("Carrier", PolicyCarrierSchema);
