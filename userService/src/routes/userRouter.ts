import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.entity';
import bcrypt from 'bcryptjs';
import {authMiddleware, AuthRequest} from "../middlewares/auth.middleware";
import {internalMiddleware} from "../middlewares/internal.middleware";
import {AppDataSource} from "../data-source";
import {publishUserDeleted} from "../messages/rabbit";
const router = Router();

const userRepo = AppDataSource.getRepository(User)

router.post('/register', async (req, res) => {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) return res.status(400).json({ message: 'missing fields' });
    const existing = await User.findOneBy({ email });
    if (existing) return res.status(400).json({ message: 'email already exists' });
    const user = User.create({ fullName, email, password: password });
    await user.save();
    // don't return password
    const { password: _p, ...rest } = user as any;
    res.status(201).json(rest);
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'missing fields' });
    const user = await User.createQueryBuilder('user').where('user.email = :email', { email }).addSelect('user.password').getOne();
    if (!user) return res.status(400).json({ message: 'invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'invalid credentials' });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token });
});

router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
    const user = req.user!;
    const { password: _p, ...rest } = user as any;

    return res.status(200).json(rest);
});

router.get('/internal/whoami', [internalMiddleware, authMiddleware], async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { password: _p, ...rest } = user as any;

    return res.status(200).json(rest);
});

router.delete("/me", authMiddleware, async (req: AuthRequest, res) => {
    const userId = req.user!.id;
    await userRepo.remove(req.user!);

    await publishUserDeleted(userId);

    return res.status(204).send();
});

export default router;