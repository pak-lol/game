import { Component } from '../Component.js';

/**
 * PowerUp Component - Power-up data
 *
 * Holds power-up specific properties.
 */
export class PowerUp extends Component {
    constructor(powerUpConfig = null) {
        super();
        this.config = powerUpConfig;   // PowerUp configuration
        this.effectType = null;        // e.g., 'speed_multiplier', 'invincibility'
        this.effectValue = 0;          // Effect magnitude
        this.duration = 0;             // Duration in milliseconds
    }

    /**
     * Reset to default values
     */
    reset() {
        this.config = null;
        this.effectType = null;
        this.effectValue = 0;
        this.duration = 0;
    }
}
