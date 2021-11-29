const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const Schema = mongoose.Schema;

const blogSchema = new Schema(
  {
    title: {
      maxlength: 100,
      minlength: 1,
      required: true,
      trim: true,
      type: String,
    },
    subTitle: {
      maxlength: 100,
      minlength: 1,
      required: true,
      trim: true,
      type: String,
    },
    slug: {
      maxlength: 100,
      trim: true,
      type: String,
    },
    content: {
      maxlength: 10000,
      minlength: 1,
      trim: true,
      required: true,
      type: String,
    },
    buttonText: {
      maxlength: 100,
      minlength: 1,
      required: true,
      trim: true,
      type: String,
    },
    publishDate: {
      type: Date,
      default: Date.now(),
    },
    blogImage: {
      trim: true,
      type: String,
      maxlength: 250,
      minlength: 1,
    },
    blog_category_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    blog_tag_id: {
      type: [mongoose.Schema.Types.ObjectId],
    },
    meta_title: {
      maxlength: 100,
      trim: true,
      type: String,
    },
    meta_keyword: {
      maxlength: 1000,
      trim: true,
      type: String,
    },
    meta_description: {
      maxlength: 5000,
      trim: true,
      type: String,
    },
    published: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

blogSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Blog', blogSchema);
