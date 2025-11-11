/**
 * Service for Telegram Web App integration
 */
export class TelegramService {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.isInTelegram = !!this.tg;
    }

    /**
     * Initialize Telegram Web App
     */
    init() {
        if (!this.isInTelegram) {
            console.log('Not running in Telegram Web App');
            return;
        }

        console.log('Initializing Telegram Web App...');

        // Tell Telegram the app is ready
        this.tg.ready();

        // Expand to full height
        this.tg.expand();

        // Enable closing confirmation
        this.tg.enableClosingConfirmation();

        // Set header color
        this.tg.setHeaderColor('#0F2027');
        this.tg.setBackgroundColor('#0F2027');

        // Disable vertical swipes
        this.tg.disableVerticalSwipes();

        // Log Telegram info
        console.log('Telegram Web App initialized:', {
            version: this.tg.version,
            platform: this.tg.platform,
            colorScheme: this.tg.colorScheme,
            viewportHeight: this.tg.viewportHeight,
            viewportStableHeight: this.tg.viewportStableHeight,
            isExpanded: this.tg.isExpanded,
            safeAreaInset: this.tg.safeAreaInset
        });

        // Set CSS variables for viewport
        this.updateViewportVariables();

        // Listen for viewport changes
        this.tg.onEvent('viewportChanged', () => {
            console.log('Telegram viewport changed');
            this.updateViewportVariables();

            // Dispatch custom event for the game to handle
            window.dispatchEvent(new Event('telegramViewportChanged'));
        });

        // Listen for theme changes
        this.tg.onEvent('themeChanged', () => {
            console.log('Telegram theme changed');
            this.tg.setHeaderColor('#0F2027');
            this.tg.setBackgroundColor('#0F2027');
        });
    }

    /**
     * Update CSS variables with Telegram viewport dimensions
     */
    updateViewportVariables() {
        if (!this.isInTelegram) return;

        const root = document.documentElement;

        // Set viewport height variables
        if (this.tg.viewportHeight) {
            root.style.setProperty('--tg-viewport-height', `${this.tg.viewportHeight}px`);
        }

        if (this.tg.viewportStableHeight) {
            root.style.setProperty('--tg-viewport-stable-height', `${this.tg.viewportStableHeight}px`);
        }

        // Set safe area insets
        if (this.tg.safeAreaInset) {
            root.style.setProperty('--tg-safe-area-inset-top', `${this.tg.safeAreaInset.top}px`);
            root.style.setProperty('--tg-safe-area-inset-bottom', `${this.tg.safeAreaInset.bottom}px`);
            root.style.setProperty('--tg-safe-area-inset-left', `${this.tg.safeAreaInset.left}px`);
            root.style.setProperty('--tg-safe-area-inset-right', `${this.tg.safeAreaInset.right}px`);
        }
    }

    /**
     * Get current user from Telegram
     * @returns {Object|null} User object or null
     */
    getUser() {
        if (!this.isInTelegram) return null;
        return this.tg.initDataUnsafe?.user || null;
    }

    /**
     * Get user's display name
     * @returns {string} User's name or empty string
     */
    getUserDisplayName() {
        const user = this.getUser();
        if (!user) return '';

        return user.username ||
               user.first_name ||
               `User${user.id}` ||
               '';
    }

    /**
     * Show a confirmation dialog
     * @param {string} message - Message to show
     * @returns {Promise<boolean>} User's choice
     */
    showConfirm(message) {
        if (!this.isInTelegram) {
            return Promise.resolve(window.confirm(message));
        }

        return new Promise((resolve) => {
            this.tg.showConfirm(message, resolve);
        });
    }

    /**
     * Show an alert
     * @param {string} message - Message to show
     * @returns {Promise<void>}
     */
    showAlert(message) {
        if (!this.isInTelegram) {
            alert(message);
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            this.tg.showAlert(message, resolve);
        });
    }

    /**
     * Provide haptic feedback
     * @param {string} type - 'light', 'medium', 'heavy', 'rigid', 'soft'
     */
    hapticFeedback(type = 'medium') {
        if (!this.isInTelegram || !this.tg.HapticFeedback) return;

        try {
            switch (type) {
                case 'light':
                case 'medium':
                case 'heavy':
                case 'rigid':
                case 'soft':
                    this.tg.HapticFeedback.impactOccurred(type);
                    break;
                case 'success':
                case 'warning':
                case 'error':
                    this.tg.HapticFeedback.notificationOccurred(type);
                    break;
                default:
                    this.tg.HapticFeedback.impactOccurred('medium');
            }
        } catch (error) {
            console.warn('Haptic feedback failed:', error);
        }
    }

    /**
     * Close the Web App
     */
    close() {
        if (!this.isInTelegram) {
            window.close();
            return;
        }

        this.tg.close();
    }

    /**
     * Get viewport dimensions
     * @returns {Object} Viewport dimensions
     */
    getViewportDimensions() {
        if (this.isInTelegram && this.tg.viewportHeight) {
            return {
                width: window.innerWidth,
                height: this.tg.viewportStableHeight || this.tg.viewportHeight,
                stableHeight: this.tg.viewportStableHeight,
                isExpanded: this.tg.isExpanded
            };
        }

        return {
            width: window.innerWidth,
            height: window.innerHeight,
            stableHeight: window.innerHeight,
            isExpanded: true
        };
    }

    /**
     * Check if running in Telegram
     * @returns {boolean}
     */
    isRunningInTelegram() {
        return this.isInTelegram;
    }

    /**
     * Get platform info
     * @returns {string} Platform name
     */
    getPlatform() {
        if (!this.isInTelegram) return 'web';
        return this.tg.platform || 'unknown';
    }

    /**
     * Check if platform is mobile
     * @returns {boolean}
     */
    isMobile() {
        const platform = this.getPlatform();
        return ['android', 'ios'].includes(platform) ||
               /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    }
}
