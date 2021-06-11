


const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PolicyInfoSchema = new Schema({
    policy_number: {
        type: String,
        required:true
    },
    policy_start_date: {
        type: Date,
    },
    policy_end_date: {
        type: Date,
    },
    policy_category_ID: {
        type: ObjectId,
        
    },
    company_ID: {
        type: ObjectId,
        
    },
    user_ID: {
        type: ObjectId
    }
})


PolicyInfoSchema.index({ policy_number: 1 }, { unique: true });

module.exports = User = mongoose.model("PolicyInfo", PolicyInfoSchema);