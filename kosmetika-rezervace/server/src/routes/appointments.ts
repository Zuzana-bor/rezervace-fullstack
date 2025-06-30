import express from 'express';
import { requireAuth } from '../middleware/auth';
import { Appointment } from '../models/Appointments';

const router = express.Router();

router.post('/me', requireAuth, async (req, res) => {
  const { date, service, price } = req.body;
  const userId = req.user?.id;
  try {
    const appointment = new Appointment({ date, service, price, userId });
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Chyba při vytváření rezervace' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  const userId = req.user?.id;
  try {
    const appointments = await Appointment.find({ userId }).populate(
      'userId',
      'name email',
    );
    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Chyba při načítání rezervací' });
  }
});

export default router;
