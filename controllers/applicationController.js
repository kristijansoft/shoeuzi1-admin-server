const express = require('express');
const router = express.Router();
const httpStatus = require('../lib/httpStatus');
const verifyToken = require('../lib/verifyToken');
const Faq = require('../models/Faq');
const Customer = require('../models/Customer');
const Service = require('../models/Service');
const Role = require('../models/Role');
const User = require('../models/User');
const Product = require('../models/Product');
const Blog = require('../models/Blog');
var multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const checkPermissions = require('../lib/checkPermissions');
let path = require('path');

// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/applicationImages')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

var upload = multer({ storage: storage })


/************************************************************** 
 Customer Routes 
**************************************************************/

//Customer List 
router.get('/customerList', [verifyToken, checkPermissions.check('read', 'Customer')], function (req, res, next) {
    let page = parseInt(req.query.currentPage, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 10;
    let fsort = req.query.sort;
    let forder = req.query.order;
    let filterData = {};
    let sort = '-createdAt';
    if (fsort != '') {
        if (forder == 'ASC') {
            sort = fsort;
        }
        else if (forder == 'DESC') {
            sort = '-' + fsort;
        }
    }

    if (req.query.keyword != '') {
        filterData = { 'first_name': { "$regex": req.query.keyword, "$options": "i" } }
    }

    Customer.countDocuments(filterData, function (err, count) {
        Customer.find(filterData)
            .skip(page > 0 ? ((page - 1) * limit) : 0)
            .sort(`${sort}`)
            .limit(limit)
            .exec(function (err, records) {
                if (err) return res.status(httpStatus.OK).send({ status: false, msg: `Server error: ${err.message}` });
                res.status(httpStatus.OK).send({ status: true, data: records, page: page, per_page: limit, total: count, total_pages: Math.ceil(count / limit) });
            });
    })
});

//Customer Add Route
router.post('/customerAdd', [verifyToken, checkPermissions.check('create', 'Customer')], function (req, res) {
    const { first_name, last_name, email, password, phone_no, isActive } = req.body;

    if (!first_name || !email || !password) {
        return res.status(httpStatus.OK).send({ status: false, msg: 'Invalid parameters in request' });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);
    //Save to Mongo
    Customer.create({
        first_name: first_name,
        last_name: last_name,
        email: email,
        password: hashedPassword,
        phone_no: phone_no,
        isActive: isActive,
    },
        function (error, inserted) {
            if (error) {
                const message = `Server error: ${error.message}`
                return res.status(httpStatus.OK).send({ status: false, msg: message });
            }
            res.status(httpStatus.OK).send({ status: true, msg: 'Data Added Successfully!', customer_id: inserted._id });
        });
});

//Customer Update Route
router.put('/customerEdit/:id', [verifyToken, checkPermissions.check('update', 'Customer')], function (req, res) {
    const { first_name, last_name, email, password, phone_no, isActive, oldPassword } = req.body;

    if (!first_name || !email || !phone_no) {
        return res.status(httpStatus.OK).send({ status: false, msg: 'Invalid parameters in request' });
    }
    let hashedPassword;

    if (password) {
        hashedPassword = bcrypt.hashSync(password, 8);
    }
    else {
        hashedPassword = oldPassword;
    }

    Customer.findByIdAndUpdate(req.params.id, {
        $set: {
            first_name: first_name,
            last_name: last_name,
            email: email,
            password: hashedPassword,
            phone_no: phone_no,
            isActive: isActive,
        }
    }, { new: false }, function (err, data) {
        if (err) return res.status(httpStatus.OK).send({ status: false, msg: 'Failed To Update' });
        res.status(httpStatus.OK).send({ status: true, msg: 'Data Updated Successfully' });
    });
});

//Customer Delete
router.delete('/customerDelete/:id', [verifyToken, checkPermissions.check('delete', 'Customer')], function (req, res) {
    Customer.findByIdAndRemove(req.params.id, function (err, data) {
        if (err) return res.status(httpStatus.OK).send({ status: false, msg: 'Failed To Delete' });

        //delete from storage
        fs.unlink(path.join(__dirname, '../public/applicationImages/' + data.profileImage), function (err) {
            if (err && err.code == 'ENOENT') {
                // file doens't exist
                console.info("File doesn't exist, won't remove it.");
            } else if (err) {
                // other errors, e.g. maybe we don't have enough permission
                console.error("Error occurred while trying to remove file");
            } else {
                //    console.info(`removed`);
            }
        });
        res.status(httpStatus.OK).send({ status: true, msg: "Data Deleted Successfully" });
    });
});


//upload Customer image
router.post('/uploadCustomerImage', [verifyToken, upload.single('image')], function (req, res) {
    Customer.findByIdAndUpdate(req.query.id, {
        $set: { profileImage: req.file.filename }
    }, { new: false }, function (err, Customer) {
        if (err) return res.status(httpStatus.OK).send({ status: false, msg: 'Failed To Update' });
        res.status(httpStatus.OK).send({ status: true, msg: 'Data Added Successfully', imageuploaded: true });
    });
});

//update Customer images
router.post('/updateCustomerImage', [verifyToken, upload.single('image')], function (req, res) {

    Customer.findByIdAndUpdate(req.query.id, {
        $set: { profileImage: req.file.filename }
    }, { new: false }, function (err, Customer) {
        if (err) return res.status(httpStatus.OK).send({ status: false, msg: 'Failed To Update' });

        //delete from storage
        fs.unlink(path.join(__dirname, '../public/applicationImages/' + req.body.oldImage), function (err) {
            if (err && err.code == 'ENOENT') {
                // file doens't exist
                console.info("File doesn't exist, won't remove it.");
            } else if (err) {
                // other errors, e.g. maybe we don't have enough permission
                console.error("Error occurred while trying to remove file");
            } else {
                //    console.info(`removed`);
            }
        });
        res.status(httpStatus.OK).send({ status: true, msg: 'Data Updated Successfully' });
    });
});

/************************************************************** 
  Faq Routes 
**************************************************************/

//Faq List 
router.get('/faqList', [verifyToken, checkPermissions.check('read', 'Faq')], function (req, res, next) {


    let page = parseInt(req.query.currentPage, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 10;
    let fsort = req.query.sort;
    let forder = req.query.order;
    let filterData = {};
    let sort = '-createdAt';
    if (fsort != '') {
        sort = '';
        if (forder == 'ASC') {
            sort = fsort;
        }
        else if (forder == 'DESC') {
            sort = '-' + fsort;
        }
    }

    if (req.query.keyword != '') {
        filterData = { 'title': { "$regex": req.query.keyword, "$options": "i" } }
    }

    Faq.countDocuments(filterData, function (err, count) {
        Faq.find(filterData)
            .skip(page > 0 ? ((page - 1) * limit) : 0)
            .limit(limit)
            .sort(`${sort}`)
            .exec(function (err, records) {
                if (err) return res.status(httpStatus.OK).send({ status: false, msg: `Server error: ${err.message}` });
                res.status(httpStatus.OK).send({ status: true, data: records, page: page, per_page: limit, total: count, total_pages: Math.ceil(count / limit) });

            });
    })
});

//Faq Add Route
router.post('/faqAdd', [verifyToken, checkPermissions.check('create', 'Faq')], function (req, res) {
    const { title, content, status } = req.body;

    if (!title) {
        return res.status(httpStatus.OK).send({ status: false, msg: 'Invalid parameters in request' });
    }

    //Save to Mongo
    Faq.create({
        title: title,
        content: content,
        status: status,
    },
        function (error, inserted) {
            if (error) {
                const message = `Server error: ${error.message}`
                return res.status(httpStatus.OK).send({ status: false, msg: message });
            }
            res.status(httpStatus.OK).send({ status: true, msg: 'Data Added Successfully!' });
        });
});


//Faq Update Route
router.put('/faqEdit/:id', [verifyToken, checkPermissions.check('update', 'Faq')], function (req, res) {
    const { title, content, status } = req.body;

    if (!title) {
        return res.status(httpStatus.OK).send({ status: false, msg: 'Invalid parameters in request' });
    }

    Faq.findByIdAndUpdate(req.params.id, {
        $set: {
            title: title,
            content: content,
            status: status,
        }
    }, { new: false }, function (err, data) {
        if (err) return res.status(httpStatus.OK).send({ status: false, msg: 'Failed To Update' });
        res.status(httpStatus.OK).send({ status: true, msg: 'Data Updated Successfully' });
    });
});

//Faq Delete
router.delete('/faqDelete/:id', [verifyToken, checkPermissions.check('delete', 'Faq')], function (req, res) {
    Faq.findByIdAndRemove(req.params.id, function (err, data) {
        if (err) return res.status(httpStatus.OK).send({ status: false, msg: 'Failed To Delete' });
        res.status(httpStatus.OK).send({ status: true, msg: "Data Deleted Successfully" });
    });
});


/************************************************************** 
 Service Routes 
**************************************************************/

//Service List 
router.get('/serviceList', [verifyToken, checkPermissions.check('read', 'Service')], function (req, res, next) {
    let page = parseInt(req.query.currentPage, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 10;
    let fsort = req.query.sort;
    let forder = req.query.order;
    let filterData = {};
    let sort = '-createdAt';

    if (fsort != '') {
        if (forder == 'ASC') {
            sort = fsort;
        }
        else if (forder == 'DESC') {
            sort = '-' + fsort;
        }
    }

    if (req.query.keyword != '') {
        filterData = { 'title': { "$regex": req.query.keyword, "$options": "i" } }
    }

    Service.countDocuments(filterData, function (err, count) {
        Service.find(filterData)
            .skip(page > 0 ? ((page - 1) * limit) : 0)
            .limit(limit)
            .sort(`${sort}`)
            .exec(function (err, records) {
                if (err) return res.status(httpStatus.OK).send({ status: false, msg: `Server error: ${err.message}` });
                res.status(httpStatus.OK).send({ status: true, data: records, page: page, per_page: limit, total: count, total_pages: Math.ceil(count / limit) });
            });
    })
});

//Service Add Route
router.post('/serviceAdd', [verifyToken, checkPermissions.check('create', 'Service')], function (req, res) {
    const { title, content, status } = req.body;

    if (!title || !content) {
        return res.status(httpStatus.OK).send({ status: false, msg: 'Invalid parameters in request' });
    }

    //Save to Mongo
    Service.create({
        title: title,
        content: content,
        status: status
    },
        function (error, inserted) {
            if (error) {
                const message = `Server error: ${error.message}`
                return res.status(httpStatus.OK).send({ status: false, msg: message });
            }
            res.status(httpStatus.OK).send({ status: true, msg: 'Data Added Successfully!', service_id: inserted._id });
        });
});

//Service Update Route
router.put('/serviceEdit/:id', [verifyToken, checkPermissions.check('update', 'Service')], function (req, res) {
    const { title, content, status } = req.body;

    if (!title || !content) {
        return res.status(httpStatus.OK).send({ status: false, msg: 'Invalid parameters in request' });
    }

    Service.findByIdAndUpdate(req.params.id, {
        $set: {
            title: title,
            content: content,
            status: status
        }
    }, { new: false }, function (err, data) {
        if (err) return res.status(httpStatus.OK).send({ status: false, msg: 'Failed To Update' });
        res.status(httpStatus.OK).send({ status: true, msg: 'Data Updated Successfully' });
    });
});

//Service Delete
router.delete('/serviceDelete/:id', [verifyToken, checkPermissions.check('delete', 'Service')], function (req, res) {
    Service.findByIdAndRemove(req.params.id, function (err, data) {
        if (err) return res.status(httpStatus.OK).send({ status: false, msg: 'Failed To Delete' });

        //delete from storage
        fs.unlink(path.join(__dirname, '../public/applicationImages/' + data.serviceImage), function (err) {
            if (err && err.code == 'ENOENT') {
                // file doens't exist
                console.info("File doesn't exist, won't remove it.");
            } else if (err) {
                // other errors, e.g. maybe we don't have enough permission
                console.error("Error occurred while trying to remove file");
            } else {
                //    console.info(`removed`);
            }
        });
        res.status(httpStatus.OK).send({ status: true, msg: "Data Deleted Successfully" });
    });
});

//upload Service image
router.post('/uploadServiceImage', [verifyToken, upload.single('image')], function (req, res) {
    Service.findByIdAndUpdate(req.query.id, {
        $set: { serviceImage: req.file.filename }
    }, { new: false }, function (err, Service) {
        if (err) return res.status(httpStatus.OK).send({ status: false, msg: 'Failed To Update' });
        res.status(httpStatus.OK).send({ status: true, msg: 'Data Added Successfully' });
    });
});

//update Service images
router.post('/updateServiceImage', [verifyToken, upload.single('image')], function (req, res) {

    Service.findByIdAndUpdate(req.query.id, {
        $set: { serviceImage: req.file.filename }
    }, { new: false }, function (err, Service) {
        if (err) return res.status(httpStatus.OK).send({ status: false, msg: 'Failed To Update' });

        //delete from storage
        fs.unlink(path.join(__dirname, '../public/applicationImages/' + req.body.oldImage), function (err) {
            if (err && err.code == 'ENOENT') {
                // file doens't exist
                console.info("File doesn't exist, won't remove it.");
            } else if (err) {
                // other errors, e.g. maybe we don't have enough permission
                console.error("Error occurred while trying to remove file");
            } else {
                //    console.info(`removed`);
            }
        });
        res.status(httpStatus.OK).send({ status: true, msg: 'Data Updated Successfully' });
    });
});

/************************************************************** 
  Role Routes 
**************************************************************/

//Role List 
router.get('/roleList', [verifyToken, checkPermissions.check('read', 'Role')], function (req, res, next) {


    let page = parseInt(req.query.currentPage, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 10;
    let fsort = req.query.sort;
    let forder = req.query.order;
    let filterData = {};
    let sort = '-createdAt';

    if (fsort != '') {
        if (forder == 'ASC') {
            sort = fsort;
        }
        else if (forder == 'DESC') {
            sort = '-' + fsort;
        }
    }

    if (req.query.keyword != '') {
        filterData = { 'name': { "$regex": req.query.keyword, "$options": "i" } }
    }

    Role.countDocuments(filterData, function (err, count) {
        Role.find(filterData)
            .skip(page > 0 ? ((page - 1) * limit) : 0)
            .limit(limit)
            .sort(`${sort}`)
            .exec(function (err, records) {
                if (err) return res.status(httpStatus.OK).send({ status: false, msg: `Server error: ${err.message}` });
                res.status(httpStatus.OK).send({ status: true, data: records, page: page, per_page: limit, total: count, total_pages: Math.ceil(count / limit) });

            });
    })
});

//Role Add Route
router.post('/roleAdd', [verifyToken, checkPermissions.check('create', 'Role')], function (req, res) {
    const { name, description, permissions } = req.body;

    if (!name) {
        return res.status(httpStatus.OK).send({ status: false, msg: 'Invalid parameters in request' });
    }

    //Save to Mongo
    Role.create({
        name: name,
        description: description,
        permissions: permissions,
    },
        function (error, inserted) {
            if (error) {
                const message = `Server error: ${error.message}`
                return res.status(httpStatus.OK).send({ status: false, msg: message });
            }
            res.status(httpStatus.OK).send({ status: true, msg: 'Data Added Successfully!' });
        });
});


//Role Update Route
router.put('/roleEdit/:id', [verifyToken, checkPermissions.check('update', 'Role')], function (req, res) {
    const { name, description, permissions } = req.body;

    if (!name) {
        return res.status(httpStatus.OK).send({ status: false, msg: 'Invalid parameters in request' });
    }

    Role.findByIdAndUpdate(req.params.id, {
        $set: {
            name: name,
            description: description,
            permissions: permissions,
        }
    }, { new: false }, function (err, data) {
        if (err) return res.status(httpStatus.OK).send({ status: false, msg: 'Failed To Update' });
        res.status(httpStatus.OK).send({ status: true, msg: 'Data Updated Successfully' });
    });
});

//Role Delete
router.delete('/roleDelete/:id', [verifyToken, checkPermissions.check('delete', 'Role')], function (req, res) {
    Role.findByIdAndRemove(req.params.id, function (err, data) {
        if (err) return res.status(httpStatus.OK).send({ status: false, msg: 'Failed To Delete' });
        res.status(httpStatus.OK).send({ status: true, msg: "Data Deleted Successfully" });
    });
});


/************************************************************** 
 User Routes 
**************************************************************/

//User List 
router.get('/userList', [verifyToken, checkPermissions.check('read', 'Users')], function (req, res, next) {
    let page = parseInt(req.query.currentPage, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 10;
    let fsort = req.query.sort;
    let forder = req.query.order;
    let keyword = '';
    let filterData = {};
    let sort = { 'createdAt': -1 };

    if (fsort != '') {
        if (forder == 'ASC') {
            sort = { [fsort]: 1 };
        }
        else if (forder == 'DESC') {
            sort = { [fsort]: -1 };
        }
    }

    if (req.query.keyword != '') {
        keyword = req.query.keyword;
    }
    if (req.query.keyword != '') {
        filterData = { 'name': { "$regex": req.query.keyword, $options: 'm' } }
    }

    User.countDocuments(filterData, function (err, count) {
        User.aggregate([
            {
                $lookup:
                {
                    from: "roles",
                    let: { roleID: "$role_id" },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr:
                                {
                                    $and: { $eq: ["$_id", "$$roleID"] },
                                }
                            }
                        },
                    ],
                    as: "roleData"
                },
            },
            { $match: { $or: [{ name: { $regex: keyword, $options: 'i' } }, { email: { $regex: keyword, $options: 'i' } }] } },
            {
                $unwind: {
                    path: '$roleData',
                    preserveNullAndEmptyArrays: true
                }
            },
            { $sort: sort },
            { $skip: page > 0 ? ((page - 1) * limit) : 0 },
            { $limit: limit },
        ]).exec(function (err, records) {
            if (err) return res.status(httpStatus.OK).send({ status: false, msg: `Server error: ${err.message}` });
            res.status(httpStatus.OK).send({ status: true, data: records, page: page, per_page: limit, total: count, total_pages: Math.ceil(count / limit) });
        });
    });
});

//User Add Route
router.post('/userAdd', [verifyToken, checkPermissions.check('create', 'Users')], function (req, res) {
    const { name, email, password, role_id } = req.body;

    if (!name || !email || !password || !role_id) {
        return res.status(httpStatus.OK).send({ status: false, msg: 'Invalid parameters in request' });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);
    //Save to Mongo
    User.create({
        name: name,
        email: email,
        password: hashedPassword,
        role_id: role_id,
    },
        function (error, inserted) {
            if (error) {
                const message = `Server error: ${error.message}`
                return res.status(httpStatus.OK).send({ status: false, msg: message });
            }
            res.status(httpStatus.OK).send({ status: true, msg: 'Data Added Successfully!', user_id: inserted._id });
        });
});

//User Update Route
router.put('/userEdit/:id', [verifyToken, checkPermissions.check('update', 'Users')], function (req, res) {
    const { name, email, password, oldPassword, role_id } = req.body;

    if (!name || !email || !role_id) {
        return res.status(httpStatus.OK).send({ status: false, msg: 'Invalid parameters in request' });
    }

    let hashedPassword;

    if (password) {
        hashedPassword = bcrypt.hashSync(password, 8);
    }
    else {
        hashedPassword = oldPassword;
    }
    User.findByIdAndUpdate(req.params.id, {
        $set: {
            name: name,
            email: email,
            password: hashedPassword,
            role_id: role_id,
        }
    }, { new: false }, function (err, user) {
        if (err) return res.status(httpStatus.OK).send({ status: false, msg: 'Failed To Update' });
        res.status(httpStatus.OK).send({ status: true, msg: 'Data Updated Successfully', userData: { name: user.name, email: user.email, profileImage: user.profileImage } });
    });
});

//User Delete
router.delete('/userDelete/:id', [verifyToken, checkPermissions.check('delete', 'Users')], function (req, res) {
    User.findByIdAndRemove(req.params.id, function (err, data) {
        if (err) return res.status(httpStatus.OK).send({ status: false, msg: 'Failed To Delete' });

        //delete from storage
        fs.unlink(path.join(__dirname, '../public/applicationImages/' + data.profileImage), function (err) {
            if (err && err.code == 'ENOENT') {
                // file doens't exist
                console.info("File doesn't exist, won't remove it.");
            } else if (err) {
                // other errors, e.g. maybe we don't have enough permission
                console.error("Error occurred while trying to remove file");
            } else {
                //    console.info(`removed`);
            }
        });
        res.status(httpStatus.OK).send({ status: true, msg: "Data Deleted Successfully" });
    });
});


//upload User image
router.post('/uploadUserImage', [verifyToken, upload.single('image')], function (req, res) {
    User.findByIdAndUpdate(req.query.id, {
        $set: { profileImage: req.file.filename }
    }, { new: false }, function (err, Customer) {
        if (err) return res.status(httpStatus.OK).send({ status: false, msg: 'Failed To Update' });
        res.status(httpStatus.OK).send({ status: true, msg: 'Data Added Successfully' });
    });
});

//update User images
router.post('/updateUserImage', [verifyToken, upload.single('image')], function (req, res) {

    User.findByIdAndUpdate(req.query.id, {

        $set: { profileImage: req.file.filename }
    }, { new: false }, function (err, user) {
        if (err) return res.status(httpStatus.OK).send({ status: false, msg: 'Failed To Update' });
        //delete from storage
        fs.unlink(path.join(__dirname, '../public/applicationImages/' + req.body.oldImage), function (err) {
            if (err && err.code == 'ENOENT') {
                // file doens't exist
                console.info("File doesn't exist, won't remove it.");
            } else if (err) {
                // other errors, e.g. maybe we don't have enough permission
                console.error("Error occurred while trying to remove file");
            } else {
                //    console.info(`removed`);
            }
        });

        res.status(httpStatus.OK).send({ status: true, msg: 'Data Updated Successfully', userData: { name: user.name, email: user.email, profileImage: req.file.filename, token: user.token } });

    });
});

//Role List For users
router.get('/userRoles', [verifyToken], function (req, res, next) {

    Role.find({})
        .exec(function (err, records) {
            if (err) return res.status(httpStatus.OK).send({ status: false, msg: `Server error: ${err.message}` });
            res.status(httpStatus.OK).send({ status: true, data: records });
        });
});


router.get('/refreshUserPermission', [verifyToken], function (req, res) {

    //find user 
    User.findOne({ _id: req.userId }).exec(function (err, user) {
        Role.findOne({ _id: user.role_id }, function (err, role) {
            if (err) return res.status(httpStatus.OK).send(`Server error: ${err.message}`);
            return res.status(httpStatus.OK).send({ status: true, roleData: role });
        });
    });
});



/************************************************************** 
 Dashboard Routes 
**************************************************************/

//Dashboard  
router.get('/getDashboard', [verifyToken, checkPermissions.check('read', 'Dashboard')], function (req, res, next) {

    //counts
    Promise.all([
        Product.countDocuments().exec(),
        Customer.countDocuments().exec(),
        Blog.countDocuments().exec(),
        User.countDocuments().exec(),
    ]).then(function (counts) {
        User.aggregate(
            [
                { $limit: 1 },
                { $lookup: { from: 'products', pipeline: [{ $match: { is_active: true } }, { $sort: { "createdAt": -1 } }, { $limit: 8 }], as: 'productData' } },
                { $lookup: { from: 'customers', pipeline: [{ $match: { isActive: true } }, { $sort: { "createdAt": -1 } }, { $limit: 10 }], as: 'customerData' } },
                { $lookup: { from: 'blogs', pipeline: [{ $group: { _id: { $substr: ['$createdAt', 5, 2] }, count: { $sum: 1 } }, }, { $sort: { "_id": 1 } },], as: 'blogsMonthly' } },
                { $lookup: { from: 'customers', pipeline: [{ $group: { _id: { $substr: ['$createdAt', 5, 2] }, count: { $sum: 1 } }, }, { $sort: { "_id": 1 } },], as: 'customerMonthly' } }

            ]).exec(function (err, collections) {
                if (err) { return console.log(err); }
                return res.status(httpStatus.OK).send({ status: true, data: collections, totalProduct: counts[0], totalCustomer: counts[1], totalBlog: counts[2], totalUser: counts[3] });
            });
    });
});


/************************************************************** 
 Profile Routes 
**************************************************************/

//Profile  
router.get('/getProfile', [verifyToken], function (req, res, next) {
    let token = req.header('authorization');
    token = token.replace('Bearer ', '');
    User.findOne({ token: token }).exec(function (err, user) {
        if (err) return res.status(httpStatus.OK).send(`Server error: ${err.message}`);
        return res.status(httpStatus.OK).send({ status: true, data: user });
    });
});


//Profile Update Route
router.put('/profileEdit/:id', [verifyToken, checkPermissions.check('update', 'Users')], function (req, res) {
    const { name, email, role_id } = req.body;

    if (!name || !email || !role_id) {
        return res.status(httpStatus.OK).send({ status: false, msg: 'Invalid parameters in request' });
    }

    User.findByIdAndUpdate(req.params.id, {
        $set: {
            name: name,
            email: email,
            role_id: role_id,
        }
    }, { new: false }).exec(function (err, user) {
        if (err) return res.status(httpStatus.OK).send({ status: false, msg: 'Failed To Update' });
        res.status(httpStatus.OK).send({ status: true, msg: 'Data Updated Successfully', userData: { name: name, role_id: role_id, email: user.email } });
    });
});

//Profile Update Route
router.put('/passwordEdit/:id', [verifyToken, checkPermissions.check('update', 'Users')], function (req, res) {
    const { password, oldPassword } = req.body;

    if (!password || !oldPassword) {
        return res.status(httpStatus.OK).send({ status: false, msg: 'Invalid parameters in request' });
    }

    User.findOne({ _id: req.params.id }, function (error, user) {
        const passwordMatch = bcrypt.compareSync(oldPassword, user.password);
        if (passwordMatch) {
            let hashedPassword = bcrypt.hashSync(password, 8);
            User.findByIdAndUpdate(req.params.id, {
                $set: {
                    password: hashedPassword,
                }
            }, { new: false }, function (err, data) {
                if (err) return res.status(httpStatus.OK).send({ status: false, msg: 'Failed To Update' });
                res.status(httpStatus.OK).send({ status: true, msg: 'Data Updated Successfully' });
            });
        }
        else {
            res.status(httpStatus.OK).send({ status: false, msg: 'Current Password Does Not Match' });
        }
    });
});


module.exports = router;
