import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true }, // délka služby v minutách
});

export const Service = mongoose.model('Service', serviceSchema);
