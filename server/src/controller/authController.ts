import { type Request, type Response } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../model/userSchema.js";
import { config } from "../envConfig.js";

// Keep in sync with config.refreshTokenExpiresIn
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// Shared base so setRefreshCookie and clearCookie always agree — mismatched
// attributes (sameSite, secure, path) mean the browser won't clear the cookie
const cookieOptions = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: config.isProduction ? ("none" as const) : ("lax" as const),
  path: "/",
};

const generateAccessToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, config.accessTokenSecret, {
    expiresIn: config.accessTokenExpiresIn!,
  });
};

const generateRefreshToken = (id: string) => {
  return jwt.sign({ id }, config.refreshTokenSecret, {
    expiresIn: config.refreshTokenExpiresIn!,
  });
};

const setRefreshCookie = (res: Response, refreshToken: string) => {
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
  });
};

// Register
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const emailExist = await User.findOne({ email });
    if (emailExist) {
      res.status(400).json({ error: "Email already exists" });
      return;
    }
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
    });

    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save({ validateModifiedOnly: true });

    setRefreshCookie(res, refreshToken);
    res.status(201).json({
      accessToken,
      user: { id: user._id, email: user.email },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(400).json({ error: message });
  }
};

// Login
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save({ validateModifiedOnly: true });

    setRefreshCookie(res, refreshToken);
    res.status(200).json({
      accessToken,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
};

// Refresh — reads refreshToken cookie, rotates it, issues a new access token
export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const incomingToken = req.cookies?.refreshToken;
    if (!incomingToken) {
      res.status(401).json({ error: "No refresh token provided" });
      return;
    }

    let decoded: { id: string };
    try {
      decoded = jwt.verify(incomingToken, config.refreshTokenSecret) as {
        id: string;
      };
    } catch {
      res.status(401).json({ error: "Invalid or expired refresh token" });
      return;
    }

    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user || !user.refreshToken) {
      res.status(401).json({ error: "Invalid refresh token" });
      return;
    }

    const isValid = await bcrypt.compare(incomingToken, user.refreshToken);
    if (!isValid) {
      res.status(401).json({ error: "Invalid refresh token" });
      return;
    }

    const newAccessToken = generateAccessToken(user._id.toString(), user.role);
    const newRefreshToken = generateRefreshToken(user._id.toString());

    user.refreshToken = await bcrypt.hash(newRefreshToken, 10);
    await user.save();

    setRefreshCookie(res, newRefreshToken);
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
};

// Logout — revokes the stored refresh token and clears the cookie
export const logoutUser = async (req: Request, res: Response) => {
  try {
    const incomingToken = req.cookies?.refreshToken;
    if (incomingToken) {
      try {
        const decoded = jwt.verify(
          incomingToken,
          config.refreshTokenSecret,
        ) as { id: string };
        await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
      } catch {
        // Token already invalid/expired — nothing to revoke
      }
    }
    res.clearCookie("refreshToken", cookieOptions);
    res.status(200).json({ message: "Logged out" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.status(200).json({ id: user._id, email: user.email, role: user.role });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
};