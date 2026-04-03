import config from ".";

export const JWT_SECRET = config.jwtAccessSecret || "supersecret";
export const JWT_REFRESH_SECRET = config.jwtRefreshSecret || "supersecret";
export const JWT_EXPIRES_IN = config.accessTokenExpiresIn || "7d";
export const JWT_REFRESH_EXPIRES_IN = config.refreshTokenExpiresIn || "2h";
