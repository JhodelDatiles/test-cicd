import dotenv from "dotenv";
import { type SignOptions } from "jsonwebtoken";

dotenv.config();

function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key] || fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const isProduction = process.env.NODE_ENV === "production";

export const config = {
  isProduction,
  port: Number(getEnvVar("PORT")),
  db: getEnvVar("MONGO_URI"),
  accessTokenSecret: getEnvVar("ACCESS_TOKEN_SECRET"),
  refreshTokenSecret: getEnvVar("REFRESH_TOKEN_SECRET"),
  accessTokenExpiresIn: getEnvVar(
    "ACCESS_TOKEN_EXPIRES_IN",
    "15m",
  ) as SignOptions["expiresIn"],
  refreshTokenExpiresIn: getEnvVar(
    "REFRESH_TOKEN_EXPIRES_IN",
    "7d",
  ) as SignOptions["expiresIn"],
  clientUrl: isProduction
    ? process.env.CLIENT_URL_PROD
    : "http://localhost:5173",
};

// console.log(`-----------------------------------`);
// console.log(`port: ${config.port}`);
// console.log(`-----------------------------------`);
