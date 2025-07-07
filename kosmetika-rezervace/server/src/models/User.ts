import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
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
    role: { type: String, default: 'user' },
  },
  { timestamps: true },
); // automaticky přidá createdAt a updatedAt

export const User = mongoose.model('User', UserSchema);
