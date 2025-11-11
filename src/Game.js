import * as PIXI from 'pixi.js';
import { GAME_CONFIG, updateGameDimensions } from './config.js';
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
        document.getElementById('startButton').addEventListener('click', () => this.start());
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
        
        const item = new FallingItem(texture, randomType, label);
        
        item.addToStage(this.app.stage);
        this.fallingItems.push(item);
    }

    update(delta) {
        if (!this.gameStarted) return;
        
        // Spawn falling items
        this.spawnTimer += delta.deltaTime;
        if (this.spawnTimer > GAME_CONFIG.spawnInterval) {
            this.spawnFallingItem();
            this.spawnTimer = 0;
        }
        
        // Update falling items
        for (let i = this.fallingItems.length - 1; i >= 0; i--) {
            const item = this.fallingItems[i];
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
        const position = item.getPosition();
        
        // Only increment score for "vorinio dumai"
        if (item.isScoreable()) {
            this.scoreDisplay.increment();
            this.particleSystem.createCatchEffect(position.x, position.y, '#4CAF50');
        } else {
            // Game over for catching "chimke"
            this.particleSystem.createCatchEffect(position.x, position.y, '#FF6B6B');
            this.gameOver();
        }
        
        item.removeFromStage(this.app.stage);
        this.fallingItems.splice(index, 1);
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
        
        // Show game over screen
        this.showGameOverScreen();
    }

    showGameOverScreen() {
        const gameOverContainer = new PIXI.Container();
        
        // Semi-transparent background
        const overlay = new PIXI.Graphics();
        overlay.rect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
        overlay.fill({ color: 0x000000, alpha: 0.85 });
        gameOverContainer.addChild(overlay);
        
        // Responsive font sizes
        const titleSize = Math.max(32, Math.min(64, GAME_CONFIG.width / 12));
        const scoreSize = Math.max(24, Math.min(36, GAME_CONFIG.width / 20));
        const warningSize = Math.max(16, Math.min(24, GAME_CONFIG.width / 30));
        const restartSize = Math.max(20, Math.min(28, GAME_CONFIG.width / 25));
        
        // Game Over text
        const gameOverText = new PIXI.Text({
            text: i18n.t('game.gameOver'),
            style: {
                fontFamily: 'Arial',
                fontSize: titleSize,
                fill: '#FF6B6B',
                fontWeight: 'bold',
                stroke: '#000000',
                strokeThickness: 6,
                dropShadow: true,
                dropShadowColor: '#000000',
                dropShadowBlur: 8,
                dropShadowDistance: 4
            }
        });
        gameOverText.anchor.set(0.5);
        gameOverText.x = GAME_CONFIG.width / 2;
        gameOverText.y = GAME_CONFIG.height / 2 - 80;
        gameOverContainer.addChild(gameOverText);
        
        // Score text
        const finalScoreText = new PIXI.Text({
            text: `${i18n.t('game.finalScore')}: ${this.scoreDisplay.score}`,
            style: {
                fontFamily: 'Arial',
                fontSize: scoreSize,
                fill: '#FFFFFF',
                fontWeight: 'bold',
                stroke: '#000000',
                strokeThickness: 4
            }
        });
        finalScoreText.anchor.set(0.5);
        finalScoreText.x = GAME_CONFIG.width / 2;
        finalScoreText.y = GAME_CONFIG.height / 2;
        gameOverContainer.addChild(finalScoreText);
        
        // Warning text
        const warningText = new PIXI.Text({
            text: i18n.t('game.warning'),
            style: {
                fontFamily: 'Arial',
                fontSize: warningSize,
                fill: '#FFD700',
                fontWeight: 'bold',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 3
            }
        });
        warningText.anchor.set(0.5);
        warningText.x = GAME_CONFIG.width / 2;
        warningText.y = GAME_CONFIG.height / 2 + 60;
        gameOverContainer.addChild(warningText);
        
        // Restart button text
        const restartText = new PIXI.Text({
            text: i18n.t('game.restart'),
            style: {
                fontFamily: 'Arial',
                fontSize: restartSize,
                fill: '#4CAF50',
                fontWeight: 'bold',
                stroke: '#000000',
                strokeThickness: 3
            }
        });
        restartText.anchor.set(0.5);
        restartText.x = GAME_CONFIG.width / 2;
        restartText.y = GAME_CONFIG.height / 2 + 130;
        gameOverContainer.addChild(restartText);
        
        this.app.stage.addChild(gameOverContainer);
        
        // Make it interactive
        gameOverContainer.eventMode = 'static';
        gameOverContainer.cursor = 'pointer';
        gameOverContainer.on('pointerdown', () => {
            this.app.stage.removeChild(gameOverContainer);
            this.restart();
        });
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
        
        // Create new score display
        this.scoreDisplay = new ScoreDisplay();
        
        // Restart game
        this.start();
    }
}
