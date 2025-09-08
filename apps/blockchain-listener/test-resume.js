// Simple test script to verify resume functionality
import { EventRepository, EventService } from '@better-play/core';

async function testResumeFunction() {
  console.log('🧪 Testing resume functionality...');
  
  try {
    const eventRepo = new EventRepository();
    const eventService = new EventService(eventRepo);
    
    // Test getting last processed event
    const lastEvent = await eventService.getLastProcessedEvent();
    
    if (lastEvent) {
      console.log('✅ Found last processed event:');
      console.log(`   Block: ${lastEvent.blockNumber}`);
      console.log(`   Event: ${lastEvent.eventName}`); 
      console.log(`   TxId: ${lastEvent.txId}`);
      console.log(`   Resume from block: ${lastEvent.blockNumber + 1}`);
    } else {
      console.log('ℹ️  No processed events found - would start from config block');
    }
    
    console.log('✅ Resume functionality test completed');
  } catch (error) {
    console.error('❌ Resume functionality test failed:', error);
  }
}

testResumeFunction();