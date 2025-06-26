import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // e-mail musí být jedinečný
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
); // automaticky přidá createdAt a updatedAt

export const User = mongoose.model('User', UserSchema);
