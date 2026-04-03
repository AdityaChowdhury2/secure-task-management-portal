import bcrypt from "bcrypt";
import config from "../config";

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, config.bcrypt_salt_round);
};

export const comparePassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};
