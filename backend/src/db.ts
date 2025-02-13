import mongoose, { model, Schema } from "mongoose";

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

const UserSchema = new Schema({
  email: { type: String, require: true, unique: true },
  password: { type: String, require: true },
});

export const UserModel = model("User", UserSchema);

const ContentSchema = new Schema({
  title: { type: String, require: true, unique: true },
  link: { type: String, require: true },
  tags: { type: Schema.Types.ObjectId, require: true },
  type: { type: String, require: true },
});

export const ContentModel = model("Content", ContentSchema);
