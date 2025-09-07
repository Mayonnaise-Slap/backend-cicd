import dotenv from "dotenv";

dotenv.config();

interface Config {
    db: {
        host: string;
        port: number;
        user: string;
        password: string;
        database: string;
        url: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    server: {
        port: number;
        host: string;
        sharedSecret: string;
    }
    rabbit: {
        url: string;
    }
}

if (!process.env.WORKOUT_USER || !process.env.WORKOUT_PASS || !process.env.WORKOUT_DB) {
    throw new Error("Missing required database env vars for WorkoutService");
}
if (!process.env.JWT_SECRET) {
    throw new Error("Missing JWT_SECRET in env vars");
}

const config: Config = {
    db: {
        host: process.env.DB_HOST || "postgres",
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.WORKOUT_USER,
        password: process.env.WORKOUT_PASS,
        database: process.env.WORKOUT_DB,
        url: `postgresql://${process.env.WORKOUT_USER}:${process.env.WORKOUT_PASS}@${process.env.DB_HOST || "postgres"}:${process.env.DB_PORT || 5432}/${process.env.WORKOUT_DB}`,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    },
    server: {
        port: Number(process.env.PORT) || 5000,
        host: process.env.HOST || "0.0.0.0",
        sharedSecret: process.env.INTERNAL_SECRET || "secret",
    },
    rabbit: {
        url: process.env.RABBITMQ_URL || "amqp://guest:guest@rabbitmq:5672",
    },
};

export default config;
