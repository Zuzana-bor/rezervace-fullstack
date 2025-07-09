import express from 'express';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';
import { Appointment } from '../models/Appointments';

const router = express.Router();

// Získat všechny rezervace
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const appointments = await Appointment.find().populate(
    'userId',
    'firstName lastName email',
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

// Vytvořit rezervaci pro libovolného klienta (admin)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { date, service, firstName, lastName, clientPhone } = req.body;
  try {
    if (!date || !service || !firstName || !lastName) {
      return res.status(400).json({
        message: 'Chybí povinné údaje (datum, služba, jméno, příjmení)',
      });
    }
    // Najdi službu podle názvu (nebo ID, podle implementace)
    const foundService = await require('../models/Service').Service.findOne({
      name: service,
    });
    if (!foundService) {
      return res.status(400).json({ message: 'Služba nenalezena' });
    }
    const price = foundService.price;
    const duration = foundService.duration;
    const start = new Date(date);
    // Vytvoř rezervaci bez userId, ale s jménem, příjmením a telefonem klientky
    const appointment = new Appointment({
      date: start,
      service: foundService.name,
      price,
      duration,
      clientFirstName: firstName,
      clientLastName: lastName,
      clientPhone,
      createdByAdmin: true,
    });
    const saved = await appointment.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({
      message: 'Chyba při vytváření rezervace adminem',
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

export default router;
