import express, { NextFunction, Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";

interface User {}
export interface AuthRequest extends Request {
  userId: string;
}

export function userMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.token;
    if (!authHeader && !cookieToken) {
      res.status(401).json({ message: "Authorization token required" });
      return;
    }

    const token = authHeader
      ? authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader
      : cookieToken;

    const decoded = jwt.verify(
      token,
      process.env.USER_JWT_SECRET as Secret
    ) as { id: string };

    (req as any).userId = decoded.id;

    next();
  } catch (error) {
    console.error("auth middleware error", error);
    res.status(401).json({ message: "Invalid token" });
  }
}
