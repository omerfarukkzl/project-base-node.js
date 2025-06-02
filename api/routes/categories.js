var express = require('express');
var router = express.Router();
const Categories = require('../db/models/Categories');
const Response = require('../lib/Response');
const CustomError = require('../lib/Error');
const Enum = require('../config/Enum');
const AuditLogs = require("../lib/AuditLogs");

/* GET categories listing. */
router.get('/', async (req, res) => {
  try {
    let categories = await Categories.find({});

    res.json(Response.successResponse(categories));
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post('/add', async (req, res) => {
  let body = req.body;
  try {
    if (!body.name) {
      throw new CustomError('Name is required', 'Name is required', Enum.HTTP_STATUS_CODES.BAD_REQUEST);
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

router.put('/update', async (req, res) => {
  let body = req.body;

  try {
    if (!body._id) throw new CustomError('Id is required', 'Id is required', Enum.HTTP_STATUS_CODES.BAD_REQUEST);
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

router.delete('/delete', async (req, res) => {
  let body = req.body;
  try {
    if (!body._id) throw new CustomError('Id is required', 'Id is required', Enum.HTTP_STATUS_CODES.BAD_REQUEST);
    let category = await Categories.deleteOne({ _id: body._id });

    AuditLogs.info(req.user?.email, "Categories", "delete", `Category deleted: ${JSON.stringify({_id: body._id})}`);
    res.json(Response.successResponse({ success: true, data: category }));
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
})

module.exports = router;
