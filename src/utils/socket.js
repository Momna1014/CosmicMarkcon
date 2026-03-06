// import { io } from 'socket.io-client';

// // Socket configuration with reconnection logic for production resilience
// const socket = io('https://socket.islamicapps.care20.com', {
//   transports: ['polling', 'websocket'],
//   reconnection: true, // Enable automatic reconnection
//   reconnectionDelay: 1000, // Initial delay before reconnection (1 second)
//   reconnectionDelayMax: 5000, // Maximum delay between reconnection attempts
//   reconnectionAttempts: 5, // Number of reconnection attempts before giving up
//   timeout: 10000, // Connection timeout (10 seconds)
//   autoConnect: true, // Auto-connect on initialization
// });

// // Connection state management
// const connectionState = {
//   isConnected: false,
//   reconnecting: false,
//   reconnectAttempt: 0,
//   lastConnectedAt: null,
//   lastDisconnectedAt: null,
//   currentZikr: null, // Track current zikr for auto-rejoin
// };

// // Store current zikr info for auto-rejoin on reconnect
// export const setCurrentZikr = (zikrId, userId) => {
//   connectionState.currentZikr = { zikrId, userId };
//   // console.log('💾 [SOCKET] Stored current zikr for auto-rejoin:', connectionState.currentZikr);
// };

// // Clear current zikr info
// export const clearCurrentZikr = () => {
//   // console.log('🗑️ [SOCKET] Clearing current zikr info');
//   connectionState.currentZikr = null;
// };

// // Get connection status - for UI to check before operations
// export const getConnectionStatus = () => {
//   return {
//     isConnected: connectionState.isConnected,
//     reconnecting: connectionState.reconnecting,
//     socketConnected: socket.connected,
//   };
// };

// // Connection event listeners
// socket.on('connect', () => {
//   connectionState.isConnected = true;
//   connectionState.reconnecting = false;
//   connectionState.reconnectAttempt = 0;
//   connectionState.lastConnectedAt = new Date();
//   // console.log('✅ Connected to socket server!', {
//   //   socketId: socket.id,
//   //   timestamp: connectionState.lastConnectedAt
//   // });

//   // Auto-rejoin zikr room if we were in one before disconnect
//   if (connectionState.currentZikr) {
//     const { zikrId, userId } = connectionState.currentZikr;
//     // console.log('🔄 [SOCKET] Auto-rejoining zikr after reconnect:', { zikrId, userId });

//     // Use rejoin_zikr event for reconnection
//     socket.emit('rejoin_zikr', {
//       create_zikr_id: zikrId,
//       user_id: userId,
//     });
//   }
// });

// socket.on('disconnect', (reason) => {
//   connectionState.isConnected = false;
//   connectionState.lastDisconnectedAt = new Date();
//   // console.log('❌ Disconnected from server', {
//   //   reason,
//   //   timestamp: connectionState.lastDisconnectedAt
//   // });
// });

// socket.on('reconnect_attempt', (attemptNumber) => {
//   connectionState.reconnecting = true;
//   connectionState.reconnectAttempt = attemptNumber;
//   // console.log(`🔄 Reconnection attempt #${attemptNumber}`);
// });

// socket.on('reconnect', (attemptNumber) => {
//   connectionState.reconnecting = false;
//   // console.log(`✅ Reconnected after ${attemptNumber} attempt(s)`);
// });

// socket.on('reconnect_failed', () => {
//   connectionState.reconnecting = false;
//   // console.error('❌ Reconnection failed after maximum attempts');
// });

// socket.on('connect_error', (error) => {
//   // console.error('❌ Connection error:', error.message);
// });

// // Join Zikr Room
// const joinZikr = (zikrId, userId) => {
//   // console.log('🔄 Attempting to join zikr room:', { zikrId, userId });

//   // Store current zikr for auto-rejoin on reconnect
//   setCurrentZikr(zikrId, userId);

//   socket.emit('join_zikr', {
//     create_zikr_id: zikrId,
//     user_id: userId,
//   });
// };

// // Listen for join confirmation
// socket.on('zikr_joined', (data) => {
//   // console.log('✅ Joined room:', data);
//   // console.log('📊 Current count:', data.count);
// });

// // Listen for rejoin confirmation (after reconnect)
// socket.on('zikr_rejoined', (data) => {
//   // console.log('🔄 [SOCKET] Successfully rejoined room after reconnect:', data.room);
//   // console.log('📊 [SOCKET] Restored count:', data.count);
//   // console.log('📊 [SOCKET] Total count:', data.total_count);
//   // console.log('🎯 [SOCKET] Target:', data.target_count);
//   // console.log('✅ [SOCKET] Completed:', data.is_completed);
// });

// // Increment zikr count
// const incrementZikr = (zikrId, userId, count) => {
//   // console.log('⬆️ Incrementing zikr:', { zikrId, userId,count });
//   socket.emit('increment_zikr', {
//     create_zikr_id: zikrId,
//     user_id: userId,
//     count: 1,
//   });
// };

// // Decrement zikr count
// const decrementZikr = (zikrId, userId, amount = 1) => {
//   // console.log('⬇️ Decrementing zikr:', { zikrId, userId, amount });
//   socket.emit('decrement_zikr', {
//     create_zikr_id: zikrId,
//     user_id: userId,
//     count: amount,
//   });
// };

// // Listen for count updates
// socket.on('zikr_count_updated', (data) => {
//   // console.log('🔄 Zikr count updated:', data);
//   if (data.decrement) {
//     // console.log('⬇️ Decremented by:', data.decrement);
//   }
//   // console.log('📊 User count:', data.count);
//   // console.log('📊 Total count:', data.all_count_by_zikr_id);
//   // Update UI with new count
// });

// // Note: The 'zikr_total_updated' event is now handled in individual components
// // to allow proper state management. See CustomChallenges.tsx for implementation.
// // Get current count
// const getCount = (zikrId, userId) => {
//   // console.log('📊 Getting zikr count:', { zikrId, userId });
//   socket.emit('get_zikr_count', {
//     create_zikr_id: zikrId,
//     user_id: userId,
//     // count:
//   });
// };

// socket.on('zikr_count_result', (data) => {
//   // console.log('📊 Current count result:', data.count);
// });

// // Reset count
// const resetZikr = (zikrId, userId) => {
//   // console.log('🔄 Resetting zikr:', { zikrId, userId });
//   socket.emit('reset_zikr', {
//     create_zikr_id: zikrId,
//     user_id: userId,
//   });
// };

// // Error handling
// socket.on('zikr_error', (error) => {
//   // console.error('❌ Socket Error:', error.message);
// });

// // Connection state helpers
// export const isConnected = () => socket.connected;

// export const getConnectionState = () => ({
//   ...connectionState,
//   socketId: socket.id,
// });

// export const forceReconnect = () => {
//   if (!socket.connected) {
//     // console.log('🔄 Forcing reconnection...');
//     socket.connect();
//   }
// };

// export const disconnect = () => {
//   // console.log('🔌 Manually disconnecting...');
//   socket.disconnect();
// };

// // Operation timeout helper
// const withTimeout = (emitFn, timeoutMs = 5000) => {
//   return new Promise((resolve, reject) => {
//     const timer = setTimeout(() => {
//       reject(new Error('Operation timed out'));
//     }, timeoutMs);

//     try {
//       emitFn();
//       clearTimeout(timer);
//       resolve();
//     } catch (error) {
//       clearTimeout(timer);
//       reject(error);
//     }
//   });
// };

// // Enhanced operations with timeout protection
// export const joinZikrWithTimeout = async (zikrId, userId, timeout = 5000) => {
//   try {
//     await withTimeout(() => joinZikr(zikrId, userId), timeout);
//     return { success: true };
//   } catch (error) {
//     // console.error('❌ Join zikr operation timed out:', error);
//     return { success: false, error: error.message };
//   }
// };

// export const incrementZikrWithTimeout = async (
//   zikrId,
//   userId,
//   count = 1,
//   timeout = 5000
// ) => {
//   try {
//     await withTimeout(() => incrementZikr(zikrId, userId, count), timeout);
//     return { success: true };
//   } catch (error) {
//     // console.error('❌ Increment operation timed out:', error);
//     return { success: false, error: error.message };
//   }
// };

// export const decrementZikrWithTimeout = async (
//   zikrId,
//   userId,
//   amount = 1,
//   timeout = 5000
// ) => {
//   try {
//     await withTimeout(() => decrementZikr(zikrId, userId, amount), timeout);
//     return { success: true };
//   } catch (error) {
//     // console.error('❌ Decrement operation timed out:', error);
//     return { success: false, error: error.message };
//   }
// };

// export { socket, joinZikr, incrementZikr, decrementZikr, getCount, resetZikr };
