const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AgentSchema = new Schema({
  agent_name: {
    type: String,
  }
});

AgentSchema.index({ agent_name: 1 });

module.exports = Agent = mongoose.model("Agent", AgentSchema);