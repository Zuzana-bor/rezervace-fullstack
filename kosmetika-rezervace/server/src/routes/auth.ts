import express, { Request, Response } from 'express';
import { User } from '../models/User';

const router = express.Router();

router.post('/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Vyplň všechna pole.' });
  }

  try {
    // Zkontrolujeme, jestli už existuje uživatel s tímto e-mailem
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: 'Uživatel s tímto e-mailem už existuje.' });
    }
    const newUser = new User({ name, email, password });
    await newUser.save();

    console.log('✅ Uživatel uložen:', newUser);

    return res.status(201).json({ message: 'Registrace proběhla!' });
  } catch (error) {
    console.error('❌ Chyba při registraci:', error);
    return res.status(500).json({ message: 'Něco se pokazilo.' });
  }
});

export default router;
