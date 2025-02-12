import express, { Request, Response } from "express";
import { z } from "zod";
import { UserModel } from "./db";
import bcrypt from "bcrypt";

const app = express();

app.use(express.json());
//@ts-ignore
app.post("/api/v1/signup", async (req, res) => {
  const schema = z.object({
    email: z.string().min(3).max(50).email(),
    password: z.string().min(8).max(20),
  });

  const parsedBody = schema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({
      message: "Invalid request body",
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
    res.status(500).json("Internal server error");
  }
});
app.post("/api/v1", (req, res) => {});
app.post("/api/v1/signin", (req, res) => {});

app.post("/api/v1/content", (req, res) => {});

app.get("/api/v1/content", (req, res) => {});

app.delete("/api/v1/content", (req, res) => {});

app.post("/api/v1/brain/share", (req, res) => {});

app.get("/api/v1/brain/:shareLink", (req, res) => {});

app.listen(3000);
