import express from 'express';
import { requireAuth } from '../middleware/auth';
import { Appointment } from '../models/Appointments';

const router = express.Router();

// Mapování služeb na ceny
const SERVICE_PRICES: Record<string, number> = {
  manikura: 500,
  pedikura: 600,
  masaz: 800,
  // Přidejte další služby a ceny dle potřeby
};

router.post('/me', requireAuth, async (req, res) => {
  const { date, service } = req.body;
  const userId = req.user?.id;
  console.log('REQ BODY:', req.body);
  console.log('USER ID:', userId);
  try {
    const price = SERVICE_PRICES[service] || 0;
    if (!date || !service || !userId) {
      return res
        .status(400)
        .json({ message: 'Chybí povinné údaje (datum, služba nebo uživatel)' });
    }
    // Kontrola typu userId a převod na ObjectId
    const mongoose = require('mongoose');
    const userObjectId = mongoose.Types.ObjectId.isValid(userId)
      ? userId
      : null;
    if (!userObjectId) {
      return res.status(400).json({ message: 'Neplatné userId' });
    }
    const appointment = new Appointment({
      date,
      service,
      price,
      userId: userObjectId,
    });
    const saved = await appointment.save();
    console.log('ULOŽENO:', saved);
    // Výpis všech rezervací pro kontrolu

    res.status(201).json(saved);
  } catch (err: any) {
    console.error('Chyba při vytváření rezervace:', err);
    console.error(err.stack);
    res.status(500).json({
      message: 'Chyba při vytváření rezervace',
      error: err.message,
      stack: err.stack,
    });
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
