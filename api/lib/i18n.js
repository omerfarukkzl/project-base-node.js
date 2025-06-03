const i18n = require('../i18n');

class I18n {
    constructor(lang) {
        this.lang = lang;
    }

    translate(text, lang = this.lang, params = []) {
        let arr = text.split("."); //  COMMON.VALIDATION_ERROR => ["COMMON", "VALIDATION_ERROR"]

        let value = i18n[lang][arr[0]]; // i18n[EN]["COMMON"]

        for (let i = 1; i < arr.length; i++) {
            value = value[arr[i]]; // value = i18n[EN]["COMMON"]["VALIDATION_ERROR"]
        }

        if (!value) return text; // If translation not found, return original text

        value = value + "";

        // Handle both array and single string params
        if (Array.isArray(params)) {
            // First try indexed placeholders {0}, {1}, etc.
            for (let i = 0; i < params.length; i++) {
                value = value.replace(`{${i}}`, params[i]);
            }
            // Then try simple placeholder {} for the first parameter
            if (params.length > 0) {
                value = value.replace('{}', params[0]);
            }
        } else if (typeof params === 'string') {
            value = value.replace('{}', params);
        }

        return value;
    }
}
module.exports = I18n;