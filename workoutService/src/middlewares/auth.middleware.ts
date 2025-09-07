import { Request, Response, NextFunction } from 'express';
import {User} from "../models/user.type";
import axios from "axios";
import config from "../config";

export interface AuthRequest extends Request {
    user?: User;
}

export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const response = await axios.get<User>(
            "http://user:5000/internal/whoami",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "X-Internal-Key": config.server.sharedSecret!,
                },
            }
        );

        req.user = response.data;
        next();
    } catch (err: any) {
        console.error("Auth middleware error:", err.response?.data || err.message);
        return res.status(401).json({ message: "Invalid token" });
    }
};