import express from 'express';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';
import { User } from '../models/User';

const router = express.Router();

// Získat všechny uživatele
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const users = await User.find({}, '-password'); // Bez hesla
  res.json(users);
});

// (Volitelně) Smazat uživatele
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Uživatel nenalezen' });
    res.json({ message: 'Uživatel smazán' });
  } catch (err: any) {
    res
      .status(400)
      .json({ message: 'Chyba při mazání uživatele', error: err.message });
  }
});

export default router;
