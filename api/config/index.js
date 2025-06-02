/* eslint-disable no-undef */
module.exports = {
    PORT: process.env.PORT || 3000,
    LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
    CONNECTION_STRING: process.env.CONNECTION_STRING || '',
    JWT_SECRET: process.env.JWT_SECRET || 'secret',
    JWT_EXPIRATION_TIME: process.env.JWT_EXPIRATION_TIME || 24*60*60
}