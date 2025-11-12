/**
 * Game Events - Centralized event constants
 * Use these constants instead of strings to avoid typos
 *
 * Usage:
 *   eventBus.emit(GameEvents.ITEM_CAUGHT, { score: 10, position: {x, y} });
 *   eventBus.on(GameEvents.ITEM_CAUGHT, (data) => { ... });
 */

export const GameEvents = {
    // ===== GAME LIFECYCLE =====
    GAME_INITIALIZED: 'game:initialized',
    GAME_STARTED: 'game:started',
    GAME_PAUSED: 'game:paused',
    GAME_RESUMED: 'game:resumed',
    GAME_OVER: 'game:over',
    GAME_RESTARTED: 'game:restarted',

    // ===== GAME STATE =====
    STATE_CHANGED: 'state:changed',  // { newState, oldState }

    // ===== ENTITIES =====
    ITEM_SPAWNED: 'item:spawned',     // { item, config }
    ITEM_CAUGHT: 'item:caught',       // { item, position, score, config }
    ITEM_MISSED: 'item:missed',       // { item, config }
    ITEM_DESTROYED: 'item:destroyed', // { item }

    // ===== POWER-UPS =====
    POWERUP_SPAWNED: 'powerup:spawned',       // { item, config }
    POWERUP_CAUGHT: 'powerup:caught',         // { config, position }
    POWERUP_ACTIVATED: 'powerup:activated',   // { config, duration }
    POWERUP_EXPIRED: 'powerup:expired',       // { config }

    // ===== SCORE =====
    SCORE_ADDED: 'score:added',           // { amount, total, multiplier }
    SCORE_CHANGED: 'score:changed',       // { newScore, oldScore }
    HIGH_SCORE_BEAT: 'score:highscore',   // { newScore, oldHighScore }

    // ===== DIFFICULTY =====
    DIFFICULTY_INCREASED: 'difficulty:increased',  // { speedMultiplier, spawnInterval }
    SPEED_CHANGED: 'speed:changed',               // { newSpeed, oldSpeed }

    // ===== COLLISION =====
    COLLISION_DETECTED: 'collision:detected',  // { entity1, entity2, position }

    // ===== UI =====
    MODAL_OPENED: 'ui:modal:opened',   // { modalType }
    MODAL_CLOSED: 'ui:modal:closed',   // { modalType }
    BUTTON_CLICKED: 'ui:button:click', // { buttonId }

    // ===== AUDIO =====
    MUSIC_STARTED: 'audio:music:started',     // { trackName }
    MUSIC_STOPPED: 'audio:music:stopped',
    MUSIC_CHANGED: 'audio:music:changed',     // { newTrack, oldTrack }
    SFX_PLAYED: 'audio:sfx:played',           // { sfxName }

    // ===== INPUT =====
    POINTER_DOWN: 'input:pointer:down',   // { x, y, originalEvent }
    POINTER_UP: 'input:pointer:up',       // { x, y, originalEvent }
    POINTER_MOVE: 'input:pointer:move',   // { x, y, deltaX, deltaY, originalEvent }
    INPUT_KEY_DOWN: 'input:key:down',     // { key, code, originalEvent }
    INPUT_KEY_UP: 'input:key:up',         // { key, code, originalEvent }

    // ===== NETWORK =====
    WS_CONNECTED: 'network:ws:connected',
    WS_DISCONNECTED: 'network:ws:disconnected',
    WS_ERROR: 'network:ws:error',           // { error }
    SCORE_SUBMITTED: 'network:score:submitted',  // { rank, score }
    LEADERBOARD_UPDATED: 'network:leaderboard:updated',  // { leaderboard }

    // ===== WINDOW =====
    WINDOW_RESIZED: 'window:resized',  // { width, height }
    WINDOW_FOCUSED: 'window:focused',
    WINDOW_BLURRED: 'window:blurred',

    // ===== DEBUG =====
    DEBUG_LOG: 'debug:log',       // { message, level }
    POOL_STATS: 'debug:pool',     // { poolName, stats }
};

/**
 * Event priority constants
 * Lower number = higher priority (executes first)
 */
export const EventPriority = {
    HIGHEST: 0,
    HIGH: 10,
    NORMAL: 50,
    LOW: 100,
    LOWEST: 1000
};
