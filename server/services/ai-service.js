// AI Service - Handles all AI-related operations
const Anthropic = require('@anthropic-ai/sdk');

class AIService {
    constructor() {
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
        
        this.defaultModel = 'claude-3-5-sonnet-20241022';
        this.maxTokens = 4000;
    }
    
    async analyzeContext(selectedText, documents, promptTemplate) {
        try {
            console.log(`🤖 AI Service: Analyzing context for "${selectedText.substring(0, 100)}..."`);
            
            const enhancedPrompt = this.buildContextPrompt(selectedText, documents, promptTemplate);
            
            const response = await this.anthropic.messages.create({
                model: this.defaultModel,
                max_tokens: this.maxTokens,
                messages: [{ role: 'user', content: enhancedPrompt }]
            });
            
            return {
                success: true,
                analysis: response.content[0].text,
                model: this.defaultModel,
                tokens: response.usage?.total_tokens || 0
            };
            
        } catch (error) {
            console.error('❌ AI Service Error:', error);
            return {
                success: false,
                error: error.message,
                details: this.handleAIError(error)
            };
        }
    }
    
    async chatCompletion(message, context = null) {
        try {
            const prompt = context 
                ? `Context:\n${context}\n\nUser: ${message}`
                : message;
                
            const response = await this.anthropic.messages.create({
                model: this.defaultModel,
                max_tokens: this.maxTokens,
                messages: [{ role: 'user', content: prompt }]
            });
            
            return {
                success: true,
                response: response.content[0].text,
                model: this.defaultModel,
                tokens: response.usage?.total_tokens || 0
            };
            
        } catch (error) {
            console.error('❌ AI Service Chat Error:', error);
            return {
                success: false,
                error: error.message,
                details: this.handleAIError(error)
            };
        }
    }
    
    buildContextPrompt(selectedText, documents, promptTemplate) {
        let documentsText = '';
        if (documents && documents.length > 0) {
            documentsText = documents.map(doc => doc.text).join('\n\n');
        }
        
        return promptTemplate
            .replace('{selectedText}', selectedText)
            .replace('{documents}', documentsText);
    }
    
    handleAIError(error) {
        if (error.message?.includes('rate_limit')) {
            return {
                type: 'RATE_LIMIT',
                retryAfter: 60,
                message: 'API rate limit exceeded. Please wait before trying again.'
            };
        }
        
        if (error.message?.includes('authentication')) {
            return {
                type: 'AUTH_ERROR',
                message: 'Invalid API key. Please check your configuration.'
            };
        }
        
        if (error.message?.includes('quota')) {
            return {
                type: 'QUOTA_EXCEEDED',
                message: 'API quota exceeded. Please check your usage limits.'
            };
        }
        
        return {
            type: 'UNKNOWN_ERROR',
            message: 'An unexpected error occurred. Please try again.'
        };
    }
    
    getServiceStatus() {
        return {
            status: 'healthy',
            model: this.defaultModel,
            maxTokens: this.maxTokens,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = AIService;
