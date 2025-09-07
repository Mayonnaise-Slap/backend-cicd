import { Router } from 'express';
import {authMiddleware, AuthRequest} from "../middlewares/auth.middleware";

const router = Router();

router.get("/social_user_comms", authMiddleware, async (req: AuthRequest, res) => {
    // just used to test authMiddleware

    // let's say it pings user service
    return res.json(req.user);
})

export default router;