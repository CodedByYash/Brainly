import express, { Request, Response } from "express";
import { z } from "zod";
import { UserModel } from "./db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());

interface IUser {
  _id: string;
  email: string;
  password: string;
}

//@ts-ignore
app.post("/api/v1/signup", async (req: Request, res: Response) => {
  const schema = z.object({
    email: z.string().min(3).max(50).email(),
    password: z.string().min(8).max(20),
  });

  const parsedBody = schema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({
      message: "Invalid request body",
      error: parsedBody.error,
    });
  }

  const { email, password } = parsedBody.data;
  try {
    const founduser = await UserModel.findOne({ email });

    if (founduser) {
      return res.status(409).json({ message: "User already exists" });
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

//@ts-ignore
app.post("/api/v1/signin", async (req: Request, res: Response) => {
  const schema = z.object({
    email: z.string().min(3).max(50).email(),
    password: z.string().min(8).max(20),
  });

  const parsedBody = schema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({ message: "Invalid request body" });
  }

  const { email, password } = parsedBody.data;

  try {
    const founduser = (await UserModel.findOne({ email })) as IUser | null;

    if (
      !founduser ||
      !(await bcrypt.compareSync(password, founduser.password))
    ) {
      res.status(403).json({ message: "Invalid Credentials" });
    }

    const JWT_SECRET = process.env.USER_JWT_SECRET;

    if (!JWT_SECRET) {
      console.error("USER_JWT_SECRET is missing in environment variables.");
      return res.status(500).json({ message: "Internal Server Error" });
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
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal Server error" });
  }
});

app.post("/api/v1/content", (req: Request, res: Response) => {
  const schema = z.object({
    title: z.string().min(3).max(300),
    link: z.string().min(3).max(400),
    type: z.string().min(3).max(20),
  });
});

app.get("/api/v1/content", (req: Request, res: Response) => {});

app.delete("/api/v1/content", (req: Request, res: Response) => {});

app.post("/api/v1/brain/share", (req: Request, res: Response) => {});

app.get("/api/v1/brain/:shareLink", (req: Request, res: Response) => {});

app.listen(3000);
