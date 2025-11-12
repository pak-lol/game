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
                        Sveiki atvykę į savaitinį "Žolės Gaudytojas" konkursą! 🎯
                    </p>
                    <p class="text-gray-300 text-sm leading-relaxed mb-3">
                        Varžykitės su kitais žaidėjais ir surinkite kuo daugiau taškų. Žaidėjas su
                        didžiausiu rezultatu savaitės pabaigoje laimės prizą!
                    </p>
                    <p class="text-gray-300 text-sm leading-relaxed">
                        Gaudykite "vorinio dumai" ir "vorinio sniegas", vengkite "chimke", naudokite
                        kibiro galią lėtėjimui. Kiekvienas taškas priartina jus prie pergalės! 🏆
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
                    <div class="bg-gradient-to-r from-yellow-900/30 to-yellow-800/20
                                border-2 border-yellow-600/50 rounded-lg p-4 mb-3
                                shadow-lg shadow-yellow-500/10">
                        <div class="flex items-start gap-3">
                            <span class="text-3xl">🥇</span>
                            <div>
                                <div class="text-yellow-400 font-bold text-base mb-1">
                                    1 vieta - Nugalėtojas
                                </div>
                                <div class="text-gray-200 text-lg font-bold">
                                    2g Lemon Haze 🌿
                                </div>
                                <div class="text-gray-400 text-xs mt-1">
                                    Prizas bus įteiktas sekmadienį
                                </div>
                            </div>
                        </div>
                    </div>
                    <p class="text-gray-400 text-xs text-center italic">
                        Žaidėjas su didžiausiu rezultatu savaitės pabaigoje laimi prizą! 🎁
                    </p>
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
                        <li>Konkurse gali dalyvauti visi žaidėjai</li>
                        <li>Laimėtojas - žaidėjas su didžiausiu rezultatu savaitės pabaigoje</li>
                        <li>Galite žaisti tiek kartų, kiek norite - skaičiuojamas geriausias rezultatas</li>
                        <li>Rezultatai atsinaujina realiuoju laiku lyderių lentelėje</li>
                        <li>Prizas bus įteiktas sekmadienį nugalėtojui</li>
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
                    <div class="space-y-3 text-gray-300 text-sm">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">Konkurso pradžia:</span>
                            <span class="font-bold text-emerald-400">2025-11-12 (antradienis)</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">Konkurso pabaiga:</span>
                            <span class="font-bold text-yellow-400">2025-11-16 (sekmadienis)</span>
                        </div>
                        <div class="mt-3 pt-3 border-t border-emerald-800/40">
                            <div class="flex justify-between items-center">
                                <span class="text-gray-400">Prizų įteikimas:</span>
                                <span class="font-bold text-yellow-400">Sekmadienį 🎁</span>
                            </div>
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
