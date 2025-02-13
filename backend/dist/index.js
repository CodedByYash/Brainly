"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const db_1 = require("./db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
//@ts-ignore
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const schema = zod_1.z.object({
        email: zod_1.z.string().min(3).max(50).email(),
        password: zod_1.z.string().min(8).max(20),
    });
    const parsedBody = schema.safeParse(req.body);
    if (!parsedBody.success) {
        return res.status(400).json({
            message: "Invalid request body",
        });
    }
    const { email, password } = parsedBody.data;
    try {
        const founduser = yield db_1.UserModel.findOne({ email });
        if (founduser) {
            return res.status(409).json({ message: "User already exists" });
        }
        const saltround = 10;
        const hashedPassword = yield bcrypt_1.default.hash(password, saltround);
        const user = yield db_1.UserModel.create({
            email: email,
            password: hashedPassword,
        });
        res.status(201).json({ message: "user signup successful" });
    }
    catch (e) {
        console.log(e);
        res.status(500).json("Internal server error");
    }
}));
app.post("/api/v1", (req, res) => { });
app.post("/api/v1/signin", (req, res) => { });
app.post("/api/v1/content", (req, res) => { });
app.get("/api/v1/content", (req, res) => { });
app.delete("/api/v1/content", (req, res) => { });
app.post("/api/v1/brain/share", (req, res) => { });
app.get("/api/v1/brain/:shareLink", (req, res) => { });
app.listen(3000);
