// Configuration Service - Centralized configuration management
const path = require('path');
require('dotenv').config();

class ConfigService {
    constructor() {
        this.loadConfiguration();
    }
    
    loadConfiguration() {
        this.config = {
            // Server Configuration
            server: {
                port: process.env.PORT || 8000,
                host: process.env.HOST || 'localhost',
                environment: process.env.NODE_ENV || 'development',
                cors: {
                    allowedOrigins: this.parseAllowedOrigins(),
                    credentials: false
                }
            },
            
            // AI Configuration
            ai: {
                provider: 'anthropic',
                model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
                maxTokens: parseInt(process.env.MAX_TOKENS) || 4000,
                temperature: parseFloat(process.env.TEMPERATURE) || 0.7,
                apiKey: process.env.ANTHROPIC_API_KEY
            },
            
            // Cache Configuration
            cache: {
                enabled: process.env.CACHE_ENABLED !== 'false',
                ttl: parseInt(process.env.CACHE_TTL) || 24 * 60 * 60 * 1000, // 24 hours
                maxSize: parseInt(process.env.CACHE_MAX_SIZE) || 100 * 1024 * 1024, // 100MB
                cleanupInterval: parseInt(process.env.CACHE_CLEANUP_INTERVAL) || 6 * 60 * 60 * 1000 // 6 hours
            },
            
            // Rate Limiting
            rateLimit: {
                enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
                windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
                maxRequests: parseInt(process.env.RATE_LIMIT_MAX) || 100,
                skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESS !== 'false'
            },
            
            // Security
            security: {
                maxPayloadSize: process.env.MAX_PAYLOAD_SIZE || '50mb',
                enableHelmet: process.env.ENABLE_HELMET !== 'false',
                enableRateLimit: process.env.ENABLE_RATE_LIMIT !== 'false'
            },
            
            // Logging
            logging: {
                level: process.env.LOG_LEVEL || 'info',
                enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING !== 'false',
                logFile: process.env.LOG_FILE || path.join(__dirname, '../logs/server.log')
            }
        };
        
        this.validateConfiguration();
    }
    
    parseAllowedOrigins() {
        const origins = process.env.ALLOWED_ORIGINS;
        if (!origins) {
            return [
                'http://localhost:3000',
                'http://localhost:8000',
                'http://127.0.0.1:3000',
                'http://127.0.0.1:8000'
            ];
        }
        
        return origins.split(',').map(origin => origin.trim());
    }
    
    validateConfiguration() {
        const errors = [];
        
        if (!this.config.ai.apiKey) {
            errors.push('ANTHROPIC_API_KEY is required');
        }
        
        if (this.config.server.port < 1 || this.config.server.port > 65535) {
            errors.push('Invalid port number');
        }
        
        if (this.config.ai.maxTokens < 1 || this.config.ai.maxTokens > 100000) {
            errors.push('Invalid max tokens value');
        }
        
        if (errors.length > 0) {
            throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
        }
    }
    
    get(key) {
        return key.split('.').reduce((obj, k) => obj?.[k], this.config);
    }
    
    getAll() {
        return { ...this.config };
    }
    
    update(key, value) {
        const keys = key.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, k) => obj[k] = obj[k] || {}, this.config);
        target[lastKey] = value;
    }
    
    isDevelopment() {
        return this.config.server.environment === 'development';
    }
    
    isProduction() {
        return this.config.server.environment === 'production';
    }
    
    getCorsConfig() {
        return this.config.server.cors;
    }
    
    getAIConfig() {
        return this.config.ai;
    }
    
    getCacheConfig() {
        return this.config.cache;
    }
    
    getRateLimitConfig() {
        return this.config.rateLimit;
    }
    
    getSecurityConfig() {
        return this.config.security;
    }
    
    getLoggingConfig() {
        return this.config.logging;
    }
}

module.exports = ConfigService;
