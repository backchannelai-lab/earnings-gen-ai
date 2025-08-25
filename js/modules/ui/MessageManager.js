export class MessageManager {
    constructor() {
        this.elements = {};
        this.messageQueue = [];
        this.isShowingMessage = false;
    }

    initializeElements(messageContainer, contextIndicator, contextIndicatorText) {
        this.elements = {
            messageContainer,
            contextIndicator,
            contextIndicatorText
        };
    }

    showMessage(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        if (!this.elements.messageContainer) {
            console.warn('⚠️ Message container not found');
            return;
        }

        // Add to queue if already showing a message
        if (this.isShowingMessage) {
            this.messageQueue.push({ message, type });
            return;
        }

        this.displayMessage(message, type);
    }

    displayMessage(message, type) {
        this.isShowingMessage = true;
        
        const messageElement = document.createElement('div');
        messageElement.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm transform transition-all duration-300 ease-in-out ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            type === 'warning' ? 'bg-yellow-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        
        messageElement.innerHTML = `
            <div class="flex items-center space-x-3">
                <i class="fas fa-${
                    type === 'success' ? 'check-circle' :
                    type === 'error' ? 'exclamation-circle' :
                    type === 'warning' ? 'exclamation-triangle' :
                    'info-circle'
                }"></i>
                <span>${message}</span>
                <button class="ml-2 hover:opacity-75" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        this.elements.messageContainer.appendChild(messageElement);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageElement.parentElement) {
                messageElement.remove();
            }
            this.isShowingMessage = false;
            this.processNextMessage();
        }, 5000);
    }

    processNextMessage() {
        if (this.messageQueue.length > 0) {
            const nextMessage = this.messageQueue.shift();
            this.displayMessage(nextMessage.message, nextMessage.type);
        }
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showWarning(message) {
        this.showMessage(message, 'warning');
    }

    showInfo(message) {
        this.showMessage(message, 'info');
    }

    showContextPullingIndicator(text) {
        if (!this.elements.contextIndicator || !this.elements.contextIndicatorText) {
            console.warn('⚠️ Context indicator elements not found');
            return;
        }

        this.elements.contextIndicatorText.textContent = `Pulling context from: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`;
        this.elements.contextIndicator.style.display = 'block';
        this.elements.contextIndicator.classList.add('animate-pulse');
        
        console.log('🔄 Context pulling indicator shown');
    }

    hideContextPullingIndicator() {
        if (!this.elements.contextIndicator) return;
        
        this.elements.contextIndicator.style.display = 'none';
        this.elements.contextIndicator.classList.remove('animate-pulse');
        this.elements.contextIndicatorText.textContent = '';
        
        console.log('🔄 Context pulling indicator hidden');
    }

    showContextUpdateIndicator() {
        if (!this.elements.contextIndicator || !this.elements.contextIndicatorText) return;
        
        this.elements.contextIndicatorText.textContent = 'Context updated!';
        this.elements.contextIndicator.style.display = 'block';
        this.elements.contextIndicator.classList.remove('animate-pulse');
        this.elements.contextIndicator.classList.add('bg-green-100', 'border-green-500', 'text-green-700');
        
        setTimeout(() => {
            this.hideContextPullingIndicator();
            this.elements.contextIndicator.classList.remove('bg-green-100', 'border-green-500', 'text-green-700');
        }, 2000);
        
        console.log('🔄 Context update indicator shown');
    }

    showNoDocumentsMessage() {
        if (!this.elements.contextIndicator || !this.elements.contextIndicatorText) return;
        
        this.elements.contextIndicatorText.textContent = 'No documents uploaded. Please upload files to get context.';
        this.elements.contextIndicator.style.display = 'block';
        this.elements.contextIndicator.classList.remove('animate-pulse');
        this.elements.contextIndicator.classList.add('bg-yellow-100', 'border-yellow-500', 'text-yellow-700');
        
        setTimeout(() => {
            this.hideContextPullingIndicator();
            this.elements.contextIndicator.classList.remove('bg-yellow-100', 'border-yellow-500', 'text-yellow-700');
        }, 3000);
        
        console.log('🔄 No documents message shown');
    }

    showLoadingState() {
        // This can be implemented to show a global loading indicator
        console.log('🔄 Loading state shown');
    }

    hideLoadingState() {
        // This can be implemented to hide a global loading indicator
        console.log('🔄 Loading state hidden');
    }

    clearAllMessages() {
        if (this.elements.messageContainer) {
            this.elements.messageContainer.innerHTML = '';
        }
        this.messageQueue = [];
        this.isShowingMessage = false;
    }
}
