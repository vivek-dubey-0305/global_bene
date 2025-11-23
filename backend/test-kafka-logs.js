import { config } from "dotenv";
import { sendActivityEvent } from "./utils/kafka.utils.js";

// Load environment variables
config({ path: "./.env" });

console.log("Testing Kafka logging functionality...");
console.log("Wait for connection logs every 3 seconds, then activity event logs...");

// Wait a bit for connection to establish and periodic logs to start
setTimeout(async () => {
  console.log("\n--- Testing activity event logging ---");

  // Test different types of activity events
  const testEvents = [
    {
      user_id: "user123",
      event_type: "profile_updated",
      description: "User updated their profile",
      entity_type: "user",
      entity_id: "user123",
      session_id: "session456",
      props: {
        geo_location: "Mumbai, India",
        ip_address: "192.168.1.100",
        device: "Desktop",
        browser: "Chrome",
        platform: "Windows"
      },
      request: {
        method: "PUT",
        path: "/api/v1/users/profile",
        ip_address: "192.168.1.100"
      },
      occurred_at: new Date().toISOString()
    },
    {
      user_id: "user123",
      event_type: "avatar_updated",
      description: "User updated their avatar",
      entity_type: "user",
      entity_id: "user123",
      session_id: "session456",
      props: {
        geo_location: "Mumbai, India",
        ip_address: "192.168.1.100",
        device: "Desktop",
        browser: "Chrome",
        platform: "Windows"
      },
      request: {
        method: "POST",
        path: "/api/v1/users/avatar",
        ip_address: "192.168.1.100"
      },
      occurred_at: new Date().toISOString()
    }
  ];

  for (const event of testEvents) {
    await sendActivityEvent(event);
    // Wait 2 seconds between events
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log("\n--- Test completed ---");
  console.log("You should see:");
  console.log("1. '[Kafka] Connected to Confluent Cloud' every 3 seconds");
  console.log("2. '[Kafka] Sending activity event: <event_type> for user <user_id>' for each event");
  console.log("3. '[Kafka] Successfully sent <event_type> event to topic: event' for each event");

  // Keep the process running to see periodic logs
  console.log("\nKeeping process alive to show periodic connection logs...");
  console.log("Press Ctrl+C to exit");

}, 5000);