import express from 'express';
import authRoutes from './routes/auth';
import cors from 'cors';
import connectDB from './db';

const app = express();
app.use(cors());
const PORT = 5000;

app.use(express.json());
app.use('/auth', authRoutes);

connectDB();

app.listen(PORT, () => {
  console.log(`✅ Server běží na http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Server běží!');
});
