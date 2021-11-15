const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const Schema = mongoose.Schema;

const roleSchema = new Schema({
    name: {
        maxlength: 255,
        minlength: 2,
        required: true,
        unique: true,
        trim: true,
        type: String
    },
    permissions: {
        required: true,
        type: Array
    },
    description: {
        required: false,
        type: String
    }
},
    {
        timestamps: true
    });

roleSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Role', roleSchema);
