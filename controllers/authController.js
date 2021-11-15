const express = require('express');
const router = express.Router();
const httpStatus = require('../lib/httpStatus');
const jwtModule = require('../lib/jwtModule');
const verifyToken = require('../lib/verifyToken');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/index');

/* Customer Authentication */

//login user api
router.post('/customerLogin', function (req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(httpStatus.OK)
      .send({ status: false, msg: 'Invalid parameters in request' });
  }
  //find customer
  Customer.findOne({ email }, function (error, customer) {
    if (error) {
      const message = `Server error: ${error.message}`;
      return res.status(httpStatus.OK).send({ status: false, msg: message });
    } else {
      if (customer) {
        const { _id, email, password } = customer;
        const passwordMatch = bcrypt.compareSync(req.body.password, password);
        if (passwordMatch) {
          // login and return a new token
          const payload = { id: _id };
          const signingOptions = {
            subject: email,
            audience: 'ajadmin',
          };
          const signedToken = jwtModule.sign(payload, signingOptions);
          res.locals.loginToken = signedToken;

          //update token in user table
          Customer.findByIdAndUpdate(
            _id,
            {
              $set: { token: signedToken },
            },
            { new: false },
            function (err, user) {
              if (err)
                return res
                  .status(httpStatus.OK)
                  .send(`Server error: ${err.message}`);

              return res.status(httpStatus.OK).send({
                status: true,
                msg: 'successfully login',
                token: signedToken,
                userData: {
                  first_name: customer.first_name,
                  last_name: customer.last_name,
                  email: customer.email,
                  profileImage: customer.profileImage,
                },
              });
            }
          );
        } else {
          return res
            .status(httpStatus.OK)
            .send({ status: false, msg: 'Password Not Match', token: null });
        }
      } else {
        const message = `User not found (email: ${req.body.email})`;
        return res.status(httpStatus.OK).send({ status: false, msg: message });
      }
    }
  });
});
/* End Customer Authentication */

//login user api
router.post('/login', function (req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(httpStatus.OK)
      .send({ status: false, msg: 'Invalid parameters in request' });
  }
  //find user
  User.findOne({ email }, function (error, user) {
    if (error) {
      const message = `Server error: ${error.message}`;
      return res.status(httpStatus.OK).send({ status: false, msg: message });
    } else {
      if (user) {
        const { _id, email, password } = user;
        const passwordMatch = bcrypt.compareSync(req.body.password, password);
        if (passwordMatch) {
          // login and return a new token
          const payload = { id: _id };
          const signingOptions = {
            subject: email,
            audience: 'ajadmin',
          };
          const signedToken = jwtModule.sign(payload, signingOptions);
          res.locals.loginToken = signedToken;

          //update token in user table
          User.findByIdAndUpdate(
            _id,
            {
              $set: { token: signedToken },
            },
            { new: false },
            function (err, user) {
              if (err)
                return res
                  .status(httpStatus.OK)
                  .send(`Server error: ${err.message}`);

              //get user role
              Role.findOne({ _id: user.role_id }, function (error, role) {
                if (err)
                  return res
                    .status(httpStatus.OK)
                    .send(`Server error: ${err.message}`);
                return res.status(httpStatus.OK).send({
                  status: true,
                  msg: 'successfully login',
                  token: signedToken,
                  userData: {
                    name: user.name,
                    email: user.email,
                    profileImage: user.profileImage,
                  },
                  roleData: role,
                });
              });
            }
          );
        } else {
          return res
            .status(httpStatus.OK)
            .send({ status: false, msg: 'Password Not Match', token: null });
        }
      } else {
        const message = `User not found (email: ${req.body.email})`;
        return res.status(httpStatus.OK).send({ status: false, msg: message });
      }
    }
  });
});

//login user api
router.post('/addUserIfNotExist', function (req, res) {
  //find user
  User.find({}, function (error, user) {
    if (error) {
      const message = `Server error: ${error.message}`;
      return res.status(httpStatus.OK).send({ status: false, msg: message });
    } else {
      if (user.length < 1) {
        Role.create(
          {
            name: 'Super Admin',
            description: 'Can Do Anything',
            permissions: [
              { module: 'Dashboard', permission: ['read'] },
              {
                module: 'Category',
                permission: ['create', 'read', 'update', 'delete'],
              },
              {
                module: 'Size',
                permission: ['create', 'read', 'update', 'delete'],
              },
              {
                module: 'Colors',
                permission: ['create', 'read', 'update', 'delete'],
              },
              {
                module: 'Country',
                permission: ['create', 'read', 'update', 'delete'],
              },
              {
                module: 'Product',
                permission: ['create', 'read', 'update', 'delete'],
              },
              {
                module: 'Blog',
                permission: ['create', 'read', 'update', 'delete'],
              },
              {
                module: 'Blog Category',
                permission: ['create', 'read', 'update', 'delete'],
              },
              {
                module: 'Tag',
                permission: ['create', 'read', 'update', 'delete'],
              },
              {
                module: 'Faq',
                permission: ['create', 'read', 'update', 'delete'],
              },
              {
                module: 'Service',
                permission: ['create', 'read', 'update', 'delete'],
              },
              {
                module: 'Customer',
                permission: ['create', 'read', 'update', 'delete'],
              },
              {
                module: 'Role',
                permission: ['create', 'read', 'update', 'delete'],
              },
              {
                module: 'Users',
                permission: ['create', 'read', 'update', 'delete'],
              },
              {
                module: 'Currency',
                permission: ['create', 'read', 'update', 'delete'],
              },
              {
                module: 'Coupon',
                permission: ['create', 'read', 'update', 'delete'],
              },
              {
                module: 'Tax',
                permission: ['create', 'read', 'update', 'delete'],
              },
              {
                module: 'Order Status',
                permission: ['create', 'read', 'update', 'delete'],
              },
              {
                module: 'Orders',
                permission: ['create', 'read', 'update', 'delete', 'view'],
              },
              { module: 'Setting', permission: ['read', 'update'] },
              {
                module: 'Example',
                permission: ['create', 'read', 'update', 'delete'],
              },
            ],
          },
          function (err, inserted) {
            const hashedPassword = bcrypt.hashSync(')z#F>WPq(M+^kHVX', 8);
            User.create(
              {
                name: 'Super Admin',
                email: 'superadmin@mail.com',
                password: hashedPassword,
                role_id: inserted._id,
              },
              function () {
                return res
                  .status(httpStatus.OK)
                  .send({ status: true, msg: 'User Created' });
              }
            );
          }
        );
      }
    }
  });
});

module.exports = router;
