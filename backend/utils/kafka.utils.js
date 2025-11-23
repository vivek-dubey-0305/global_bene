import { Kafka, logLevel } from "kafkajs";

const brokers = (process.env.KAFKA_BROKERS || "192.168.0.119:9092")
  .split(",")
  .map((broker) => broker.trim())
  .filter(Boolean);

const activityTopic = process.env.KAFKA_ACTIVITY_TOPIC || "event";
const clientId = process.env.KAFKA_CLIENT_ID || "global-bene-activity-service";
const isEnabled = process.env.KAFKA_ENABLED !== "false";

let kafkaInstance;
let producerInstance;
let isConnected = false;
let hasLoggedConnectionError = false;
let shutdownHookAttached = false;

const ensureShutdownHook = () => {
  if (shutdownHookAttached || !producerInstance) {
    return;
  }

  const cleanup = async () => {
    try {
      if (isConnected) {
        await producerInstance.disconnect();
      }
    } catch (disconnectError) {
      console.error("[Kafka] Error while disconnecting producer:", disconnectError.message);
    }
  };

  process.on("beforeExit", cleanup);
  process.on("SIGINT", async () => {
    await cleanup();
    process.exit(0);
  });
  process.on("SIGTERM", async () => {
    await cleanup();
    process.exit(0);
  });

  shutdownHookAttached = true;
};

const createProducer = () => {
  if (!brokers.length || !isEnabled) {
    throw new Error("KAFKA_BROKERS is not configured or Kafka is disabled");
  }

  if (!kafkaInstance) {
    kafkaInstance = new Kafka({
      clientId,
      brokers,
      retry: {
        retries: 5,
      },
      logLevel: logLevel.NOTHING,
    });
  }

  if (!producerInstance) {
    producerInstance = kafkaInstance.producer({
      allowAutoTopicCreation: false,
    });
  }

  ensureShutdownHook();
  return producerInstance;
};

const connectProducerIfNeeded = async () => {
  if (!producerInstance) {
    createProducer();
  }

  if (!isConnected) {
    await producerInstance.connect();
    isConnected = true;
  }
};

export const sendActivityEvent = async (eventPayload) => {
  if (!isEnabled || !brokers.length) {
    return;
  }

  try {
    await connectProducerIfNeeded();

    const keyParts = [eventPayload.user_id, eventPayload.event_type, eventPayload.session_id]
      .filter(Boolean)
      .join(":");

    await producerInstance.send({
      topic: activityTopic,
      messages: [
        {
          key: keyParts || "activity",
          value: JSON.stringify(eventPayload),
        },
      ],
    });

    hasLoggedConnectionError = false;
  } catch (error) {
    if (!hasLoggedConnectionError) {
      console.error("[Kafka] Failed to publish activity event:", error.message);
      hasLoggedConnectionError = true;
    }
  }
};
