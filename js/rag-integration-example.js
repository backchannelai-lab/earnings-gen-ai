// ============================================================================
// RAG INTEGRATION EXAMPLE - HOW TO USE THE ENHANCED CLIENT
// ============================================================================

// This file shows how to integrate the EnhancedRealtimeClient with your existing frontend
// Replace the existing RealtimeClient usage with this enhanced version

class RAGIntegrationExample {
    constructor() {
        // Initialize the enhanced RAG client
        this.ragClient = new EnhancedRealtimeClient();
        this.documents = [];
        this.currentAnalysis = null;
        
        this.init();
    }
    
    init() {
        console.log('🚀 Initializing RAG Integration...');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Connect to the RAG backend
        this.ragClient.autoConnect();
        
        // Listen for important events
        this.setupRAGEventListeners();
        
        console.log('✅ RAG Integration ready!');
    }
    
    setupEventListeners() {
        // Example: Listen for editor text changes
        const editor = document.getElementById('articleEditor');
        if (editor) {
            let updateTimeout;
            editor.addEventListener('input', (e) => {
                clearTimeout(updateTimeout);
                updateTimeout = setTimeout(() => {
                    const text = editor.textContent || editor.innerText || '';
                    if (text.trim()) {
                        this.updateUserText(text);
                    }
                }, 100); // Small delay to avoid overwhelming the server
            });
        }
        
        // Example: Listen for file uploads
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileUpload(e);
            });
        }
        
        // Example: Listen for analysis requests
        const analyzeBtn = document.getElementById('analyzeBtn');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => {
                this.requestAnalysis();
            });
        }
    }
    
    setupRAGEventListeners() {
        // Listen for system prompt updates
        this.ragClient.on('prompt_update', (prompt) => {
            console.log('🔄 System prompt updated via RAG:', prompt.substring(0, 100) + '...');
            this.updateSystemPromptDisplay(prompt);
        });
        
        // Listen for document updates
        this.ragClient.on('document_update', (stats) => {
            console.log('📊 Document stats updated:', stats);
            this.updateDocumentDisplay(stats);
        });
        
        // Listen for Claude responses
        this.ragClient.on('claude_response', (text, isComplete) => {
            if (!isComplete) {
                this.streamClaudeResponse(text);
            }
        });
        
        // Listen for analysis completion
        this.ragClient.on('claude_complete', (fullResponse) => {
            this.completeAnalysis(fullResponse);
        });
        
        // Listen for document upload results
        this.ragClient.on('document_upload_success', (result) => {
            this.showNotification(`✅ Document "${result.documentName}" processed successfully`, 'success');
        });
        
        this.ragClient.on('document_upload_error', (error) => {
            this.showNotification(`❌ Document upload failed: ${error.message}`, 'error');
        });
        
        // Listen for connection status
        this.ragClient.on('connected', () => {
            this.showNotification('🔌 Connected to RAG backend', 'success');
        });
        
        this.ragClient.on('disconnected', () => {
            this.showNotification('🔌 Disconnected from RAG backend', 'warning');
        });
        
        this.ragClient.on('error', (message, details) => {
            this.showNotification(`❌ RAG Error: ${message}`, 'error');
            console.error('RAG Error details:', details);
        });
    }
    
    // ============================================================================
    // USER TEXT UPDATES - TRIGGERS RAG CONTEXT RETRIEVAL
    // ============================================================================
    
    updateUserText(text) {
        if (!text || text.trim().length === 0) return;
        
        console.log(`📝 Updating user text (${text.length} characters)`);
        
        // Send to RAG backend - this will trigger:
        // 1. Text processing and keyword extraction
        // 2. Semantic search in document chunks
        // 3. Context retrieval and prompt rebuilding
        // 4. Real-time prompt updates to all clients
        this.ragClient.updateUserText(text);
        
        // Show loading indicator
        this.showLoadingIndicator('Retrieving relevant context...');
    }
    
    // ============================================================================
    // DOCUMENT UPLOAD AND PROCESSING
    // ============================================================================
    
    async handleFileUpload(event) {
        const files = Array.from(event.target.files);
        
        for (const file of files) {
            try {
                console.log(`📁 Processing file: ${file.name}`);
                
                // Extract text from file (using your existing logic)
                const text = await this.extractText(file);
                
                // Upload to RAG backend for processing
                const documentData = {
                    name: file.name,
                    text: text,
                    type: file.type || 'text'
                };
                
                this.ragClient.uploadDocument(documentData);
                
                // Store locally for reference
                this.documents.push(documentData);
                
            } catch (error) {
                console.error('❌ Error processing file:', error);
                this.showNotification(`❌ Failed to process ${file.name}: ${error.message}`, 'error');
            }
        }
        
        event.target.value = '';
    }
    
    async extractText(file) {
        // Use your existing text extraction logic
        if (file.type === 'text/plain') {
            return await file.text();
        } else if (file.name.endsWith('.pdf')) {
            // Your existing PDF processing logic
            return `PDF content from ${file.name}`;
        }
        return `Content from ${file.name}`;
    }
    
    // ============================================================================
    // ANALYSIS REQUESTS
    // ============================================================================
    
    requestAnalysis(selectedText = null) {
        if (!selectedText) {
            // Get selected text from editor
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                selectedText = selection.toString();
            }
        }
        
        if (!selectedText || selectedText.trim().length === 0) {
            this.showNotification('Please select text to analyze', 'warning');
            return;
        }
        
        console.log('🚀 Requesting analysis for:', selectedText.substring(0, 100) + '...');
        
        // Request analysis from RAG backend
        // This will use the current system prompt (with RAG context)
        this.ragClient.requestAnalysis(selectedText, true);
        
        // Show analysis area
        this.showAnalysisArea();
    }
    
    // ============================================================================
    // RESPONSE HANDLING
    // ============================================================================
    
    streamClaudeResponse(text) {
        if (!this.currentAnalysis) {
            this.currentAnalysis = '';
        }
        
        this.currentAnalysis += text;
        
        // Update the analysis display in real-time
        this.updateAnalysisDisplay(this.currentAnalysis);
    }
    
    completeAnalysis(fullResponse) {
        console.log('✅ Analysis completed:', fullResponse.length, 'characters');
        
        // Store the complete analysis
        this.currentAnalysis = fullResponse;
        
        // Update final display
        this.updateAnalysisDisplay(fullResponse);
        
        // Hide loading indicator
        this.hideLoadingIndicator();
        
        // Show completion notification
        this.showNotification('✅ Analysis completed!', 'success');
    }
    
    // ============================================================================
    // UI UPDATES
    // ============================================================================
    
    updateSystemPromptDisplay(prompt) {
        // Update the system prompt input field
        const systemPromptInput = document.getElementById('systemPromptInput');
        if (systemPromptInput) {
            systemPromptInput.value = prompt;
        }
        
        // Update any other prompt display elements
        const promptDisplay = document.getElementById('promptDisplay');
        if (promptDisplay) {
            promptDisplay.textContent = prompt.substring(0, 200) + '...';
        }
        
        // Hide loading indicator since context retrieval is complete
        this.hideLoadingIndicator();
    }
    
    updateDocumentDisplay(stats) {
        // Update document count
        const countElement = document.getElementById('knowledgeDocumentCount');
        if (countElement) {
            countElement.textContent = stats.documentCount;
        }
        
        // Update chunk count if available
        const chunkCountElement = document.getElementById('chunkCount');
        if (chunkCountElement) {
            chunkCountElement.textContent = stats.chunkCount;
        }
        
        // Update document list
        this.updateDocumentList(stats.documents);
    }
    
    updateDocumentList(documents) {
        const fileList = document.getElementById('fileList');
        if (!fileList) return;
        
        if (!documents || documents.length === 0) {
            fileList.innerHTML = '<p class="text-gray-500 text-sm">No documents uploaded</p>';
            return;
        }
        
        fileList.innerHTML = documents.map(doc => `
            <div class="p-2 bg-gray-50 rounded border">
                <div class="font-medium">${doc.name}</div>
                <div class="text-sm text-gray-500">
                    ${doc.chunkCount} chunks • ${new Date(doc.timestamp).toLocaleDateString()}
                </div>
            </div>
        `).join('');
    }
    
    showAnalysisArea() {
        // Create or show analysis display area
        let analysisArea = document.getElementById('analysisArea');
        if (!analysisArea) {
            analysisArea = document.createElement('div');
            analysisArea.id = 'analysisArea';
            analysisArea.className = 'mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg';
            analysisArea.innerHTML = `
                <h3 class="text-lg font-medium text-blue-900 mb-2">AI Analysis</h3>
                <div id="analysisContent" class="text-blue-800"></div>
            `;
            
            // Insert after editor or in appropriate location
            const editor = document.getElementById('articleEditor');
            if (editor && editor.parentNode) {
                editor.parentNode.insertBefore(analysisArea, editor.nextSibling);
            }
        }
        
        analysisArea.style.display = 'block';
        this.currentAnalysis = '';
    }
    
    updateAnalysisDisplay(content) {
        const analysisContent = document.getElementById('analysisContent');
        if (analysisContent) {
            analysisContent.textContent = content;
        }
    }
    
    showLoadingIndicator(message) {
        // Create or show loading indicator
        let loadingIndicator = document.getElementById('loadingIndicator');
        if (!loadingIndicator) {
            loadingIndicator = document.createElement('div');
            loadingIndicator.id = 'loadingIndicator';
            loadingIndicator.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50';
        }
        
        loadingIndicator.textContent = message;
        loadingIndicator.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.hideLoadingIndicator();
        }, 5000);
    }
    
    hideLoadingIndicator() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-4 py-2 rounded shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            type === 'warning' ? 'bg-yellow-500 text-black' :
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
    
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    
    getConnectionStatus() {
        return this.ragClient.getConnectionStatus();
    }
    
    getCurrentPrompt() {
        return this.ragClient.getCurrentPrompt();
    }
    
    getDocumentStats() {
        return this.ragClient.getDocumentStats();
    }
    
    clearDocuments() {
        if (confirm('Are you sure you want to clear all documents? This cannot be undone.')) {
            this.ragClient.clearDocuments();
            this.documents = [];
            this.showNotification('🗑️ All documents cleared', 'info');
        }
    }
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

// To use this integration, replace your existing RealtimeClient setup:

/*
// OLD WAY:
const realtimeClient = new RealtimeClient();
realtimeClient.autoConnect();

// NEW WAY:
const ragIntegration = new RAGIntegrationExample();
// This automatically sets up everything and connects to the RAG backend
*/

// The enhanced client provides:
// - Automatic RAG context retrieval as users type
// - Real-time system prompt updates with relevant document context
// - Streaming Claude responses
// - Better document management and processing
// - Comprehensive error handling and notifications

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RAGIntegrationExample;
} else {
    // Browser environment - make it globally available
    window.RAGIntegrationExample = RAGIntegrationExample;
}
