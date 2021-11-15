const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const Schema = mongoose.Schema;

const serviceSchema = new Schema({
    title: {
        maxlength: 255,
        minlength: 1,
        required: true,
        trim: true,
        type: String
    },
    content: {
        maxlength: 50000,
        trim: true,
        type: String
    },
    serviceImage: {
        type: String,
        trim: true
    },
    status: {
        type: Boolean,
        required: true
    }
},
    {
        timestamps: true
    });

serviceSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Service', serviceSchema);
