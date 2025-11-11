import { modalManager } from '../components/Modal.js';

/**
 * Contest Info Modal - Information about the contest/competition
 */
export class ContestInfoModal {
    show(onClose) {
        const content = this.createContent();
        
        modalManager.show({
            title: '🏆 Konkurso Informacija',
            content: content,
            onClose: onClose
        });

        // Setup event listeners after modal is shown
        setTimeout(() => this.setupEventListeners(), 0);
    }

    createContent() {
        return `
            <div class="space-y-4">
                <!-- Contest Description -->
                <div class="bg-gradient-to-br from-emerald-950/40 to-emerald-900/20 
                            border-2 border-emerald-800/40 
                            rounded-xl p-5 
                            backdrop-blur-sm shadow-lg shadow-black/50">
                    <h3 class="text-emerald-400 font-bold text-lg mb-3 flex items-center gap-2">
                        <span>🎮</span>
                        <span>Apie Konkursą</span>
                    </h3>
                    <p class="text-gray-300 text-sm leading-relaxed mb-3">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                        incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
                        exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                    <p class="text-gray-300 text-sm leading-relaxed">
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
                        fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in 
                        culpa qui officia deserunt mollit anim id est laborum.
                    </p>
                </div>

                <!-- Prizes Section -->
                <div class="bg-gradient-to-br from-emerald-950/40 to-emerald-900/20 
                            border-2 border-emerald-800/40 
                            rounded-xl p-5 
                            backdrop-blur-sm shadow-lg shadow-black/50">
                    <h3 class="text-emerald-400 font-bold text-lg mb-3 flex items-center gap-2">
                        <span>🎁</span>
                        <span>Prizai</span>
                    </h3>
                    <ul class="space-y-2 text-gray-300 text-sm">
                        <li class="flex items-start gap-2">
                            <span class="text-yellow-400 font-bold">🥇</span>
                            <span>1 vieta - Lorem ipsum dolor sit amet</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-gray-400 font-bold">🥈</span>
                            <span>2 vieta - Consectetur adipiscing elit</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-orange-400 font-bold">🥉</span>
                            <span>3 vieta - Sed do eiusmod tempor</span>
                        </li>
                    </ul>
                </div>

                <!-- Rules Section -->
                <div class="bg-gradient-to-br from-emerald-950/40 to-emerald-900/20 
                            border-2 border-emerald-800/40 
                            rounded-xl p-5 
                            backdrop-blur-sm shadow-lg shadow-black/50">
                    <h3 class="text-emerald-400 font-bold text-lg mb-3 flex items-center gap-2">
                        <span>📋</span>
                        <span>Taisyklės</span>
                    </h3>
                    <ul class="space-y-2 text-gray-300 text-sm list-disc list-inside">
                        <li>Lorem ipsum dolor sit amet consectetur</li>
                        <li>Adipiscing elit sed do eiusmod tempor</li>
                        <li>Incididunt ut labore et dolore magna</li>
                        <li>Aliqua ut enim ad minim veniam</li>
                    </ul>
                </div>

                <!-- Dates Section -->
                <div class="bg-gradient-to-br from-emerald-950/40 to-emerald-900/20 
                            border-2 border-emerald-800/40 
                            rounded-xl p-5 
                            backdrop-blur-sm shadow-lg shadow-black/50">
                    <h3 class="text-emerald-400 font-bold text-lg mb-3 flex items-center gap-2">
                        <span>📅</span>
                        <span>Datos</span>
                    </h3>
                    <div class="space-y-2 text-gray-300 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-400">Pradžia:</span>
                            <span class="font-bold">2024-01-01</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Pabaiga:</span>
                            <span class="font-bold">2024-12-31</span>
                        </div>
                    </div>
                </div>

                <!-- Close Button -->
                <button id="contestInfoBackBtn" 
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
                    <span>Uždaryti</span>
                </button>
            </div>
        `;
    }

    setupEventListeners() {
        // Close button
        const backBtn = document.getElementById('contestInfoBackBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                modalManager.close();
            });
        }
    }
}
