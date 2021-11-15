const express = require('express');
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

module.exports = router;
