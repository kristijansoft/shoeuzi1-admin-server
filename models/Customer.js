const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const Schema = mongoose.Schema;

const customerSchema = new Schema(
  {
    first_name: {
      maxlength: 255,
      minlength: 1,
      required: true,
      trim: true,
      type: String,
    },
    last_name: {
      maxlength: 255,
      trim: true,
      type: String,
    },
    email: {
      lowercase: true,
      maxlength: 255,
      minlength: 5,
      required: false,
      trim: true,
      type: String,
      unique: true,
    },
    phone_no: {
      maxlength: 100,
      type: Number,
    },
    password: {
      required: true,
      type: String,
    },
    profileImage: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      required: true,
    },
    token: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

customerSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Customer', customerSchema);
