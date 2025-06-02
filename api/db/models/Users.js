const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    first_name: {
        type: String,
    },
    last_name: {
        type: String,
    },
    phone_number: {
        type: String,
    },
    
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    versionKey: false
});

class Users extends mongoose.Model {
}
schema.loadClass(Users);
module.exports = mongoose.model('users', schema);