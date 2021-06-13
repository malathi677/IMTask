const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AgentSchema = new Schema({
  agentName: {
    type: String,
  }
},{
  versionKey: false 
});

AgentSchema.index({ agentName: 1 });

module.exports = Agent = mongoose.model("Agent", AgentSchema);