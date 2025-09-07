import { DataSource } from "typeorm";
import config from "./config";


export const AppDataSource = new DataSource({
    type: "postgres",
    host: config.db.host || "postgres",
    port: Number(config.db.port) || 5432,
    username: config.db.user || "useruser",
    password: config.db.password || "userpass",
    database: config.db.database || "userdb",
    synchronize: true,
    logging: false,
    entities: [__dirname + "/models/*entity.{ts,js}"],
    subscribers: [__dirname + "/models/*.subscribers.{ts,js}"],
});
