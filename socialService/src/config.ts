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
    },
    rabbit: {
        url: string;
    }
}

if (!process.env.SOCIAL_USER || !process.env.SOCIAL_PASS || !process.env.SOCIAL_DB) {
    throw new Error("Missing required database env vars for SocialService");
}
if (!process.env.JWT_SECRET) {
    throw new Error("Missing JWT_SECRET in env vars");
}

const config: Config = {
    db: {
        host: process.env.DB_HOST || "postgres",
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.SOCIAL_USER,
        password: process.env.SOCIAL_PASS,
        database: process.env.SOCIAL_DB,
        url: `postgresql://${process.env.SOCIAL_USER}:${process.env.SOCIAL_PASS}@${process.env.DB_HOST || "postgres"}:${process.env.DB_PORT || 5432}/${process.env.SOCIAL_DB}`,
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
