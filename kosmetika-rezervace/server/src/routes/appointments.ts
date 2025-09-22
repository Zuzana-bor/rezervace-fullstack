import express from 'express';
import { requireAuth } from '../middleware/auth';
import { Appointment } from '../models/Appointments';
import { Service } from '../models/Service';
import { BlockedTime } from '../models/BlockedTime';

const router = express.Router();

// Endpoint pro získání všech rezervací - upraven pro admin
router.get('/', requireAuth, async (req, res) => {
  try {
    console.log('🔍 Endpoint / volaný, user role:', req.user?.role);

    let appointments;

    if (req.user?.role === 'admin') {
      // Admin vidí všechny rezervace s populovanými údaji
      appointments = await Appointment.find()
        .populate('userId', 'firstName lastName email phone')
        .sort({ date: 1 });
      console.log('📋 Admin - nalezeno všech rezervací:', appointments.length);
    } else {
      // Uživatel vidí jen své rezervace
      appointments = await Appointment.find({ userId: req.user?.id })
        .populate('userId', 'firstName lastName email')
        .sort({ date: 1 });
      console.log('📋 User - nalezeno rezervací:', appointments.length);
    }

    res.status(200).json(appointments);
  } catch (err) {
    console.error('Chyba při načítání rezervací:', err);
    res.status(500).json({ message: 'Chyba při načítání rezervací' });
  }
});

// Upravit stávající endpoint aby podporoval admin dotazy
router.get('/me', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const targetUserId = req.query.userId as string; // Admin může specifikovat userId

    let queryUserId = userId; // Default: vlastní rezervace

    // Pokud je admin a specifikuje userId, načte rezervace toho uživatele
    if (userRole === 'admin' && targetUserId) {
      queryUserId = targetUserId;
      console.log('🔍 Admin načítá rezervace pro userId:', targetUserId);
    } else {
      console.log('👤 Uživatel načítá své rezervace:', userId);
    }

    const appointments = await Appointment.find({ userId: queryUserId })
      .populate('userId', 'firstName lastName email phone')
      .sort({ date: 1 });

    console.log('📋 Nalezeno rezervací:', appointments.length);
    res.status(200).json(appointments);
  } catch (err) {
    console.error('Chyba při načítání rezervací:', err);
    res.status(500).json({ message: 'Chyba při načítání rezervací' });
  }
});

// CHYBĚJÍCÍ DELETE endpoint
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    console.log('🗑️ Mazání rezervace:', appointmentId, 'user role:', userRole);

    // Najdi rezervaci
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Rezervace nenalezena' });
    }

    // Kontrola oprávnění - admin může mazat všechny, uživatel jen své
    if (userRole !== 'admin' && appointment.userId?.toString() !== userId) {
      return res
        .status(403)
        .json({ message: 'Nemáte oprávnění smazat tuto rezervaci' });
    }

    await Appointment.findByIdAndDelete(appointmentId);
    console.log('✅ Rezervace smazána:', appointmentId);

    res.status(200).json({ message: 'Rezervace byla úspěšně smazána' });
  } catch (err) {
    console.error('❌ Chyba při mazání rezervace:', err);
    res.status(500).json({
      message: 'Chyba při mazání rezervace',
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

// Vytvoření nové rezervace s blokací podle délky služby
router.post('/me', requireAuth, async (req, res) => {
  const { date, service } = req.body;
  const userId = req.user?.id;

  try {
    if (!date || !service || !userId) {
      return res.status(400).json({
        message: 'Chybí povinné údaje (datum, služba nebo uživatel)',
      });
    }

    const start = new Date(date);

    // Kontrola, zda už existuje rezervace ve stejný čas
    const existingAppointment = await Appointment.findOne({
      date: {
        $gte: new Date(start.getTime() - 30 * 60000), // 30 minut před
        $lt: new Date(start.getTime() + 30 * 60000), // 30 minut po
      },
    });

    if (existingAppointment) {
      return res.status(409).json({
        message: 'Tento termín je již obsazený. Prosím vyberte jiný čas.',
      });
    }

    // Kontrola blokovaných časů
    const blockedTime = await BlockedTime.findOne({
      date: {
        $gte: new Date(start.getTime() - 30 * 60000),
        $lt: new Date(start.getTime() + 30 * 60000),
      },
    });

    if (blockedTime) {
      return res.status(409).json({
        message: 'V tomto termínu nepracujem. Prosím vyberte jiný čas.',
      });
    }

    // Najdi službu podle ID a získej cenu a délku
    const foundService = await Service.findById(service);
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
    const appointmentStart = new Date(dateString);
    const appointmentEnd = new Date(
      appointmentStart.getTime() + duration * 60000,
    );
    // Zkontroluj kolize s existujícími rezervacemi
    const conflict = await Appointment.findOne({
      $or: [
        // Nový začátek spadá do existující rezervace
        {
          date: { $lt: appointmentEnd },
          $expr: {
            $gt: [
              { $add: ['$date', { $multiply: ['$duration', 60000] }] },
              appointmentStart,
            ],
          },
        },
        // Nový konec spadá do existující rezervace
        {
          date: { $lt: appointmentEnd },
          $expr: {
            $gt: [
              { $add: ['$date', { $multiply: ['$duration', 60000] }] },
              appointmentStart,
            ],
          },
        },
        // Nová rezervace zcela překrývá existující
        { date: { $gte: appointmentStart, $lt: appointmentEnd } },
      ],
    });
    if (conflict) {
      return res.status(409).json({ message: 'Tento termín je již obsazený.' });
    }
    // Zkontroluj kolize s blokovanými časy
    const blocked = await BlockedTime.findOne({
      $or: [
        // Překryv s blokovaným intervalem
        { start: { $lt: appointmentEnd }, end: { $gt: appointmentStart } },
        // Blokace na celý den
        {
          allDay: true,
          start: { $lte: appointmentStart },
          end: { $gte: appointmentEnd },
        },
        // Blokace na celý den pro víkend
      ],
    });
    // Zablokuj všechny soboty a neděle
    const isWeekend =
      appointmentStart.getDay() === 0 || appointmentStart.getDay() === 6;
    if (blocked || isWeekend) {
      return res.status(409).json({ message: 'Tento termín je blokovaný.' });
    }
    const appointment = new Appointment({
      date: appointmentStart,
      service: foundService.name,
      price,
      userId,
      duration,
    });
    const saved = await appointment.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Chyba při vytváření rezervace:', err);
    res.status(500).json({
      message: 'Chyba při vytváření rezervace',
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

export default router;
