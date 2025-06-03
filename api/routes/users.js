var express = require('express');
const bcrypt = require("bcrypt-nodejs");
const Users = require('../db/models/Users');
const Response = require("../lib/Response");
const CustomError = require('../lib/Error');
const Enum = require('../config/Enum');
const UserRoles = require('../db/models/UserRoles');
const Roles = require('../db/models/Roles');
const is = require("is_js");
const config = require('../config');
const jwt = require('jwt-simple');
const RolePrivileges = require('../db/models/RolePrivileges');
const role_priviliges = require('../config/role_priviliges');
var router = express.Router();
const auth = require("../lib/auth")();
const i18n = new (require('../lib/i18n'))(config.DEFAULT_LANGUAGE);

router.post("/auth", async (req, res) => {
  try {
    let { email, password } = req.body;

    Users.validateFieldsBeforeAuth(email, password);

    let user = await Users.findOne({ email });

    if (!user) throw new CustomError("Validation Error", "Invalid email or password", Enum.HTTP_CODES.UNAUTHORIZED);

    if (!user.validPassword(password)) throw new CustomError("Validation Error", "Invalid email or password", Enum.HTTP_CODES.UNAUTHORIZED);

    let payload = {
      id: user._id,
      exp: parseInt(Date.now() / 1000) + config.JWT_EXPIRATION_TIME
    }

    let token = jwt.encode(payload, config.JWT_SECRET);

    let userData = {
      _id: user._id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
    }

    res.json(Response.successResponse({ token, user: userData }));

  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
})

router.post("/register", async (req, res) => {
  let body = req.body;
  try {

    if (!body.email) throw new CustomError("Validation Error", "email field must be filled", Enum.HTTP_CODES.BAD_REQUEST);

    if (is.not.email(body.email)) throw new CustomError("Validation Error", "email field must be an email format", Enum.HTTP_CODES.BAD_REQUEST);

    let existingUser = await Users.findOne({ email: body.email });
    if (existingUser) {
      throw new CustomError("Registration Error", "User with this email already exists", Enum.HTTP_CODES.CONFLICT);
    }

    if (!body.password) throw new CustomError("Validation Error", "password field must be filled", Enum.HTTP_CODES.BAD_REQUEST);

    if (body.password.length < Enum.PASS_LENGTH) {
      throw new CustomError("Validation Error", "password length must be greater than " + Enum.PASS_LENGTH, Enum.HTTP_CODES.BAD_REQUEST);
    }

    let password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);

    let createdUser = await Users.create({
      email: body.email,
      password,
      is_active: true,
      first_name: body.first_name,
      last_name: body.last_name,
      phone_number: body.phone_number
    });

    let role = await Roles.create({
      role_name: Enum.SUPER_ADMIN,
      is_active: true,
      created_by: createdUser._id
    })

    await UserRoles.create({
      role_id: role._id,
      user_id: createdUser._id
    });

    // Grant all privileges to super admin
    for (let privilege of role_priviliges.privileges) {
      await RolePrivileges.create({
        role_id: role._id,
        permission: privilege.key,
        created_by: createdUser._id
      });
    }

    res.status(Enum.HTTP_CODES.CREATED).json(Response.successResponse({ success: true }, Enum.HTTP_CODES.CREATED));

  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
})
router.all("*", auth.authenticate(), (req, res, next) => {
  next();
});



/* GET users listing. */
router.get('/', auth.checkRoles("user_view"), async (req, res) => {
  try {
    let users = await Users.find({}, { password: 0 }).lean();

    for (let i = 0; i < users.length; i++) {
      let roles = await UserRoles.find({ user_id: users[i]._id }).populate("role_id").lean();
      users[i].roles = roles.map(r => ({
        _id: r._id,
        role_id: r.role_id._id,
        role_name: r.role_id.role_name,
        is_active: r.role_id.is_active,
        created_at: r.created_at,
        updated_at: r.updated_at
      }));
    }

    res.json(Response.successResponse(users));

  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post("/add", auth.checkRoles("user_create"), async (req, res) => {
  let body = req.body;
  try {

    if (!body.email) throw new CustomError("Validation Error", "email field must be filled", Enum.HTTP_CODES.BAD_REQUEST);

    if (is.not.email(body.email)) throw new CustomError("Validation Error", "email field must be an email format", Enum.HTTP_CODES.BAD_REQUEST);

    if (!body.password) throw new CustomError(i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language, ["Password"]), i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language, ["Password"]), Enum.HTTP_CODES.BAD_REQUEST);

    if (body.password.length < Enum.PASS_LENGTH) {
      throw new CustomError(i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language, ["Password"]), i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language, ["Password"]), Enum.HTTP_CODES.BAD_REQUEST);
    }

    if (!body.roles || !Array.isArray(body.roles) || body.roles.length == 0) {
      throw new CustomError(i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language, i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["Roles"])), i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language, i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["Roles"])), Enum.HTTP_CODES.BAD_REQUEST);
    }

    let roles = await Roles.find({ _id: { $in: body.roles } });

    if (roles.length == 0) {
      throw new CustomError(i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language, i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["Roles"])), i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language, i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["Roles"])), Enum.HTTP_CODES.BAD_REQUEST);
    }

    let password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);

    let user = await Users.create({
      email: body.email,
      password,
      is_active: true,
      first_name: body.first_name,
      last_name: body.last_name,
      phone_number: body.phone_number
    });

    for (let i = 0; i < roles.length; i++) {
      await UserRoles.create({
        role_id: roles[i]._id,
        user_id: user._id
      })
    }

    res.status(Enum.HTTP_CODES.CREATED).json(Response.successResponse({ success: true }, Enum.HTTP_CODES.CREATED));

  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
})

router.put("/update", auth.checkRoles("user_update"), async (req, res) => {
  try {
    let body = req.body;
    let updates = {};

    if (!body._id) throw new CustomError(i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language, ["Id"]), i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language, ["Id"]), Enum.HTTP_CODES.BAD_REQUEST);

    if (body.password && body.password.length < Enum.PASS_LENGTH) {
      updates.password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);
    }

    if (typeof body.is_active === "boolean") updates.is_active = body.is_active;
    if (body.first_name) updates.first_name = body.first_name;
    if (body.last_name) updates.last_name = body.last_name;
    if (body.phone_number) updates.phone_number = body.phone_number;

    if (req.user && body._id == req.user.id) {
      // throw new CustomError(Enum.HTTP_CODES.FORBIDDEN, "Permission Error", "Cannot edit own roles")
      body.roles = null;
    }

    if (Array.isArray(body.roles) && body.roles.length > 0) {

      let userRoles = await UserRoles.find({ user_id: body._id });

      let removedRoles = userRoles.filter(x => !body.roles.includes(x.role_id));
      let newRoles = body.roles.filter(x => !userRoles.map(r => r.role_id).includes(x));

      if (removedRoles.length > 0) {
        await UserRoles.deleteMany({ _id: { $in: removedRoles.map(x => x._id.toString()) } });
      }

      if (newRoles.length > 0) {
        for (let i = 0; i < newRoles.length; i++) {
          let userRole = new UserRoles({
            role_id: newRoles[i],
            user_id: body._id
          });

          await userRole.save();
        }
      }

    }

    await Users.updateOne({ _id: body._id }, updates);

    res.json(Response.successResponse({ success: true }));

  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post("/delete", auth.checkRoles("user_delete"), async (req, res) => {
  try {
    let body = req.body;

    if (!body._id) throw new CustomError("Validation Error", "_id field must be filled", Enum.HTTP_CODES.BAD_REQUEST);

    await Users.deleteOne({ _id: body._id });

    await UserRoles.deleteMany({ user_id: body._id });

    res.json(Response.successResponse({ success: true }));

  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.get("/secret", auth.checkRoles("super_secret_access"), async (req, res) => {
  try {
    res.json(Response.successResponse({ message: "This is a super secret endpoint!" }));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

module.exports = router;