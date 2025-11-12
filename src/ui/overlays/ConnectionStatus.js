import * as PIXI from 'pixi.js';

/**
 * Connection Status Indicator
 * Shows WebSocket connection status in top-right corner
 */
export class ConnectionStatus {
    constructor() {
        this.container = null;
        this.statusCircle = null;
        this.statusText = null;
        this.connected = false;
    }

    /**
     * Create the connection status display
     */
    create() {
        this.container = new PIXI.Container();
        this.container.x = 10;
        this.container.y = 50; // Below score

        // Create status circle (dot indicator)
        this.statusCircle = new PIXI.Graphics();
        this.updateCircle(false);
        this.container.addChild(this.statusCircle);

        // Create status text
        this.statusText = new PIXI.Text('', {
            fontFamily: 'Inter, Arial, sans-serif',
            fontSize: 12,
            fill: '#FFFFFF',
            fontWeight: '500'
        });
        this.statusText.x = 15;
        this.statusText.y = -6;
        this.container.addChild(this.statusText);

        // Initially hidden
        this.container.visible = false;

        return this.container;
    }

    /**
     * Update circle appearance based on connection state
     */
    updateCircle(connected, reconnecting = false) {
        if (!this.statusCircle) return;

        this.statusCircle.clear();

        if (connected) {
            // Green dot for connected
            this.statusCircle.circle(0, 0, 5);
            this.statusCircle.fill({ color: 0x4CAF50, alpha: 1 });
        } else if (reconnecting) {
            // Yellow/orange dot for reconnecting
            this.statusCircle.circle(0, 0, 5);
            this.statusCircle.fill({ color: 0xFFA726, alpha: 1 });
        } else {
            // Red dot for disconnected
            this.statusCircle.circle(0, 0, 5);
            this.statusCircle.fill({ color: 0xFF6B6B, alpha: 1 });
        }
    }

    /**
     * Update connection status
     */
    setStatus(connected, reconnecting = false, reconnectAttempts = 0) {
        this.connected = connected;

        if (!this.container) return;

        this.updateCircle(connected, reconnecting);

        if (connected) {
            this.statusText.text = 'Online';
            this.statusText.style.fill = '#4CAF50';
            // Hide after 3 seconds when connected
            setTimeout(() => {
                if (this.connected && this.container) {
                    this.container.visible = false;
                }
            }, 3000);
        } else if (reconnecting) {
            this.statusText.text = `Jungiamasi... (${reconnectAttempts})`;
            this.statusText.style.fill = '#FFA726';
            this.container.visible = true;
        } else {
            this.statusText.text = 'Neprisijungta';
            this.statusText.style.fill = '#FF6B6B';
            this.container.visible = true;
        }
    }

    /**
     * Add to stage
     */
    addToStage(stage) {
        if (!this.container) {
            this.create();
        }
        stage.addChild(this.container);
    }

    /**
     * Remove from stage
     */
    removeFromStage(stage) {
        if (this.container && stage) {
            stage.removeChild(this.container);
        }
    }

    /**
     * Update position (for responsive design)
     */
    updatePosition() {
        if (this.container) {
            this.container.x = 10;
            this.container.y = 50;
        }
    }

    /**
     * Clean up
     */
    destroy() {
        if (this.container) {
            this.container.destroy({ children: true });
            this.container = null;
        }
        this.statusCircle = null;
        this.statusText = null;
    }
}
