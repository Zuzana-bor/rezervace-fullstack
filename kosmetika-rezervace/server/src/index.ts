import express from 'express';
import authRoutes from './routes/auth';
import cors from 'cors';
import connectDB from './db';
import appointmentRouter from './routes/appointments';
import axios from 'axios';
import servicesRouter from './routes/services';
import blockedTimesRouter from './routes/blockedTimes';
import adminAppointmentsRouter from './routes/adminAppointments';
import adminUsersRouter from './routes/adminUsers';

const app = express();
app.use(cors());
const PORT = 5000;

app.use(express.json());
app.use('/auth', authRoutes);
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
