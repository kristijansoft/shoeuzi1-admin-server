const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const Schema = mongoose.Schema;

const orderstatuesSchema = new Schema({
    name: {
        maxlength: 200,
        minlength: 1,
        required: true,
        trim: true,
        type: String
    },
    status: {
        type: Boolean,
        default: true
    }
},
    {
        timestamps: true
    });

orderstatuesSchema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('OrderStatuses', orderstatuesSchema);
