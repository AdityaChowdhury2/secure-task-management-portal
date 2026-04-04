"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendResponse = (res, data) => {
    if (data.cookies) {
        data.cookies.forEach((cookie) => {
            res.cookie(cookie.name, cookie.value, cookie.options);
        });
    }
    res.status(data.statusCode).json({
        success: data.success,
        message: data.message,
        data: data.data,
    });
};
exports.default = sendResponse;
