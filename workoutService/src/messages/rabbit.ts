import amqp, {Channel, ChannelModel} from "amqplib";
import config from "../config";
import { AppDataSource } from "../data-source";
import { Workout } from "../models/workout.entity";

let connection: ChannelModel;
let channel: Channel;

const EXCHANGE = "user.events";
const QUEUE = "workout.user-deleted";
const ROUTING_KEY = "user.deleted";

export async function initRabbit() {
    if (connection && channel) return;

    connection = await amqp.connect(config.rabbit.url);
    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE, "topic", { durable: true });

    await channel.assertQueue(QUEUE, { durable: true });

    await channel.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY);

    console.log(`[RabbitMQ] WorkoutService bound to ${EXCHANGE} (${ROUTING_KEY})`);

    channel.consume(QUEUE, async (msg) => {
        if (!msg) return;

        try {
            const event = JSON.parse(msg.content.toString());
            console.log("[WorkoutService] Received event:", event);

            if (event.type === "UserDeleted") {
                await handleUserDeleted(event.userId);
            }

            channel.ack(msg);
        } catch (err) {
            console.error("Error processing RabbitMQ message:", err);
            channel.nack(msg, false, false); // reject & drop
        }
    });
}

async function handleUserDeleted(userId: number) {
    const repo = AppDataSource.getRepository(Workout);

    const result = await repo.delete({ author_id: userId });
    console.log(`[WorkoutService] Deleted ${result.affected} workouts for user ${userId}`);
}
