// ============================================================================
// SYSTEM PROMPT MANAGER - DYNAMIC PROMPT BUILDING WITH RAG CONTEXT
// ============================================================================

class SystemPromptManager {
    constructor() {
        this.baseTemplate = this.getDefaultTemplate();
        this.currentUserText = '';
        this.currentRetrievedContext = '';
        this.lastBuiltPrompt = '';
        this.promptUpdateCallbacks = new Set();
        
        console.log('✅ System Prompt Manager initialized');
    }
    
    // ============================================================================
    // TEMPLATE MANAGEMENT
    // ============================================================================
    
    getDefaultTemplate() {
        return `Analyze the following text and provide insights about:
- Key financial metrics and year-over-year trends
- Business performance highlights and operational results
- Strategic initiatives, investments, and their outcomes
- Risk factors, challenges, and opportunities
- Market position changes and competitive advantages

Reference only the uploaded project documents for additional context — do not make up data.

Historical Context (based only on uploaded documents and relevant to the typed terms):
{{RETRIEVED_CONTEXT}}

Text to Analyze:
{{USER_TEXT}}`;
    }
    
    setBaseTemplate(template) {
        if (!template || typeof template !== 'string') {
            throw new Error('Template must be a non-empty string');
        }
        
        if (!template.includes('{{USER_TEXT}}')) {
            throw new Error('Template must include {{USER_TEXT}} placeholder');
        }
        
        this.baseTemplate = template;
        console.log('✅ Base template updated');
        
        // Rebuild prompt with new template
        this.rebuildPrompt();
        
        return true;
    }
    
    getBaseTemplate() {
        return this.baseTemplate;
    }
    
    // ============================================================================
    // PROMPT BUILDING
    // ============================================================================
    
    updateUserText(userText) {
        if (typeof userText !== 'string') {
            throw new Error('User text must be a string');
        }
        
        this.currentUserText = userText.trim();
        console.log(`📝 User text updated (${this.currentUserText.length} characters)`);
        
        // Rebuild prompt with new user text
        this.rebuildPrompt();
        
        return true;
    }
    
    updateRetrievedContext(context) {
        if (typeof context !== 'string') {
            throw new Error('Retrieved context must be a string');
        }
        
        this.currentRetrievedContext = context.trim();
        console.log(`📚 Retrieved context updated (${this.currentRetrievedContext.length} characters)`);
        
        // Rebuild prompt with new context
        this.rebuildPrompt();
        
        return true;
    }
    
    rebuildPrompt() {
        try {
            let prompt = this.baseTemplate;
            
            // Replace placeholders with actual content
            prompt = prompt.replace(/{{USER_TEXT}}/g, this.currentUserText || '');
            prompt = prompt.replace(/{{RETRIEVED_CONTEXT}}/g, this.currentRetrievedContext || 'No relevant context found');
            
            // Clean up any double newlines or excessive whitespace
            prompt = prompt.replace(/\n\s*\n\s*\n/g, '\n\n');
            
            this.lastBuiltPrompt = prompt;
            
            console.log(`🔧 Prompt rebuilt (${prompt.length} characters)`);
            console.log(`   - User text: ${this.currentUserText.length} chars`);
            console.log(`   - Context: ${this.currentRetrievedContext.length} chars`);
            
            // Notify listeners of prompt update
            this.notifyPromptUpdate(prompt);
            
            return prompt;
            
        } catch (error) {
            console.error('❌ Error rebuilding prompt:', error);
            return this.lastBuiltPrompt || this.baseTemplate;
        }
    }
    
    getCurrentPrompt() {
        if (!this.lastBuiltPrompt) {
            this.rebuildPrompt();
        }
        return this.lastBuiltPrompt;
    }
    
    // ============================================================================
    // CONTEXT FORMATTING
    // ============================================================================
    
    formatRetrievedContext(chunks) {
        if (!Array.isArray(chunks) || chunks.length === 0) {
            return 'No relevant context found in uploaded documents.';
        }
        
        try {
            const formattedChunks = chunks.map((chunk, index) => {
                const source = chunk.documentName || 'Unknown Document';
                const similarity = chunk.similarity ? ` (relevance: ${(chunk.similarity * 100).toFixed(1)}%)` : '';
                const text = chunk.text.trim();
                
                return `[${index + 1}] Source: ${source}${similarity}\n${text}`;
            });
            
            const context = formattedChunks.join('\n\n');
            console.log(`📋 Formatted ${chunks.length} context chunks`);
            
            return context;
            
        } catch (error) {
            console.error('❌ Error formatting retrieved context:', error);
            return 'Error formatting context from documents.';
        }
    }
    
    // ============================================================================
    // PROMPT VALIDATION
    // ============================================================================
    
    validatePrompt(prompt) {
        const issues = [];
        
        if (!prompt || prompt.trim().length === 0) {
            issues.push('Prompt is empty');
        }
        
        if (prompt.length > 100000) { // Conservative limit
            issues.push('Prompt exceeds recommended length');
        }
        
        if (prompt.includes('{{USER_TEXT}}') && !this.currentUserText) {
            issues.push('User text placeholder not filled');
        }
        
        if (prompt.includes('{{RETRIEVED_CONTEXT}}') && !this.currentRetrievedContext) {
            issues.push('Retrieved context placeholder not filled');
        }
        
        return {
            isValid: issues.length === 0,
            issues,
            length: prompt.length,
            hasUserText: !!this.currentUserText,
            hasContext: !!this.currentRetrievedContext
        };
    }
    
    // ============================================================================
    // CALLBACK MANAGEMENT
    // ============================================================================
    
    onPromptUpdate(callback) {
        if (typeof callback === 'function') {
            this.promptUpdateCallbacks.add(callback);
        }
    }
    
    offPromptUpdate(callback) {
        this.promptUpdateCallbacks.delete(callback);
    }
    
    notifyPromptUpdate(prompt) {
        this.promptUpdateCallbacks.forEach(callback => {
            try {
                callback(prompt);
            } catch (error) {
                console.error('❌ Error in prompt update callback:', error);
            }
        });
    }
    
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    
    getPromptStats() {
        return {
            baseTemplateLength: this.baseTemplate.length,
            currentUserTextLength: this.currentUserText.length,
            currentContextLength: this.currentRetrievedContext.length,
            lastBuiltPromptLength: this.lastBuiltPrompt.length,
            hasUserText: !!this.currentUserText,
            hasContext: !!this.currentRetrievedContext,
            isValid: this.validatePrompt(this.lastBuiltPrompt).isValid
        };
    }
    
    reset() {
        this.currentUserText = '';
        this.currentRetrievedContext = '';
        this.lastBuiltPrompt = '';
        console.log('🔄 System Prompt Manager reset');
    }
    
    exportTemplate() {
        return {
            baseTemplate: this.baseTemplate,
            currentUserText: this.currentUserText,
            currentRetrievedContext: this.currentRetrievedContext,
            lastBuiltPrompt: this.lastBuiltPrompt,
            timestamp: new Date().toISOString()
        };
    }
    
    importTemplate(templateData) {
        try {
            if (templateData.baseTemplate) {
                this.setBaseTemplate(templateData.baseTemplate);
            }
            if (templateData.currentUserText) {
                this.updateUserText(templateData.currentUserText);
            }
            if (templateData.currentRetrievedContext) {
                this.updateRetrievedContext(templateData.currentRetrievedContext);
            }
            
            console.log('✅ Template imported successfully');
            return true;
        } catch (error) {
            console.error('❌ Error importing template:', error);
            return false;
        }
    }
}

module.exports = SystemPromptManager;
