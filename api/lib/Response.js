const CustomError = require('./Error');
const Enum = require('../config/Enum');

class Response {
    constructor() { }


    static successResponse(data, code = 200) {
        return {
            code,
            data: data
        }
    }

    static errorResponse(error) {
        if (error instanceof CustomError) {
            return {
                code: error.code,
                error: {
                    message: error.message,
                    description: error.description,
                }
            }
        }
        return {
            code: 500,
            error: {
                message: error.message,
                description: error.description,
            }
        }
    }
}

module.exports = Response;