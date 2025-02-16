import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

export interface AuthenticatedRequest extends Request {
  userId: Types.ObjectId;
}
export const userMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized, no token provided" });
  }
  const secret = process.env.USER_JWT_SECRET;
  if (!secret) {
    console.error("No JWT secret is defined in environment variables");
    process.exit(1);
  }
  try {
    const decode = jwt.verify(token, secret) as JwtPayload;
    if (!decode || decode._id) {
      return res.status(400).json({ message: "Invalid token" });
    }
    (req as AuthenticatedRequest).userId = new mongoose.Types.ObjectId(decode._id);
    next();
  } catch (e) {
    console.log("JWT verification failed:", e);
    return res.status(403).json({ message: "Invalid token" });
  }
};
