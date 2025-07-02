import express from 'express';
import { requireAuth } from '../middleware/auth';
import { Appointment } from '../models/Appointments';
import { Service } from '../models/Service';
import { BlockedTime } from '../models/BlockedTime';

const router = express.Router();

// Vytvoření nové rezervace s blokací podle délky služby
router.post('/me', requireAuth, async (req, res) => {
  const { date, service } = req.body;
  const userId = req.user?.id;
  try {
    if (!date || !service || !userId) {
      return res
        .status(400)
        .json({ message: 'Chybí povinné údaje (datum, služba nebo uživatel)' });
    }
    // Najdi službu podle ID a získej cenu a délku
    const foundService = await Service.findById(service);
    if (!foundService) {
      return res.status(400).json({ message: 'Služba nenalezena' });
    }
    const price = foundService.price;
    const duration = foundService.duration;
    const start = new Date(date);
    const end = new Date(start.getTime() + duration * 60000);
    // Zkontroluj kolize s existujícími rezervacemi
    const conflict = await Appointment.findOne({
      $or: [
        // Nový začátek spadá do existující rezervace
        {
          date: { $lt: end },
          $expr: {
            $gt: [
              { $add: ['$date', { $multiply: ['$duration', 60000] }] },
              start,
            ],
          },
        },
        // Nový konec spadá do existující rezervace
        {
          date: { $lt: end },
          $expr: {
            $gt: [
              { $add: ['$date', { $multiply: ['$duration', 60000] }] },
              start,
            ],
          },
        },
        // Nová rezervace zcela překrývá existující
        { date: { $gte: start, $lt: end } },
      ],
    });
    if (conflict) {
      return res.status(409).json({ message: 'Tento termín je již obsazený.' });
    }
    // Zkontroluj kolize s blokovanými časy
    const blocked = await BlockedTime.findOne({
      $or: [
        // Překryv s blokovaným intervalem
        { start: { $lt: end }, end: { $gt: start } },
        // Blokace na celý den
        { allDay: true, start: { $lte: start }, end: { $gte: end } },
        // Blokace na celý den pro víkend
      ],
    });
    // Zablokuj všechny soboty a neděle
    const isWeekend = start.getDay() === 0 || start.getDay() === 6;
    if (blocked || isWeekend) {
      return res.status(409).json({ message: 'Tento termín je blokovaný.' });
    }
    const appointment = new Appointment({
      date: start,
      service: foundService.name,
      price,
      userId,
      duration,
    });
    const saved = await appointment.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({
      message: 'Chyba při vytváření rezervace',
      error: err instanceof Error ? err.message : String(err),
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

// Endpoint pro získání všech rezervací (pro blokování termínů ve formuláři)
router.get('/', requireAuth, async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Chyba při načítání všech rezervací' });
  }
});

export default router;
