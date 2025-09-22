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
    console.log('DELETE request pro rezervaci ID:', req.params.id); // Debug log
    console.log('User:', req.user); // Debug log

    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      console.log('Rezervace nenalezena pro ID:', req.params.id); // Debug log
      return res.status(404).json({ message: 'Rezervace nenalezena' });
    }

    console.log('Rezervace úspěšně smazána:', appointment._id); // Debug log
    res.json({ message: 'Rezervace smazána' });
  } catch (err: any) {
    console.error('Chyba při mazání rezervace:', err); // Debug log
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
    // Only add Czech timezone offset (+02:00) if no timezone is specified
    // This prevents double-adding when frontend already includes timezone
    // Check for timezone info only after the time part (after 'T')
    const timePartIndex = date.indexOf('T');
    const hasTimezone = timePartIndex !== -1 && (
      date.slice(timePartIndex).includes('+') || 
      date.slice(timePartIndex).includes('Z') || 
      date.slice(timePartIndex).includes('-')
    );
    const dateString = hasTimezone ? date : date + '+02:00';
    const start = new Date(dateString);
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

// Úprava rezervace (admin)
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { clientFirstName, clientLastName, phone, service, price, date } =
    req.body;
  try {
    // Najdi službu podle názvu (kvůli ceně a délce)
    const foundService = await require('../models/Service').Service.findOne({
      name: service,
    });
    if (!foundService) {
      return res.status(400).json({ message: 'Služba nenalezena' });
    }
    const update: any = {
      clientFirstName,
      clientLastName,
      clientPhone: phone,
      service: foundService.name,
      price: price || foundService.price,
      duration: foundService.duration,
      // Only add Czech timezone offset (+02:00) if no timezone is specified
      // This prevents double-adding when frontend already includes timezone
      // Check for timezone info only after the time part (after 'T')
      date: new Date((() => {
        const timePartIndex = date.indexOf('T');
        const hasTimezone = timePartIndex !== -1 && (
          date.slice(timePartIndex).includes('+') || 
          date.slice(timePartIndex).includes('Z') || 
          date.slice(timePartIndex).includes('-')
        );
        return hasTimezone ? date : date + '+02:00';
      })()),
    };
    const updated = await Appointment.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    if (!updated)
      return res.status(404).json({ message: 'Rezervace nenalezena' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({
      message: 'Chyba při úpravě rezervace',
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

export default router;
