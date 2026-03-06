// Socket.IO Configuration
// This file contains socket configuration and constants

export const SOCKET_CONFIG = {
  // Backend developer's local IP on same WiFi network
  // IPv4 Address: 192.168.20.198 (from ipconfig)
  // Port: 8000
  SERVER_URL: 'http://192.168.20.198:7000',

  // Socket connection options
  OPTIONS: {
    transports: ['polling', 'websocket'], // Try polling first, then upgrade to websocket
    reconnection: true, // Enable auto-reconnection
    reconnectionAttempts: 5, // Number of reconnection attempts
    reconnectionDelay: 1000, // Delay between reconnection attempts (ms)
    timeout: 20000, // Connection timeout (ms) - increased for better connectivity
    forceNew: true, // Force a new connection
    autoConnect: true, // Auto connect on creation
  },
};

// Socket event names - Define your custom events here
export const SOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',

  // Custom challenge events (examples - customize as needed)
  CHALLENGE_UPDATE: 'challenge_update',
  CHALLENGE_JOIN: 'challenge_join',
  CHALLENGE_LEAVE: 'challenge_leave',
  PROGRESS_UPDATE: 'progress_update',
  LEADERBOARD_UPDATE: 'leaderboard_update',
};

export default SOCKET_CONFIG;
