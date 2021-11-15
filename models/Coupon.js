const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const Schema = mongoose.Schema;

const couponSchema = new Schema({
    name: {
        maxlength: 100,
        minlength: 1,
        required: true,
        trim: true,
        type: String
    },
    code: {
        maxlength: 100,
        minlength: 1,
        required: true,
        trim: true,
        type: String,
        unique: true
    },
    type: {
        maxlength: 100,
        type: String
    },
    discount: {
        maxlength: 100,
        trim: true,
        type: String
    },
    date_start: {
        type: Date,
        default: Date.now()
    },
    date_end: {
        type: Date,
    },
    status: {
        type: Boolean,
        default: true
    }
},
    {
        timestamps: true
    });


couponSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Coupon', couponSchema);
