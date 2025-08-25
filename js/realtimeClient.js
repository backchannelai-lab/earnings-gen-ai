// ============================================================================
// REAL-TIME CLIENT FOR WEBSOCKET COMMUNICATION
// ============================================================================

class RealtimeClient {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.onMessageCallbacks = new Map();
        this.onPromptUpdateCallbacks = new Set();
        this.onClaudeResponseCallbacks = new Set();
        this.onErrorCallbacks = new Set();
        
        // Configuration
        this.serverUrl = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        this.serverUrl += '//' + window.location.host;
        
        console.log('🔌 RealtimeClient initialized, server URL:', this.serverUrl);
    }
    
    // ============================================================================
    // CONNECTION MANAGEMENT
    // ============================================================================
    
    connect() {
        try {
            console.log('🔌 Attempting WebSocket connection...');
            this.ws = new WebSocket(this.serverUrl);
            
            this.ws.onopen = () => {
                console.log('✅ WebSocket connected successfully');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.triggerCallbacks('connected', []);
            };
            
            this.ws.onmessage = (event) => {
                this.handleMessage(event.data);
            };
            
            this.ws.onclose = (event) => {
                console.log('🔌 WebSocket connection closed:', event.code, event.reason);
                this.isConnected = false;
                this.triggerCallbacks('disconnected', [event]);
                
                // Attempt to reconnect if not a clean close
                if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.scheduleReconnect();
                }
            };
            
            this.ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                this.triggerCallbacks('error', [error]);
            };
            
        } catch (error) {
            console.error('❌ Failed to create WebSocket connection:', error);
            this.triggerCallbacks('error', [error]);
        }
    }
    
    disconnect() {
        if (this.ws) {
            console.log('🔌 Disconnecting WebSocket...');
            this.ws.close(1000, 'Client disconnect');
            this.ws = null;
            this.isConnected = false;
        }
    }
    
    scheduleReconnect() {
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
        
        setTimeout(() => {
            if (!this.isConnected) {
                this.connect();
            }
        }, delay);
    }
    
    // ============================================================================
    // MESSAGE HANDLING
    // ============================================================================
    
    handleMessage(data) {
        try {
            const message = JSON.parse(data);
            console.log('📨 Received message:', message.type);
            
            switch (message.type) {
                case 'system_prompt_update':
                    this.handleSystemPromptUpdate(message.prompt);
                    break;
                    
                case 'claude_chunk':
                    this.handleClaudeChunk(message);
                    break;
                    
                case 'analysis_started':
                    this.triggerCallbacks('analysis_started', [message]);
                    break;
                    
                case 'error':
                    this.handleError(message);
                    break;
                    
                default:
                    console.warn('⚠️ Unknown message type:', message.type);
            }
            
        } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
        }
    }
    
    handleSystemPromptUpdate(prompt) {
        console.log('🔄 System prompt updated via WebSocket:', prompt.substring(0, 100) + '...');
        
        // Update the system prompt input field if it exists
        const systemPromptInput = document.getElementById('systemPromptInput');
        if (systemPromptInput) {
            systemPromptInput.value = prompt;
        }
        
        // Trigger callbacks
        this.onPromptUpdateCallbacks.forEach(callback => {
            try {
                callback(prompt);
            } catch (error) {
                console.error('❌ Error in prompt update callback:', error);
            }
        });
    }
    
    handleClaudeChunk(message) {
        if (message.isComplete) {
            console.log('✅ Claude response completed');
            this.triggerCallbacks('claude_complete', [message.fullResponse]);
        } else {
            // Stream the text chunk
            this.onClaudeResponseCallbacks.forEach(callback => {
                try {
                    callback(message.text, false);
                } catch (error) {
                    console.error('❌ Error in Claude response callback:', error);
                }
            });
        }
    }
    
    handleError(message) {
        console.error('❌ Server error:', message.message);
        this.onErrorCallbacks.forEach(callback => {
            try {
                callback(message.message, message.details);
            } catch (error) {
                console.error('❌ Error in error callback:', error);
            }
        });
    }
    
    // ============================================================================
    // OUTGOING MESSAGES
    // ============================================================================
    
    sendMessage(type, data = {}) {
        if (!this.isConnected || !this.ws) {
            console.warn('⚠️ Cannot send message: WebSocket not connected');
            return false;
        }
        
        try {
            const message = { type, ...data };
            this.ws.send(JSON.stringify(message));
            console.log('📤 Sent message:', type, data);
            return true;
        } catch (error) {
            console.error('❌ Error sending message:', error);
            return false;
        }
    }
    
    updateSystemPrompt(prompt) {
        return this.sendMessage('update_system_prompt', { prompt });
    }
    
    requestClaudeAnalysis(selectedText, documents) {
        return this.sendMessage('request_claude_analysis', { selectedText, documents });
    }
    
    // ============================================================================
    // CALLBACK MANAGEMENT
    // ============================================================================
    
    on(event, callback) {
        switch (event) {
            case 'prompt_update':
                this.onPromptUpdateCallbacks.add(callback);
                break;
            case 'claude_response':
                this.onClaudeResponseCallbacks.add(callback);
                break;
            case 'claude_complete':
                this.onClaudeResponseCallbacks.add(callback);
                break;
            case 'error':
                this.onErrorCallbacks.add(callback);
                break;
            case 'connected':
            case 'disconnected':
            case 'analysis_started':
                if (!this.onMessageCallbacks.has(event)) {
                    this.onMessageCallbacks.set(event, new Set());
                }
                this.onMessageCallbacks.get(event).add(callback);
                break;
            default:
                console.warn('⚠️ Unknown event type:', event);
        }
    }
    
    off(event, callback) {
        switch (event) {
            case 'prompt_update':
                this.onPromptUpdateCallbacks.delete(callback);
                break;
            case 'claude_response':
                this.onClaudeResponseCallbacks.delete(callback);
                break;
            case 'error':
                this.onErrorCallbacks.delete(callback);
                break;
            case 'connected':
            case 'disconnected':
            case 'analysis_started':
                const callbacks = this.onMessageCallbacks.get(event);
                if (callbacks) {
                    callbacks.delete(callback);
                }
                break;
        }
    }
    
    triggerCallbacks(event, args) {
        const callbacks = this.onMessageCallbacks.get(event);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`❌ Error in ${event} callback:`, error);
                }
            });
        }
    }
    
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            maxReconnectAttempts: this.maxReconnectAttempts
        };
    }
    
    // ============================================================================
    // AUTO-CONNECT ON PAGE LOAD
    // ============================================================================
    
    autoConnect() {
        // Connect when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.connect());
        } else {
            this.connect();
        }
        
        // Reconnect on page visibility change (when tab becomes visible again)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && !this.isConnected) {
                console.log('👁️ Page became visible, attempting to reconnect...');
                this.connect();
            }
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealtimeClient;
} else {
    // Browser environment - make it globally available
    window.RealtimeClient = RealtimeClient;
}
