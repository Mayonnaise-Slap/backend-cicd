import 'reflect-metadata';
import express from 'express';
import {AppDataSource} from "./data-source";
import config from './config'
import userRouter from "./routes/userRouter";
import bodyParser from 'body-parser';
import {loggingMiddleware} from "./middlewares/logging.middleware";
import {initRabbit} from "./messages/rabbit";


const app = express();
app.use(bodyParser.json());
app.all("*", loggingMiddleware)
app.use(userRouter);


const port = Number(config.server.port || 5000);
const host = config.server.host;

AppDataSource.initialize()
    .then(async () => {
        console.log('Data Source initialized');
        await initRabbit();

        app.listen(port, () => console.log(`Server listening on http://${host}:${port}`));
    })
    .catch((err) => {
        console.error('Error during Data Source initialization', err);
    });