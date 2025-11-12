import { modalManager } from '../components/Modal.js';
import { i18n } from '../../utils/i18n.js';

/**
 * Options Modal - HTML-based settings UI
 */
export class OptionsModal {
    constructor(audioManager = null) {
        this.audioManager = audioManager;
        this.settings = this.loadSettings();
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('game_settings');
            if (saved) return JSON.parse(saved);
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
        return { soundEnabled: true, musicEnabled: true };
    }

    saveSettings() {
        try {
            localStorage.setItem('game_settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    show(onClose) {
        const content = this.createContent();
        
        modalManager.show({
            title: '⚙️ ' + i18n.t('menu.options'),
            content: content,
            onClose: onClose
        });

        // Setup event listeners after modal is shown
        setTimeout(() => this.setupEventListeners(), 0);
    }

    createContent() {
        return `
            <div class="space-y-4">
                <!-- Sound Setting -->
                <div class="bg-gradient-to-br from-emerald-950/40 to-emerald-900/20 
                            border-2 border-emerald-800/40 
                            rounded-xl p-4 
                            backdrop-blur-sm shadow-lg shadow-black/50
                            hover:from-emerald-900/50 hover:to-emerald-800/30
                            hover:border-emerald-700/60
                            transition-all duration-200">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <span class="text-2xl">🔊</span>
                            <div>
                                <div class="text-white font-bold text-lg">${i18n.t('options.sound')}</div>
                                <div class="text-gray-400 text-sm">Garso efektai žaidime</div>
                            </div>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="soundToggle" class="sr-only peer" ${this.settings.soundEnabled ? 'checked' : ''}>
                            <div class="w-14 h-8 bg-gray-700 peer-focus:outline-none rounded-full peer 
                                        peer-checked:after:translate-x-full peer-checked:after:border-white 
                                        after:content-[''] after:absolute after:top-[4px] after:left-[4px] 
                                        after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all
                                        peer-checked:bg-emerald-600 border-2 border-gray-600 peer-checked:border-emerald-500"></div>
                        </label>
                    </div>
                </div>

                <!-- Music Setting -->
                <div class="bg-gradient-to-br from-emerald-950/40 to-emerald-900/20 
                            border-2 border-emerald-800/40 
                            rounded-xl p-4 
                            backdrop-blur-sm shadow-lg shadow-black/50
                            hover:from-emerald-900/50 hover:to-emerald-800/30
                            hover:border-emerald-700/60
                            transition-all duration-200">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <span class="text-2xl">🎵</span>
                            <div>
                                <div class="text-white font-bold text-lg">${i18n.t('options.music')}</div>
                                <div class="text-gray-400 text-sm">Fono muzika</div>
                            </div>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="musicToggle" class="sr-only peer" ${this.settings.musicEnabled ? 'checked' : ''}>
                            <div class="w-14 h-8 bg-gray-700 peer-focus:outline-none rounded-full peer 
                                        peer-checked:after:translate-x-full peer-checked:after:border-white 
                                        after:content-[''] after:absolute after:top-[4px] after:left-[4px] 
                                        after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all
                                        peer-checked:bg-emerald-600 border-2 border-gray-600 peer-checked:border-emerald-500"></div>
                        </label>
                    </div>
                </div>

                <!-- Back Button -->
                <button id="optionsBackBtn" 
                        class="w-full px-6 py-3 rounded-xl font-bold text-base
                               bg-gradient-to-br from-emerald-950/40 to-emerald-900/20
                               border-2 border-emerald-800/40
                               text-gray-300 uppercase tracking-wide
                               hover:from-emerald-900/50 hover:to-emerald-800/30
                               hover:border-emerald-700/60
                               hover:text-white
                               hover:shadow-lg hover:shadow-emerald-500/20
                               active:scale-[0.97]
                               transition-all duration-200
                               flex items-center justify-center gap-2
                               shadow-lg shadow-black/50 backdrop-blur-sm">
                    <span>←</span>
                    <span>${i18n.t('menu.back')}</span>
                </button>
            </div>
        `;
    }

    setupEventListeners() {
        // Sound toggle
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            soundToggle.addEventListener('change', (e) => {
                this.settings.soundEnabled = e.target.checked;
                this.saveSettings();
            });
        }

        // Music toggle
        const musicToggle = document.getElementById('musicToggle');
        if (musicToggle) {
            musicToggle.addEventListener('change', (e) => {
                this.settings.musicEnabled = e.target.checked;
                this.saveSettings();

                // Control background music in real-time
                if (this.audioManager) {
                    this.audioManager.toggleBackgroundMusic(e.target.checked);
                }
            });
        }

        // Back button
        const backBtn = document.getElementById('optionsBackBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                modalManager.close();
            });
        }
    }

    getSettings() {
        return this.settings;
    }
}
