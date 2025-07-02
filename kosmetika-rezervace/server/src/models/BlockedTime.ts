import mongoose from 'mongoose';

const blockedTimeSchema = new mongoose.Schema({
  start: { type: Date, required: true }, // začátek blokace
  end: { type: Date, required: true }, // konec blokace
  allDay: { type: Boolean, default: false }, // blokace na celý den
  note: { type: String },
});

export const BlockedTime = mongoose.model('BlockedTime', blockedTimeSchema);
