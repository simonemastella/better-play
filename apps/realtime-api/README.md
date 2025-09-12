# Realtime API

NestJS service that provides real-time data to the frontend using Server-Sent Events (SSE).

## Features

- **SSE Endpoint**: `/events` - streams real-time events to clients
- **Event Bridge**: Listens to blockchain-listener events and broadcasts them
- **CORS enabled**: Ready for frontend integration

## Usage

### Start the service
```bash
yarn workspace @better-play/realtime-api dev
```

### Frontend Integration
```typescript
// React hook example
import { useEffect, useState } from 'react';

export function useRealTimeEvents() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:3001/events');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setEvents(prev => [...prev, data]);
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
    };

    return () => eventSource.close();
  }, []);

  return events;
}
```

### Test with curl
```bash
curl -N -H "Accept: text/event-stream" http://localhost:3001/events
```

## How it works

1. **EventsController**: Provides SSE endpoint at `/events`
2. **EventBridgeService**: Listens to all events via EventEmitter2 and broadcasts them to SSE clients
3. **Integration**: Any event emitted in blockchain-listener gets forwarded to connected frontends

## Event Format
```json
{
  "event": "blockchain.transaction",
  "data": { "txHash": "0x123...", "status": "confirmed" },
  "timestamp": "2025-09-12T19:07:06.000Z"
}
```