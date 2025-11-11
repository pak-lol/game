/**
 * Reusable Modal Component for HTML-based UI
 */
export class Modal {
    constructor() {
        this.modalElement = null;
        this.isOpen = false;
    }

    /**
     * Create and show a modal
     * @param {Object} options - Modal configuration
     * @param {string} options.title - Modal title
     * @param {string} options.content - HTML content
     * @param {Function} options.onClose - Callback when modal closes
     */
    show({ title, content, onClose }) {
        // Remove existing modal if any
        this.close();

        // Create modal container
        this.modalElement = document.createElement('div');
        this.modalElement.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 animate-slide-up';
        
        // Modal backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'absolute inset-0 glass-strong';
        backdrop.onclick = () => {
            this.close();
            if (onClose) onClose();
        };
        this.modalElement.appendChild(backdrop);

        // Modal content container
        const modalContent = document.createElement('div');
        modalContent.className = 'relative z-10 w-full max-w-md mx-auto';
        
        // Modal card
        const modalCard = document.createElement('div');
        modalCard.className = `
            bg-gradient-to-br from-emerald-950/95 to-emerald-900/90
            border-2 border-emerald-500/30
            rounded-2xl
            shadow-2xl shadow-black/50
            backdrop-blur-xl
            overflow-hidden
        `;

        // Modal header
        const header = document.createElement('div');
        header.className = 'relative px-6 py-4 border-b border-emerald-500/20';
        
        const titleElement = document.createElement('h2');
        titleElement.className = 'text-2xl font-bold text-emerald-400 text-center';
        titleElement.textContent = title;
        header.appendChild(titleElement);

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.className = `
            absolute top-4 right-4
            w-8 h-8
            flex items-center justify-center
            text-gray-400 hover:text-white
            bg-emerald-950/50 hover:bg-emerald-900/70
            border border-emerald-500/20 hover:border-emerald-500/40
            rounded-lg
            transition-all duration-200
            text-xl
        `;
        closeBtn.innerHTML = '×';
        closeBtn.onclick = () => {
            this.close();
            if (onClose) onClose();
        };
        header.appendChild(closeBtn);

        modalCard.appendChild(header);

        // Modal body
        const body = document.createElement('div');
        body.className = 'px-6 py-6 max-h-[60vh] overflow-y-auto';
        body.innerHTML = content;
        modalCard.appendChild(body);

        modalContent.appendChild(modalCard);
        this.modalElement.appendChild(modalContent);

        // Add to DOM
        document.body.appendChild(this.modalElement);
        this.isOpen = true;

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close and remove the modal
     */
    close() {
        if (this.modalElement) {
            this.modalElement.remove();
            this.modalElement = null;
            this.isOpen = false;
            document.body.style.overflow = '';
        }
    }

    /**
     * Check if modal is currently open
     */
    isModalOpen() {
        return this.isOpen;
    }
}

/**
 * Modal Manager - Singleton to manage all modals
 */
class ModalManager {
    constructor() {
        this.currentModal = null;
    }

    show(options) {
        // Close existing modal
        if (this.currentModal) {
            this.currentModal.close();
        }

        // Create and show new modal
        this.currentModal = new Modal();
        this.currentModal.show(options);
        return this.currentModal;
    }

    close() {
        if (this.currentModal) {
            this.currentModal.close();
            this.currentModal = null;
        }
    }

    isOpen() {
        return this.currentModal && this.currentModal.isModalOpen();
    }
}

// Export singleton instance
export const modalManager = new ModalManager();
