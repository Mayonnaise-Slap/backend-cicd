import { Request, Response, NextFunction } from 'express';


export async function loggingMiddleware (req: Request, res: Response, next: NextFunction) {
    const now = new Date().toISOString();
    res.on("finish", () => {
        console.log(`[${now}] ${req.method}: ${res.statusCode} ${req.originalUrl}`);
    });
    next();
}