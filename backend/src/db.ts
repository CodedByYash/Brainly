import mongoose, { Document, model, Schema, Types } from "mongoose";

interface IUserSchema extends Document {
  email: string;
  password: string;
}

interface IContentSchema extends Document {
  link: string;
  type: "text" | "image" | "video" | "audio" | "link";
  title: string;
  tags: Types.ObjectId[];
  userId: Types.ObjectId;
}

interface ILinkSchema extends Document {
  userId: Types.ObjectId;
  hash: string;
}

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("Databse url is not defined in url");
  process.exit(1);
}

mongoose
  .connect(DATABASE_URL)
  .then(() => console.log("Database connected successfully"))
  .catch((error) => {
    console.error("Database connection failed", error);
    process.exit(1);
  });

const UserSchema = new Schema<IUserSchema>({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const contentTypes = ["text", "image", "video", "audio", "link"] as const;
const ContentSchema = new Schema<IContentSchema>({
  link: { type: String, required: true },
  type: { type: String, enum: contentTypes, required: true },
  title: { type: String, required: true },
  tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const LinkSchema = new Schema<ILinkSchema>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  hash: { type: String, required: true },
});

export const LinkModel = model<ILinkSchema>("Link", LinkSchema);
export const UserModel = model<IUserSchema>("User", UserSchema);
export const ContentModel = model<IContentSchema>("Content", ContentSchema);
