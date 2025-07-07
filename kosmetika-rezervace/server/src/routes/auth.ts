import express, { Request, Response } from 'express';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Uživatel neexistuje' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Špatné heslo' });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'tajnyklic', // Pro vývoj
      { expiresIn: '1d' },
    );
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Něco se pokazilo na serveru' });
  }
});

router.post('/register', async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, phone } = req.body;

  if (!firstName || !lastName || !email || !password) {
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
    // Zahashuj heslo před uložením
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
    });
    await newUser.save();

    console.log('✅ Uživatel uložen:', newUser);

    // Vygeneruj JWT token stejně jako při loginu
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'tajnyklic',
      { expiresIn: '1d' },
    );

    return res.status(201).json({
      message: 'Registrace proběhla!',
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    console.error('❌ Chyba při registraci:', error);
    return res.status(500).json({ message: 'Něco se pokazilo.' });
  }
});

export default router;
