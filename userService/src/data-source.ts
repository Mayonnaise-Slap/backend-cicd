import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "postgres",
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.USER_USER || "useruser",
    password: process.env.USER_PASS || "userpass",
    database: process.env.USER_DB || "userdb",
    synchronize: true,
    logging: false,
    entities: [__dirname + "/models/*entity.{ts,js}"],
    subscribers: [__dirname + "/models/*.subscribers.{ts,js}"],
});
