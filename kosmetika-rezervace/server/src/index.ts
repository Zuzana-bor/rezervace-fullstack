import express from 'express';
import authRoutes from './routes/auth';
import cors from 'cors';
import connectDB from './db';
import appointmentRouter from './routes/appointments';
import axios from 'axios';

const app = express();
app.use(cors());
const PORT = 5000;

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/api/appointments', appointmentRouter);

connectDB();

app.listen(PORT, () => {
  console.log(`✅ Server běží na http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Server běží!');
});

// Example of using axios to get appointments
app.get('/get-appointments', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/appointments');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});
