import { Kafka, logLevel } from "kafkajs";

const brokers = (process.env.KAFKA_BROKERS || "pkc-41p56.asia-south1.gcp.confluent.cloud:9092")
  .split(",")
  .map((broker) => broker.trim())
  .filter(Boolean);

const activityTopic = process.env.KAFKA_ACTIVITY_TOPIC || "event";
const clientId = process.env.KAFKA_CLIENT_ID || "ccloud-nodejs-client-346f0024-b81a-49f2-b234-3dd6aa7a90ee";
const isEnabled = process.env.KAFKA_ENABLED !== "false";

// Confluent Cloud SASL configuration
const saslConfig = process.env.KAFKA_SECURITY_PROTOCOL === "SASL_SSL" ? {
  mechanism: process.env.KAFKA_SASL_MECHANISM || "PLAIN",
  username: process.env.KAFKA_SASL_USERNAME,
  password: process.env.KAFKA_SASL_PASSWORD,
} : null;

let kafkaInstance;
let producerInstance;
let isConnected = false;
let hasLoggedConnectionError = false;
let shutdownHookAttached = false;
let connectionLoggerInterval;

const startConnectionLogger = () => {
  if (connectionLoggerInterval) {
    clearInterval(connectionLoggerInterval);
  }
  connectionLoggerInterval = setInterval(() => {
    if (isConnected) {
      console.log("[Kafka] Connected to Confluent Cloud");
    }
  }, 3000);
};

const stopConnectionLogger = () => {
  if (connectionLoggerInterval) {
    clearInterval(connectionLoggerInterval);
    connectionLoggerInterval = null;
  }
};

const ensureShutdownHook = () => {
  if (shutdownHookAttached || !producerInstance) {
    return;
  }

  const cleanup = async () => {
    try {
      stopConnectionLogger();
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
      ssl: process.env.KAFKA_SECURITY_PROTOCOL === "SASL_SSL",
      sasl: saslConfig,
      retry: {
        retries: 5,
      },
      connectionTimeout: 30000,
      requestTimeout: 60000,
      sessionTimeout: parseInt(process.env.KAFKA_SESSION_TIMEOUT) || 45000,
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
    startConnectionLogger();
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

    console.log(`[Kafka] Sending activity event: ${eventPayload.event_type} for user ${eventPayload.user_id}`);

    await producerInstance.send({
      topic: activityTopic,
      messages: [
        {
          key: keyParts || "activity",
          value: JSON.stringify(eventPayload),
        },
      ],
    });

    console.log(`[Kafka] Successfully sent ${eventPayload.event_type} event to topic: ${activityTopic}`);
    hasLoggedConnectionError = false;
  } catch (error) {
    console.error(`[Kafka] Failed to publish activity event ${eventPayload.event_type}:`, error.message);
    if (!hasLoggedConnectionError) {
      console.error("[Kafka] Failed to publish activity event:", error.message);
      hasLoggedConnectionError = true;
    }
  }
};
