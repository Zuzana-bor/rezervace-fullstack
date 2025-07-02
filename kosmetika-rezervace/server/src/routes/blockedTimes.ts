import express from 'express';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';
import { BlockedTime } from '../models/BlockedTime';

const router = express.Router();

// Získat všechny blokované časy
router.get('/', requireAuth, async (req, res) => {
  const times = await BlockedTime.find();
  res.json(times);
});

// Přidat blokovaný čas (interval nebo celý den)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { start, end, allDay, note } = req.body;
  if (!start || !end) {
    return res.status(400).json({ message: 'Začátek a konec jsou povinné.' });
  }
  try {
    const blocked = new BlockedTime({ start, end, allDay: !!allDay, note });
    await blocked.save();
    res.status(201).json(blocked);
  } catch (err: any) {
    res.status(400).json({
      message: 'Chyba při vytváření blokovaného času',
      error: err.message,
    });
  }
});

// Smazat blokovaný čas
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const blocked = await BlockedTime.findByIdAndDelete(req.params.id);
    if (!blocked)
      return res.status(404).json({ message: 'Blokovaný čas nenalezen' });
    res.json({ message: 'Blokovaný čas smazán' });
  } catch (err: any) {
    res.status(400).json({
      message: 'Chyba při mazání blokovaného času',
      error: err.message,
    });
  }
});

export default router;
