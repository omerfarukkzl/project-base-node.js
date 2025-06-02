/* eslint-disable no-unused-vars */
const passport = require('passport');
const { ExtractJwt, Strategy } = require('passport-jwt');
const Users = require('../db/models/Users');
const UserRoles = require('../db/models/UserRoles');
const RolePrivileges = require('../db/models/RolePrivileges');
const config = require('../config');


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

            done(null, {
                id: user._id,
                email: user.email,
                roles: rolePrivileges,
                first_name: user.first_name,
                last_name: user.last_name,
                exp: parseInt(Date.now() / 1000) * config.JWT_EXPIRATION_TIME
            });

            return;
        } else{
            done(null, Error("User not found"));
        }
    } catch (error) {
        done(error,null)
    }
    })

    passport.use(strategy);

    return {
        initialize: function(){
            return passport.initialize();
        },
        authenticate: function(){
            return passport.authenticate("jwt", {session: false});
        }
    }


    
}
