import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";
import { RefreshToken } from "../models/refreshToken.model.js";
import crypto from "crypto";
import parseExpiryToMs from "../utils/parseExpiry.js";
import { ENV } from "../config/env.js";
import jwt from "jsonwebtoken";

// User register services
export const registerUser = async (data) => {
  const { name, email, password } = data;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "Email already in use");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  const hashedToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const refreshExpiry = new Date(
    Date.now() + parseExpiryToMs(ENV.REFRESH_TOKEN_EXPIRY),
  );

  await RefreshToken.create({
    user: user._id,
    token: hashedToken,
    expiresAt: refreshExpiry,
  });

  const userObject = user.toObject();
  delete userObject.password;

  return {
    user: userObject,
    accessToken,
    refreshToken,
  };
};

// User log in services
export const loginUser = async (data) => {
  const { email, password } = data;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isMatch = await user.isPasswordCorrect(password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  await RefreshToken.deleteMany({ user: user._id });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  const hashedToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const refreshExpiry = new Date(
    Date.now() + parseExpiryToMs(ENV.REFRESH_TOKEN_EXPIRY),
  );

  await RefreshToken.create({
    user: user._id,
    token: hashedToken,
    expiresAt: refreshExpiry,
  });

  const userObject = user.toObject();
  delete userObject.password;

  return {
    user: userObject,
    accessToken,
    refreshToken,
  };
};

// Refresh token rotation services
export const refreshUserToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token required");
  }

  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, ENV.REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(incomingRefreshToken)
    .digest("hex");

  const existingToken = await RefreshToken.findOne({
    token: hashedToken,
    user: decoded.id,
  });

  if (!existingToken) {
    await RefreshToken.deleteMany({ user: decoded.id });
    throw new ApiError(403, "Refresh token reuse detected");
  }

  await RefreshToken.deleteOne({ _id: existingToken._id });

  const newAccessToken = generateAccessToken(decoded.id);
  const newRefreshToken = generateRefreshToken(decoded.id);

  const newHashedToken = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  const refreshExpiry = new Date(
    Date.now() + parseExpiryToMs(ENV.REFRESH_TOKEN_EXPIRY),
  );

  await RefreshToken.create({
    user: decoded.id,
    token: newHashedToken,
    expiresAt: refreshExpiry,
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};
