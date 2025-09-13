import { useEffect, useState, useCallback, useRef } from 'react';

export interface RealtimeEvent {
  event: string;
  data: any;
  timestamp: string;
  source: string;
}

export interface UseRealtimeEventsOptions {
  url?: string;
  enabled?: boolean;
  onEvent?: (event: RealtimeEvent) => void;
  onError?: (error: Event) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

// Global connection to prevent multiple instances
let globalEventSource: EventSource | null = null;
let globalListeners: Set<(event: RealtimeEvent) => void> = new Set();

export function useRealtimeEvents(options: UseRealtimeEventsOptions = {}) {
  const {
    url = 'http://localhost:3001/events',
    enabled = true,
    onEvent,
    onError,
    onConnect,
    onDisconnect
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const listenerRef = useRef<((event: RealtimeEvent) => void) | null>(null);

  const addEvent = useCallback((event: RealtimeEvent) => {
    setLastEvent(event);
    setEvents(prev => [event, ...prev.slice(0, 99)]); // Keep last 100 events
    onEvent?.(event);
  }, [onEvent]);

  useEffect(() => {
    if (!enabled) return;

    // Create listener for this hook instance
    const listener = (event: RealtimeEvent) => {
      addEvent(event);
    };
    listenerRef.current = listener;

    const connectGlobal = () => {
      if (globalEventSource?.readyState === EventSource.OPEN) {
        setIsConnected(true);
        globalListeners.add(listener);
        return;
      }

      if (globalEventSource) {
        globalEventSource.close();
      }

      console.log('🔗 Creating SSE connection', new Date().toISOString());
      globalEventSource = new EventSource(url);

      globalEventSource.onopen = () => {
        console.log('🔗 SSE Connected', new Date().toISOString());
        setIsConnected(true);
        setError(null);
        onConnect?.();
      };

      globalEventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          const realtimeEvent: RealtimeEvent = {
            event: data.event || 'unknown',
            data: data.data || data,
            timestamp: data.timestamp || new Date().toISOString(),
            source: 'sse'
          };
          
          // Broadcast to all listeners
          globalListeners.forEach(listener => listener(realtimeEvent));
        } catch (err) {
          console.error('Failed to parse event data:', err, event.data);
        }
      };

      globalEventSource.onerror = (err) => {
        console.log('❌ SSE Error, reconnecting in 3s...');
        setIsConnected(false);
        setError('Connection error');
        onError?.(err);
        onDisconnect?.();

        setTimeout(() => {
          if (globalListeners.size > 0) {
            connectGlobal();
          }
        }, 3000);
      };

      globalListeners.add(listener);
    };

    connectGlobal();

    return () => {
      console.log('🔌 Removing SSE listener', new Date().toISOString());
      if (listenerRef.current) {
        globalListeners.delete(listenerRef.current);
      }
      
      // Close connection if no more listeners
      if (globalListeners.size === 0 && globalEventSource) {
        console.log('🔌 Closing SSE connection (no more listeners)');
        globalEventSource.close();
        globalEventSource = null;
      }
      
      setIsConnected(false);
    };
  }, [url, enabled]);

  const clearEvents = useCallback(() => {
    setEvents([]);
    setLastEvent(null);
  }, []);

  return {
    isConnected,
    lastEvent,
    events,
    error,
    clearEvents
  };
}