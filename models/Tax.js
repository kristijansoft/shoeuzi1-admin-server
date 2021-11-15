const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const Schema = mongoose.Schema;

const taxSchema = new Schema({
    name: {
        maxlength: 100,
        minlength: 1,
        required: true,
        trim: true,
        type: String,
        unique: true
    },
    rate: {
        required: true,
        type: Number
    },
    type: {
        required: true,
        type: String
    },
    status: {
        type: Boolean,
        required: true
    }
},
    {
        timestamps: true
    });


taxSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Tax', taxSchema);
