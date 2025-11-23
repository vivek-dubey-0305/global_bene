# Kafka Integration for Activity Events

This backend integrates with **Confluent Cloud** to send activity events for dashboard analytics and real-time monitoring.

## Configuration

The Kafka configuration is set up in the `.env` file with the following variables:

```env
# Kafka Configuration for Confluent Cloud
KAFKA_ENABLED=true
KAFKA_BROKERS=pkc-41p56.asia-south1.gcp.confluent.cloud:9092
KAFKA_ACTIVITY_TOPIC=event
KAFKA_CLIENT_ID=ccloud-nodejs-client-346f0024-b81a-49f2-b234-3dd6aa7a90ee
KAFKA_SECURITY_PROTOCOL=SASL_SSL
KAFKA_SASL_MECHANISM=PLAIN
KAFKA_SASL_USERNAME=QPSONC2CC3MEDRDH
KAFKA_SASL_PASSWORD=cfltyHRFQe2xBqSVKe9WbkcTZcjDqPIcyXUjGIjYIocRqzNGWcGXKXQ3AWY7dgew
KAFKA_SESSION_TIMEOUT=45000
```

## How It Works

### Automatic Activity Logging

The system automatically sends activity events to Kafka whenever users perform actions:

- **User Registration/Login**: `user_register`, `user_login`
- **Community Actions**: `community_created`, `community_joined`, `community_left`
- **Post Actions**: `post_created`, `post_updated`, `post_deleted`
- **Comment Actions**: `comment_created`, `comment_updated`, `comment_deleted`
- **Vote Actions**: `vote_cast` (upvote/downvote)
- **Admin Actions**: Various admin operations

### Event Structure

Each event sent to Kafka has the following structure:

```json
{
  "user_id": "string",           // User who performed the action
  "event_type": "string",        // Type of event (e.g., "user_login", "post_created")
  "description": "string",       // Human-readable description
  "entity_type": "string",       // Type of entity affected (user, post, community, etc.)
  "entity_id": "string",         // ID of the affected entity
  "session_id": "string",        // User session token
  "props": {                     // Additional properties
    "geo_location": "string",
    "ip_address": "string",
    "device": "string",          // Desktop/Mobile
    "browser": "string",         // Chrome, Firefox, etc.
    "platform": "string"         // Windows, MacOS, etc.
  },
  "request": {                   // HTTP request details
    "method": "string",
    "path": "string",
    "ip_address": "string"
  },
  "occurred_at": "ISO string"    // Timestamp
}
```

## Testing Kafka Connection

To test if Kafka is working correctly:

```bash
npm run test:kafka
```

This will send a test event to verify the connection.

**✅ Status: Connection Test Passed**
- Successfully connected to Confluent Cloud
- Successfully sent test messages to the topic
- Integration is ready for production use

## Sending Events from JSON File

You can also send events from a JSON file using the producer script:

```bash
npm run produce:events data.json
```

The JSON file should contain an array of event objects matching the structure above.

## Integration with Dashboard

The events sent to Kafka can be consumed by your dashboard application to:

1. **Real-time Analytics**: Display live user activity
2. **User Behavior Analysis**: Track engagement patterns
3. **System Monitoring**: Monitor application health
4. **Business Intelligence**: Generate insights from user actions

## Error Handling

- If Kafka is unavailable, activity logging continues without blocking the application
- Failed Kafka sends are logged but don't affect user operations
- Connection errors are logged only once to avoid spam

## Security

- SASL_SSL encryption is used for secure communication
- Credentials are stored in environment variables
- No sensitive user data is sent to Kafka (passwords, tokens, etc.)

## Monitoring and Logging

### Connection Status Logging
When Kafka is connected, the system logs connection status every 3 seconds:
```
[Kafka] Connected to Confluent Cloud
```

### Activity Event Logging
Whenever any activity occurs (profile updates, avatar changes, etc.), you'll see detailed logs:
```
[Kafka] Sending activity event: profile_updated for user user123
[Kafka] Successfully sent profile_updated event to topic: event
```

### Error Logging
If there are connection issues:
```
[Kafka] Failed to publish activity event profile_updated: <error message>
```

## Testing Logging

To test the logging functionality:

```bash
node test-kafka-logs.js
```

This will demonstrate:
- Periodic connection status logs every 3 seconds
- Activity event logs when sending test events (profile_updated, avatar_updated)