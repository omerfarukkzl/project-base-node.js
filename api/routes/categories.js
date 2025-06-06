var express = require('express');
var router = express.Router();
const Categories = require('../db/models/Categories');
const Response = require('../lib/Response');
const CustomError = require('../lib/Error');
const Enum = require('../config/Enum');
const AuditLogs = require("../lib/AuditLogs");
const auth = require("../lib/auth")();
const config = require('../config');
const i18n = new (require('../lib/i18n'))(config.DEFAULT_LANGUAGE);

router.all("*", auth.authenticate(),(req, res, next) => {
    next();
});

/* GET categories listing. */
router.get('/', auth.checkRoles("category_view"), async (req, res) => {
  try {
    let categories = await Categories.find({});

    res.json(Response.successResponse(categories));
  } catch (error) {
    let errorResponse = Response.errorResponse(error, req.user?.language);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post('/add', auth.checkRoles("category_create"), async (req, res) => {
  let body = req.body;
  try {
    if (!body.name) {
      throw new CustomError(i18n.translate("COMMON.VALIDATION_ERROR", req.user?.language), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["Name"]), Enum.HTTP_CODES.BAD_REQUEST);
    }
    let category = new Categories({
      name: body.name,
      is_active: body.is_active,
      created_by: req.user?.id || null,
    });

    await category.save()

    AuditLogs.info(req.user?.email, "Categories", "add", `Category added: ${JSON.stringify(category)}`);

    res.json(Response.successResponse({ success: true, data: category }));
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.put('/update', auth.checkRoles("category_update"), async (req, res) => {
  let body = req.body;

  try {
    if (!body._id) throw new CustomError(i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["Id"]), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["Id"]), Enum.HTTP_CODES.BAD_REQUEST);
    let updates = {};

    if (body.name) updates.name = body.name;
    if (typeof body.is_active === 'boolean') updates.is_active = body.is_active;

    let category = await Categories.updateOne({ _id: body._id }, updates);

    AuditLogs.info(req.user?.email, "Categories", "update", `Category updated: ${JSON.stringify({_id: body._id, ...updates})}`);

    res.json(Response.successResponse({ success: true, data: category }));
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
})

router.delete('/delete', auth.checkRoles("category_delete"), async (req, res) => {
  let body = req.body;
  try {
    if (!body._id) throw new CustomError(i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["Id"]), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user?.language, ["Id"]), Enum.HTTP_CODES.BAD_REQUEST);
    let category = await Categories.deleteOne({ _id: body._id });

    AuditLogs.info(req.user?.email, "Categories", "delete", `Category deleted: ${JSON.stringify({_id: body._id})}`);
    res.json(Response.successResponse({ success: true, data: category }));
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
})

module.exports = router;
