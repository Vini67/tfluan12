import { WebSocketServer } from "ws";
import chalk from "chalk";
import { getConnection } from "./config/rabbit.js";

const SOCKET_PORT = Number(process.env.SOCKET_PORT ?? 8081);

// pega --exchange=room da CLI, se existir
const exchangeArg = process.argv.find((arg) => arg.startsWith("--exchange="));
const EXCHANGE_NAME = exchangeArg ? exchangeArg.split("=")[1] : "websocket";

const websocket = new WebSocketServer({ port: SOCKET_PORT });

let rabbitChannel = null;

function broadcastJson(payload) {
    const message = JSON.stringify(payload);
    websocket.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
            client.send(message);
        }
    });
}

// --- Bridge RabbitMQ <-> WebSocket ---
async function setupRabbitWebsocketBridge() {
    try {
        const channel = await getConnection();
        rabbitChannel = channel;

        await channel.assertExchange(EXCHANGE_NAME, "fanout", { durable: true });

        const q = await channel.assertQueue("", {
            exclusive: true,
            durable: false,
            autoDelete: true,
        });

        await channel.bindQueue(q.queue, EXCHANGE_NAME, "");

        console.log(
            chalk.green(
                `[Rabbit] WebSocket ligado no exchange "${EXCHANGE_NAME}" (fanout) com fila exclusiva "${q.queue}"`
            )
        );

        channel.consume(
            q.queue,
            (msg) => {
                if (!msg) return;

                let data;
                try {
                    data = JSON.parse(msg.content.toString());
                } catch {
                    console.error("[Rabbit] Mensagem inválida:", msg.content.toString());
                    channel.ack(msg);
                    return;
                }

                // 🔥 TRAATAMENTO DOS EVENTOS QUE VÃO PARA O FRONT
                if (data.type === "join" && data.name) {
                    broadcastJson({
                        type: "system",
                        text: `${data.name} entrou no chat`,
                    });

                } else if (data.type === "leave" && data.name) {
                    broadcastJson({
                        type: "system",
                        text: `${data.name} saiu do chat`,
                    });

                } else if (data.type === "message" && data.name && data.text) {
                    broadcastJson({
                        type: "message",
                        name: data.name,
                        text: data.text,
                    });

                // 🔥 AQUI ENTRA O SUPORTE PARA REAÇÕES
                } else if (data.type === "reaction" && data.name && data.reaction) {
                    broadcastJson({
                        type: "reaction",
                        name: data.name,
                        reaction: data.reaction, // "approved" | "rejected"
                    });

                } else {
                    console.log("[Rabbit] Tipo desconhecido vindo da fila:", data);
                }

                channel.ack(msg);
            },
            { noAck: false }
        );
    } catch (err) {
        console.error(chalk.red("[Rabbit] Erro no bridge Rabbit -> WS:"), err);
    }
}

setupRabbitWebsocketBridge();

// helper pra publicar no exchange
function publishToRabbit(payload) {
    if (!rabbitChannel) {
        console.warn("[Rabbit] Canal ainda não pronto, ignorando mensagem:", payload);
        return;
    }

    rabbitChannel.publish(
        EXCHANGE_NAME,
        "",
        Buffer.from(JSON.stringify(payload))
    );
}

// --- WebSocket ---
websocket.on("connection", (ws) => {
    console.log(chalk.cyan("Cliente conectado.."));

    ws.on("message", (raw) => {
        const text = raw.toString();
        console.log(chalk.yellow("Do client:"), text);

        let data;
        try {
            data = JSON.parse(text);
        } catch {
            console.log("Mensagem não é JSON válido, ignorando.");
            return;
        }

        // JOIN
        if (data.type === "join" && data.name) {
            ws.userName = data.name;
            publishToRabbit({ type: "join", name: data.name });
            return;
        }

        // MENSAGEM NORMAL
        if (data.type === "message" && data.name && data.text) {
            publishToRabbit({
                type: "message",
                name: data.name,
                text: data.text,
            });
            return;
        }

        // 🔥 NOVO EVENTO: REAÇÃO
        if (data.type === "reaction" && data.name && data.reaction) {
            publishToRabbit({
                type: "reaction",
                name: data.name,
                reaction: data.reaction,
            });
            return;
        }

        console.log("Tipo de mensagem desconhecido vindo do client:", data);
    });

    ws.on("close", () => {
        console.log(chalk.gray("Cliente desconectado."));
        if (ws.userName) {
            publishToRabbit({
                type: "leave",
                name: ws.userName,
            });
        }
    });
});

console.log(
    chalk.greenBright(
        `WebSocket rodando na porta ${SOCKET_PORT} usando exchange "${EXCHANGE_NAME}"...`
    )
);
