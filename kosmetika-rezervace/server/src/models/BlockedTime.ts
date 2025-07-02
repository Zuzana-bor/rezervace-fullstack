import mongoose from 'mongoose';

const blockedTimeSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  note: { type: String },
});

export const BlockedTime = mongoose.model('BlockedTime', blockedTimeSchema);
