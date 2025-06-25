import express, { Request, Response } from 'express';

const router = express.Router();

router.post('/register', (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Vyplň všechna pole.' });
  }

  console.log('Registrace:', { name, email, password });

  return res.status(201).json({ message: 'Registrace proběhla!' });
});

export default router;
