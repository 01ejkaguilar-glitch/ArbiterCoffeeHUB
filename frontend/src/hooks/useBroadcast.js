/**
 * Real-time Broadcasting Hook
 * React hook for subscribing to real-time events
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import broadcastService from '../services/broadcast.service';

export const useBroadcast = (channelName, eventHandlers = {}, isPrivate = false) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const channelRef = useRef(null);
  const prevEventHandlersRef = useRef(eventHandlers);
  const eventHandlersRef = useRef(eventHandlers);

  // Update the ref when eventHandlers change
  useEffect(() => {
    eventHandlersRef.current = eventHandlers;
  }, [eventHandlers]);

  useEffect(() => {
    if (!broadcastService.isEnabled()) {
      setIsConnected(false);
      return;
    }

    // Initialize broadcast service (Reverb WebSocket)
    broadcastService.init();

    // Subscribe to channel only if channelName is provided
    if (channelName) {
      const subscribeMethod = isPrivate ? 'subscribePrivate' : 'subscribe';
      channelRef.current = broadcastService[subscribeMethod](channelName, eventHandlersRef.current);
    }

    // Detect the underlying pusher-protocol socket (works for both Reverb and Pusher)
    const getPusherSocket = () => {
      const echo = broadcastService.getEcho();
      return echo?.connector?.pusher ?? null;
    };

    const pusherSocket = getPusherSocket();
    const connection = pusherSocket?.connection;
    if (connection && typeof connection.bind === 'function' && typeof connection.unbind === 'function') {
      // WebSocket mode — track actual connection state
      // Set initial state based on current connection.state
      if (connection.state === 'connected') {
        setIsConnected(true);
        setIsConnecting(false);
      } else if (connection.state === 'connecting') {
        setIsConnected(false);
        setIsConnecting(true);
      } else {
        setIsConnected(false);
        setIsConnecting(false);
      }

      const handleConnecting = () => {
        setIsConnected(false);
        setIsConnecting(true);
      };
      const handleConnected    = () => {
        setIsConnected(true);
        setIsConnecting(false);
      };
      const handleDisconnected = () => {
        setIsConnected(false);
        setIsConnecting(false);
      };
      connection.bind('connecting', handleConnecting);
      connection.bind('connected',    handleConnected);
      connection.bind('disconnected', handleDisconnected);

      return () => {
        try {
          if (channelName && broadcastService.getEcho()) broadcastService.unsubscribe(channelName);
          connection.unbind('connecting', handleConnecting);
          connection.unbind('connected',    handleConnected);
          connection.unbind('disconnected', handleDisconnected);
        } catch (err) {
          console.error('Error during broadcast cleanup:', err);
        }
      };
    } else {
      // Polling fallback mode — treat as always "connected" (polling is active)
      setIsConnected(true);
      setIsConnecting(false);
      return () => {
        try {
          if (channelName && broadcastService.getEcho()) broadcastService.unsubscribe(channelName);
        } catch (err) {
          console.error('Error during broadcast cleanup:', err);
        }
      };
    }
  }, [channelName, isPrivate]);


  // Update event handlers on existing channel when eventHandlers change
  useEffect(() => {
    const channel = channelRef.current;
    if (!channel) return;

    // Get the current eventHandlers from the ref (we'll store the previous in a ref)
    // We use a ref to track the previous eventHandlers
    const prevHandlers = prevEventHandlersRef.current;
    const newHandlers = eventHandlers;

    // Remove listeners for events that are no longer in newHandlers
    Object.keys(prevHandlers).forEach(event => {
      if (!(event in newHandlers)) {
        channel.stopListening(event);
      }
    });

    // Add or update listeners for events in newHandlers
    Object.keys(newHandlers).forEach(event => {
      if (prevHandlers[event] !== newHandlers[event]) {
        channel.stopListening(event);
        channel.listen(event, newHandlers[event]);
      }
    });

    // Update the previous eventHandlers ref
    prevEventHandlersRef.current = newHandlers;
  }, [eventHandlers]);


  return {
    isConnected,
    isConnecting,
    channel: channelRef.current
  };
};

/**
 * Hook for real-time order updates
 */
export const useOrderUpdates = (userId, onOrderUpdate) => {
  const [lastUpdate, setLastUpdate] = useState(null);

  const eventHandlers = useMemo(() => ({
    'order.created': (event) => {
      // console.log('New order created:', event);
      setLastUpdate(new Date());
      if (onOrderUpdate) {
        onOrderUpdate('created', event.order);
      }
    },
    'order.status.updated': (event) => {
      // console.log('Order status updated:', event);
      setLastUpdate(new Date());
      if (onOrderUpdate) {
        onOrderUpdate('status_updated', event.order);
      }
    }
  }), [onOrderUpdate]);

  const { isConnected, isConnecting } = useBroadcast(`user-orders-${userId}`, eventHandlers, true);

  return {
    isConnected,
    isConnecting,
    lastUpdate
  };
};

/**
 * Hook for real-time barista order notifications
 */
export const useBaristaOrders = (onNewOrder) => {
  const [pendingOrders, setPendingOrders] = useState([]);

  const eventHandlers = useMemo(() => ({
    'order.created': (event) => {
      // console.log('New order for barista:', event);
      setPendingOrders(prev => [...prev, event.order].slice(-50));
      if (onNewOrder) {
        onNewOrder(event.order);
      }
    }
  }), [onNewOrder]);

  const { isConnected, isConnecting } = useBroadcast('barista-orders', eventHandlers);

  return {
    isConnected,
    isConnecting,
    pendingOrders
  };
};

/**
 * Hook for real-time inventory alerts
 */
export const useInventoryAlerts = (onLowStock) => {
  const eventHandlers = useMemo(() => ({
    'inventory.low-stock': (event) => {
      // console.log('Low stock alert:', event);
      if (onLowStock) {
        onLowStock(event.item);
      }
    }
  }), [onLowStock]);

  const { isConnected } = useBroadcast('inventory-alerts', eventHandlers);

  return { isConnected };
};

/**
 * Hook for real-time kitchen order notifications
 */
export const useKitchenOrders = (onNewOrder) => {
  const [pendingOrders, setPendingOrders] = useState([]);

  const eventHandlers = useMemo(() => ({
    'order.created': (event) => {
      // console.log('New food order for kitchen:', event);
      setPendingOrders(prev => [...prev, event.order].slice(-50));
      if (onNewOrder) {
        onNewOrder(event.order);
      }
    }
  }), [onNewOrder]);

  const { isConnected, isConnecting } = useBroadcast('kitchen-orders', eventHandlers);

  return {
    isConnected,
    isConnecting,
    pendingOrders
  };
};

/**
 * Hook for real-time task assignment notifications
 */
export const useTaskAssignments = (onTaskAssigned) => {
  const eventHandlers = useMemo(() => ({
    'task.assigned': (event) => {
      // console.log('Task assigned:', event);
      if (onTaskAssigned) {
        onTaskAssigned(event);
      }
    }
  }), [onTaskAssigned]);

  const { isConnected } = useBroadcast('tasks', eventHandlers);

  return { isConnected };
};

/**
 * Hook for real-time shift notifications
 */
export const useShiftNotifications = (onShiftStarted) => {
  const eventHandlers = useMemo(() => ({
    'shift.started': (event) => {
      // console.log('Shift started:', event);
      if (onShiftStarted) {
        onShiftStarted(event);
      }
    }
  }), [onShiftStarted]);

  const { isConnected } = useBroadcast('shifts', eventHandlers);

  return { isConnected };
};

/**
 * Hook for real-time notifications
 */
export const useNotifications = (userId, onNotification) => {
  const eventHandlers = useMemo(() => ({
    'notification.received': (event) => {
      // console.log('New notification:', event);
      if (onNotification) {
        onNotification(event.notification);
      }
    }
  }), [onNotification]);

  // Always call useBroadcast but with conditional channel name
  const channelName = userId ? `user-notifications-${userId}` : null;
  const broadcastResult = useBroadcast(channelName, eventHandlers, !!userId);

  // Return disconnected state if no userId
  return userId ? broadcastResult : { isConnected: false };
};