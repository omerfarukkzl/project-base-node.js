const CustomError = require('./Error');
const config = require('../config');
const i18n = new (require('./i18n'))(config.DEFAULT_LANGUAGE);
const Enum = require('../config/Enum');

class Response {
    constructor() { }


    static successResponse(data, code = 200) {
        return {
            code,
            data: data
        }
    }

    static errorResponse(error, lang = config.DEFAULT_LANGUAGE) {
        if (error instanceof CustomError) {
            return {
                code: error.code,
                error: {
                    message: error.message,
                    description: error.description,
                }
            }
        } else if (error.message.includes("E11000")) {
            return {
                code: Enum.HTTP_CODES.CONFLICT,
                error: {
                    message: i18n.translate("COMMON.ALREADY_EXISTS", lang),
                    description: i18n.translate("COMMON.ALREADY_EXISTS", lang),
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