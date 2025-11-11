import * as PIXI from 'pixi.js';
import { GAME_CONFIG, DIFFICULTY_CONFIG, updateGameDimensions } from './config.js';
import { AssetLoader } from './utils/AssetLoader.js';
import { Player } from './entities/Player.js';
import { FallingItem } from './entities/FallingItem.js';
import { CollisionSystem } from './systems/CollisionSystem.js';
import { ParticleSystem } from './systems/ParticleSystem.js';
import { ScoreDisplay } from './ui/ScoreDisplay.js';
import { i18n } from './utils/i18n.js';

export class Game {
    constructor() {
        this.app = null;
        this.assetLoader = new AssetLoader();
        this.player = null;
        this.scoreDisplay = null;
        this.collisionSystem = new CollisionSystem();
        this.particleSystem = null;
        
        this.gameStarted = false;
        this.fallingItems = [];
        this.spawnTimer = 0;
        this.gameLoopBound = null;
        this.currentSpeedMultiplier = 1.0;
        this.currentSpawnInterval = GAME_CONFIG.spawnInterval;
        this.username = '';
    }

    async init() {
        // Load translations
        await i18n.load(GAME_CONFIG.defaultLocale);
        
        // Update UI with translations
        this.updateUITranslations();
        
        // Initialize PixiJS app with responsive settings
        this.app = new PIXI.Application();
        await this.app.init({
            width: GAME_CONFIG.width,
            height: GAME_CONFIG.height,
            backgroundColor: GAME_CONFIG.backgroundColor,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });
        
        document.getElementById('gameContainer').appendChild(this.app.canvas);
        
        // Load assets
        await this.assetLoader.loadAll();
        
        // Initialize systems
        this.particleSystem = new ParticleSystem(this.app);
        
        // Setup resize handler
        this.setupResizeHandler();
        
        // Setup start button
        document.getElementById('startButton').addEventListener('click', () => this.handleStartClick());
        
        // Allow Enter key to start game
        document.getElementById('usernameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleStartClick();
            }
        });
    }

    handleStartClick() {
        const usernameInput = document.getElementById('usernameInput');
        const username = usernameInput.value.trim();
        
        if (!username) {
            // Show error
            usernameInput.style.borderColor = '#FF6B6B';
            usernameInput.placeholder = i18n.t('game.usernameRequired');
            setTimeout(() => {
                usernameInput.style.borderColor = 'rgba(76, 175, 80, 0.5)';
                usernameInput.placeholder = i18n.t('game.usernamePlaceholder');
            }, 2000);
            return;
        }
        
        this.username = username;
        console.log('Starting game for player:', this.username);
        this.start();
    }

    setupResizeHandler() {
        const resize = () => {
            const oldWidth = GAME_CONFIG.width;
            const oldHeight = GAME_CONFIG.height;
            
            updateGameDimensions();
            this.app.renderer.resize(GAME_CONFIG.width, GAME_CONFIG.height);

            // Update background if it exists
            if (this.background) {
                this.background.clear();
                this.background.rect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
                this.background.fill(GAME_CONFIG.backgroundColor);
            }

            // Update player position if it exists
            if (this.player) {
                this.player.updateBounds();
            }
            
            // Update score display position if it exists
            if (this.scoreDisplay && this.scoreDisplay.text) {
                // Keep score in top-left corner
                this.scoreDisplay.text.x = 20;
                this.scoreDisplay.text.y = 20;
            }
            
            // Update falling items positions proportionally
            if (this.fallingItems.length > 0) {
                const scaleX = GAME_CONFIG.width / oldWidth;
                for (const item of this.fallingItems) {
                    if (item.container) {
                        item.container.x *= scaleX;
                    }
                }
            }
        };

        window.addEventListener('resize', resize);
        window.addEventListener('orientationchange', () => {
            setTimeout(resize, 100);
        });
    }

    updateUITranslations() {
        document.getElementById('gameTitle').textContent = i18n.t('game.title');
        document.getElementById('startButton').textContent = i18n.t('game.start');
        document.getElementById('usernameInput').placeholder = i18n.t('game.usernamePlaceholder');
    }

    start() {
        document.getElementById('startScreen').classList.add('hidden');
        this.gameStarted = true;
        
        this.createBackground();
        this.createPlayer();
        this.createScoreDisplay();
        
        // Remove old game loop if it exists
        if (this.gameLoopBound) {
            this.app.ticker.remove(this.gameLoopBound);
        }
        
        // Create and add new game loop
        this.gameLoopBound = (delta) => this.update(delta);
        this.app.ticker.add(this.gameLoopBound);
    }

    createBackground() {
        // Create solid color background
        const bg = new PIXI.Graphics();
        bg.rect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
        bg.fill(GAME_CONFIG.backgroundColor);
        this.background = bg;
        this.app.stage.addChild(this.background);
        
        // Add some stars for decoration
        for (let i = 0; i < 50; i++) {
            const star = new PIXI.Graphics();
            star.circle(0, 0, Math.random() * 2 + 0.5);
            star.fill({ color: 0xFFFFFF, alpha: Math.random() * 0.5 + 0.2 });
            star.x = Math.random() * GAME_CONFIG.width;
            star.y = Math.random() * GAME_CONFIG.height;
            this.background.addChild(star);
        }
    }

    createPlayer() {
        this.player = new Player(this.assetLoader.getTexture('basket'));
        this.player.addToStage(this.app.stage);
        this.player.setupControls(this.app.canvas);
    }

    createScoreDisplay() {
        this.scoreDisplay = new ScoreDisplay();
        this.scoreDisplay.addToStage(this.app.stage);
    }

    spawnFallingItem() {
        // Randomly choose between the two types
        const types = Object.values(GAME_CONFIG.itemTypes);
        const randomType = types[Math.floor(Math.random() * types.length)];
        
        // Use different texture based on type
        const texture =
            randomType === GAME_CONFIG.itemTypes.CHIMKE
                ? this.assetLoader.getTexture('weedLeafBrown')
                : this.assetLoader.getTexture('weedLeaf');
        
        // Get translated label
        const label =
            randomType === GAME_CONFIG.itemTypes.CHIMKE
                ? i18n.t('items.chimke')
                : i18n.t('items.vorinioDumai');
        
        const item = new FallingItem(texture, randomType, label, this.currentSpeedMultiplier);
        
        item.addToStage(this.app.stage);
        this.fallingItems.push(item);
    }

    update(delta) {
        if (!this.gameStarted || !this.scoreDisplay || !this.player) return;
        
        // Spawn falling items
        this.spawnTimer += delta.deltaTime;
        if (this.spawnTimer > this.currentSpawnInterval) {
            this.spawnFallingItem();
            this.spawnTimer = 0;
        }
        
        // Update falling items
        for (let i = this.fallingItems.length - 1; i >= 0; i--) {
            const item = this.fallingItems[i];
            if (!item || !item.update) continue;
            
            item.update(delta.deltaTime);
            
            // Check collision with player
            if (this.collisionSystem.checkCollision(item, this.player)) {
                this.handleItemCatch(item, i);
                continue;
            }
            
            // Remove if off screen
            if (item.isOffScreen()) {
                item.removeFromStage(this.app.stage);
                this.fallingItems.splice(i, 1);
            }
        }
    }

    handleItemCatch(item, index) {
        if (!item || !this.scoreDisplay) return;
        
        const position = item.getPosition();
        
        // Only increment score for "vorinio dumai"
        if (item.isScoreable()) {
            this.scoreDisplay.increment();
            this.particleSystem.createCatchEffect(position.x, position.y, '#4CAF50');
            
            // Increase difficulty
            this.increaseDifficulty();
        } else {
            // Game over for catching "chimke"
            this.particleSystem.createCatchEffect(position.x, position.y, '#FF6B6B');
            this.gameOver();
        }
        
        item.removeFromStage(this.app.stage);
        this.fallingItems.splice(index, 1);
    }

    increaseDifficulty() {
        // Increase speed multiplier
        const speedIncrease = DIFFICULTY_CONFIG.speedIncreasePerScore;
        this.currentSpeedMultiplier = Math.min(
            this.currentSpeedMultiplier + speedIncrease,
            DIFFICULTY_CONFIG.maxSpeedMultiplier
        );
        
        // Decrease spawn interval (spawn faster)
        this.currentSpawnInterval = Math.max(
            this.currentSpawnInterval - DIFFICULTY_CONFIG.spawnRateIncrease,
            DIFFICULTY_CONFIG.minSpawnInterval
        );
        
        console.log(`Difficulty increased! Speed: ${this.currentSpeedMultiplier.toFixed(2)}x, Spawn interval: ${this.currentSpawnInterval}`);
    }

    gameOver() {
        this.gameStarted = false;
        
        // Remove game loop ticker
        if (this.gameLoopBound) {
            this.app.ticker.remove(this.gameLoopBound);
        }
        
        // Stop all falling items
        for (const item of this.fallingItems) {
            item.removeFromStage(this.app.stage);
        }
        this.fallingItems = [];
        
        // Save score to leaderboard (for future implementation)
        this.saveScore();
        
        // Show game over screen
        this.showGameOverScreen();
    }

    saveScore() {
        const scoreData = {
            username: this.username,
            score: this.scoreDisplay.score,
            timestamp: new Date().toISOString()
        };
        
        console.log('Saving score:', scoreData);
        
        // Get existing leaderboard from localStorage
        let leaderboard = [];
        try {
            const stored = localStorage.getItem('weedCatcherLeaderboard');
            if (stored) {
                leaderboard = JSON.parse(stored);
            }
        } catch (e) {
            console.error('Error loading leaderboard:', e);
        }
        
        // Add new score
        leaderboard.push(scoreData);
        
        // Sort by score (highest first) and keep top 100
        leaderboard.sort((a, b) => b.score - a.score);
        leaderboard = leaderboard.slice(0, 100);
        
        // Save back to localStorage
        try {
            localStorage.setItem('weedCatcherLeaderboard', JSON.stringify(leaderboard));
            console.log('Score saved successfully!');
        } catch (e) {
            console.error('Error saving score:', e);
        }
    }

    showGameOverScreen() {
        const gameOverContainer = new PIXI.Container();
        
        // Animated gradient background
        const overlay = new PIXI.Graphics();
        overlay.rect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
        overlay.fill({ color: 0x000000, alpha: 0.9 });
        gameOverContainer.addChild(overlay);
        
        // Responsive font sizes
        const titleSize = Math.max(40, Math.min(72, GAME_CONFIG.width / 10));
        const nameSize = Math.max(28, Math.min(42, GAME_CONFIG.width / 18));
        const scoreSize = Math.max(32, Math.min(56, GAME_CONFIG.width / 14));
        const warningSize = Math.max(14, Math.min(20, GAME_CONFIG.width / 35));
        const restartSize = Math.max(22, Math.min(32, GAME_CONFIG.width / 22));
        
        const centerX = GAME_CONFIG.width / 2;
        const centerY = GAME_CONFIG.height / 2;
        
        // Decorative panel background
        const panel = new PIXI.Graphics();
        const panelWidth = Math.min(500, GAME_CONFIG.width - 40);
        const panelHeight = Math.min(450, GAME_CONFIG.height - 100);
        panel.roundRect(
            centerX - panelWidth / 2,
            centerY - panelHeight / 2,
            panelWidth,
            panelHeight,
            20
        );
        panel.fill({ color: 0x1a1a2e, alpha: 0.95 });
        panel.stroke({ color: 0xFF6B6B, width: 4 });
        gameOverContainer.addChild(panel);
        
        // Skull/sad emoji decoration
        const emojiText = new PIXI.Text({
            text: '💀',
            style: {
                fontSize: Math.max(40, Math.min(60, GAME_CONFIG.width / 12))
            }
        });
        emojiText.anchor.set(0.5);
        emojiText.x = centerX;
        emojiText.y = centerY - panelHeight / 2 + 50;
        gameOverContainer.addChild(emojiText);
        
        // Game Over text with glow
        const gameOverText = new PIXI.Text({
            text: i18n.t('game.gameOver'),
            style: {
                fontFamily: 'Arial',
                fontSize: titleSize,
                fill: '#FF6B6B',
                fontWeight: 'bold',
                stroke: '#8B0000',
                strokeThickness: 6,
                dropShadow: true,
                dropShadowColor: '#FF0000',
                dropShadowBlur: 15,
                dropShadowDistance: 0
            }
        });
        gameOverText.anchor.set(0.5);
        gameOverText.x = centerX;
        gameOverText.y = centerY - panelHeight / 2 + 120;
        gameOverContainer.addChild(gameOverText);
        
        // Divider line
        const divider1 = new PIXI.Graphics();
        divider1.rect(centerX - panelWidth / 3, centerY - 80, panelWidth / 1.5, 2);
        divider1.fill({ color: 0x4CAF50, alpha: 0.5 });
        gameOverContainer.addChild(divider1);
        
        // Player name with icon
        const playerContainer = new PIXI.Container();
        const playerIcon = new PIXI.Text({
            text: '👤',
            style: { fontSize: nameSize }
        });
        playerIcon.anchor.set(0.5);
        playerIcon.x = -nameSize;
        playerIcon.y = 0;
        
        const playerNameText = new PIXI.Text({
            text: this.username,
            style: {
                fontFamily: 'Arial',
                fontSize: nameSize,
                fill: '#FFD700',
                fontWeight: 'bold',
                stroke: '#8B6914',
                strokeThickness: 4,
                dropShadow: true,
                dropShadowColor: '#000000',
                dropShadowBlur: 4,
                dropShadowDistance: 2
            }
        });
        playerNameText.anchor.set(0.5);
        
        playerContainer.addChild(playerIcon);
        playerContainer.addChild(playerNameText);
        playerContainer.x = centerX;
        playerContainer.y = centerY - 30;
        gameOverContainer.addChild(playerContainer);
        
        // Score display with trophy
        const scoreContainer = new PIXI.Container();
        const trophy = new PIXI.Text({
            text: '🏆',
            style: { fontSize: scoreSize * 0.8 }
        });
        trophy.anchor.set(0.5);
        trophy.x = -scoreSize * 1.5;
        trophy.y = 0;
        
        const finalScoreText = new PIXI.Text({
            text: this.scoreDisplay.score.toString(),
            style: {
                fontFamily: 'Arial',
                fontSize: scoreSize,
                fill: '#4CAF50',
                fontWeight: 'bold',
                stroke: '#1B5E20',
                strokeThickness: 5,
                dropShadow: true,
                dropShadowColor: '#000000',
                dropShadowBlur: 6,
                dropShadowDistance: 3
            }
        });
        finalScoreText.anchor.set(0.5);
        
        const pointsLabel = new PIXI.Text({
            text: i18n.t('game.score'),
            style: {
                fontFamily: 'Arial',
                fontSize: scoreSize * 0.4,
                fill: '#FFFFFF',
                fontWeight: 'normal'
            }
        });
        pointsLabel.anchor.set(0.5);
        pointsLabel.x = scoreSize * 1.5;
        pointsLabel.y = 0;
        
        scoreContainer.addChild(trophy);
        scoreContainer.addChild(finalScoreText);
        scoreContainer.addChild(pointsLabel);
        scoreContainer.x = centerX;
        scoreContainer.y = centerY + 40;
        gameOverContainer.addChild(scoreContainer);
        
        // Divider line 2
        const divider2 = new PIXI.Graphics();
        divider2.rect(centerX - panelWidth / 3, centerY + 90, panelWidth / 1.5, 2);
        divider2.fill({ color: 0xFF6B6B, alpha: 0.5 });
        gameOverContainer.addChild(divider2);
        
        // Warning text with icon
        const warningContainer = new PIXI.Container();
        const warningIcon = new PIXI.Text({
            text: '⚠️',
            style: { fontSize: warningSize * 1.5 }
        });
        warningIcon.anchor.set(0.5);
        warningIcon.y = -warningSize;
        
        const warningText = new PIXI.Text({
            text: i18n.t('game.warning'),
            style: {
                fontFamily: 'Arial',
                fontSize: warningSize,
                fill: '#FFD700',
                fontWeight: 'bold',
                align: 'center',
                stroke: '#8B6914',
                strokeThickness: 3,
                wordWrap: true,
                wordWrapWidth: panelWidth - 60
            }
        });
        warningText.anchor.set(0.5);
        warningText.y = warningSize / 2;
        
        warningContainer.addChild(warningIcon);
        warningContainer.addChild(warningText);
        warningContainer.x = centerX;
        warningContainer.y = centerY + 130;
        gameOverContainer.addChild(warningContainer);
        
        // Restart button with background
        const restartButton = new PIXI.Graphics();
        const buttonWidth = Math.min(300, panelWidth - 100);
        const buttonHeight = 60;
        restartButton.roundRect(
            centerX - buttonWidth / 2,
            centerY + panelHeight / 2 - 80,
            buttonWidth,
            buttonHeight,
            15
        );
        restartButton.fill({ color: 0x4CAF50 });
        restartButton.stroke({ color: 0x66BB6A, width: 3 });
        gameOverContainer.addChild(restartButton);
        
        const restartText = new PIXI.Text({
            text: '🔄 ' + i18n.t('game.restart'),
            style: {
                fontFamily: 'Arial',
                fontSize: restartSize,
                fill: '#FFFFFF',
                fontWeight: 'bold',
                stroke: '#1B5E20',
                strokeThickness: 3
            }
        });
        restartText.anchor.set(0.5);
        restartText.x = centerX;
        restartText.y = centerY + panelHeight / 2 - 50;
        gameOverContainer.addChild(restartText);
        
        this.app.stage.addChild(gameOverContainer);
        
        // Make button interactive with hover effect
        restartButton.eventMode = 'static';
        restartButton.cursor = 'pointer';
        
        restartButton.on('pointerover', () => {
            restartButton.clear();
            restartButton.roundRect(
                centerX - buttonWidth / 2,
                centerY + panelHeight / 2 - 80,
                buttonWidth,
                buttonHeight,
                15
            );
            restartButton.fill({ color: 0x66BB6A });
            restartButton.stroke({ color: 0x81C784, width: 3 });
        });
        
        restartButton.on('pointerout', () => {
            restartButton.clear();
            restartButton.roundRect(
                centerX - buttonWidth / 2,
                centerY + panelHeight / 2 - 80,
                buttonWidth,
                buttonHeight,
                15
            );
            restartButton.fill({ color: 0x4CAF50 });
            restartButton.stroke({ color: 0x66BB6A, width: 3 });
        });
        
        restartButton.on('pointerdown', () => {
            this.app.stage.removeChild(gameOverContainer);
            this.restart();
        });
        
        // Add pulsing animation to game over text
        let pulseDirection = 1;
        const pulseAnimation = () => {
            if (!gameOverText.parent) return;
            
            gameOverText.scale.x += 0.002 * pulseDirection;
            gameOverText.scale.y += 0.002 * pulseDirection;
            
            if (gameOverText.scale.x > 1.1) pulseDirection = -1;
            if (gameOverText.scale.x < 0.95) pulseDirection = 1;
        };
        
        this.app.ticker.add(pulseAnimation);
    }

    restart() {
        // Clear stage completely
        this.app.stage.removeChildren();
        
        // Reset all game state
        this.fallingItems = [];
        this.spawnTimer = 0;
        this.gameStarted = false;
        this.background = null;
        this.player = null;
        
        // Reset difficulty
        this.currentSpeedMultiplier = 1.0;
        this.currentSpawnInterval = GAME_CONFIG.spawnInterval;
        
        // Create new score display
        this.scoreDisplay = new ScoreDisplay();
        
        // Restart game
        this.start();
    }
}
