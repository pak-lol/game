import { Game } from './Game.js';
import { TelegramService } from './services/TelegramService.js';
import { wsService } from './services/WebSocketService.js';

// Initialize Telegram first
const telegramService = new TelegramService();
telegramService.init();

// Connect to WebSocket server
wsService.connect().catch(err => {
    console.warn('WebSocket connection failed, will use localStorage fallback:', err);
});

// Create game instance
const game = new Game();

// Pre-fill username from Telegram if available
function prefillUsername() {
    const username = telegramService.getUserDisplayName();
    if (username) {
        const input = document.getElementById('usernameInput');
        if (input) {
            input.value = username;
            console.log('Pre-filled username from Telegram:', username);
        }
    }
}

window.onload = async () => {
    try {
        console.log('Initializing game...');
        console.log('Running in Telegram:', telegramService.isRunningInTelegram());
        console.log('Platform:', telegramService.getPlatform());
        console.log('Is Mobile:', telegramService.isMobile());

        // Lock orientation to portrait
        if (screen.orientation && screen.orientation.lock) {
            try {
                await screen.orientation.lock('portrait').catch(err => {
                    console.log('Orientation lock not supported:', err.message);
                });
            } catch (err) {
                console.log('Could not lock orientation:', err.message);
            }
        }

        // Get viewport info
        const viewport = telegramService.getViewportDimensions();
        console.log('Viewport dimensions:', viewport);

        // Pre-fill username if in Telegram
        prefillUsername();

        // Initialize game
        await game.init();

        // Set Telegram service in game
        game.setTelegramService(telegramService);

        console.log('Game initialized successfully!');
    } catch (error) {
        console.error('Failed to initialize game:', error);

        // Show error to user
        const startScreen = document.getElementById('startScreen');
        if (startScreen) {
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = 'color: #FF6B6B; background: rgba(0,0,0,0.8); padding: 20px; border-radius: 10px; margin-top: 20px; max-width: 500px;';
            errorDiv.innerHTML = `
                <h3 style="margin-bottom: 10px;">Klaida kraunant žaidimą</h3>
                <p style="font-size: 14px;">${error.message}</p>
                <button onclick="location.reload()" style="margin-top: 15px; padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Perkrauti puslapį
                </button>
            `;
            startScreen.querySelector('.start-content').appendChild(errorDiv);
        }
    }
};

// Handle Telegram viewport changes
window.addEventListener('telegramViewportChanged', () => {
    console.log('Handling Telegram viewport change in main.js');
    // The game will handle the resize through its resize handler
});
