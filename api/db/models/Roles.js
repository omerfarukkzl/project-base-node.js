const mongoose = require('mongoose');
const RolePriviliges = require('./RolePrivileges');

const schema = new mongoose.Schema({
    role_name: {
        type: String,
        required: true
    },
    is_active: {
        type: Boolean,
        default: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
    },
}, {
    versionKey: false,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

class Roles extends mongoose.Model {

    static async remove(query)
    {
        await RolePriviliges.deleteMany({role_id: query._id});
        await super.remove(query)
    }
}
schema.loadClass(Roles);
module.exports = mongoose.model('roles', schema);