const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const Schema = mongoose.Schema;

const currencySchema = new Schema({
    title: {
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
        type: String
    },
    value: {
        type: String,
        required: true
    },
    symbol: {
        maxlength: 100,
        type: String
    },
    status: {
        type: Boolean,
    }
},
    {
        timestamps: true
    });


currencySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Currency', currencySchema);
