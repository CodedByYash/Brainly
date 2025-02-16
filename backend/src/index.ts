import express, { Request, Response } from "express";
import { z } from "zod";
import { ContentModel, UserModel } from "./db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { AuthenticatedRequest, userMiddleware } from "./middleware";
import { Document, Types } from "mongoose";

const app = express();

app.use(express.json());
app.use(cookieParser());

interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
}

interface AuthRequestBody {
  email: string;
  password: string;
}

app.post("/api/v1/signup", async (req: Request, res: Response) => {
  const schema = z.object({
    email: z.string().min(3).max(50).email(),
    password: z.string().min(8).max(20),
  });

  const parsedBody = schema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json({
      message: "Invalid request body",
      error: parsedBody.error,
    });
    return;
  }

  const { email, password } = parsedBody.data;
  try {
    const founduser = await UserModel.findOne({ email });

    if (founduser) {
      res.status(409).json({ message: "User already exists" });
      return;
    }

    const saltround = 10;
    const hashedPassword = await bcrypt.hash(password, saltround);
    const user = await UserModel.create({
      email: email,
      password: hashedPassword,
    });
    res.status(201).json({ message: "user signup successful" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/v1/signin", async (req: Request, res: Response) => {
  const schema = z.object({
    email: z.string().min(3).max(50).email(),
    password: z.string().min(8).max(20),
  });

  const parsedBody = schema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json({ message: "Invalid request body" });
    return;
  }

  const { email, password } = parsedBody.data;

  try {
    const founduser = (await UserModel.findOne({ email })) as IUser | null;

    if (!founduser || !(await bcrypt.compare(password, founduser.password))) {
      res.status(403).json({ message: "Invalid Credentials" });
      return;
    }

    const JWT_SECRET = process.env.USER_JWT_SECRET;

    if (!JWT_SECRET) {
      console.error("USER_JWT_SECRET is missing in environment variables.");
      res.status(500).json({ message: "Internal Server Error" });
      return;
    }

    const token = jwt.sign({ id: founduser?._id }, JWT_SECRET, {
      expiresIn: "2d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 172800 * 1000,
    });
    res.status(200).json({ message: "SignIn successful" });
    return;
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal Server error" });
    return;
  }
});

app.post(
  "/api/v1/content",
  userMiddleware,
  async (req: Request<{}, {}, AuthRequestBody>, res: Response) => {
    const schema = z.object({
      title: z.string().min(3).max(300),
      link: z.string().min(3).max(400),
      type: z.string().min(3).max(20),
    });

    const parsedBody = schema.safeParse(req.body);
    if (!parsedBody.success) {
      res
        .status(400)
        .json({ message: "Invalid request body", error: parsedBody.error });
      return;
    }

    const { title, link, type } = parsedBody.data;
    try {
      const course = await ContentModel.create({
        title,
        link,
        type,
        tags: [],
        userId: req.userId,
      });
      res.status(201).json({ message: "Content created successfully" });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

app.get(
  "/api/v1/content",
  //@ts-ignore
  userMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    try {
      const contet = await ContentModel.find({ userId }).populate(
        "userId",
        "username"
      );
      res.status(200).json({ content: contet });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

app.delete(
  "/api/v1/content",
  //@ts-ignore
  userMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    const contentId = req.body.contentId;

    if (!contentId) {
      res.status(400).json({ message: "Content ID is required" });
      return;
    }

    try {
      await ContentModel.deleteMany({ _id: contentId, userId: req.userId });
      res.status(200).json({ message: "Content deleted successfully" });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

app.post("/api/v1/brain/share", (req: Request, res: Response) => {});

app.get("/api/v1/brain/:shareLink", (req: Request, res: Response) => {});

app.listen(3000);
