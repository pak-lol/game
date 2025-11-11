import { WS_CONFIG } from '../config.js';

/**
 * WebSocket Service for real-time communication with game server
 */
export class WebSocketService {
    constructor() {
        this.ws = null;
        this.url = WS_CONFIG.url;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.messageHandlers = new Map();
        this.connected = false;
    }

    /**
     * Connect to WebSocket server
     */
    connect() {
        return new Promise((resolve, reject) => {
            try {
                console.log(`Connecting to WebSocket server: ${this.url}`);
                this.ws = new WebSocket(this.url);

                this.ws.onopen = () => {
                    console.log('✓ WebSocket connected');
                    this.connected = true;
                    this.reconnectAttempts = 0;
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    this.handleMessage(event.data);
                };

                this.ws.onclose = () => {
                    console.log('✗ WebSocket disconnected');
                    this.connected = false;
                    this.attemptReconnect();
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                };
            } catch (error) {
                console.error('Failed to create WebSocket:', error);
                reject(error);
            }
        });
    }

    /**
     * Attempt to reconnect
     */
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connect().catch(err => {
                    console.error('Reconnection failed:', err);
                });
            }, this.reconnectDelay);
        } else {
            console.error('Max reconnection attempts reached');
        }
    }

    /**
     * Handle incoming messages
     */
    handleMessage(data) {
        try {
            const message = JSON.parse(data);
            
            // Call registered handlers
            const handlers = this.messageHandlers.get(message.type);
            if (handlers) {
                handlers.forEach(handler => handler(message.payload));
            }

            // Log unhandled messages
            if (!handlers && message.type !== 'HEARTBEAT') {
                console.log('Received message:', message);
            }
        } catch (error) {
            console.error('Error handling message:', error);
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
        return this.connected;
    }

    /**
     * Disconnect from server
     */
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.connected = false;
        }
    }
}

// Export singleton instance
export const wsService = new WebSocketService();
