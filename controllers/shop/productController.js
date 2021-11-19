const express = require('express');
const { Mongoose } = require('mongoose');
const router = express.Router();
let path = require('path');
const httpStatus = require('../../lib/httpStatus');
const Product = require('../../models/Product');

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

module.exports = router;
