import express from 'express';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';
import { Service } from '../models/Service';

const router = express.Router();

// Získat všechny služby (veřejné)
router.get('/', async (req, res) => {
  const services = await Service.find();
  res.json(services);
});

// Přidat novou službu
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { name, price, duration } = req.body;
  if (!name || !price || !duration) {
    return res
      .status(400)
      .json({ message: 'Jméno, cena a délka jsou povinné.' });
  }
  try {
    const service = new Service({ name, price, duration });
    await service.save();
    res.status(201).json(service);
  } catch (err: any) {
    res
      .status(400)
      .json({ message: 'Chyba při vytváření služby', error: err.message });
  }
});

// Upravit službu
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { name, price, duration } = req.body;
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { name, price, duration },
      { new: true },
    );
    if (!service) return res.status(404).json({ message: 'Služba nenalezena' });
    res.json(service);
  } catch (err: any) {
    res
      .status(400)
      .json({ message: 'Chyba při úpravě služby', error: err.message });
  }
});

// Smazat službu
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: 'Služba nenalezena' });
    res.json({ message: 'Služba smazána' });
  } catch (err: any) {
    res
      .status(400)
      .json({ message: 'Chyba při mazání služby', error: err.message });
  }
});

export default router;
