const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const Schema = mongoose.Schema;

const faqSchema = new Schema({
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
    status: {
        type: Boolean,
        required: true
    }
},
    {
        timestamps: true
    });

faqSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Faq', faqSchema);
