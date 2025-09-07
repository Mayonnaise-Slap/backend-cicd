import {NextFunction, Response, Request} from "express";
import config from "../config";


export const internalMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const sharedSecret = req.get("X-Internal-Key");

    if (!sharedSecret || sharedSecret !== config.server.sharedSecret) return res.status(401).json({ message: 'Unauthorized' });

    next();
};