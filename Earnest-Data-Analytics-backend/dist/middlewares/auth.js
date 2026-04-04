"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const token_1 = require("../utils/token");
const getBearerToken = (authorizationHeader) => {
    if (!authorizationHeader)
        return null;
    const [type, token] = authorizationHeader.split(" ");
    if (type !== "Bearer" || !token)
        return null;
    return token;
};
const requireAuth = (req, res, next) => {
    const token = getBearerToken(req.headers.authorization);
    if (!token) {
        res.status(401).json({ message: "Unauthorized: missing access token." });
        return;
    }
    try {
        req.user = (0, token_1.verifyAccessToken)(token);
        next();
    }
    catch (_error) {
        res.status(401).json({ message: "Unauthorized: invalid access token." });
    }
};
exports.requireAuth = requireAuth;
