const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const Schema = mongoose.Schema;

const exampleSchema = new Schema({
    name: {
        maxlength: 100,
        minlength: 1,
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
exampleSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Example', exampleSchema);
