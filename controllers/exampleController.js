const express = require('express');
const router = express.Router();
const httpStatus = require('../lib/httpStatus');
const verifyToken = require('../lib/verifyToken');
const Example = require('../models/Example');

const checkPermissions = require('../lib/checkPermissions');

/************************************************************** 
  Example Routes 
**************************************************************/

//Example List 
router.get('/exampleList', [verifyToken, checkPermissions.check('read', 'Example')], function (req, res, next) {

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

    Example.countDocuments(filterData, function (err, count) {
        Example.find(filterData)
            .skip(page > 0 ? ((page - 1) * limit) : 0)
            .limit(limit)
            .sort(`${sort}`)
            .exec(function (err, records) {
                if (err) return res.status(httpStatus.OK).send({ status: false, msg: `Server error: ${err.message}` });
                res.status(httpStatus.OK).send({ status: true, data: records, page: page, per_page: limit, total: count, total_pages: Math.ceil(count / limit) });

            });
    })
});

//Example Add Route
router.post('/exampleAdd', [verifyToken, checkPermissions.check('create', 'Example')], function (req, res) {
    const { name, status } = req.body;

    if (!name) {
        return res.status(httpStatus.OK).send({ status: false, msg: 'Invalid parameters in request' });
    }

    //Save to Mongo
    Example.create({
        name: name,
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


//Example Update Route
router.put('/exampleEdit/:id', [verifyToken, checkPermissions.check('update', 'Example')], function (req, res) {
    const { name, status } = req.body;

    if (!name) {
        return res.status(httpStatus.OK).send({ status: false, msg: 'Invalid parameters in request' });
    }

    Example.findByIdAndUpdate(req.params.id, {
        $set: { name: name, status: status }
    }, { new: false }, function (err, data) {
        if (err) return res.status(httpStatus.OK).send({ status: false, msg: 'Failed To Update' });
        res.status(httpStatus.OK).send({ status: true, msg: 'Data Updated Successfully' });
    });
});

//Example Delete
router.delete('/exampleDelete/:id', [verifyToken, checkPermissions.check('delete', 'Example')], function (req, res) {
    Example.findByIdAndRemove(req.params.id, function (err, data) {
        if (err) return res.status(httpStatus.OK).send({ status: false, msg: 'Failed To Delete' });
        res.status(httpStatus.OK).send({ status: true, msg: "Data Deleted Successfully" });
    });
});

module.exports = router;
