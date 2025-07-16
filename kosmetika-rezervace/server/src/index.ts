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
import { requireAuth } from './middleware/auth';
// @ts-ignore
const cron = require('node-cron');
import axios from 'axios';
import { Appointment } from './models/Appointments';

const app = express();

const isDev = process.env.NODE_ENV !== 'production';
const allowedOrigins = [
  'https://kosmetika-lhota.vercel.app',
  'https://rezervace-fullstack.onrender.com',
  'https://rezervace-fullstack.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Povolit požadavky bez originu (např. curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(
        new Error('CORS policy: This origin is not allowed'),
        false,
      );
    },
    credentials: true,
  }),
);
const PORT = process.env.PORT || 5000;

let gosmsAccessToken = process.env.GOSMS_ACCESS_TOKEN;

// Získání GoSMS access tokenu při startu serveru
// async function refreshGoSmsToken() {
//   try {
//     const resp = await axios.post(
//       'https://app.gosms.eu/oauth/v2/token',
//       `client_id=${process.env.GOSMS_LOGIN}&client_secret=${process.env.GOSMS_PASSWORD}&grant_type=client_credentials`,
//       {
//         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//       },
//     );
//     gosmsAccessToken = resp.data.access_token;
//     console.log('GoSMS access token byl získán při startu serveru.');
//   } catch (err) {
//     console.error(
//       'Chyba při získávání GoSMS tokenu při startu serveru:',
//       err &&
//         typeof err === 'object' &&
//         'response' in err &&
//         err.response &&
//         typeof err.response === 'object' &&
//         'data' in err.response
//         ? (err as any).response.data
//         : err && typeof err === 'object' && 'message' in err
//         ? (err as any).message
//         : String(err),
//     );
//   }
// }
// refreshGoSmsToken();

// Automatické obnovení tokenu každý den v 17:30
cron.schedule('30 17 * * *', async () => {
  try {
    const resp = await axios.post(
      'https://app.gosms.eu/oauth/v2/token',
      `client_id=${process.env.GOSMS_LOGIN}&client_secret=${process.env.GOSMS_PASSWORD}&grant_type=client_credentials`,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );
    gosmsAccessToken = resp.data.access_token;
    console.log('GoSMS access token byl automaticky obnoven v 17:30.');
  } catch (err) {
    console.error(
      'Chyba při automatickém obnovování GoSMS tokenu:',
      err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response
        ? (err as any).response.data
        : err && typeof err === 'object' && 'message' in err
        ? (err as any).message
        : String(err),
    );
  }
});

// GoSMS.cz integrace: Spouští se každý den v 18:00 (OAuth2 token-based autentizace)
try {
  cron.schedule('00 18 * * *', async () => {
    try {
      if (!gosmsAccessToken) {
        console.error('GOSMS_ACCESS_TOKEN není nastaven v .env ani v paměti!');
        return;
      }
      // --- Získání kreditu před rozesláním SMS ---
      try {
        const creditResp = await axios.get(
          'https://app.gosms.eu/selfservice/api/credit',
          {
            headers: {
              Authorization: `Bearer ${gosmsAccessToken}`,
              'Content-Type': 'application/json',
            },
          },
        );
        const credit = creditResp.data?.credit;
        if (typeof credit === 'number' && credit < 10) {
          console.warn(
            `UPOZORNĚNÍ: Nízký kredit na GoSMS.cz účtu! Zbývá pouze ${credit} Kč.`,
          );
        }
      } catch (err) {
        let msg = '';
        if (err && typeof err === 'object' && err !== null) {
          const anyErr = err as any;
          if (anyErr.response && anyErr.response.data) {
            msg = anyErr.response.data;
          } else if (anyErr.message) {
            msg = anyErr.message;
          } else {
            msg = JSON.stringify(anyErr);
          }
        } else {
          msg = String(err);
        }
        console.error('Nepodařilo se zjistit kredit na GoSMS.cz:', msg);
      }
      // --- Pokračuje rozesílání SMS ---
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
        const user = appt.userId as
          | { phone?: string; firstName?: string; lastName?: string }
          | null
          | undefined;
        const phone = user?.phone || appt.clientPhone;
        const serviceName = appt.service || '';
        if (!phone) continue;
        const time = new Date(appt.date).toLocaleTimeString('cs-CZ', {
          hour: '2-digit',
          minute: '2-digit',
        });
        const text = `Dobrý den, zítra v ${time} máte rezervaci (${serviceName}). Těším se na vás, Petra.`;

        try {
          await axios.post(
            `https://app.gosms.eu/api/v1/messages?access_token=${gosmsAccessToken}`,
            {
              message: text,
              recipients: [
                phone.startsWith('+')
                  ? phone
                  : `+420${phone.replace(/\s+/g, '')}`,
              ],
              channel: 468188,
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            },
          );
          console.log(`SMS odeslána na ${phone}`);
        } catch (err: any) {
          console.error(
            'Chyba při odesílání SMS přes GoSMS:',
            err?.response?.data || err.message,
          );
        }
      }
    } catch (err) {
      console.error('Chyba v cron úloze GoSMS:', err);
    }
  });
} catch (err) {
  console.error('Chyba při inicializaci cron úlohy GoSMS:', err);
}

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

// Test endpoint pro debug
app.get('/api/debug/auth', requireAuth, (req, res) => {
  res.json({
    message: 'Autentizace funguje',
    user: req.user,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/test-sms', async (req, res) => {
  try {
    if (!gosmsAccessToken) {
      return res
        .status(500)
        .json({ error: 'GOSMS_ACCESS_TOKEN není nastaven!' });
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);
    const appointments = await Appointment.find({
      date: { $gte: tomorrow, $lt: dayAfter },
    }).populate('userId');
    let results = [];
    for (const appt of appointments) {
      const user = appt.userId as
        | { phone?: string; firstName?: string; lastName?: string }
        | null
        | undefined;
      const phone = user?.phone || appt.clientPhone;
      const serviceName = appt.service || '';
      if (!phone) {
        results.push({ appt, status: 'NO_PHONE' });
        continue;
      }
      const time = new Date(appt.date).toLocaleTimeString('cs-CZ', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const text = `Dobrý den, zítra v ${time} máte rezervaci (${serviceName}). Těším se na vás, Petra.`;
      try {
        await axios.post(
          `https://app.gosms.eu/api/v1/messages?access_token=${gosmsAccessToken}`,
          {
            message: text,
            recipients: [
              phone.startsWith('+')
                ? phone
                : `+420${phone.replace(/\s+/g, '')}`,
            ],
            channel: 468188,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
        results.push({ appt, status: 'OK', phone });
      } catch (err: any) {
        results.push({
          appt,
          status: 'ERROR',
          error: err?.response?.data || err.message,
        });
      }
    }
    res.json({ count: appointments.length, results });
  } catch (err) {
    res
      .status(500)
      .json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// Endpoint pro zjištění kreditu GoSMS (pouze pro admina)
app.get('/api/admin/gosms-credit', async (req, res) => {
  try {
    // Ověření admina (použijte vlastní middleware pokud máte)
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Chybí token' });
    }
    // (volitelně: ověřit JWT a roli admina)
    if (!gosmsAccessToken) {
      return res.status(500).json({ message: 'Chybí GoSMS access token' });
    }
    const resp = await axios.get(
      'https://app.gosms.eu/selfservice/api/credit',
      {
        headers: {
          Authorization: `Bearer ${gosmsAccessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
    res.json({ credit: resp.data?.credit ?? null });
  } catch (err: any) {
    res.status(500).json({
      message: 'Chyba při získávání kreditu',
      error: err?.response?.data || err.message,
    });
  }
});
