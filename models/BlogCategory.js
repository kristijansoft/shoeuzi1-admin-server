const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const Schema = mongoose.Schema;

const blogCategorySchema = new Schema({
    name: {
        maxlength: 100,
        minlength: 1,
        required: true,
        trim: true,
        type: String
    },
    slug: {
        maxlength: 100,
        minlength: 1,
        trim: true,
        type: String
    },
    meta_title: {
        maxlength: 100,
        trim: true,
        type: String
    },
    meta_keyword: {
        maxlength: 1000,
        trim: true,
        type: String
    },
    meta_description: {
        maxlength: 5000,
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


blogCategorySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('BlogCategory', blogCategorySchema);
