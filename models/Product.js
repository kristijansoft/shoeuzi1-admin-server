const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const productSchema = new Schema(
  {
    product_name: {
      maxlength: 150,
      minlength: 1,
      required: true,
      trim: true,
      type: String,
    },
    slug: {
      type: String,
      trim: true,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    tax_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    model: {
      type: String,
      trim: true,
      required: true,
    },
    size_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    color_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    featured_image: {
      type: String,
      trim: true,
    },
    additional_images: {
      type: Array,
    },
    description: {
      type: String,
      trim: true,
    },
    short_description: {
      type: String,
      trim: true,
    },
    features: {
      type: String,
      trim: true,
    },
    conditions: {
      type: String,
      trim: true,
    },
    return_policy: {
      type: String,
      trim: true,
    },
    is_featured: {
      type: Boolean,
    },
    is_active: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
