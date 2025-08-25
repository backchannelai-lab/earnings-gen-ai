// content-cache.js - Intelligent content caching and optimization
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class ContentCache {
    constructor() {
        this.cacheDir = './cache';
        this.memoryCache = new Map(); // In-memory cache for hot content
        this.maxMemorySize = 100; // Max items in memory cache
        this.cacheStats = {
            hits: 0,
            misses: 0,
            saves: 0,
            totalSize: 0
        };
        
        this.ensureCacheDirectory();
        this.loadCacheIndex();
        
        // Set up automatic cache cleanup
        this.setupCacheCleanup();
    }

    // Ensure cache directory exists
    ensureCacheDirectory() {
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
        }
    }

    // Generate cache key from content and query
    generateCacheKey(content, query = '') {
        const combined = content + '|' + query;
        return crypto.createHash('sha256').update(combined).digest('hex');
    }

    // Get cached content if available
    async getCachedContent(content, query = '') {
        const cacheKey = this.generateCacheKey(content, query);
        
        // Check memory cache first
        if (this.memoryCache.has(cacheKey)) {
            this.cacheStats.hits++;
            const cached = this.memoryCache.get(cacheKey);
            console.log(`⚡ Memory cache hit for key: ${cacheKey.substring(0, 8)}...`);
            return cached;
        }
        
        // Check disk cache
        const cacheFile = path.join(this.cacheDir, `${cacheKey}.json`);
        if (fs.existsSync(cacheFile)) {
            try {
                const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
                
                // Check if cache is still valid (not expired)
                if (this.isCacheValid(cached)) {
                    this.cacheStats.hits++;
                    
                    // Move to memory cache for faster access
                    this.addToMemoryCache(cacheKey, cached);
                    
                    console.log(`💾 Disk cache hit for key: ${cacheKey.substring(0, 8)}...`);
                    return cached;
                } else {
                    // Remove expired cache
                    fs.unlinkSync(cacheFile);
                    console.log(`🗑️ Removed expired cache: ${cacheKey.substring(0, 8)}...`);
                }
            } catch (error) {
                console.error('❌ Error reading cache file:', error.message);
                // Remove corrupted cache
                try { fs.unlinkSync(cacheFile); } catch (e) {}
            }
        }
        
        this.cacheStats.misses++;
        return null;
    }

    // Cache processed content
    async cacheContent(content, query, processedChunks, metadata = {}) {
        const cacheKey = this.generateCacheKey(content, query);
        const cacheData = {
            content: processedChunks,
            metadata: {
                ...metadata,
                originalLength: content.length,
                query: query,
                timestamp: Date.now(),
                expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
            }
        };
        
        try {
            // Save to disk cache
            const cacheFile = path.join(this.cacheDir, `${cacheKey}.json`);
            fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2));
            
            // Add to memory cache
            this.addToMemoryCache(cacheKey, cacheData);
            
            // Update cache index
            this.updateCacheIndex(cacheKey, cacheData);
            
            this.cacheStats.saves++;
            this.cacheStats.totalSize += JSON.stringify(cacheData).length;
            
            console.log(`💾 Cached content with key: ${cacheKey.substring(0, 8)}...`);
            return true;
        } catch (error) {
            console.error('❌ Failed to cache content:', error.message);
            return false;
        }
    }

    // Add content to memory cache with LRU eviction
    addToMemoryCache(cacheKey, cacheData) {
        // Remove oldest item if at capacity
        if (this.memoryCache.size >= this.maxMemorySize) {
            const oldestKey = this.memoryCache.keys().next().value;
            this.memoryCache.delete(oldestKey);
        }
        
        this.memoryCache.set(cacheKey, cacheData);
    }

    // Check if cache entry is still valid
    isCacheValid(cached) {
        if (!cached.metadata || !cached.metadata.expiresAt) {
            return false;
        }
        
        return Date.now() < cached.metadata.expiresAt;
    }

    // Update cache index for management
    updateCacheIndex(cacheKey, cacheData) {
        const indexFile = path.join(this.cacheDir, 'index.json');
        let index = {};
        
        try {
            if (fs.existsSync(indexFile)) {
                index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
            }
        } catch (error) {
            console.error('❌ Error reading cache index:', error.message);
        }
        
        index[cacheKey] = {
            timestamp: cacheData.metadata.timestamp,
            expiresAt: cacheData.metadata.expiresAt,
            originalLength: cacheData.metadata.originalLength,
            query: cacheData.metadata.query,
            size: JSON.stringify(cacheData).length
        };
        
        try {
            fs.writeFileSync(indexFile, JSON.stringify(index, null, 2));
        } catch (error) {
            console.error('❌ Failed to update cache index:', error.message);
        }
    }

    // Load cache index from disk
    loadCacheIndex() {
        const indexFile = path.join(this.cacheDir, 'index.json');
        try {
            if (fs.existsSync(indexFile)) {
                const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
                console.log(`📁 Loaded cache index with ${Object.keys(index).length} entries`);
            }
        } catch (error) {
            console.log('📁 No existing cache index found');
        }
    }

    // Get cache statistics
    getCacheStats() {
        const indexFile = path.join(this.cacheDir, 'index.json');
        let totalEntries = 0;
        let totalSize = 0;
        
        try {
            if (fs.existsSync(indexFile)) {
                const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
                totalEntries = Object.keys(index).length;
                totalSize = Object.values(index).reduce((sum, entry) => sum + (entry.size || 0), 0);
            }
        } catch (error) {
            console.error('❌ Error reading cache stats:', error.message);
        }
        
        return {
            memoryCacheSize: this.memoryCache.size,
            diskCacheEntries: totalEntries,
            totalDiskSize: totalSize,
            hitRate: this.cacheStats.hits / Math.max(1, this.cacheStats.hits + this.cacheStats.misses),
            ...this.cacheStats
        };
    }

    // Clear expired cache entries
    async clearExpiredCache() {
        const indexFile = path.join(this.cacheDir, 'index.json');
        if (!fs.existsSync(indexFile)) return;
        
        try {
            const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
            const now = Date.now();
            let clearedCount = 0;
            
            for (const [cacheKey, entry] of Object.entries(index)) {
                if (entry.expiresAt && now > entry.expiresAt) {
                    const cacheFile = path.join(this.cacheDir, `${cacheKey}.json`);
                    try {
                        if (fs.existsSync(cacheFile)) {
                            fs.unlinkSync(cacheFile);
                            clearedCount++;
                        }
                    } catch (error) {
                        console.error(`❌ Failed to remove expired cache: ${cacheKey}`);
                    }
                }
            }
            
            if (clearedCount > 0) {
                console.log(`🗑️ Cleared ${clearedCount} expired cache entries`);
                this.loadCacheIndex(); // Reload index
            }
        } catch (error) {
            console.error('❌ Error clearing expired cache:', error.message);
        }
    }

    // Clear all cache
    async clearAllCache() {
        try {
            const files = fs.readdirSync(this.cacheDir);
            let clearedCount = 0;
            
            for (const file of files) {
                if (file.endsWith('.json')) {
                    fs.unlinkSync(path.join(this.cacheDir, file));
                    clearedCount++;
                }
            }
            
            this.memoryCache.clear();
            this.cacheStats = { hits: 0, misses: 0, saves: 0, totalSize: 0 };
            
            console.log(`🗑️ Cleared all cache (${clearedCount} files)`);
            return true;
        } catch (error) {
            console.error('❌ Failed to clear cache:', error.message);
            return false;
        }
    }

    // Get cache recommendations
    getCacheRecommendations() {
        const stats = this.getCacheStats();
        const recommendations = [];
        
        if (stats.hitRate < 0.3) {
            recommendations.push('Low cache hit rate - consider adjusting cache expiration or content processing');
        }
        
        if (stats.memoryCacheSize > this.maxMemorySize * 0.8) {
            recommendations.push('Memory cache near capacity - consider increasing maxMemorySize');
        }
        
        if (stats.totalDiskSize > 100 * 1024 * 1024) { // 100MB
            recommendations.push('Large disk cache - consider implementing cache compression');
        }
        
        return recommendations;
    }

    // Preload frequently accessed content
    async preloadContent(contentKeys) {
        console.log(`🔄 Preloading ${contentKeys.length} content items...`);
        
        for (const key of contentKeys) {
            const cacheFile = path.join(this.cacheDir, `${key}.json`);
            if (fs.existsSync(cacheFile)) {
                try {
                    const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
                    if (this.isCacheValid(cached)) {
                        this.addToMemoryCache(key, cached);
                    }
                } catch (error) {
                    console.error(`❌ Failed to preload cache key ${key}:`, error.message);
                }
            }
        }
        
        console.log(`✅ Preloaded ${this.memoryCache.size} items to memory cache`);
    }
    
    // Set up automatic cache cleanup
    setupCacheCleanup() {
        // Clean up expired cache every 6 hours
        const CLEANUP_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours
        
        setInterval(() => {
            console.log('🧹 Running scheduled cache cleanup...');
            this.clearExpiredCache();
        }, CLEANUP_INTERVAL);
        
        // Clean up old cache files older than 7 days
        const DEEP_CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
        
        setInterval(() => {
            console.log('🧹 Running deep cache cleanup...');
            this.clearOldCacheFiles();
        }, DEEP_CLEANUP_INTERVAL);
        
        console.log('✅ Cache cleanup scheduled');
    }
    
    // Clear old cache files (older than 7 days)
    async clearOldCacheFiles() {
        const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
        const now = Date.now();
        let clearedCount = 0;
        
        try {
            const files = fs.readdirSync(this.cacheDir);
            
            for (const file of files) {
                if (file.endsWith('.json') && file !== 'index.json') {
                    const filePath = path.join(this.cacheDir, file);
                    const stats = fs.statSync(filePath);
                    
                    if (now - stats.mtime.getTime() > MAX_AGE) {
                        try {
                            fs.unlinkSync(filePath);
                            clearedCount++;
                        } catch (error) {
                            console.error(`❌ Failed to remove old cache file: ${file}`);
                        }
                    }
                }
            }
            
            if (clearedCount > 0) {
                console.log(`🗑️ Cleared ${clearedCount} old cache files`);
                this.loadCacheIndex(); // Reload index
            }
        } catch (error) {
            console.error('❌ Error clearing old cache files:', error.message);
        }
    }
}

module.exports = ContentCache;
