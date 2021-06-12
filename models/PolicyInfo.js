


const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PolicyInfoSchema = new Schema({
    policyNumber: {
        type: String,
        required: true,
        index: true,
        unique:true
    },
    policyStartDate: {
        type: Date,
    },
    policyEndDate: {
        type: Date,
    },
    policyCategoryId: {
        type: Schema.Types.ObjectId,
        
    },
    companyId: {
        type: Schema.Types.ObjectId,
        
    },
    userId: {
        type: Schema.Types.ObjectId
    }
})


//PolicyInfoSchema.index({ policyNumber: 1 }, { unique: true });

module.exports = PolicyInfo = mongoose.model("PolicyInfo", PolicyInfoSchema);