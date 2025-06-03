const mongoose = require('mongoose');
const is = require('is_js');
const { HTTP_CODES, PASS_LENGTH } = require('../../config/Enum');
const CustomError = require('../../lib/Error');
const bcrypt = require('bcrypt');
const {DEFAULT_LANGUAGE} = require('../../config');

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
    language: {
        type: String,
        default: DEFAULT_LANGUAGE
    }

}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    versionKey: false
});

class Users extends mongoose.Model {

    validPassword(password) {
        return bcrypt.compareSync(password, this.password);
    }

    static validateFieldsBeforeAuth(email, password) {
        if(typeof password !== 'string' || password.length < PASS_LENGTH || is.not.email(email)) {
            throw new CustomError(HTTP_CODES.UNAUTHORIZED, "Validation Error", "Invalid email or password");
        }
        return null;
    }

}
schema.loadClass(Users);
module.exports = mongoose.model('users', schema);