class CustomError extends Error {
    constructor(message, description, code) {
        super(`{"code": ${code} - "message": "${message}" - "description": "${description}"}`);
        this.description = description;
        this.code = code;
        this.message = message;
    }
}

module.exports = CustomError;