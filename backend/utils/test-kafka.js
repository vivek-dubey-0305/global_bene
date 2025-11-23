import { config } from "dotenv";
import { writeFileSync } from 'fs';
import { sendActivityEvent } from './kafka.utils.js';

// Load environment variables
config({ path: "c:/Users/DELL/Desktop/Internship/Globle_Bane/global_bene/backend/.env" });

// Test function to verify Kafka connection
export const testKafkaConnection = async () => {
  const logFile = 'kafka-test-result.txt';
  let logContent = '';

  try {
    logContent += '🧪 Testing Kafka connection to Confluent Cloud...\n';
    logContent += 'Environment variables loaded successfully\n';

    const testEvent = {
      user_id: 'test-user-123',
      event_type: 'test_connection',
      description: 'Testing Kafka connection to Confluent Cloud',
      entity_type: 'system',
      entity_id: 'test-001',
      session_id: 'test-session-456',
      props: {
        geo_location: 'Test Location',
        ip_address: '127.0.0.1',
        device: 'Desktop',
        browser: 'Chrome',
        platform: 'Windows'
      },
      request: {
        method: 'GET',
        path: '/test',
        ip_address: '127.0.0.1'
      },
      occurred_at: new Date().toISOString()
    };

    logContent += 'Sending test event...\n';
    await sendActivityEvent(testEvent);
    logContent += '✅ Kafka connection test successful!\n';
    logContent += `Event sent to topic: ${process.env.KAFKA_ACTIVITY_TOPIC}\n`;
    logContent += 'SUCCESS\n';

    writeFileSync(logFile, logContent);
    return true;
  } catch (error) {
    logContent += `❌ Kafka connection test failed: ${error.message}\n`;
    logContent += `Full error: ${error}\n`;
    logContent += 'FAILED\n';

    writeFileSync(logFile, logContent);
    return false;
  }
};

// Test the connection when this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testKafkaConnection().then(() => {
    console.log('Test completed.');
    process.exit(0);
  }).catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}