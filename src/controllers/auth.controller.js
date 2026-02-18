import {
  registerUser,
  loginUser,
  refreshUserToken,
} from "../services/auth.service.js";

// Register controller
export const register = async (req, res) => {
  const result = await registerUser(req.body);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: result,
  });
};

// Log in controller
export const login = async (req, res) => {
  const result = await loginUser(req.body);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
};

// Refresh token controller
export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  const tokens = await refreshUserToken(refreshToken);

  res.status(200).json({
    success: true,
    ...tokens,
  });
};
