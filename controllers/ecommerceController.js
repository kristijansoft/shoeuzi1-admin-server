const express = require('express');
const router = express.Router();
const httpStatus = require('../lib/httpStatus');
const verifyToken = require('../lib/verifyToken');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Size = require('../models/Size');
const Color = require('../models/Color');
const Country = require('../models/Country');
const Currency = require('../models/Currency');
const Coupon = require('../models/Coupon');
const OrderStatuses = require('../models/OrderStatuses');
const Tax = require('../models/Tax');
const Order = require('../models/Order');
let path = require('path');

var multer = require('multer');
const fs = require('fs');
const checkPermissions = require('../lib/checkPermissions');

var slugify = require('slugify');

// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/productImages');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

var upload = multer({ storage: storage });

/************************************************************** 
  Category Routes 
**************************************************************/

//Category List
router.get(
  '/categoryList',
  [verifyToken, checkPermissions.check('read', 'Category')],
  function (req, res, next) {
    let page = parseInt(req.query.currentPage, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 10;
    let fsort = req.query.sort;
    let forder = req.query.order;
    let filterData = {};
    let sort = '-createdAt';

    if (fsort != '') {
      if (forder == 'ASC') {
        sort = fsort;
      } else if (forder == 'DESC') {
        sort = '-' + fsort;
      }
    }

    if (req.query.keyword != '') {
      filterData = { name: { $regex: req.query.keyword, $options: 'i' } };
    }

    Category.countDocuments(filterData, function (err, count) {
      Category.find(filterData)
        .skip(page > 0 ? (page - 1) * limit : 0)
        .limit(limit)
        .sort(`${sort}`)
        .exec(function (err, records) {
          if (err)
            return res
              .status(httpStatus.OK)
              .send({ status: false, msg: `Server error: ${err.message}` });
          res.status(httpStatus.OK).send({
            status: true,
            data: records,
            page: page,
            per_page: limit,
            total: count,
            total_pages: Math.ceil(count / limit),
          });
        });
    });
  }
);

//Category Add Route
router.post(
  '/categoryAdd',
  [verifyToken, checkPermissions.check('create', 'Category')],
  function (req, res) {
    const { name, status } = req.body;

    if (!name) {
      return res
        .status(httpStatus.OK)
        .send({ status: false, msg: 'Invalid parameters in request' });
    }

    //Save to Mongo
    Category.create(
      {
        name: name,
        status: status,
      },
      function (error, inserted) {
        if (error) {
          const message = `Server error: ${error.message}`;
          return res
            .status(httpStatus.OK)
            .send({ status: false, msg: message });
        }
        res
          .status(httpStatus.OK)
          .send({ status: true, msg: 'Data Added Successfully!' });
      }
    );
  }
);

//Category Update Route
router.put(
  '/categoryEdit/:id',
  [verifyToken, checkPermissions.check('update', 'Category')],
  function (req, res) {
    const { name, status } = req.body;

    if (!name) {
      return res
        .status(httpStatus.OK)
        .send({ status: false, msg: 'Invalid parameters in request' });
    }

    Category.findByIdAndUpdate(
      req.params.id,
      {
        $set: { name: name, status: status },
      },
      { new: false },
      function (err, data) {
        if (err)
          return res
            .status(httpStatus.OK)
            .send({ status: false, msg: 'Failed To Update' });
        res
          .status(httpStatus.OK)
          .send({ status: true, msg: 'Data Updated Successfully' });
      }
    );
  }
);

//Category Delete
router.delete(
  '/categoryDelete/:id',
  [verifyToken, checkPermissions.check('delete', 'Category')],
  function (req, res) {
    Category.findByIdAndRemove(req.params.id, function (err, data) {
      if (err)
        return res
          .status(httpStatus.OK)
          .send({ status: false, msg: 'Failed To Delete' });
      res
        .status(httpStatus.OK)
        .send({ status: true, msg: 'Data Deleted Successfully' });
    });
  }
);

/************************************************************** 
  Size Routes 
**************************************************************/

//Size List
router.get(
  '/sizeList',
  [verifyToken, checkPermissions.check('read', 'Size')],
  function (req, res, next) {
    let page = parseInt(req.query.currentPage, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 10;
    let fsort = req.query.sort;
    let forder = req.query.order;
    let filterData = {};
    let sort = '-createdAt';

    if (fsort != '') {
      if (forder == 'ASC') {
        sort = fsort;
      } else if (forder == 'DESC') {
        sort = '-' + fsort;
      }
    }

    if (req.query.keyword != '') {
      filterData = { name: { $regex: req.query.keyword, $options: 'i' } };
    }

    Size.countDocuments(filterData, function (err, count) {
      Size.find(filterData)
        .skip(page > 0 ? (page - 1) * limit : 0)
        .limit(limit)
        .sort(`${sort}`)
        .exec(function (err, records) {
          if (err)
            return res
              .status(httpStatus.OK)
              .send({ status: false, msg: `Server error: ${err.message}` });
          res.status(httpStatus.OK).send({
            status: true,
            data: records,
            page: page,
            per_page: limit,
            total: count,
            total_pages: Math.ceil(count / limit),
          });
        });
    });
  }
);

//Size Add Route
router.post(
  '/sizeAdd',
  [verifyToken, checkPermissions.check('create', 'Size')],
  function (req, res) {
    const { name, status } = req.body;

    if (!name) {
      return res
        .status(httpStatus.OK)
        .send({ status: false, msg: 'Invalid parameters in request' });
    }

    //Save to Mongo
    Size.create(
      {
        name: name,
        status: status,
      },
      function (error, inserted) {
        if (error) {
          const message = `Server error: ${error.message}`;
          return res
            .status(httpStatus.OK)
            .send({ status: false, msg: message });
        }
        res
          .status(httpStatus.OK)
          .send({ status: true, msg: 'Data Added Successfully!' });
      }
    );
  }
);

//Size Update Route
router.put(
  '/sizeEdit/:id',
  [verifyToken, checkPermissions.check('update', 'Size')],
  function (req, res) {
    const { name, status } = req.body;

    if (!name) {
      return res
        .status(httpStatus.OK)
        .send({ status: false, msg: 'Invalid parameters in request' });
    }

    Size.findByIdAndUpdate(
      req.params.id,
      {
        $set: { name: name, status: status },
      },
      { new: false },
      function (err, data) {
        if (err)
          return res
            .status(httpStatus.OK)
            .send({ status: false, msg: 'Failed To Update' });
        res
          .status(httpStatus.OK)
          .send({ status: true, msg: 'Data Updated Successfully' });
      }
    );
  }
);

//Size Delete
router.delete(
  '/sizeDelete/:id',
  [verifyToken, checkPermissions.check('delete', 'Size')],
  function (req, res) {
    Size.findByIdAndRemove(req.params.id, function (err, data) {
      if (err)
        return res
          .status(httpStatus.OK)
          .send({ status: false, msg: 'Failed To Delete' });
      res
        .status(httpStatus.OK)
        .send({ status: true, msg: 'Data Deleted Successfully' });
    });
  }
);

/************************************************************** 
  Color Routes 
**************************************************************/

//Color List
router.get(
  '/colorList',
  [verifyToken, checkPermissions.check('read', 'Colors')],
  function (req, res, next) {
    let page = parseInt(req.query.currentPage, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 10;
    let fsort = req.query.sort;
    let forder = req.query.order;
    let filterData = {};
    let sort = '-createdAt';

    if (fsort != '') {
      if (forder == 'ASC') {
        sort = fsort;
      } else if (forder == 'DESC') {
        sort = '-' + fsort;
      }
    }

    if (req.query.keyword != '') {
      filterData = { name: { $regex: req.query.keyword, $options: 'i' } };
    }

    Color.countDocuments(filterData, function (err, count) {
      Color.find(filterData)
        .skip(page > 0 ? (page - 1) * limit : 0)
        .limit(limit)
        .sort(`${sort}`)
        .exec(function (err, records) {
          if (err)
            return res
              .status(httpStatus.OK)
              .send({ status: false, msg: `Server error: ${err.message}` });
          res.status(httpStatus.OK).send({
            status: true,
            data: records,
            page: page,
            per_page: limit,
            total: count,
            total_pages: Math.ceil(count / limit),
          });
        });
    });
  }
);

//Color Add Route
router.post(
  '/colorAdd',
  [verifyToken, checkPermissions.check('create', 'Colors')],
  function (req, res) {
    const { name, status } = req.body;

    if (!name) {
      return res
        .status(httpStatus.OK)
        .send({ status: false, msg: 'Invalid parameters in request' });
    }

    //Save to Mongo
    Color.create(
      {
        name: name,
        status: status,
      },
      function (error, inserted) {
        if (error) {
          const message = `Server error: ${error.message}`;
          return res
            .status(httpStatus.OK)
            .send({ status: false, msg: message });
        }
        res
          .status(httpStatus.OK)
          .send({ status: true, msg: 'Data Added Successfully!' });
      }
    );
  }
);

//Color Update Route
router.put(
  '/colorEdit/:id',
  [verifyToken, checkPermissions.check('update', 'Colors')],
  function (req, res) {
    const { name, status } = req.body;

    if (!name) {
      return res
        .status(httpStatus.OK)
        .send({ status: false, msg: 'Invalid parameters in request' });
    }

    Color.findByIdAndUpdate(
      req.params.id,
      {
        $set: { name: name, status: status },
      },
      { new: false },
      function (err, data) {
        if (err)
          return res
            .status(httpStatus.OK)
            .send({ status: false, msg: 'Failed To Update' });
        res
          .status(httpStatus.OK)
          .send({ status: true, msg: 'Data Updated Successfully' });
      }
    );
  }
);

//Color Delete
router.delete(
  '/colorDelete/:id',
  [verifyToken, checkPermissions.check('delete', 'Colors')],
  function (req, res) {
    Color.findByIdAndRemove(req.params.id, function (err, data) {
      if (err)
        return res
          .status(httpStatus.OK)
          .send({ status: false, msg: 'Failed To Delete' });
      res
        .status(httpStatus.OK)
        .send({ status: true, msg: 'Data Deleted Successfully' });
    });
  }
);

/************************************************************** 
  County Routes 
**************************************************************/

//Country List
router.get(
  '/countryList',
  [verifyToken, checkPermissions.check('read', 'Country')],
  function (req, res, next) {
    let page = parseInt(req.query.currentPage, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 10;
    let fsort = req.query.sort;
    let forder = req.query.order;
    let filterData = {};
    let sort = '-createdAt';

    if (fsort != '') {
      if (forder == 'ASC') {
        sort = fsort;
      } else if (forder == 'DESC') {
        sort = '-' + fsort;
      }
    }

    if (req.query.keyword != '') {
      filterData = { name: { $regex: req.query.keyword, $options: 'i' } };
    }

    Country.countDocuments(filterData, function (err, count) {
      Country.find(filterData)
        .skip(page > 0 ? (page - 1) * limit : 0)
        .limit(limit)
        .sort(`${sort}`)
        .exec(function (err, records) {
          if (err)
            return res
              .status(httpStatus.OK)
              .send({ status: false, msg: `Server error: ${err.message}` });
          res.status(httpStatus.OK).send({
            status: true,
            data: records,
            page: page,
            per_page: limit,
            total: count,
            total_pages: Math.ceil(count / limit),
          });
        });
    });
  }
);

//Country Add Route
router.post(
  '/countryAdd',
  [verifyToken, checkPermissions.check('create', 'Country')],
  function (req, res) {
    const { name, status } = req.body;

    if (!name) {
      return res
        .status(httpStatus.OK)
        .send({ status: false, msg: 'Invalid parameters in request' });
    }

    //Save to Mongo
    Country.create(
      {
        name: name,
        status: status,
      },
      function (error, inserted) {
        if (error) {
          const message = `Server error: ${error.message}`;
          return res
            .status(httpStatus.OK)
            .send({ status: false, msg: message });
        }
        res
          .status(httpStatus.OK)
          .send({ status: true, msg: 'Data Added Successfully!' });
      }
    );
  }
);

//Country Update Route
router.put(
  '/countryEdit/:id',
  [verifyToken, checkPermissions.check('update', 'Country')],
  function (req, res) {
    const { name, status } = req.body;

    if (!name) {
      return res
        .status(httpStatus.OK)
        .send({ status: false, msg: 'Invalid parameters in request' });
    }

    Country.findByIdAndUpdate(
      req.params.id,
      {
        $set: { name: name, status: status },
      },
      { new: false },
      function (err, data) {
        if (err)
          return res
            .status(httpStatus.OK)
            .send({ status: false, msg: 'Failed To Update' });
        res
          .status(httpStatus.OK)
          .send({ status: true, msg: 'Data Updated Successfully' });
      }
    );
  }
);

//Country Delete
router.delete(
  '/countryDelete/:id',
  [verifyToken, checkPermissions.check('delete', 'Country')],
  function (req, res) {
    Country.findByIdAndRemove(req.params.id, function (err, data) {
      if (err)
        return res
          .status(httpStatus.OK)
          .send({ status: false, msg: 'Failed To Delete' });
      res
        .status(httpStatus.OK)
        .send({ status: true, msg: 'Data Deleted Successfully' });
    });
  }
);

/************************************************************** 
  Product Routes 
**************************************************************/

//Product List
router.get(
  '/productList',
  [verifyToken, checkPermissions.check('read', 'Product')],
  function (req, res, next) {
    let page = parseInt(req.query.currentPage, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 10;
    let fsort = req.query.sort;
    let forder = req.query.order;
    let keyword = '';
    let filterData = {};
    let sort = { createdAt: -1 };

    if (fsort != '') {
      if (forder == 'ASC') {
        sort = { [fsort]: 1 };
      } else if (forder == 'DESC') {
        sort = { [fsort]: -1 };
      }
    }

    if (req.query.keyword != '') {
      keyword = req.query.keyword;
    }
    if (req.query.keyword != '') {
      filterData = {
        product_name: { $regex: req.query.keyword, $options: 'i' },
      };
    }

    Product.countDocuments(filterData, function (err, count) {
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
          $lookup: {
            from: 'colors',
            let: { colorID: '$color_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: { $eq: ['$_id', '$$colorID'] },
                  },
                },
              },
            ],
            as: 'colorsData',
          },
        },
        {
          $lookup: {
            from: 'sizes',
            let: { sizeID: '$size_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: { $eq: ['$_id', '$$sizeID'] },
                  },
                },
              },
            ],
            as: 'sizeData',
          },
        },
        {
          $match: {
            $or: [
              { product_name: { $regex: keyword, $options: 'i' } },
              { model: { $regex: keyword, $options: 'i' } },
            ],
          },
        },
        {
          $unwind: {
            path: '$categoryData',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$colorsData',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$sizeData',
            preserveNullAndEmptyArrays: true,
          },
        },
        { $sort: sort },
        { $skip: page > 0 ? (page - 1) * limit : 0 },
        { $limit: limit },
      ]).exec(function (err, records) {
        if (err)
          return res
            .status(httpStatus.OK)
            .send({ status: false, msg: `Server error: ${err.message}` });
        res.status(httpStatus.OK).send({
          status: true,
          data: records,
          page: page,
          per_page: limit,
          total: count,
          total_pages: Math.ceil(count / limit),
        });
      });
    });
  }
);

//Product Add Route
router.post(
  '/productAdd',
  [verifyToken, checkPermissions.check('create', 'Product')],
  function (req, res) {
    const {
      product_name,
      category_id,
      price,
      quantity,
      sold_individual,
      tax_id,
      model,
      size_id,
      color_id,
      description,
      short_description,
      features,
      conditions,
      return_policy,
      is_featured,
      is_active,
    } = req.body;

    if (
      !product_name ||
      !category_id ||
      !price ||
      !quantity ||
      !model ||
      !tax_id
    ) {
      return res
        .status(httpStatus.OK)
        .send({ status: false, msg: 'Invalid parameters in request' });
    }

    const slug = slugify(product_name, { lower: true });

    //Save to Mongo
    Product.create(
      {
        product_name: product_name,
        slug: slug,
        category_id: category_id,
        model: model,
        price: price,
        quantity: quantity,
        sold_individual: sold_individual,
        tax_id: tax_id,
        size_id: size_id,
        color_id: color_id,
        category_id: category_id,
        description: description,
        short_description: short_description,
        features: features,
        conditions: conditions,
        return_policy: return_policy,
        is_featured: is_featured,
        is_active: is_active,
      },
      function (error, inserted) {
        if (error) {
          const message = `Server error: ${error.message}`;
          return res
            .status(httpStatus.OK)
            .send({ status: false, msg: message });
        }
        res.status(httpStatus.OK).send({
          status: true,
          msg: 'Data Added Successfully!',
          product_id: inserted._id,
        });
      }
    );
  }
);

//upload product images
router.post(
  '/uploadProductImages',
  [verifyToken, upload.any()],
  function (req, res) {
    let images = req.files;
    let featuredImage = '';
    let additionalImages = [];
    for (let f = 0; f < images.length; f++) {
      if (images[f].fieldname == 'image') {
        featuredImage = images[f].filename;
      }
      if (images[f].fieldname == 'multipleImages') {
        additionalImages.push(images[f].filename);
      }
    }

    Product.findByIdAndUpdate(
      req.query.id,
      {
        $set: {
          featured_image: featuredImage,
          additional_images: additionalImages,
        },
      },
      { new: false },
      function (err, product) {
        if (err)
          return res
            .status(httpStatus.OK)
            .send({ status: false, msg: 'Failed To Update' });
        res
          .status(httpStatus.OK)
          .send({ status: true, msg: 'Data Added Successfully' });
      }
    );
  }
);

//update product images
router.post(
  '/updateProductImages',
  [verifyToken, upload.any()],
  function (req, res) {
    let images = req.files;
    let featuredImage = '';
    let additionalImages = [];

    for (let f = 0; f < images.length; f++) {
      if (images[f].fieldname == 'image') {
        featuredImage = images[f].filename;
      }
      if (images[f].fieldname == 'multipleImages') {
        additionalImages.push(images[f].filename);
      }
    }

    let oldAdditionalImages = req.body.oldAdditional;
    if (oldAdditionalImages != '') {
      oldAdditionalImages = oldAdditionalImages.split(',');
      additionalImages = additionalImages.concat(oldAdditionalImages);
    }

    if (featuredImage == '') {
      featuredImage = req.body.oldImage;
    }

    Product.findByIdAndUpdate(
      req.query.id,
      {
        $set: {
          featured_image: featuredImage,
          additional_images: additionalImages,
        },
      },
      { new: false },
      function (err, product) {
        if (err)
          return res
            .status(httpStatus.OK)
            .send({ status: false, msg: 'Failed To Update' });
        res
          .status(httpStatus.OK)
          .send({ status: true, msg: 'Data Added Successfully' });
      }
    );
  }
);

//Product Update Route
router.put(
  '/productEdit/:id',
  [verifyToken, checkPermissions.check('update', 'Product')],
  function (req, res) {
    const {
      product_name,
      category_id,
      price,
      quantity,
      sold_individual,
      tax_id,
      model,
      size_id,
      color_id,
      description,
      short_description,
      features,
      conditions,
      return_policy,
      is_featured,
      is_active,
      deletedImages,
    } = req.body;

    if (
      !product_name ||
      !category_id ||
      !price ||
      !quantity ||
      !model ||
      !tax_id
    ) {
      return res
        .status(httpStatus.OK)
        .send({ status: false, msg: 'Invalid parameters in request' });
    }

    const slug = slugify(product_name, { lower: true });

    Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          product_name: product_name,
          slug: slug,
          category_id: category_id,
          model: model,
          price: price,
          quantity: quantity,
          sold_individual: sold_individual,
          tax_id: tax_id,
          size_id: size_id,
          color_id: color_id,
          category_id: category_id,
          description: description,
          short_description: short_description,
          features: features,
          conditions: conditions,
          return_policy: return_policy,
          is_featured: is_featured,
          is_active: is_active,
        },
      },
      { new: true },
      function (err, data) {
        if (err)
          return res
            .status(httpStatus.OK)
            .send({ status: false, msg: 'Failed To Update' });

        //delete image from storage
        let dbImages = data.additional_images;
        if (deletedImages.length > 0) {
          for (let i = 0; i < deletedImages.length; i++) {
            if (dbImages.includes(deletedImages[i])) {
              var index = dbImages.indexOf(deletedImages[i]); // get index if value found otherwise -1
              if (index > -1) {
                //if found
                dbImages.splice(index, 1);
              }
            }
            fs.unlink(
              path.join(
                __dirname,
                '../public/productImages/' + deletedImages[i]
              ),
              function (err) {
                if (err && err.code == 'ENOENT') {
                  // file doens't exist
                  console.info("File doesn't exist, won't remove it.");
                } else if (err) {
                  // other errors, e.g. maybe we don't have enough permission
                  console.error('Error occurred while trying to remove file');
                } else {
                  //    console.info(`removed`);
                }
              }
            );
          }
          Product.findByIdAndUpdate(
            req.params.id,
            {
              $set: {
                additional_images: dbImages,
              },
            },
            { new: false },
            function (err, data) {
              //  console.log(data)
            }
          );
        }

        res
          .status(httpStatus.OK)
          .send({ status: true, msg: 'Data Updated Successfully' });
      }
    );
  }
);

//Product Delete
router.delete(
  '/productDelete/:id',
  [verifyToken, checkPermissions.check('delete', 'Product')],
  function (req, res) {
    Product.findByIdAndRemove(req.params.id, function (err, data) {
      if (err)
        return res
          .status(httpStatus.OK)
          .send({ status: false, msg: 'Failed To Delete' });

      //delete from storage
      fs.unlink(
        path.join(__dirname, '../public/productImages/' + data.featured_image),
        function (err) {
          if (err && err.code == 'ENOENT') {
            // file doens't exist
            console.info("File doesn't exist, won't remove it.");
          } else if (err) {
            // other errors, e.g. maybe we don't have enough permission
            console.error('Error occurred while trying to remove file');
          } else {
            //    console.info(`removed`);
          }
        }
      );

      //remove addional images
      if (data.additional_images.length > 1) {
        for (let i = 0; i < data.additional_images.length; i++) {
          //delete from storage
          fs.unlink(
            path.join(
              __dirname,
              '../public/productImages/' + data.additional_images[i]
            ),
            function (err) {
              if (err && err.code == 'ENOENT') {
                // file doens't exist
                console.info("File doesn't exist, won't remove it.");
              } else if (err) {
                // other errors, e.g. maybe we don't have enough permission
                console.error('Error occurred while trying to remove file');
              } else {
                //    console.info(`removed`);
              }
            }
          );
        }
      }

      res
        .status(httpStatus.OK)
        .send({ status: true, msg: 'Data Deleted Successfully' });
    });
  }
);

/************************************************************** 
  Currency Routes 
**************************************************************/

//Currency List
router.get(
  '/currencyList',
  [verifyToken, checkPermissions.check('read', 'Currency')],
  function (req, res, next) {
    let page = parseInt(req.query.currentPage, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 10;
    let fsort = req.query.sort;
    let forder = req.query.order;
    let filterData = {};
    let sort = '-createdAt';

    if (fsort != '') {
      if (forder == 'ASC') {
        sort = fsort;
      } else if (forder == 'DESC') {
        sort = '-' + fsort;
      }
    }

    if (req.query.keyword != '') {
      filterData = { title: { $regex: req.query.keyword, $options: 'i' } };
    }

    Currency.countDocuments(filterData, function (err, count) {
      Currency.find(filterData)
        .skip(page > 0 ? (page - 1) * limit : 0)
        .limit(limit)
        .sort(`${sort}`)
        .exec(function (err, records) {
          if (err)
            return res
              .status(httpStatus.OK)
              .send({ status: false, msg: `Server error: ${err.message}` });
          res.status(httpStatus.OK).send({
            status: true,
            data: records,
            page: page,
            per_page: limit,
            total: count,
            total_pages: Math.ceil(count / limit),
          });
        });
    });
  }
);

//Currency Add Route
router.post(
  '/currencyAdd',
  [verifyToken, checkPermissions.check('create', 'Currency')],
  function (req, res) {
    const { title, code, value, symbol, status } = req.body;

    if (!title && !code) {
      return res
        .status(httpStatus.OK)
        .send({ status: false, msg: 'Invalid parameters in request' });
    }

    //Save to Mongo
    Currency.create(
      {
        title: title,
        code: code,
        value: value,
        symbol: symbol,
        status: status,
      },
      function (error, inserted) {
        if (error) {
          const message = `Server error: ${error.message}`;
          return res
            .status(httpStatus.OK)
            .send({ status: false, msg: message });
        }
        res
          .status(httpStatus.OK)
          .send({ status: true, msg: 'Data Added Successfully!' });
      }
    );
  }
);

//Currency Update Route
router.put(
  '/currencyEdit/:id',
  [verifyToken, checkPermissions.check('update', 'Currency')],
  function (req, res) {
    const { title, code, symbol, value, status } = req.body;

    if (!title && !code) {
      return res
        .status(httpStatus.OK)
        .send({ status: false, msg: 'Invalid parameters in request' });
    }

    Currency.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          title: title,
          code: code,
          value: value,
          symbol: symbol,
          status: status,
        },
      },
      { new: false },
      function (err, data) {
        if (err)
          return res
            .status(httpStatus.OK)
            .send({ status: false, msg: 'Failed To Update' });
        res
          .status(httpStatus.OK)
          .send({ status: true, msg: 'Data Updated Successfully' });
      }
    );
  }
);

//Currency Delete
router.delete(
  '/currencyDelete/:id',
  [verifyToken, checkPermissions.check('delete', 'Currency')],
  function (req, res) {
    Currency.findByIdAndRemove(req.params.id, function (err, data) {
      if (err)
        return res
          .status(httpStatus.OK)
          .send({ status: false, msg: 'Failed To Delete' });
      res
        .status(httpStatus.OK)
        .send({ status: true, msg: 'Data Deleted Successfully' });
    });
  }
);

/************************************************************** 
  Coupons Routes 
**************************************************************/

//Coupons List
router.get(
  '/couponList',
  [verifyToken, checkPermissions.check('read', 'Coupon')],
  function (req, res, next) {
    let page = parseInt(req.query.currentPage, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 10;
    let fsort = req.query.sort;
    let forder = req.query.order;
    let filterData = {};
    let sort = '-createdAt';

    if (fsort != '') {
      if (forder == 'ASC') {
        sort = fsort;
      } else if (forder == 'DESC') {
        sort = '-' + fsort;
      }
    }

    if (req.query.keyword != '') {
      filterData = { name: { $regex: req.query.keyword, $options: 'i' } };
    }

    Coupon.countDocuments(filterData, function (err, count) {
      Coupon.find(filterData)
        .skip(page > 0 ? (page - 1) * limit : 0)
        .limit(limit)
        .sort(`${sort}`)
        .exec(function (err, records) {
          if (err)
            return res
              .status(httpStatus.OK)
              .send({ status: false, msg: `Server error: ${err.message}` });
          res.status(httpStatus.OK).send({
            status: true,
            data: records,
            page: page,
            per_page: limit,
            total: count,
            total_pages: Math.ceil(count / limit),
          });
        });
    });
  }
);

//Coupon Add Route
router.post(
  '/couponAdd',
  [verifyToken, checkPermissions.check('create', 'Coupon')],
  function (req, res) {
    const { name, code, type, discount, date_start, date_end, status } =
      req.body;

    if (!name && !code && discount && !date_start && !date_end) {
      return res
        .status(httpStatus.OK)
        .send({ status: false, msg: 'Invalid parameters in request' });
    }

    //find user
    Coupon.findOne({ code: code }, function (error, couponFound) {
      if (!couponFound) {
        //Save to Mongo
        Coupon.create(
          {
            name: name,
            code: code,
            type: type,
            discount: discount,
            date_start: date_start,
            date_end: date_end,
            status: status,
          },
          function (error, inserted) {
            if (error) {
              const message = `Server error: ${error.message}`;
              return res
                .status(httpStatus.OK)
                .send({ status: false, msg: message });
            }
            res
              .status(httpStatus.OK)
              .send({ status: true, msg: 'Data Added Successfully!' });
          }
        );
      } else {
        res
          .status(httpStatus.OK)
          .send({ status: false, msg: 'Code already exists' });
      }
    });
  }
);

//Coupon Update Route
router.put(
  '/couponEdit/:id',
  [verifyToken, checkPermissions.check('update', 'Coupon')],
  function (req, res) {
    const {
      name,
      code,
      type,
      discount,
      customer_login,
      date_start,
      date_end,
      uses_per_coupons,
      status,
    } = req.body;

    if (!name && !code && discount) {
      return res
        .status(httpStatus.OK)
        .send({ status: false, msg: 'Invalid parameters in request' });
    }

    Coupon.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name: name,
          code: code,
          type: type,
          discount: discount,
          customer_login: customer_login,
          date_start: date_start,
          date_end: date_end,
          uses_per_coupons: uses_per_coupons,
          status: status,
        },
      },
      { new: false },
      function (err, data) {
        if (err)
          return res
            .status(httpStatus.OK)
            .send({ status: false, msg: 'Failed To Update' });
        res
          .status(httpStatus.OK)
          .send({ status: true, msg: 'Data Updated Successfully' });
      }
    );
  }
);

//Coupon Delete
router.delete(
  '/couponDelete/:id',
  [verifyToken, checkPermissions.check('delete', 'Coupon')],
  function (req, res) {
    Coupon.findByIdAndRemove(req.params.id, function (err, data) {
      if (err)
        return res
          .status(httpStatus.OK)
          .send({ status: false, msg: 'Failed To Delete' });
      res
        .status(httpStatus.OK)
        .send({ status: true, msg: 'Data Deleted Successfully' });
    });
  }
);

/************************************************************** 
  Order Statuses Routes 
**************************************************************/

// Order Statuses List
router.get(
  '/orderstatusesList',
  [verifyToken, checkPermissions.check('read', 'Order Status')],
  function (req, res, next) {
    let page = parseInt(req.query.currentPage, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 10;
    let fsort = req.query.sort;
    let forder = req.query.order;
    let filterData = {};
    let sort = '-createdAt';

    if (fsort != '') {
      if (forder == 'ASC') {
        sort = fsort;
      } else if (forder == 'DESC') {
        sort = '-' + fsort;
      }
    }

    if (req.query.keyword != '') {
      filterData = { name: { $regex: req.query.keyword, $options: 'i' } };
    }

    OrderStatuses.countDocuments(filterData, function (err, count) {
      OrderStatuses.find(filterData)
        .skip(page > 0 ? (page - 1) * limit : 0)
        .limit(limit)
        .sort(`${sort}`)
        .exec(function (err, records) {
          if (err)
            return res
              .status(httpStatus.OK)
              .send({ status: false, msg: `Server error: ${err.message}` });
          res.status(httpStatus.OK).send({
            status: true,
            data: records,
            page: page,
            per_page: limit,
            total: count,
            total_pages: Math.ceil(count / limit),
          });
        });
    });
  }
);

//Order Statuses Add Route
router.post(
  '/orderstatusesAdd',
  [verifyToken, checkPermissions.check('create', 'Order Status')],
  function (req, res) {
    const { name, status } = req.body;

    if (!name) {
      return res
        .status(httpStatus.OK)
        .send({ status: false, msg: 'Invalid parameters in request' });
    }

    //Save to Mongo
    OrderStatuses.create(
      {
        name: name,
        status: status,
      },
      function (error, inserted) {
        if (error) {
          const message = `Server error: ${error.message}`;
          return res
            .status(httpStatus.OK)
            .send({ status: false, msg: message });
        }
        res
          .status(httpStatus.OK)
          .send({ status: true, msg: 'Data Added Successfully!' });
      }
    );
  }
);

// Order Statuses Update Route
router.put(
  '/orderstatusesEdit/:id',
  [verifyToken, checkPermissions.check('update', 'Order Status')],
  function (req, res) {
    const { name, status } = req.body;

    if (!name) {
      return res
        .status(httpStatus.OK)
        .send({ status: false, msg: 'Invalid parameters in request' });
    }

    OrderStatuses.findByIdAndUpdate(
      req.params.id,
      {
        $set: { name: name, status: status },
      },
      { new: false },
      function (err, data) {
        if (err)
          return res
            .status(httpStatus.OK)
            .send({ status: false, msg: 'Failed To Update' });
        res
          .status(httpStatus.OK)
          .send({ status: true, msg: 'Data Updated Successfully' });
      }
    );
  }
);

// Order Statuses Delete
router.delete(
  '/orderstatusesDelete/:id',
  [verifyToken, checkPermissions.check('delete', 'Order Status')],
  function (req, res) {
    OrderStatuses.findByIdAndRemove(req.params.id, function (err, data) {
      if (err)
        return res
          .status(httpStatus.OK)
          .send({ status: false, msg: 'Failed To Delete' });
      res
        .status(httpStatus.OK)
        .send({ status: true, msg: 'Data Deleted Successfully' });
    });
  }
);

/************************************************************** 
  Tax Routes 
**************************************************************/

//Tax List
router.get(
  '/taxList',
  [verifyToken, checkPermissions.check('read', 'Tax')],
  function (req, res, next) {
    let page = parseInt(req.query.currentPage, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 10;
    let fsort = req.query.sort;
    let forder = req.query.order;
    let filterData = {};
    let sort = '-createdAt';

    if (fsort != '') {
      if (forder == 'ASC') {
        sort = fsort;
      } else if (forder == 'DESC') {
        sort = '-' + fsort;
      }
    }

    if (req.query.keyword != '') {
      filterData = { name: { $regex: req.query.keyword, $options: 'i' } };
    }

    Tax.countDocuments(filterData, function (err, count) {
      Tax.find(filterData)
        .skip(page > 0 ? (page - 1) * limit : 0)
        .limit(limit)
        .sort(`${sort}`)
        .exec(function (err, records) {
          if (err)
            return res
              .status(httpStatus.OK)
              .send({ status: false, msg: `Server error: ${err.message}` });
          res.status(httpStatus.OK).send({
            status: true,
            data: records,
            page: page,
            per_page: limit,
            total: count,
            total_pages: Math.ceil(count / limit),
          });
        });
    });
  }
);

//Tax Add Route
router.post(
  '/taxAdd',
  [verifyToken, checkPermissions.check('create', 'Tax')],
  function (req, res) {
    const { name, rate, type, status } = req.body;

    if (!name && !rate) {
      return res
        .status(httpStatus.OK)
        .send({ status: false, msg: 'Invalid parameters in request' });
    }

    //Save to Mongo
    Tax.create(
      {
        name: name,
        rate: rate,
        type: type,
        status: status,
      },
      function (error, inserted) {
        if (error) {
          const message = `Server error: ${error.message}`;
          return res
            .status(httpStatus.OK)
            .send({ status: false, msg: message });
        }
        res
          .status(httpStatus.OK)
          .send({ status: true, msg: 'Data Added Successfully!' });
      }
    );
  }
);

//Tax Update Route
router.put(
  '/taxEdit/:id',
  [verifyToken, checkPermissions.check('update', 'Tax')],
  function (req, res) {
    const { name, rate, type, status } = req.body;

    if (!name && !rate) {
      return res
        .status(httpStatus.OK)
        .send({ status: false, msg: 'Invalid parameters in request' });
    }

    Tax.findByIdAndUpdate(
      req.params.id,
      {
        $set: { name: name, rate: rate, type: type, status: status },
      },
      { new: false },
      function (err, data) {
        if (err)
          return res
            .status(httpStatus.OK)
            .send({ status: false, msg: 'Failed To Update' });
        res
          .status(httpStatus.OK)
          .send({ status: true, msg: 'Data Updated Successfully' });
      }
    );
  }
);

//Tax Delete
router.delete(
  '/taxDelete/:id',
  [verifyToken, checkPermissions.check('delete', 'Tax')],
  function (req, res) {
    Tax.findByIdAndRemove(req.params.id, function (err, data) {
      if (err)
        return res
          .status(httpStatus.OK)
          .send({ status: false, msg: 'Failed To Delete' });
      res
        .status(httpStatus.OK)
        .send({ status: true, msg: 'Data Deleted Successfully' });
    });
  }
);

/************************************************************** 
  Order Routes 
**************************************************************/

//Order List
router.get(
  '/orderList',
  [verifyToken, checkPermissions.check('read', 'Orders')],
  function (req, res, next) {
    let page = parseInt(req.query.currentPage, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 10;
    let fsort = req.query.sort;
    let forder = req.query.order;
    let keyword = '';
    let filterData = {};
    let sort = { createdAt: -1 };

    if (fsort != '') {
      if (forder == 'ASC') {
        sort = { [fsort]: 1 };
      } else if (forder == 'DESC') {
        sort = { [fsort]: -1 };
      }
    }

    if (req.query.keyword != '') {
      keyword = req.query.keyword;
    }
    if (req.query.keyword != '') {
      filterData = { order_id: { $regex: req.query.keyword, $options: 'i' } };
    }

    Order.countDocuments(filterData, function (err, count) {
      Order.aggregate([
        {
          $lookup: {
            from: 'customers',
            let: { customerID: '$customer_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: { $eq: ['$_id', '$$customerID'] },
                  },
                },
              },
              {
                $project: {
                  password: 0,
                  profileImage: 0,
                  updatedAt: 0,
                  isActive: 0,
                  createdAt: 0,
                },
              },
            ],
            as: 'customerData',
          },
        },
        {
          $lookup: {
            from: 'orderstatuses',
            let: { orderstatuesID: '$order_statuses_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: { $eq: ['$_id', '$$orderstatuesID'] },
                  },
                },
              },
            ],
            as: 'orderstatuesData',
          },
        },
        {
          $lookup: {
            from: 'currencies',
            let: { currencyID: '$currency_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: { $eq: ['$_id', '$$currencyID'] },
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  status: 0,
                  title: 0,
                  updatedAt: 0,
                  createdAt: 0,
                },
              },
            ],
            as: 'currencyData',
          },
        },
        { $match: { $or: [{ order_id: { $regex: keyword, $options: 'i' } }] } },
        {
          $unwind: {
            path: '$customerData',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$orderstatuesData',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$currencyData',
            preserveNullAndEmptyArrays: true,
          },
        },
        { $sort: sort },
        { $skip: page > 0 ? (page - 1) * limit : 0 },
        { $limit: limit },
      ]).exec(function (err, records) {
        if (err)
          return res
            .status(httpStatus.OK)
            .send({ status: false, msg: `Server error: ${err.message}` });
        res.status(httpStatus.OK).send({
          status: true,
          data: records,
          page: page,
          per_page: limit,
          total: count,
          total_pages: Math.ceil(count / limit),
        });
      });
    });
  }
);

//Order Add Route
router.post(
  '/orderAdd',
  [verifyToken, checkPermissions.check('create', 'Orders')],
  function (req, res) {
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
      !est_delivery_date &&
      !grand_total &&
      !total_amount &&
      !coupon_id &&
      !payment_method
    ) {
      return res
        .status(httpStatus.OK)
        .send({ status: false, msg: 'Invalid parameters in request' });
    }

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
            return res
              .status(httpStatus.OK)
              .send({ status: false, msg: message });
          }
          //update product stock
          for (let p = 0; p < orderItems.length; p++) {
            Product.findByIdAndUpdate(
              orderItems[p]._id,
              { $inc: { quantity: -orderItems[p].orderQuantity } },
              { new: false },
              function (err, data) {
                if (err)
                  return res
                    .status(httpStatus.OK)
                    .send({ status: false, msg: 'Failed To Update' });
              }
            );
          }
          res
            .status(httpStatus.OK)
            .send({ status: true, msg: 'Data Added Successfully!' });
        }
      );
    });
  }
);

//Order Update Route
router.put(
  '/orderEdit/:id',
  [verifyToken, checkPermissions.check('update', 'Orders')],
  function (req, res) {
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
      oldItemsArr,
    } = req.body;

    if (
      !customer_id &&
      !currency_id &&
      !est_delivery_date &&
      !grand_total &&
      !total_amount &&
      !payment_method
    ) {
      return res
        .status(httpStatus.OK)
        .send({ status: false, msg: 'Invalid parameters in request' });
    }

    Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
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
      },
      { new: false },
      function (err, data) {
        if (err)
          return res
            .status(httpStatus.OK)
            .send({ status: false, msg: 'Failed To Update' });
        //maintain stock
        for (let p = 0; p < oldItemsArr.length; p++) {
          Product.findByIdAndUpdate(
            oldItemsArr[p]._id,
            { $inc: { quantity: oldItemsArr[p].quantity } },
            { new: false },
            function (err, data) {
              if (err)
                return res
                  .status(httpStatus.OK)
                  .send({ status: false, msg: 'Failed To Update stock ' });
            }
          );
        }

        //maintain stock
        for (let p = 0; p < orderItems.length; p++) {
          Product.findByIdAndUpdate(
            orderItems[p]._id,
            { $inc: { quantity: -orderItems[p].orderQuantity } },
            { new: false },
            function (err, data) {
              if (err)
                return res
                  .status(httpStatus.OK)
                  .send({ status: false, msg: 'Failed To Update stock ' });
            }
          );
        }

        res
          .status(httpStatus.OK)
          .send({ status: true, msg: 'Data Updated Successfully' });
      }
    );
  }
);

//get cats,sizes,colors,and Tax for products
router.get('/cscp', [verifyToken], function (req, res, next) {
  Category.aggregate(
    // 1. Use any collection containing at least one document.
    [
      { $limit: 1 }, // 2. Keep only one document of the collection.
      // // 3. Lookup collections to union together.
      {
        $lookup: {
          from: 'sizes',
          pipeline: [{ $match: { status: true } }],
          as: 'SizeData',
        },
      },
      {
        $lookup: {
          from: 'colors',
          pipeline: [{ $match: { status: true } }],
          as: 'ColorData',
        },
      },
      {
        $lookup: {
          from: 'categories',
          pipeline: [{ $match: { status: true } }],
          as: 'CategoryData',
        },
      },
      {
        $lookup: {
          from: 'taxes',
          pipeline: [{ $match: { status: true } }],
          as: 'TaxData',
        },
      },
    ]
  ).exec(function (err, collections) {
    if (err) {
      return console.log(err);
    }
    return res.status(httpStatus.OK).send({ status: true, data: collections });
  });
});

//get customers,currency,order  for order
router.get('/cco', [verifyToken], function (req, res, next) {
  Product.aggregate(
    // 1. Use any collection containing at least one document.
    [
      { $limit: 1 }, // 2. Keep only one document of the collection.
      // // 3. Lookup collections to union together.
      {
        $lookup: {
          from: 'customers',
          pipeline: [
            { $match: { isActive: true } },
            {
              $project: {
                password: 0,
                email: 0,
                phone_no: 0,
                profileImage: 0,
                updatedAt: 0,
                isActive: 0,
                createdAt: 0,
              },
            },
          ],
          as: 'customerData',
        },
      },
      {
        $lookup: {
          from: 'currencies',
          pipeline: [
            { $match: { status: true } },
            { $project: { createdAt: 0, updatedAt: 0, updatedAt: 0 } },
          ],
          as: 'currencyData',
        },
      },
    ]
  ).exec(function (err, collections) {
    if (err) {
      return console.log(err);
    }
    return res.status(httpStatus.OK).send({ status: true, data: collections });
  });
});

//get products for order
router.get('/getProducts', [verifyToken], function (req, res, next) {
  Product.aggregate([
    {
      $lookup: {
        from: 'taxes',
        let: { taxID: '$tax_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: { $eq: ['$_id', '$$taxID'] },
              },
            },
          },
        ],
        as: 'taxData',
      },
    },
    { $match: { $or: [{ is_active: true }] } },
    {
      $unwind: {
        path: '$taxData',
        preserveNullAndEmptyArrays: true,
      },
    },
  ]).exec(function (err, records) {
    if (err)
      return res
        .status(httpStatus.OK)
        .send({ status: false, msg: `Server error: ${err.message}` });
    res.status(httpStatus.OK).send({ status: true, data: records });
  });
});

//get country for order
router.get('/getCountries', [verifyToken], function (req, res, next) {
  Country.find({ status: true }).exec(function (err, records) {
    if (err)
      return res
        .status(httpStatus.OK)
        .send({ status: false, msg: `Server error: ${err.message}` });
    res.status(httpStatus.OK).send({ status: true, data: records });
  });
});

//get order statues for order
router.get('/getOrderStatues', [verifyToken], function (req, res, next) {
  OrderStatuses.find({ status: true }).exec(function (err, records) {
    if (err)
      return res
        .status(httpStatus.OK)
        .send({ status: false, msg: `Server error: ${err.message}` });
    res.status(httpStatus.OK).send({ status: true, data: records });
  });
});

//Coupon Status and response
router.post('/applyCoupon', [verifyToken], function (req, res) {
  const { coupon } = req.body;

  if (!coupon) {
    return res
      .status(httpStatus.OK)
      .send({ status: false, msg: 'Invalid parameters in request' });
  }
  Coupon.find({ code: coupon, status: true }).exec(function (err, records) {
    if (err)
      return res
        .status(httpStatus.OK)
        .send({ status: false, msg: `Server error: ${err.message}` });
    if (records.length > 0) {
      res.status(httpStatus.OK).send({ status: true, data: records });
    } else {
      res
        .status(httpStatus.OK)
        .send({ status: false, data: records, msg: 'Invalid Coupon Code' });
    }
  });
});

//update order status
router.put(
  '/updateOrderStatus/:id',
  [verifyToken, checkPermissions.check('update', 'Orders')],
  function (req, res) {
    const { order_statuses_id } = req.body;

    if (!order_statuses_id) {
      return res
        .status(httpStatus.OK)
        .send({ status: false, msg: 'Invalid parameters in request' });
    }

    Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          order_statuses_id: order_statuses_id,
        },
      },
      { new: false },
      function (err, data) {
        if (err)
          return res
            .status(httpStatus.OK)
            .send({ status: false, msg: 'Failed To Update' });
        res
          .status(httpStatus.OK)
          .send({ status: true, msg: 'Data Updated Successfully' });
      }
    );
  }
);

module.exports = router;
