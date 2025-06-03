const passport = require('passport');
const { ExtractJwt, Strategy } = require('passport-jwt');
const Users = require('../db/models/Users');
const UserRoles = require('../db/models/UserRoles');
const RolePrivileges = require('../db/models/RolePrivileges');
const config = require('../config');
const privs = require('../config/role_priviliges');
const Response = require('./Response');
const CustomError = require('./Error');
const Enum = require('../config/Enum');

module.exports = function () {



    let strategy = new Strategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: config.JWT_SECRET,
    }, async (payload, done) => {

        try {

            let user = await Users.findOne({ _id: payload.id });

            if (user) {
                let userRoles = await UserRoles.find({ user_id: payload.id });
                let rolePrivileges = await RolePrivileges.find({ role_id: { $in: userRoles.map(r => r.role_id) } });
                let privileges = rolePrivileges.map(rp => privs.privileges.find(x => x.key == rp.permission));
                done(null, {
                    id: user._id,
                    email: user.email,
                    roles: privileges,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    exp: parseInt(Date.now() / 1000) * config.JWT_EXPIRATION_TIME
                });

                return;
            } else {
                done(null, Error("User not found"));
            }
        } catch (error) {
            done(error, null)
        }
    })

    passport.use(strategy);

    return {
        initialize: function () {
            return passport.initialize();
        },
        authenticate: function () {
            return passport.authenticate("jwt", { session: false });
        },
        checkRoles: (...expectedRoles) => {
            return (req, res, next) => {
                let i = 0;
                let privileges = req.user.roles.map(r => r.key);

                while (i < expectedRoles.length && privileges.includes(expectedRoles[i]))
                    i++;

                if (i >= expectedRoles.length) {
                    next();
                } else {
                    let errorResponse = Response.errorResponse(new CustomError("Permission Error", "You don't have permission to access this resource", Enum.HTTP_CODES.UNAUTHORIZED));
                    res.status(errorResponse.code).json(errorResponse);
                }
            }
        }
    }



}
