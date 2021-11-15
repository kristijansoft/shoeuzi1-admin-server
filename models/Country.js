const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const Schema = mongoose.Schema;

const countrySchema = new Schema({
    name: {
        maxlength: 100,
        minlength: 2,
        required: true,
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


countrySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Country', countrySchema);
