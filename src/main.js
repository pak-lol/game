import { Game } from './Game.js';

const game = new Game();

window.onload = async () => {
    try {
        console.log('Initializing game...');
        await game.init();
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
