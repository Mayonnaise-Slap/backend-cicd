import amqp, {Channel, ChannelModel} from "amqplib";
import config from "../config";
import { AppDataSource } from "../data-source";
import {Like} from "../models/like.entity";
import {Comment} from "../models/comment.entity";

let connection: ChannelModel;
let channel: Channel;

const EXCHANGE = "user.events";
const QUEUE = "social.user-deleted";
const ROUTING_KEY = "user.deleted";

export async function initRabbit() {
    if (connection && channel) return;

    connection = await amqp.connect(config.rabbit.url);
    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE, "topic", { durable: true });

    await channel.assertQueue(QUEUE, { durable: true });

    await channel.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY);

    console.log(`[RabbitMQ] SocialService bound to ${EXCHANGE} (${ROUTING_KEY})`);

    channel.consume(QUEUE, async (msg) => {
        if (!msg) return;

        try {
            const event = JSON.parse(msg.content.toString());
            console.log("[SocialService] Received event:", event);

            if (event.type === "UserDeleted") {
                await handleUserDeleted(event.userId);
            }

            channel.ack(msg);
        } catch (err) {
            console.error("Error processing RabbitMQ message:", err);
            channel.nack(msg, false, false);
        }
    });
}

async function handleUserDeleted(userId: number) {
    const likeRepo = AppDataSource.getRepository(Like);
    const likeResult = await likeRepo.delete({ userId: userId });
    console.log(`[SocialService] Deleted ${likeResult.affected} likes for user ${userId}`);

    const commentRepo = AppDataSource.getRepository(Comment);

    const commentResult = await commentRepo.delete({ userId: userId });
    console.log(`[SocialService] Deleted ${commentResult.affected} Comments for user ${userId}`);
}
