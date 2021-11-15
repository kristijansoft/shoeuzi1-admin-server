const jwtModule = require('./jwtModule')
const httpStatus = require('./httpStatus')
const User = require('../models/User');
const Role = require('../models/Role');

var checkPermissions = (function () {

    check = function (action, group) {
        return function (req, res, next) {
            User.findById(req.userId, { role_id: 1 }, function (err, user) {
                Role.findById(user.role_id, { permissions: 1 }, function (err, role) {
                    for (let p = 0; p < role.permissions.length; p++) {
                        if (role.permissions[p]['module'] == group) {

                            if (role.permissions[p]['permission'].includes(action)) {
                                next();
                            }
                            else {
                                return res.status(401).send({ msg: "You are trying to " + action + " and do not have the correct permissions." });
                            }
                        }
                    }
                    if (role.permissions.find(p => p.module == group) == undefined) {
                        return res.status(401).send({ msg: "You are trying to " + action + " and do not have the correct permissions." });
                    }
                });
            });
        }
    }

    return {
        check: function (action, group) {
            return check(action, group);
        }
    }

})();

module.exports = checkPermissions;
