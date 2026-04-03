const config = {
  port: Number(process.env.PORT || 5000),
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "access-secret-dev",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "refresh-secret-dev",
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  bcryptSaltRounds: Number(
    process.env.BCRYPT_SALT_ROUNDS || process.env.BCRYPT_SALT_ROUND || 10
  ),
};

export default config;
