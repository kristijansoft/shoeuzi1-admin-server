const express = require('express');
const router = express.Router();
const httpStatus = require('../lib/httpStatus');
const verifyToken = require('../lib/verifyToken');
const BlogCategory = require('../models/BlogCategory');
const Tag = require('../models/Tag');
const Blog = require('../models/Blog');
var multer = require('multer');
const fs = require('fs');
const checkPermissions = require('../lib/checkPermissions');
let path = require('path');

// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/blogImages');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

var upload = multer({ storage: storage });

/************************************************************** 
 Blog Routes 
**************************************************************/

//Blog List
router.get(
  '/blogList',
  [verifyToken, checkPermissions.check('read', 'Blog')],
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
      filterData = { name: { $regex: req.query.keyword, $options: 'm' } };
    }

    Blog.countDocuments(filterData, function (err, count) {
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
          $match: {
            $or: [
              { title: { $regex: keyword, $options: 'i' } },
              { slug: { $regex: keyword, $options: 'i' } },
            ],
          },
        },
        {
          $unwind: {
            path: '$categoryData',
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

//Blog Add Route
router.post(
  '/blogAdd',
  [verifyToken, checkPermissions.check('create', 'Blog')],
  function (req, res) {
    const {
      title,
      subTitle,
      slug,
      content,
      buttonText,
      publishDate,
      blog_category_id,
      blog_tag_id,
      meta_title,
      meta_keyword,
      meta_description,
      published,
    } = req.body;

    if (!title || !content || !blog_category_id || !publishDate) {
      return res
        .status(httpStatus.OK)
        .send({ status: false, msg: 'Invalid parameters in request' });
    }

    //Save to Mongo
    Blog.create(
      {
        title: title,
        subTitle: subTitle,
        slug: slug,
        content: content,
        buttonText: buttonText,
        publishDate: publishDate,
        blog_category_id: blog_category_id,
        blog_tag_id: blog_tag_id,
        meta_title: meta_title,
        meta_keyword: meta_keyword,
        meta_description: meta_description,
        published: published,
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
          blog_id: inserted._id,
        });
      }
    );
  }
);

//upload Blog image
router.post(
  '/uploadBlogImage',
  [verifyToken, upload.single('image')],
  function (req, res) {
    Blog.findByIdAndUpdate(
      req.query.id,
      {
        $set: { blogImage: req.file.filename },
      },
      { new: false },
      function (err, blog) {
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
  '/updateBlogImage',
  [verifyToken, upload.single('image')],
  function (req, res) {
    Blog.findByIdAndUpdate(
      req.query.id,
      {
        $set: { blogImage: req.file.filename },
      },
      { new: false },
      function (err, blog) {
        if (err)
          return res
            .status(httpStatus.OK)
            .send({ status: false, msg: 'Failed To Update' });

        //delete from storage
        fs.unlink(
          path.join(__dirname, '../public/blogImages/' + req.body.oldImage),
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

        res
          .status(httpStatus.OK)
          .send({ status: true, msg: 'Data Updated Successfully' });
      }
    );
  }
);

//Blog Update Route
router.put(
  '/blogEdit/:id',
  [verifyToken, checkPermissions.check('update', 'Blog')],
  function (req, res) {
    const {
      title,
      subTitle,
      slug,
      content,
      buttonText,
      publishDate,
      blog_category_id,
      blog_tag_id,
      meta_title,
      meta_keyword,
      meta_description,
      published,
    } = req.body;

    if (
      !title ||
      !subTitle ||
      !content ||
      !buttonText ||
      !blog_category_id ||
      !publishDate
    ) {
      return res
        .status(httpStatus.OK)
        .send({ status: false, msg: 'Invalid parameters in request' });
    }

    Blog.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          title: title,
          subTitle: subTitle,
          slug: slug,
          content: content,
          buttonText: buttonText,
          publishDate: publishDate,
          blog_category_id: blog_category_id,
          blog_tag_id: blog_tag_id,
          meta_title: meta_title,
          meta_keyword: meta_keyword,
          meta_description: meta_description,
          published: published,
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

//Blog Delete
router.delete(
  '/blogDelete/:id',
  [verifyToken, checkPermissions.check('delete', 'Blog')],
  function (req, res) {
    Blog.findByIdAndRemove(req.params.id, function (err, data) {
      if (err)
        return res
          .status(httpStatus.OK)
          .send({ status: false, msg: 'Failed To Delete' });

      //delete from storage
      fs.unlink(
        path.join(__dirname, '../public/blogImages/' + data.blogImage),
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
      res
        .status(httpStatus.OK)
        .send({ status: true, msg: 'Data Deleted Successfully' });
    });
  }
);

//get  cats,tags for blog
router.get('/bct', [verifyToken], function (req, res, next) {
  BlogCategory.aggregate(
    // 1. Use any collection containing at least one document.
    [
      { $limit: 1 }, // 2. Keep only one document of the collection.
      // // 4. Lookup collections to union together.
      {
        $lookup: {
          from: 'blogcategories',
          pipeline: [{ $match: { status: true } }],
          as: 'BlogCategoryData',
        },
      },
      {
        $lookup: {
          from: 'tags',
          pipeline: [{ $match: { status: true } }],
          as: 'TagData',
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

/************************************************************** 
 Blog Category Routes 
**************************************************************/

//Blog Category List
router.get(
  '/blogCategoryList',
  [verifyToken, checkPermissions.check('read', 'Blog Category')],
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

    BlogCategory.countDocuments(filterData, function (err, count) {
      BlogCategory.find(filterData)
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

//Blog Category Add Route
router.post(
  '/blogCategoryAdd',
  [verifyToken, checkPermissions.check('create', 'Blog Category')],
  function (req, res) {
    const { name, slug, meta_title, meta_keyword, meta_description, status } =
      req.body;

    if (!name) {
      return res
        .status(httpStatus.OK)
        .send({ status: false, msg: 'Invalid parameters in request' });
    }

    //Save to Mongo
    BlogCategory.create(
      {
        name: name,
        slug: slug,
        meta_title: meta_title,
        meta_keyword: meta_keyword,
        meta_description: meta_description,
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

//Blog Category Update Route
router.put(
  '/blogCategoryEdit/:id',
  [verifyToken, checkPermissions.check('update', 'Blog Category')],
  function (req, res) {
    const { name, slug, meta_title, meta_keyword, meta_description, status } =
      req.body;

    if (!name) {
      return res
        .status(httpStatus.OK)
        .send({ status: false, msg: 'Invalid parameters in request' });
    }

    BlogCategory.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name: name,
          slug: slug,
          meta_title: meta_title,
          meta_description: meta_description,
          meta_keyword: meta_keyword,
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

//Blog Category Delete
router.delete(
  '/blogCategoryDelete/:id',
  [verifyToken, checkPermissions.check('delete', 'Blog Category')],
  function (req, res) {
    BlogCategory.findByIdAndRemove(req.params.id, function (err, data) {
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
 Tag Routes 
**************************************************************/

//Tag List
router.get(
  '/tagList',
  [verifyToken, checkPermissions.check('read', 'Tag')],
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

    Tag.countDocuments(filterData, function (err, count) {
      Tag.find(filterData)
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

//Tag Add Route
router.post(
  '/tagAdd',
  [verifyToken, checkPermissions.check('create', 'Tag')],
  function (req, res) {
    const { name, status } = req.body;

    if (!name) {
      return res
        .status(httpStatus.OK)
        .send({ status: false, msg: 'Invalid parameters in request' });
    }

    //Save to Mongo
    Tag.create(
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

//Tag Update Route
router.put(
  '/tagEdit/:id',
  [verifyToken, checkPermissions.check('update', 'Tag')],
  function (req, res) {
    const { name, status } = req.body;

    if (!name) {
      return res
        .status(httpStatus.OK)
        .send({ status: false, msg: 'Invalid parameters in request' });
    }

    Tag.findByIdAndUpdate(
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

//Tag Delete
router.delete(
  '/tagDelete/:id',
  [verifyToken, checkPermissions.check('delete', 'Tag')],
  function (req, res) {
    Tag.findByIdAndRemove(req.params.id, function (err, data) {
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

module.exports = router;
