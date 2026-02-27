import {
  registerUser,
  loginUser,
  refreshUserToken,
  logoutUser,
  getUserSessions,
} from "../services/auth.service.js";
import { ENV } from "../config/env.js";
import parseExpiryToMs from "../utils/parseExpiry.js";

export const registerUserController = async (req, res) => {
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

export const loginUserController = async (req, res) => {
  const result = await loginUser(req.body, {
    userAgent: req.headers["user-agent"],
    ip: req.ip,
  });

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

export const refreshUserTokenController = async (req, res) => {
  const tokens = await refreshUserToken(req.userId, req.refreshToken, {
    userAgent: req.headers["user-agent"],
    ip: req.ip,
  });

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

export const logoutUserController = async (req, res) => {
  const refreshTokenCookie = req.cookies?.refreshToken;

  let result = await logoutUser(req.user._id, refreshTokenCookie);

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: ENV.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({
    success: true,
    ...result,
  });
};

export const getSessionsController = async (req, res) => {
  const sessions = await getUserSessions(req.user._id);

  res.status(200).json({
    success: true,
    count: sessions.length,
    data: sessions,
  });
};

export const revokeSessionController = async (req, res) => {
  const result = await revokeUserSession(req.user._id, req.params.id);

  res.status(200).json({
    success: true,
    ...result,
  });
};
