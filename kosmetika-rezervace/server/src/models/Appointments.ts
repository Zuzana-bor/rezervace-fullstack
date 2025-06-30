import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  service: { type: String, required: true },
  price: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

export const Appointment = mongoose.model('Appointment', appointmentSchema);
