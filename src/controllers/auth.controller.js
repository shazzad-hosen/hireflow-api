import {
  registerUser,
  loginUser,
  refreshUserToken,
  logoutUser,
} from "../services/auth.service.js";
import { ENV } from "../config/env.js";
import parseExpiryToMs from "../utils/parseExpiry.js";

export const register = async (req, res) => {
  const result = await registerUser(req.body);

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: ENV.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: parseExpiryToMs(ENV.REFRESH_TOKEN_EXPIRY),
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      accessToken: result.accessToken,
      user: result.user,
    },
  });
};

export const login = async (req, res) => {
  const result = await loginUser(req.body);

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: ENV.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: parseExpiryToMs(ENV.REFRESH_TOKEN_EXPIRY),
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      accessToken: result.accessToken,
      user: result.user,
    },
  });
};

export const refreshToken = async (req, res) => {
  const tokens = await refreshUserToken(req.userId, req.refreshToken);

  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: ENV.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: parseExpiryToMs(ENV.REFRESH_TOKEN_EXPIRY),
  });

  res.status(200).json({
    success: true,
    accessToken: tokens.accessToken,
  });
};

export const logout = async (req, res) => {
  await logoutUser(req.refreshToken);

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: ENV.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
