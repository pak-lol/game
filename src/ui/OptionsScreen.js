import * as PIXI from 'pixi.js';
import { GAME_CONFIG } from '../config.js';
import { i18n } from '../utils/i18n.js';

/**
 * Modern Options/Settings Screen
 */
export class OptionsScreen {
    constructor(onBack) {
        this.container = new PIXI.Container();
        this.onBack = onBack;

        // Load settings from localStorage
        this.settings = this.loadSettings();

        this.create();
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('game_settings');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }

        // Default settings
        return {
            soundEnabled: true,
            musicEnabled: true
        };
    }

    saveSettings() {
        try {
            localStorage.setItem('game_settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    create() {
        const screenWidth = GAME_CONFIG.width;
        const screenHeight = GAME_CONFIG.height;

        // Background
        const bg = new PIXI.Graphics();
        bg.rect(0, 0, screenWidth, screenHeight);
        bg.fill({ color: 0x0F2027 });
        this.container.addChild(bg);

        // Gradient overlay
        const gradientOverlay = new PIXI.Graphics();
        gradientOverlay.rect(0, 0, screenWidth, screenHeight);
        gradientOverlay.fill({ color: 0x000000, alpha: 0.4 });
        this.container.addChild(gradientOverlay);

        // Title with glow
        const title = new PIXI.Text({
            text: '⚙️ ' + i18n.t('menu.options'),
            style: {
                fontFamily: 'Arial',
                fontSize: Math.min(48, screenWidth * 0.1),
                fill: '#BA68C8',
                fontWeight: 'bold',
                stroke: { color: '#6A1B9A', width: 5 },
                dropShadow: {
                    color: '#BA68C8',
                    blur: 20,
                    distance: 0,
                    alpha: 0.5
                }
            }
        });
        title.anchor.set(0.5, 0);
        title.x = screenWidth / 2;
        title.y = 25;
        this.container.addChild(title);

        // Settings container
        const contentWidth = Math.min(380, screenWidth - 40);
        let currentY = 120;

        // Sound toggle
        this.soundToggle = this.createModernToggle(
            '🔊',
            i18n.t('options.sound'),
            this.settings.soundEnabled,
            screenWidth / 2,
            currentY,
            contentWidth,
            (enabled) => {
                this.settings.soundEnabled = enabled;
                this.saveSettings();
            }
        );
        this.container.addChild(this.soundToggle);
        currentY += 100;

        // Music toggle
        this.musicToggle = this.createModernToggle(
            '🎵',
            i18n.t('options.music'),
            this.settings.musicEnabled,
            screenWidth / 2,
            currentY,
            contentWidth,
            (enabled) => {
                this.settings.musicEnabled = enabled;
                this.saveSettings();
            }
        );
        this.container.addChild(this.musicToggle);
        currentY += 120;

        // Coming soon card
        const comingSoonCard = this.createComingSoonCard(screenWidth / 2, currentY, contentWidth);
        this.container.addChild(comingSoonCard);

        // Back button
        this.createModernBackButton(screenWidth, screenHeight);
    }

    createModernToggle(icon, label, initialState, x, y, width, onChange) {
        const container = new PIXI.Container();
        container.x = x;
        container.y = y;

        const height = 80;

        // Card background
        const card = new PIXI.Graphics();
        card.roundRect(-width/2, 0, width, height, 15);
        card.fill({ color: 0x1a1a1a, alpha: 0.9 });
        card.roundRect(-width/2, 0, width, height, 15);
        card.stroke({ color: 0xBA68C8, width: 2, alpha: 0.5 });
        container.addChild(card);

        // Icon
        const iconText = new PIXI.Text({
            text: icon,
            style: {
                fontSize: 32
            }
        });
        iconText.anchor.set(0, 0.5);
        iconText.x = -width/2 + 20;
        iconText.y = height/2;
        container.addChild(iconText);

        // Label
        const labelText = new PIXI.Text({
            text: label,
            style: {
                fontFamily: 'Arial',
                fontSize: 22,
                fill: '#FFFFFF',
                fontWeight: 'bold'
            }
        });
        labelText.anchor.set(0, 0.5);
        labelText.x = -width/2 + 65;
        labelText.y = height/2;
        container.addChild(labelText);

        // Modern toggle switch
        const toggleContainer = new PIXI.Container();
        const toggleWidth = 70;
        const toggleHeight = 36;
        toggleContainer.x = width/2 - 85;
        toggleContainer.y = height/2;

        const toggleBg = new PIXI.Graphics();
        const updateToggle = (enabled) => {
            toggleBg.clear();

            // Background track
            toggleBg.roundRect(0, -toggleHeight/2, toggleWidth, toggleHeight, toggleHeight/2);
            toggleBg.fill({ color: enabled ? 0x4CAF50 : 0x444444, alpha: 0.8 });

            // Border
            toggleBg.roundRect(0, -toggleHeight/2, toggleWidth, toggleHeight, toggleHeight/2);
            toggleBg.stroke({ color: enabled ? 0x66BB6A : 0x666666, width: 2 });

            // Switch circle
            const circleX = enabled ? toggleWidth - 20 : 20;
            toggleBg.circle(circleX, 0, 14);
            toggleBg.fill({ color: 0xFFFFFF });

            // Circle shadow
            toggleBg.circle(circleX, 1, 14);
            toggleBg.stroke({ color: 0x000000, width: 1, alpha: 0.2 });
        };

        updateToggle(initialState);
        toggleContainer.addChild(toggleBg);
        container.addChild(toggleContainer);

        // Status text
        const statusText = new PIXI.Text({
            text: initialState ? i18n.t('options.on') : i18n.t('options.off'),
            style: {
                fontFamily: 'Arial',
                fontSize: 16,
                fill: initialState ? '#4CAF50' : '#888888',
                fontWeight: 'bold'
            }
        });
        statusText.anchor.set(0, 0.5);
        statusText.x = width/2 - 10;
        statusText.y = height/2;
        container.addChild(statusText);

        // Make interactive
        let enabled = initialState;
        container.interactive = true;
        container.cursor = 'pointer';

        container.on('pointerdown', () => {
            container.scale.set(0.98);
        });

        container.on('pointerup', () => {
            container.scale.set(1);
            enabled = !enabled;
            updateToggle(enabled);
            statusText.text = enabled ? i18n.t('options.on') : i18n.t('options.off');
            statusText.style.fill = enabled ? '#4CAF50' : '#888888';
            if (onChange) onChange(enabled);
        });

        container.on('pointerupoutside', () => {
            container.scale.set(1);
        });

        return container;
    }

    createComingSoonCard(x, y, width) {
        const container = new PIXI.Container();
        container.x = x;
        container.y = y;

        const height = 100;

        // Card background
        const card = new PIXI.Graphics();
        card.roundRect(-width/2, 0, width, height, 15);
        card.fill({ color: 0x1a1a1a, alpha: 0.6 });
        card.roundRect(-width/2, 0, width, height, 15);
        card.stroke({ color: 0x444444, width: 2, alpha: 0.3 });
        container.addChild(card);

        // Icon
        const icon = new PIXI.Text({
            text: '🚧',
            style: {
                fontSize: 40
            }
        });
        icon.anchor.set(0.5);
        icon.x = 0;
        icon.y = 30;
        container.addChild(icon);

        // Text
        const text = new PIXI.Text({
            text: i18n.t('options.comingSoon'),
            style: {
                fontFamily: 'Arial',
                fontSize: 16,
                fill: '#888888',
                fontStyle: 'italic'
            }
        });
        text.anchor.set(0.5);
        text.x = 0;
        text.y = 70;
        container.addChild(text);

        return container;
    }

    createModernBackButton(screenWidth, screenHeight) {
        const buttonWidth = 160;
        const buttonHeight = 55;

        const button = new PIXI.Graphics();

        // Button shadow
        button.roundRect(screenWidth/2 - buttonWidth/2 + 2, screenHeight - 75 + 2, buttonWidth, buttonHeight, 12);
        button.fill({ color: 0x000000, alpha: 0.3 });

        // Button background
        button.roundRect(screenWidth/2 - buttonWidth/2, screenHeight - 75, buttonWidth, buttonHeight, 12);
        button.fill({ color: 0x9C27B0, alpha: 0.9 });

        // Button border
        button.roundRect(screenWidth/2 - buttonWidth/2, screenHeight - 75, buttonWidth, buttonHeight, 12);
        button.stroke({ color: 0xBA68C8, width: 3 });

        const buttonText = new PIXI.Text({
            text: '← ' + i18n.t('menu.back'),
            style: {
                fontFamily: 'Arial',
                fontSize: 22,
                fill: '#FFFFFF',
                fontWeight: 'bold',
                dropShadow: {
                    color: '#000000',
                    blur: 4,
                    distance: 2
                }
            }
        });
        buttonText.anchor.set(0.5);
        buttonText.x = screenWidth/2;
        buttonText.y = screenHeight - 75 + buttonHeight/2;
        button.addChild(buttonText);

        button.interactive = true;
        button.cursor = 'pointer';

        button.on('pointerdown', () => {
            button.scale.set(0.95);
        });

        button.on('pointerup', () => {
            button.scale.set(1);
            if (this.onBack) this.onBack();
        });

        button.on('pointerupoutside', () => {
            button.scale.set(1);
        });

        this.container.addChild(button);
    }

    getSettings() {
        return this.settings;
    }

    addToStage(stage) {
        stage.addChild(this.container);
    }

    removeFromStage(stage) {
        stage.removeChild(this.container);
    }

    destroy() {
        this.container.destroy({ children: true });
    }
}
