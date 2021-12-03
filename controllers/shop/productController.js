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

module.exports = router;
