import mongoose, { model, Schema } from "mongoose";
mongoose.connect("Your Connection String");

const UserSchema = new Schema({
  email: { type: String, require: true, unique: true },
  password: { type: String, require: true },
});

export const UserModel = model("user", UserSchema);

const ContentSchema = new Schema({
  title: { type: String, require: true, unique: true },
  link: { type: String, require: true },
  tags: { type: Schema.Types.ObjectId, require: true },
  type: { type: String, require: true },
});
