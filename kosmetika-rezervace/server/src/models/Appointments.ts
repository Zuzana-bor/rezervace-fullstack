import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  service: { type: String, required: true },
  price: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // už není required
  duration: { type: Number, required: true }, // délka služby v minutách
  clientFirstName: { type: String },
  clientLastName: { type: String },
  clientPhone: { type: String },
  createdByAdmin: { type: Boolean, default: false },
  notes: {
    type: String,
    required: false,
    maxlength: 500, // Limit 500 znaků
    trim: true,
  },
});

export const Appointment = mongoose.model('Appointment', appointmentSchema);
