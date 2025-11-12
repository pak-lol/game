import { WS_CONFIG } from '../config.js';

/**
 * WebSocket Service for real-time communication with game server
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Heartbeat/ping-pong to keep connection alive
 * - Visibility API integration to handle app backgrounding
 * - Connection state management
 */
export class WebSocketService {
    constructor() {
        this.ws = null;
        this.url = WS_CONFIG.url;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000; // Start with 1 second
        this.maxReconnectDelay = 30000; // Max 30 seconds between attempts
        this.messageHandlers = new Map();
        this.connected = false;
        this.reconnectTimer = null;
        this.heartbeatTimer = null;
        this.heartbeatInterval = 30000; // Send heartbeat every 30 seconds
        this.connectionStateCallbacks = [];
        this.isReconnecting = false;
        this.manualDisconnect = false;

        // Setup visibility change handler
        this.setupVisibilityHandler();
    }

    /**
     * Setup visibility change handler to reconnect when app comes back to foreground
     */
    setupVisibilityHandler() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                console.log('[WS] App visible - checking connection...');
                // If not connected, try to reconnect
                if (!this.connected && !this.isReconnecting) {
                    console.log('[WS] Reconnecting after app became visible');
                    this.attemptReconnect();
                }
            } else {
                console.log('[WS] App hidden - connection will be maintained with heartbeat');
            }
        });

        // Handle Telegram-specific events
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.onEvent('viewportChanged', () => {
                console.log('[WS] Telegram viewport changed - checking connection...');
                if (!this.connected && !this.isReconnecting) {
                    this.attemptReconnect();
                }
            });
        }
    }

    /**
     * Register a connection state change callback
     */
    onConnectionStateChange(callback) {
        this.connectionStateCallbacks.push(callback);
    }

    /**
     * Notify all callbacks about connection state change
     */
    notifyConnectionStateChange(connected) {
        this.connectionStateCallbacks.forEach(callback => {
            try {
                callback(connected);
            } catch (error) {
                console.error('[WS] Error in connection state callback:', error);
            }
        });
    }

    /**
     * Connect to WebSocket server with improved error handling
     */
    connect() {
        return new Promise((resolve, reject) => {
            // Clear any existing reconnect timer
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }

            // Close existing connection if any
            if (this.ws) {
                try {
                    this.ws.close();
                } catch (e) {
                    console.warn('[WS] Error closing existing connection:', e);
                }
                this.ws = null;
            }

            try {
                console.log(`[WS] Connecting to server: ${this.url}`);
                this.ws = new WebSocket(this.url);

                const connectionTimeout = setTimeout(() => {
                    console.warn('[WS] Connection timeout');
                    if (this.ws.readyState === WebSocket.CONNECTING) {
                        this.ws.close();
                        reject(new Error('Connection timeout'));
                    }
                }, 10000); // 10 second timeout

                this.ws.onopen = () => {
                    clearTimeout(connectionTimeout);
                    console.log('[WS] ✓ Connected successfully');
                    this.connected = true;
                    this.isReconnecting = false;
                    this.reconnectAttempts = 0;
                    this.reconnectDelay = 1000; // Reset delay
                    this.manualDisconnect = false;

                    // Start heartbeat
                    this.startHeartbeat();

                    // Notify callbacks
                    this.notifyConnectionStateChange(true);

                    resolve();
                };

                this.ws.onmessage = (event) => {
                    this.handleMessage(event.data);
                };

                this.ws.onclose = (event) => {
                    clearTimeout(connectionTimeout);
                    console.log(`[WS] ✗ Disconnected (code: ${event.code}, reason: ${event.reason})`);

                    const wasConnected = this.connected;
                    this.connected = false;
                    this.stopHeartbeat();

                    // Notify callbacks
                    if (wasConnected) {
                        this.notifyConnectionStateChange(false);
                    }

                    // Only attempt reconnect if not manually disconnected
                    if (!this.manualDisconnect) {
                        this.attemptReconnect();
                    }
                };

                this.ws.onerror = (error) => {
                    clearTimeout(connectionTimeout);
                    console.error('[WS] Connection error:', error);
                    // Don't reject here, let onclose handle it
                };
            } catch (error) {
                console.error('[WS] Failed to create WebSocket:', error);
                reject(error);
            }
        });
    }

    /**
     * Attempt to reconnect with exponential backoff
     * Will keep trying indefinitely with increasing delays
     */
    attemptReconnect() {
        // Prevent multiple simultaneous reconnection attempts
        if (this.isReconnecting) {
            return;
        }

        this.isReconnecting = true;
        this.reconnectAttempts++;

        // Calculate delay with exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s (max)
        const delay = Math.min(
            this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
            this.maxReconnectDelay
        );

        console.log(`[WS] Reconnecting in ${delay / 1000}s... (attempt ${this.reconnectAttempts})`);

        this.reconnectTimer = setTimeout(() => {
            console.log(`[WS] Attempting reconnection #${this.reconnectAttempts}`);
            this.connect()
                .then(() => {
                    console.log('[WS] Reconnection successful!');
                })
                .catch(err => {
                    console.warn('[WS] Reconnection failed:', err.message);
                    this.isReconnecting = false;
                    // Will trigger another reconnect attempt via onclose
                });
        }, delay);
    }

    /**
     * Start heartbeat to keep connection alive
     */
    startHeartbeat() {
        this.stopHeartbeat(); // Clear any existing heartbeat

        this.heartbeatTimer = setInterval(() => {
            if (this.connected && this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.send('PING', { timestamp: Date.now() });
                console.log('[WS] Heartbeat sent');
            }
        }, this.heartbeatInterval);

        console.log(`[WS] Heartbeat started (interval: ${this.heartbeatInterval / 1000}s)`);
    }

    /**
     * Stop heartbeat
     */
    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    /**
     * Handle incoming messages
     */
    handleMessage(data) {
        try {
            const message = JSON.parse(data);

            // Handle PONG response
            if (message.type === 'PONG') {
                console.log('[WS] Heartbeat acknowledged');
                return;
            }

            // Call registered handlers
            const handlers = this.messageHandlers.get(message.type);
            if (handlers) {
                handlers.forEach(handler => handler(message.payload));
            }

            // Log unhandled messages (except heartbeat-related)
            if (!handlers && message.type !== 'HEARTBEAT' && message.type !== 'PING') {
                console.log('[WS] Received message:', message);
            }
        } catch (error) {
            console.error('[WS] Error handling message:', error);
        }
    }

    /**
     * Register a message handler
     */
    on(messageType, handler) {
        if (!this.messageHandlers.has(messageType)) {
            this.messageHandlers.set(messageType, []);
        }
        this.messageHandlers.get(messageType).push(handler);
    }

    /**
     * Unregister a message handler
     */
    off(messageType, handler) {
        const handlers = this.messageHandlers.get(messageType);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    /**
     * Send a message to the server
     */
    send(type, payload = {}) {
        if (!this.connected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn('WebSocket not connected, cannot send message');
            return false;
        }

        try {
            this.ws.send(JSON.stringify({ type, payload }));
            return true;
        } catch (error) {
            console.error('Error sending message:', error);
            return false;
        }
    }

    /**
     * Submit a score
     */
    submitScore(username, score, telegramData = {}) {
        return new Promise((resolve, reject) => {
            if (!this.connected) {
                reject(new Error('Not connected to server'));
                return;
            }

            // Register one-time handler for response
            const handler = (payload) => {
                this.off('SCORE_SUBMITTED', handler);
                this.off('ERROR', errorHandler);
                resolve(payload);
            };

            const errorHandler = (payload) => {
                this.off('SCORE_SUBMITTED', handler);
                this.off('ERROR', errorHandler);
                reject(new Error(payload.message));
            };

            this.on('SCORE_SUBMITTED', handler);
            this.on('ERROR', errorHandler);

            // Send score
            this.send('SUBMIT_SCORE', {
                username,
                score,
                telegramUserId: telegramData.userId,
                telegramUsername: telegramData.username
            });

            // Timeout after 10 seconds
            setTimeout(() => {
                this.off('SCORE_SUBMITTED', handler);
                this.off('ERROR', errorHandler);
                reject(new Error('Request timeout'));
            }, 10000);
        });
    }

    /**
     * Get leaderboard
     */
    getLeaderboard(limit = 100) {
        return new Promise((resolve, reject) => {
            if (!this.connected) {
                reject(new Error('Not connected to server'));
                return;
            }

            const handler = (payload) => {
                this.off('LEADERBOARD', handler);
                this.off('ERROR', errorHandler);
                resolve(payload);
            };

            const errorHandler = (payload) => {
                this.off('LEADERBOARD', handler);
                this.off('ERROR', errorHandler);
                reject(new Error(payload.message));
            };

            this.on('LEADERBOARD', handler);
            this.on('ERROR', errorHandler);

            this.send('GET_LEADERBOARD', { limit });

            setTimeout(() => {
                this.off('LEADERBOARD', handler);
                this.off('ERROR', errorHandler);
                reject(new Error('Request timeout'));
            }, 10000);
        });
    }

    /**
     * Get player statistics
     */
    getPlayerStats(username) {
        return new Promise((resolve, reject) => {
            if (!this.connected) {
                reject(new Error('Not connected to server'));
                return;
            }

            const handler = (payload) => {
                this.off('PLAYER_STATS', handler);
                this.off('ERROR', errorHandler);
                resolve(payload);
            };

            const errorHandler = (payload) => {
                this.off('PLAYER_STATS', handler);
                this.off('ERROR', errorHandler);
                reject(new Error(payload.message));
            };

            this.on('PLAYER_STATS', handler);
            this.on('ERROR', errorHandler);

            this.send('GET_PLAYER_STATS', { username });

            setTimeout(() => {
                this.off('PLAYER_STATS', handler);
                this.off('ERROR', errorHandler);
                reject(new Error('Request timeout'));
            }, 10000);
        });
    }

    /**
     * Check if connected
     */
    isConnected() {
        return this.connected && this.ws && this.ws.readyState === WebSocket.OPEN;
    }

    /**
     * Get connection status details
     */
    getConnectionStatus() {
        return {
            connected: this.connected,
            reconnecting: this.isReconnecting,
            reconnectAttempts: this.reconnectAttempts,
            readyState: this.ws ? this.ws.readyState : -1,
            readyStateText: this.getReadyStateText()
        };
    }

    /**
     * Get human-readable ready state
     */
    getReadyStateText() {
        if (!this.ws) return 'DISCONNECTED';
        switch (this.ws.readyState) {
            case WebSocket.CONNECTING: return 'CONNECTING';
            case WebSocket.OPEN: return 'CONNECTED';
            case WebSocket.CLOSING: return 'CLOSING';
            case WebSocket.CLOSED: return 'CLOSED';
            default: return 'UNKNOWN';
        }
    }

    /**
     * Disconnect from server
     */
    disconnect() {
        console.log('[WS] Manual disconnect requested');
        this.manualDisconnect = true;

        // Clear timers
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        this.stopHeartbeat();

        // Close connection
        if (this.ws) {
            try {
                this.ws.close(1000, 'Manual disconnect');
            } catch (e) {
                console.warn('[WS] Error during disconnect:', e);
            }
            this.ws = null;
        }

        this.connected = false;
        this.isReconnecting = false;
        this.notifyConnectionStateChange(false);
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.disconnect();
        this.messageHandlers.clear();
        this.connectionStateCallbacks = [];
    }
}

// Export singleton instance
export const wsService = new WebSocketService();
