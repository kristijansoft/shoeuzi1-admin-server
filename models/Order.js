const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    order_id: {
      type: String,
      unique: true,
    },
    customer_id: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
    currency_id: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
    orderItems: {
      required: true,
      type: Array,
    },
    pfirst_name: {
      required: true,
      type: String,
      maxlength: 255,
      trim: true,
    },
    plast_name: {
      required: true,
      type: String,
      maxlength: 255,
      trim: true,
    },
    pcompany: {
      required: false,
      type: String,
      trim: true,
    },
    paddress1: {
      required: true,
      type: String,
    },
    paddress2: {
      type: String,
    },
    pcity: {
      required: true,
      type: String,
      maxlength: 255,
      trim: true,
    },
    ppost_code: {
      required: true,
      type: String,
      maxlength: 255,
      trim: true,
    },
    pcountry_id: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
    sfirst_name: {
      type: String,
      maxlength: 255,
      trim: true,
    },
    slast_name: {
      type: String,
      maxlength: 255,
      trim: true,
    },
    scompany: {
      type: String,
      trim: true,
    },
    saddress1: {
      type: String,
    },
    saddress2: {
      type: String,
    },
    scity: {
      type: String,
      maxlength: 255,
      trim: true,
    },
    spost_code: {
      type: String,
      maxlength: 255,
      trim: true,
    },
    scountry_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    order_statuses_id: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
    payment_method: {
      required: true,
      type: String,
    },
    comment: {
      type: String,
    },
    coupon_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    coupon: {
      type: String,
    },
    couponDiscount: {
      type: String,
    },
    couponType: {
      type: String,
    },
    shipping_cost: {
      type: Number,
    },
    est_delivery_date: {
      type: Date,
    },
    total_amount: {
      type: String,
    },
    grand_total: {
      type: String,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);
