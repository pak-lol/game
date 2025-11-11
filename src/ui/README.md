# UI Structure

Clean, scalable UI architecture for the game.

## Directory Structure

```
src/ui/
├── components/          # Reusable UI components
│   └── Modal.js        # Base modal component with manager
├── modals/             # Modal screens (HTML-based)
│   ├── ContestInfoModal.js
│   └── OptionsModal.js
└── overlays/           # Canvas overlays (PixiJS-based)
    ├── GameOverScreen.js
    ├── ScoreDisplay.js
    ├── ScorePopup.js
    ├── SpeedDisplay.js
    └── PowerUpTimer.js
```

## Guidelines

### Components (`components/`)
Reusable, generic UI components that can be used across the application.
- Should be framework-agnostic where possible
- Should have clear, documented APIs
- Example: Modal, Button, Toggle, etc.

### Modals (`modals/`)
Full-screen modal dialogs using HTML/Tailwind CSS.
- Use `modalManager` from `components/Modal.js`
- Should follow the same visual style
- Easy to create new modals by copying existing ones
- Example: OptionsModal, ContestInfoModal

**Creating a new modal:**
```javascript
import { modalManager } from '../components/Modal.js';

export class MyModal {
    show(onClose) {
        modalManager.show({
            title: '🎮 My Title',
            content: this.createContent(),
            onClose: onClose
        });
        setTimeout(() => this.setupEventListeners(), 0);
    }

    createContent() {
        return `<div>Your HTML here</div>`;
    }

    setupEventListeners() {
        // Add event listeners
    }
}
```

### Overlays (`overlays/`)
PixiJS canvas-based UI elements that render on top of the game.
- Used for in-game HUD elements
- Performance-critical UI
- Should extend PIXI.Container
- Example: ScoreDisplay, PowerUpTimer

**Creating a new overlay:**
```javascript
import * as PIXI from 'pixi.js';

export class MyOverlay {
    constructor() {
        this.container = new PIXI.Container();
        this.create();
    }

    create() {
        // Create PixiJS elements
    }

    update(deltaTime) {
        // Update logic
    }

    destroy() {
        this.container.destroy({ children: true });
    }
}
```

## Best Practices

1. **Separation of Concerns**: Keep HTML modals separate from PixiJS overlays
2. **Reusability**: Create components that can be reused
3. **Consistency**: Follow the established patterns and styling
4. **Documentation**: Document complex components
5. **Cleanup**: Always implement proper cleanup/destroy methods
6. **Imports**: Use relative imports correctly based on folder structure

## Import Examples

```javascript
// From Game.js
import { OptionsModal } from './ui/modals/OptionsModal.js';
import { ScoreDisplay } from './ui/overlays/ScoreDisplay.js';

// From a modal
import { modalManager } from '../components/Modal.js';
import { i18n } from '../../utils/i18n.js';

// From an overlay
import * as PIXI from 'pixi.js';
import { GAME_CONFIG } from '../../config.js';
```

## Adding New Features

### New Modal
1. Create file in `modals/`
2. Import `modalManager` from `../components/Modal.js`
3. Follow the modal pattern (see examples above)
4. Add button in `index.html`
5. Add method in `Game.js`

### New Overlay
1. Create file in `overlays/`
2. Extend PIXI.Container pattern
3. Implement create(), update(), destroy()
4. Add to Game.js where needed

### New Component
1. Create file in `components/`
2. Make it reusable and well-documented
3. Export for use in modals/overlays
