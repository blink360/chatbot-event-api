import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { prisma } from "../../lib/db/prisma/index";

import {
  JwtPayload,
  LoginDto,
  RegisterDto,
  AuthTokens,
  AuthResponse,
} from "./auth.types.js";

export const register = async (data: RegisterDto): Promise<AuthResponse> => {
  const { email, password } = data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
    },
  });

  const tokens = generateTokens({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  await storeRefreshToken(user.id, tokens.refreshToken);

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    ...tokens,
  };
};

export const login = async (data: LoginDto): Promise<AuthResponse> => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    throw new Error("Invalid credentials");
  }

  const tokens = generateTokens({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  await storeRefreshToken(user.id, tokens.refreshToken);

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    ...tokens,
  };
};

export const refreshToken = async (token: string): Promise<AuthTokens> => {
  let payload: JwtPayload;

  try {
    payload = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET as string,
    ) as JwtPayload;
  } catch {
    throw new Error("Invalid refresh token");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
  });

  if (!user || !user.refreshTokenHash) {
    throw new Error("Access denied");
  }

  const isValid = await bcrypt.compare(token, user.refreshTokenHash);

  if (!isValid) {
    throw new Error("Invalid refresh token");
  }

  const tokens = generateTokens({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  await storeRefreshToken(user.id, tokens.refreshToken);

  return tokens;
};

export const logout = async (userId: string): Promise<{ message: string }> => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      refreshTokenHash: null,
    },
  });

  return {
    message: "Logged out successfully",
  };
};

const generateTokens = (payload: JwtPayload): AuthTokens => {
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET as string,
    {
      expiresIn: "15m",
    },
  );

  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET as string,
    {
      expiresIn: "7d",
    },
  );

  return {
    accessToken,
    refreshToken,
  };
};

const storeRefreshToken = async (
  userId: string,
  refreshToken: string,
): Promise<void> => {
  const refreshTokenHash = await bcrypt.hash(refreshToken, 12);

  await prisma.user.update({
    where: { id: userId },
    data: {
      refreshTokenHash,
    },
  });
};
