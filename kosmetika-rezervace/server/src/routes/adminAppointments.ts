import express from 'express';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';
import { Appointment } from '../models/Appointments';
import { Service } from '../models/Service';
import { parseCzechDate } from '../utils/timezone';

const router = express.Router();

// Získat všechny rezervace (admin)
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    console.log('👑 Admin načítá všechny rezervace');

    const appointments = await Appointment.find()
      .populate('userId', 'firstName lastName email')
      .sort({ date: 1 });

    console.log('📋 Admin - nalezeno rezervací:', appointments.length);

    appointments.forEach((apt, index) => {
      if (apt.notes) {
        console.log(`📝 Rezervace ${index + 1} (${apt._id}): "${apt.notes}"`);
      } else {
        console.log(`📝 Rezervace ${index + 1} (${apt._id}): bez poznámky`);
      }
    });

    res.status(200).json(appointments);
  } catch (err) {
    console.error('❌ Chyba při načítání admin rezervací:', err);
    res.status(500).json({
      message: 'Chyba při načítání rezervací',
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

// Smazat rezervaci (admin)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    console.log('🗑️ Admin maže rezervaci ID:', req.params.id);

    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      console.log('❌ Rezervace nenalezena pro ID:', req.params.id);
      return res.status(404).json({ message: 'Rezervace nenalezena' });
    }

    console.log('✅ Admin - rezervace úspěšně smazána:', appointment._id);
    res.status(200).json({
      message: 'Rezervace byla úspěšně smazána',
      deletedId: appointment._id,
    });
  } catch (err: any) {
    console.error('❌ Chyba při mazání rezervace:', err);
    res.status(500).json({
      message: 'Chyba při mazání rezervace',
      error: err.message,
    });
  }
});

// Vytvořit rezervaci pro libovolného klienta (admin)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { date, service, firstName, lastName, clientPhone, notes } = req.body;

  try {
    if (!date || !service || !firstName || !lastName) {
      return res.status(400).json({
        message: 'Chybí povinné údaje (datum, služba, jméno, příjmení)',
      });
    }

    // ✅ Použijte české timezone parsing
    const appointmentStart = parseCzechDate(date);

    const foundService = await Service.findOne({ name: service });
    if (!foundService) {
      return res.status(400).json({ message: 'Služba nenalezena' });
    }
    const appointmentEnd = new Date(
      appointmentStart.getTime() + foundService.duration * 60000,
    );

    //kontrola kolizí s existujícími rezervacemi

    const existingAppointment = await Appointment.findOne({
      $or: [
        // Nová rezervace začíná během existující
        {
          date: { $lte: appointmentStart },
          $expr: {
            $gte: [
              { $add: ['$date', { $multiply: ['$duration', 60000] }] },
              appointmentStart,
            ],
          },
        },
        // Nová rezervace končí během existující
        {
          date: { $lte: appointmentEnd },
          $expr: {
            $gte: [
              { $add: ['$date', { $multiply: ['$duration', 60000] }] },
              appointmentEnd,
            ],
          },
        },
        // Nová rezervace zcela překrývá existující
        {
          date: { $gte: appointmentStart, $lt: appointmentEnd },
        },
      ],
    });

    if (existingAppointment) {
      console.log(
        '❌ Kolize rezervací detekována s ID:',
        existingAppointment._id,
      );
      return res.status(409).json({ message: 'Tento termín je již obsazený' });
    }

    const appointment = new Appointment({
      date: appointmentStart,
      service: foundService.name,
      price: foundService.price,
      duration: foundService.duration,
      clientFirstName: firstName,
      clientLastName: lastName,
      clientPhone,
      createdByAdmin: true,
      notes: notes?.trim() || undefined,
    });

    const saved = await appointment.save();
    console.log('✅ Admin rezervace vytvořena:', saved._id);

    res.status(201).json(saved);
  } catch (err) {
    console.error('❌ Chyba při vytváření admin rezervace:', err);
    res.status(500).json({
      message: 'Chyba při vytváření rezervace adminem',
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

export default router;
