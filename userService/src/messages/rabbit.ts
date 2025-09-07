import amqp, { ChannelModel, Channel } from "amqplib";
import config from "../config";

let connection: ChannelModel;
let channel: Channel;

const EXCHANGE = "user.events";

export async function initRabbit() {
    if (connection && channel) return;

    connection = await amqp.connect(config.rabbit.url);
    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE, "topic", { durable: true });
    console.log("[RabbitMQ] Connected and exchange asserted:", EXCHANGE);
}

export async function publishUserDeleted(userId: number) {
    if (!channel) throw new Error("RabbitMQ not initialized");

    const event = {
        type: "UserDeleted",
        userId,
        timestamp: new Date().toISOString(),
    };

    channel.publish(EXCHANGE, "user.deleted", Buffer.from(JSON.stringify(event)), {
        persistent: true,
    });

    console.log("[RabbitMQ] Published event:", event);
}
