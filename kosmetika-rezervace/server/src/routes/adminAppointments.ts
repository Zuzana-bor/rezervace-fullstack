import express from 'express';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';
import { Appointment } from '../models/Appointments';

const router = express.Router();

// Získat všechny rezervace
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const appointments = await Appointment.find().populate(
    'userId',
    'name email',
  );
  res.json(appointments);
});

// Smazat rezervaci
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment)
      return res.status(404).json({ message: 'Rezervace nenalezena' });
    res.json({ message: 'Rezervace smazána' });
  } catch (err: any) {
    res
      .status(400)
      .json({ message: 'Chyba při mazání rezervace', error: err.message });
  }
});

export default router;
