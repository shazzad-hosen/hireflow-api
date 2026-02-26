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

export const refreshUserToken = async (userId, existingRefreshToken) => {
  await RefreshToken.deleteOne({ _id: existingRefreshToken._id });

  const newAccessToken = generateAccessToken(userId);
  const newRefreshToken = generateRefreshToken(userId);

  const hashedToken = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  const refreshExpiry = new Date(
    Date.now() + parseExpiryToMs(ENV.REFRESH_TOKEN_EXPIRY),
  );

  await RefreshToken.create({
    user: userId,
    token: hashedToken,
    expiresAt: refreshExpiry,
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const logoutUser = async (incomingRefreshToken) => {
  await RefreshToken.deleteOne({ _id: incomingRefreshToken._id });
};
