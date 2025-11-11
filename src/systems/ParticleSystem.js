import * as PIXI from 'pixi.js';
import { PARTICLE_CONFIG } from '../config.js';

export class ParticleSystem {
    constructor(app) {
        this.app = app;
    }

    createCatchEffect(x, y, color = '#4CAF50') {
        for (let i = 0; i < PARTICLE_CONFIG.count; i++) {
            const particle = new PIXI.Graphics();
            particle.circle(0, 0, PARTICLE_CONFIG.size);
            particle.fill(color);
            
            particle.x = x;
            particle.y = y;
            
            const angle = (Math.PI * 2 * i) / PARTICLE_CONFIG.count;
            particle.vx = Math.cos(angle) * PARTICLE_CONFIG.speed;
            particle.vy = Math.sin(angle) * PARTICLE_CONFIG.speed;
            particle.life = PARTICLE_CONFIG.life;
            
            this.app.stage.addChild(particle);
            
            const particleUpdate = () => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.alpha -= PARTICLE_CONFIG.fadeSpeed;
                particle.life--;
                
                if (particle.life <= 0) {
                    this.app.stage.removeChild(particle);
                    this.app.ticker.remove(particleUpdate);
                }
            };
            
            this.app.ticker.add(particleUpdate);
        }
    }
}
