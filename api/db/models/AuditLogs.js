const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    level: {
        type: String,
    },
    email: {
        type: String,
    },
    location: {
        type: String,
    },
    proc_type: {
        type: String,
    },
    log: {
        type: mongoose.SchemaTypes.Mixed,
    }
}, {
    versionKey: false,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

class Auditlogs extends mongoose.Model {
}
schema.loadClass(Auditlogs);
module.exports = mongoose.model('auditlogs', schema);