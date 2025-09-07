import 'reflect-metadata';
import express from 'express';
import {AppDataSource} from "./data-source";
import config from './config'
import bodyParser from 'body-parser';
import {loggingMiddleware} from "./middlewares/logging.middleware";
import testRouter from "./routes/testRouter";
import workoutRouter from "./routes/workoutRouter";
import tagRouter from "./routes/tagRouter";
import {initRabbit} from "./messages/rabbit";


const app = express();
app.use(bodyParser.json());
app.all("*", loggingMiddleware)
app.use("/post/", workoutRouter)
app.use("/tags/", tagRouter)
app.use("/tests/", testRouter)


const port = config.server.port;
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