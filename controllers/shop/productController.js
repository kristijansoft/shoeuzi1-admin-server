const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
let path = require('path');
const httpStatus = require('../../lib/httpStatus');
const Product = require('../../models/Product');
const Blog = require('../../models/Blog');
const Order = require('../../models/Order');

const isCouldbeObjectId = (str) => {
  if (typeof str === 'string') {
    return /^[a-f\d]{24}$/i.test(str);
  } else if (Array.isArray(str)) {
    return str.every((arrStr) => /^[a-f\d]{24}$/i.test(arrStr));
  }
  return false;
};

/* Get products */
router.get('/products/:category', [], function (req, res, next) {
  let category = req.params.category || 'available';

  Product.aggregate([
    {
      $lookup: {
        from: 'categories',
        let: { catID: '$category_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: { $eq: ['$_id', '$$catID'] },
              },
            },
          },
        ],
        as: 'categoryData',
      },
    },
    {
      $unwind: {
        path: '$categoryData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        'categoryData.name': new RegExp(category, 'i'),
      },
    },
  ]).exec(function (err, records) {
    if (err)
      return res
        .status(httpStatus.OK)
        .send({ status: false, msg: `Server error: ${err.message}` });
    res.status(httpStatus.OK).send({
      status: true,
      data: records,
    });
  });
});

/* Get products */
router.get('/product/get', [], function (req, res, next) {
  let slug = req.query.slug;
  let productId = req.query.id;
  console.log('slug => ', slug);
  console.log('id => ', productId);
  if (!slug && !productId)
    return res
      .status(httpStatus.OK)
      .send({ status: false, msg: `Slug or Id is required.` });
  if (slug) {
    Product.aggregate([
      {
        $match: {
          slug: slug,
        },
      },
    ]).exec(function (err, records) {
      if (err)
        return res
          .status(httpStatus.OK)
          .send({ status: false, msg: `Server error: ${err.message}` });
      console.log('exec');
      res.status(httpStatus.OK).send({
        status: true,
        data: records,
      });
    });
  } else if (productId) {
    Product.findById(productId).exec(function (err, records) {
      if (err)
        return res
          .status(httpStatus.OK)
          .send({ status: false, msg: `Server error: ${err.message}` });
      console.log('exec');
      res.status(httpStatus.OK).send({
        status: true,
        data: records,
      });
    });
  } else {
    return res
      .status(httpStatus.OK)
      .send({ status: false, msg: `Query error:` });
  }
});

/* BLOGS */
router.get('/blogs/get', [], function (req, res, next) {
  Blog.aggregate([
    {
      $lookup: {
        from: 'blogcategories',
        let: { catID: '$blog_category_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: { $eq: ['$_id', '$$catID'] },
              },
            },
          },
        ],
        as: 'categoryData',
      },
    },
    {
      $unwind: {
        path: '$categoryData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        published: true,
      },
    },
  ]).exec(function (err, records) {
    if (err)
      return res
        .status(httpStatus.OK)
        .send({ status: false, msg: `Server error: ${err.message}` });
    console.log('blog exec');
    res.status(httpStatus.OK).send({
      status: true,
      data: records,
    });
  });
});

/* Get Blog by slug */
router.get('/blog/get', [], function (req, res, next) {
  let slug = req.query.slug;
  let blogId = req.query.id;
  if (!slug && !blogId)
    return res
      .status(httpStatus.OK)
      .send({ status: false, msg: `Slug or Id is required.` });
  if (slug) {
    Blog.aggregate([
      {
        $match: {
          slug: slug,
        },
      },
    ]).exec(function (err, records) {
      if (err)
        return res
          .status(httpStatus.OK)
          .send({ status: false, msg: `Server error: ${err.message}` });
      console.log('exec');
      res.status(httpStatus.OK).send({
        status: true,
        data: records,
      });
    });
  } else if (blogId) {
    Blog.findById(blogId).exec(function (err, records) {
      if (err)
        return res
          .status(httpStatus.OK)
          .send({ status: false, msg: `Server error: ${err.message}` });
      console.log('exec');
      res.status(httpStatus.OK).send({
        status: true,
        data: records,
      });
    });
  } else {
    return res
      .status(httpStatus.OK)
      .send({ status: false, msg: `Query error:` });
  }
});

/* Get Order by username */
router.get('/orders/get', [], function (req, res, next) {
  let userId = req.query.userid;
  if (!userId)
    return res
      .status(httpStatus.OK)
      .send({ status: false, msg: `Id is required.` });
  if (userId && isCouldbeObjectId(userId)) {
    Order.aggregate([
      {
        $match: {
          customer_id: mongoose.Types.ObjectId(userId),
        },
      },
    ]).exec(function (err, records) {
      if (err)
        return res
          .status(httpStatus.OK)
          .send({ status: false, msg: `Server error: ${err.message}` });
      res.status(httpStatus.OK).send({
        status: true,
        data: records,
      });
    });
  } else {
    return res
      .status(httpStatus.OK)
      .send({ status: false, msg: `Query error:` });
  }
});

/* Save order after charge */
router.post('/orders/save', [], function (req, res) {
  const {
    customer_id,
    currency_id,
    orderItems,
    pfirst_name,
    plast_name,
    pcompany,
    paddress1,
    paddress2,
    pcity,
    ppost_code,
    pcountry_id,
    sfirst_name,
    slast_name,
    scompany,
    saddress1,
    saddress2,
    scity,
    spost_code,
    scountry_id,
    payment_method,
    order_statuses_id,
    comment,
    coupon,
    coupon_id,
    couponDiscount,
    couponType,
    total_amount,
    grand_total,
    shipping_cost,
    est_delivery_date,
  } = req.body;

  if (
    !customer_id &&
    !currency_id &&
    !grand_total &&
    !total_amount &&
    !payment_method
  ) {
    return res
      .status(httpStatus.OK)
      .send({ status: false, msg: 'Invalid parameters in request' });
  }
  console.log('Have parameters');

  Order.countDocuments({}, function (err, count) {
    //Save to Mongo
    Order.create(
      {
        order_id: count + 1,
        customer_id: customer_id,
        currency_id: currency_id,
        orderItems: orderItems,
        pfirst_name: pfirst_name,
        plast_name: plast_name,
        pcompany: pcompany,
        paddress1: paddress1,
        paddress2: paddress2,
        pcity: pcity,
        ppost_code: ppost_code,
        pcountry_id: pcountry_id,
        sfirst_name: sfirst_name,
        slast_name: slast_name,
        scompany: scompany,
        saddress1: saddress1,
        saddress2: saddress2,
        scity: scity,
        spost_code: spost_code,
        scountry_id: scountry_id,
        total_amount: total_amount,
        payment_method: payment_method,
        order_statuses_id: order_statuses_id,

        comment: comment,
        coupon_id: coupon_id,
        coupon: coupon,
        grand_total: grand_total,
        couponDiscount: couponDiscount,
        couponType: couponType,
        est_delivery_date: est_delivery_date,
        shipping_cost: shipping_cost,
      },
      function (error, inserted) {
        if (error) {
          const message = `Server error: ${error.message}`;
          console.log(message);
          return res
            .status(httpStatus.OK)
            .send({ status: false, msg: message });
        }
        //update product stock
        for (let p = 0; p < orderItems.length; p++) {
          Product.findByIdAndUpdate(
            orderItems[p]._id,
            { $inc: { quantity: -orderItems[p].quantity } },
            { new: false },
            function (err, data) {
              console.log('update product stock error => ', err);
              if (err)
                return res
                  .status(httpStatus.OK)
                  .send({ status: false, msg: 'Failed To Update' });
            }
          );
        }
        console.log('all done');
        res
          .status(httpStatus.OK)
          .send({ status: true, msg: 'Data Added Successfully!' });
      }
    );
  });
});

module.exports = router;
