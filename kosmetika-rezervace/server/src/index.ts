import express from 'express';
import authRoutes from './routes/auth';

const app = express();
const PORT = 5000;

app.use(express.json());
app.use('/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server běží na http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Server běží!');
});
