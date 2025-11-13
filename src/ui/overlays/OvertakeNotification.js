/**
 * OvertakeNotification - Beautiful notification when player overtakes someone on leaderboard
 * Shows "Tu aplenkei [username]!" with smooth animations
 */
export class OvertakeNotification {
    constructor() {
        this.activeNotifications = [];
        this.container = document.createElement('div');
        this.container.id = 'overtakeNotifications';
        this.container.className = 'overtake-notifications-container';

        // Add styles
        this.addStyles();
    }

    addStyles() {
        if (document.getElementById('overtakeNotificationStyles')) return;

        const style = document.createElement('style');
        style.id = 'overtakeNotificationStyles';
        style.textContent = `
            .overtake-notifications-container {
                position: absolute;
                top: 70px;
                right: 10px;
                z-index: 200;
                pointer-events: none;
                display: flex;
                flex-direction: column;
                gap: 8px;
                align-items: flex-end;
                width: auto;
                max-width: 280px;
                padding: 0;
                box-sizing: border-box;
            }

            .overtake-notification {
                background: linear-gradient(135deg,
                    rgba(76, 175, 80, 0.95) 0%,
                    rgba(56, 142, 60, 0.95) 100%);
                border: 2px solid #81C784;
                border-radius: 12px;
                padding: 8px 16px;
                box-shadow:
                    0 4px 12px rgba(76, 175, 80, 0.5),
                    0 0 20px rgba(76, 175, 80, 0.3);
                animation: overtakeSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                position: relative;
                overflow: hidden;
                backdrop-filter: blur(8px);
                display: inline-flex;
                align-items: center;
                gap: 8px;
                white-space: nowrap;
            }

            @keyframes overtakeSlideIn {
                from {
                    opacity: 0;
                    transform: scale(0.8) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }

            .overtake-notification.removing {
                animation: overtakeSlideOut 0.4s ease-out forwards;
            }

            @keyframes overtakeSlideOut {
                to {
                    opacity: 0;
                    transform: scale(0.9) translateY(-10px);
                }
            }

            .overtake-icon {
                font-size: 20px;
                line-height: 1;
            }

            .overtake-text {
                font-family: Arial, sans-serif;
                font-size: 13px;
                font-weight: bold;
                color: #FFFFFF;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
                line-height: 1.2;
            }

            .overtake-username {
                color: #FFD700;
                font-weight: bold;
            }

            /* Responsive */
            @media (max-width: 400px) {
                .overtake-notifications-container {
                    top: 60px;
                    right: 8px;
                    max-width: 240px;
                }

                .overtake-notification {
                    padding: 6px 12px;
                    gap: 6px;
                }

                .overtake-icon {
                    font-size: 18px;
                }

                .overtake-text {
                    font-size: 12px;
                }
            }

            @media (max-width: 350px) {
                .overtake-notifications-container {
                    top: 54px;
                    right: 6px;
                    max-width: 200px;
                }

                .overtake-notification {
                    padding: 6px 10px;
                }

                .overtake-icon {
                    font-size: 16px;
                }

                .overtake-text {
                    font-size: 11px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Show overtake notification
     * @param {string} username - Username that was overtaken
     * @param {number} rank - New rank position
     */
    show(username, rank) {
        console.log(`[OvertakeNotification] Showing: Tu aplenkei ${username}! (Rank: ${rank})`);

        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'overtake-notification';

        notification.innerHTML = `
            <div class="overtake-icon">🏆</div>
            <div class="overtake-text">
                Tu aplenkei <span class="overtake-username">${this.escapeHtml(username)}</span>!
            </div>
        `;

        this.container.appendChild(notification);
        this.activeNotifications.push(notification);

        // Auto-remove after shorter duration (less intrusive)
        setTimeout(() => {
            this.removeNotification(notification);
        }, 2000);
    }

    /**
     * Remove a notification
     * @param {HTMLElement} notification - Notification to remove
     */
    removeNotification(notification) {
        notification.classList.add('removing');

        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
            const index = this.activeNotifications.indexOf(notification);
            if (index > -1) {
                this.activeNotifications.splice(index, 1);
            }
        }, 400);
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Clear all active notifications
     */
    clearAll() {
        for (const notification of this.activeNotifications) {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
        }
        this.activeNotifications = [];
    }

    /**
     * Add to stage (attach to DOM)
     * @param {PIXI.Container} stage - Not used, kept for compatibility
     */
    addToStage(stage) {
        if (!this.container.parentElement) {
            const gameContainer = document.getElementById('gameContainer');
            if (gameContainer) {
                gameContainer.appendChild(this.container);
                console.log('[OvertakeNotification] Added to gameContainer');
            } else {
                document.body.appendChild(this.container);
                console.log('[OvertakeNotification] Added to body (fallback)');
            }
        }
    }

    /**
     * Remove from stage (detach from DOM)
     */
    removeFromStage() {
        this.clearAll();
        if (this.container && this.container.parentElement) {
            this.container.parentElement.removeChild(this.container);
        }
    }

    /**
     * Clean up and destroy
     */
    destroy() {
        this.clearAll();
        if (this.container && this.container.parentElement) {
            this.container.parentElement.removeChild(this.container);
        }
        this.container = null;
    }
}
