import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import connectDB from './db';
import authRoutes from './routes/auth';
import appointmentRouter from './routes/appointments';
import servicesRouter from './routes/services';
import blockedTimesRouter from './routes/blockedTimes';
import adminAppointmentsRouter from './routes/adminAppointments';
import adminUsersRouter from './routes/adminUsers';
// @ts-ignore
const cron = require('node-cron');
import axios from 'axios';
import { Appointment } from './models/Appointments';

const GOSMS_LOGIN = process.env.GOSMS_LOGIN;
const GOSMS_PASSWORD = process.env.GOSMS_PASSWORD;

const app = express();

const isDev = process.env.NODE_ENV !== 'production';
app.use(
  cors({
    origin: isDev ? true : ['https://kosmetika-lhota.vercel.app'],
    credentials: true,
  }),
);
const PORT = process.env.PORT || 5000;

// Spouští se každý den v 18:00
cron.schedule('0 18 * * *', async () => {
  if (!GOSMS_LOGIN || !GOSMS_PASSWORD) {
    console.error('GOSMS_LOGIN nebo GOSMS_PASSWORD není nastaveno v .env!');
    return;
  }
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  // Najdi rezervace na zítřek
  const appointments = await Appointment.find({
    date: { $gte: tomorrow, $lt: dayAfter },
  }).populate('userId');

  for (const appt of appointments) {
    // Type assertion to inform TypeScript that userId is populated and has a phone property
    const user = appt.userId as { phone?: string } | null | undefined;
    const phone = user?.phone || appt.clientPhone;
    if (!phone) continue;

    const text = `Připomínka: Zítra v ${new Date(appt.date).toLocaleTimeString(
      'cs-CZ',
      { hour: '2-digit', minute: '2-digit' },
    )} máte rezervaci u Petry Jamborové.`;

    try {
      await axios.post('https://app.gosms.cz/api/v1/message', {
        login: GOSMS_LOGIN,
        password: GOSMS_PASSWORD,
        number: phone,
        message: text,
      });
      console.log(`SMS odeslána na ${phone}`);
    } catch (err: any) {
      console.error(
        'Chyba při odesílání SMS:',
        err?.response?.data || err.message,
      );
    }
  }
});

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRouter);
app.use('/api/services', servicesRouter);
app.use('/api/blocked-times', blockedTimesRouter);
app.use('/api/admin/appointments', adminAppointmentsRouter);
app.use('/api/admin/users', adminUsersRouter);

connectDB();

app.listen(PORT, () => {
  console.log(`✅ Server běží na http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Server běží!');
});
