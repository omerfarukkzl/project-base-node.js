var express = require('express');
var router = express.Router();
const Roles = require('../db/models/Roles');
const Response = require('../lib/Response');
const CustomError = require('../lib/Error');
const Enum = require('../config/Enum');
const role_priviliges = require('../config/role_priviliges');
const RolePrivileges = require('../db/models/RolePrivileges');
const auth = require("../lib/auth")();

router.all("*", auth.authenticate(),(req, res, next) => {
    next();
});

/* GET roles listing. */
router.get('/', auth.checkRoles("role_view"), async (req, res) => {

    try {
        let roles = await Roles.find({});
        res.json(Response.successResponse(roles));
    } catch (error) {
        let errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }
});

router.post('/add', auth.checkRoles("role_create"), async (req, res) => {
    let body = req.body;
    try {
        if (!body) throw new CustomError('role name is required', 'role name is required', Enum.HTTP_STATUS_CODES.BAD_REQUEST);

        if (!body.permissions || body.permissions.length === 0 || !Array.isArray(body.permissions)
        ) throw new CustomError('permissions is required', 'permissions is required', Enum.HTTP_STATUS_CODES.BAD_REQUEST);

        let role = new Roles({
            role_name: body.role_name,
            is_active: body.is_active,
            created_by: req.user?.id || null,
        });
        await role.save();

        for (let i = 0; i < body.permissions.length; i++) {
            let priv = new RolePrivileges({
                role_id: role._id,
                permission: body.permissions[i],
                created_by: req.user?.id || null,
            });
            await priv.save();

        }

        res.json(Response.successResponse({ success: true, data: role }));
    } catch (error) {
        let errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }
})

router.put('/update', auth.checkRoles("role_update"), async (req, res) => {
    let body = req.body;
    console.log('PUT /update - Request Body:', JSON.stringify(body, null, 2));
    try {
        if (!body._id) throw new CustomError('Id is required', 'Id is required', Enum.HTTP_STATUS_CODES.BAD_REQUEST);
        let updates = {};
        if (body.role_name) updates.role_name = body.role_name;
        if (typeof body.is_active === 'boolean') updates.is_active = body.is_active;

        if (body.permissions && body.permissions.length > 0 && Array.isArray(body.permissions)) {

            let permissions = await RolePrivileges.find({ role_id: body._id });
            let removed_permissions = permissions.filter(p => !body.permissions.includes(p.permission));
            let new_permissions = body.permissions.filter(x => !permissions.map(y => y.permission).includes(x));

            if (removed_permissions.length > 0) {
                await RolePrivileges.deleteMany({ role_id: body._id, permission: { $in: removed_permissions.map(p => p.permission) } });
            }

            if (new_permissions.length > 0) {
                for (let i = 0; i < new_permissions.length; i++) {
                    let priv = new RolePrivileges({
                        role_id: body._id,
                        permission: new_permissions[i],
                        created_by: req.user?.id || null,
                    });
                    await priv.save();
                }
            }
        }

        let role = await Roles.updateOne({ _id: body._id }, updates);
        res.json(Response.successResponse({ success: true, data: role }));
    } catch (error) {
        let errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }
})

router.delete('/delete', auth.checkRoles("role_delete"), async (req, res) => {
    let body = req.body;
    try {
        if (!body._id) throw new CustomError('Id is required', 'Id is required', Enum.HTTP_STATUS_CODES.BAD_REQUEST);
        
        // First delete all role privileges
        let privilegesResult = await RolePrivileges.deleteMany({ role_id: body._id });
        
        // Then delete the role
        let roleResult = await Roles.deleteOne({ _id: body._id });
        
        res.json(Response.successResponse({ 
            success: true, 
            data: {
                role: roleResult,
                privileges: privilegesResult,
                message: `Deleted ${roleResult.deletedCount} role and ${privilegesResult.deletedCount} privileges`
            }
        }));
    } catch (error) {
        let errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }
})

router.get('/role_priviliges', async (req, res) => {

    res.json(Response.successResponse(role_priviliges));

})
module.exports = router;
