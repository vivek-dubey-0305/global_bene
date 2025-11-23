import { config } from "dotenv";
import { readFileSync } from 'fs';
import { sendActivityEvent } from './kafka.utils.js';

// Load environment variables
config({ path: "c:/Users/DELL/Desktop/Internship/Globle_Bane/global_bene/backend/.env" });

/**
 * Produces events from JSON file to Kafka topic
 * @param {string} jsonFilePath - Path to JSON file with events
 */
export const produceEventsFromJson = async (jsonFilePath) => {
  try {
    console.log(`📁 Loading events from ${jsonFilePath}...`);

    // Load events from JSON file
    const fileContent = readFileSync(jsonFilePath, 'utf-8');
    const events = JSON.parse(fileContent);

    console.log(`✅ Loaded ${events.length} events from ${jsonFilePath}`);

    let deliveredCount = 0;
    let failedCount = 0;

    console.log(`\n📤 Sending ${events.length} events to Kafka topic...`);
    console.log('   This may take a moment...\n');

    // Send each event
    for (let i = 0; i < events.length; i++) {
      const event = events[i];

      try {
        await sendActivityEvent(event);
        deliveredCount++;

        // Print progress every 50 messages
        if (deliveredCount % 50 === 0) {
          console.log(`   ✅ Sent ${deliveredCount}/${events.length} events...`);
        }
      } catch (error) {
        console.error(`❌ Failed to send event ${i + 1}:`, error.message);
        failedCount++;
      }
    }

    // Print final results
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 PRODUCTION SUMMARY');
    console.log(`${'='.repeat(60)}`);
    console.log(`✅ Successfully delivered: ${deliveredCount}`);
    if (failedCount > 0) {
      console.log(`❌ Failed: ${failedCount}`);
    }
    console.log(`📦 Total events in file: ${events.length}`);
    console.log(`${'='.repeat(60)}`);

    if (deliveredCount === events.length) {
      console.log(`\n✅ All events successfully sent to Confluent Cloud!`);
      return true;
    } else {
      console.log(`\n⚠️  Some events may not have been delivered.`);
      return false;
    }

  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`❌ Error: File not found at ${jsonFilePath}`);
      console.error('   Please check the file path and try again.');
    } else if (error instanceof SyntaxError) {
      console.error(`❌ Error: Invalid JSON file - ${error.message}`);
    } else {
      console.error(`❌ Error: ${error.message}`);
    }
    return false;
  }
};

// CLI interface
const main = async () => {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node produce-events.js <json-file-path>');
    console.log('Example: node produce-events.js data.json');
    process.exit(1);
  }

  const jsonFilePath = args[0];

  console.log('='.repeat(60));
  console.log('KAFKA PRODUCER - Sending Events to Confluent Cloud');
  console.log('='.repeat(60));
  console.log(`📁 File: ${jsonFilePath}`);
  console.log('='.repeat(60));

  try {
    const success = await produceEventsFromJson(jsonFilePath);

    if (!success) {
      process.exit(1);
    }

  } catch (error) {
    console.error(`\n❌ Unexpected error: ${error.message}`);
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`) {
  main();
}