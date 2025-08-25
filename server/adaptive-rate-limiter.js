// adaptive-rate-limiter.js - Smart rate limiting based on usage patterns
const fs = require('fs');

class AdaptiveRateLimiter {
    constructor() {
        this.userLimits = new Map(); // Track per-user limits
        this.apiHealth = {
            successRate: 1.0,
            errorCount: 0,
            totalRequests: 0,
            lastReset: Date.now()
        };
        
        // Base limits that adapt over time
        this.baseLimits = {
            newUser: { requests: 5, window: 60000 },      // 5 req/min for new users
            regular: { requests: 15, window: 60000 },     // 15 req/min for regular users
            power: { requests: 25, window: 60000 },       // 25 req/min for power users
            enterprise: { requests: 50, window: 60000 }   // 50 req/min for enterprise
        };
        
        this.requestHistory = new Map(); // Track request patterns
        this.loadUserData();
    }

    // Get appropriate limit for user
    getUserLimit(userId = 'default') {
        if (!this.userLimits.has(userId)) {
            this.userLimits.set(userId, {
                tier: 'newUser',
                requests: 0,
                lastRequest: 0,
                successCount: 0,
                errorCount: 0,
                upgradeEligible: false
            });
        }

        const user = this.userLimits.get(userId);
        const baseLimit = this.baseLimits[user.tier];
        
        // Adjust based on API health
        const healthMultiplier = this.getHealthMultiplier();
        
        return {
            requests: Math.floor(baseLimit.requests * healthMultiplier),
            window: baseLimit.window,
            tier: user.tier,
            healthMultiplier
        };
    }

    // Check if request is allowed
    isRequestAllowed(userId = 'default') {
        const user = this.userLimits.get(userId);
        const limit = this.getUserLimit(userId);
        const now = Date.now();

        // Reset counter if window has passed
        if (now - user.lastRequest > limit.window) {
            user.requests = 0;
            user.lastRequest = now;
            console.log(`🔄 Rate limit window reset for user ${userId}`);
        }

        // Check if under limit
        if (user.requests < limit.requests) {
            user.requests++;
            user.lastRequest = now;
            this.recordRequest(userId, true);
            return { allowed: true, remaining: limit.requests - user.requests };
        }

        this.recordRequest(userId, false);
        
        // Calculate time until reset
        const timeUntilReset = limit.window - (now - user.lastRequest);
        const retryAfter = Math.ceil(timeUntilReset / 1000);
        
        console.log(`🚫 Rate limit exceeded for user ${userId}: ${user.requests}/${limit.requests} requests, reset in ${retryAfter}s`);
        
        return { 
            allowed: false, 
            remaining: 0,
            retryAfter: retryAfter,
            windowEnd: new Date(user.lastRequest + limit.window).toISOString()
        };
    }

    // Record request success/failure for adaptive learning
    recordRequest(userId, success) {
        const user = this.userLimits.get(userId);
        if (!user) return;

        if (success) {
            user.successCount++;
            this.apiHealth.successRate = (this.apiHealth.successRate * 0.9) + 0.1;
        } else {
            user.errorCount++;
            this.apiHealth.errorCount++;
        }

        this.apiHealth.totalRequests++;
        
        // Update user tier based on usage patterns
        this.updateUserTier(userId);
        
        // Update API health metrics
        this.updateApiHealth();
        
        // Save data periodically
        if (this.apiHealth.totalRequests % 100 === 0) {
            this.saveUserData();
        }
    }

    // Update user tier based on usage patterns
    updateUserTier(userId) {
        const user = this.userLimits.get(userId);
        if (!user) return;

        const successRate = user.successCount / (user.successCount + user.errorCount);
        const totalRequests = user.successCount + user.errorCount;

        // Upgrade logic
        if (totalRequests >= 50 && successRate >= 0.9 && user.tier === 'newUser') {
            user.tier = 'regular';
            user.upgradeEligible = false;
            console.log(`🎉 User ${userId} upgraded to regular tier`);
        } else if (totalRequests >= 200 && successRate >= 0.95 && user.tier === 'regular') {
            user.tier = 'power';
            user.upgradeEligible = false;
            console.log(`🚀 User ${userId} upgraded to power tier`);
        }

        // Downgrade logic for poor performance
        if (totalRequests >= 100 && successRate < 0.7 && user.tier !== 'newUser') {
            const newTier = user.tier === 'power' ? 'regular' : 'newUser';
            user.tier = newTier;
            console.log(`⚠️ User ${userId} downgraded to ${newTier} tier due to poor success rate`);
        }
    }

    // Update API health metrics
    updateApiHealth() {
        const now = Date.now();
        
        // Reset health metrics every hour
        if (now - this.apiHealth.lastReset > 3600000) {
            this.apiHealth.successRate = 1.0;
            this.apiHealth.errorCount = 0;
            this.apiHealth.totalRequests = 0;
            this.apiHealth.lastReset = now;
        }
    }

    // Get health-based multiplier for limits
    getHealthMultiplier() {
        const baseMultiplier = 1.0;
        
        // Reduce limits if API is struggling
        if (this.apiHealth.successRate < 0.8) {
            return Math.max(0.5, baseMultiplier * this.apiHealth.successRate);
        }
        
        // Increase limits if API is healthy
        if (this.apiHealth.successRate > 0.95 && this.apiHealth.totalRequests > 1000) {
            return Math.min(1.5, baseMultiplier * (1 + (this.apiHealth.successRate - 0.95) * 2));
        }
        
        return baseMultiplier;
    }

    // Get user statistics
    getUserStats(userId = 'default') {
        const user = this.userLimits.get(userId);
        const limit = this.getUserLimit(userId);
        
        if (!user) return null;
        
        return {
            tier: user.tier,
            currentLimit: limit.requests,
            healthMultiplier: limit.healthMultiplier,
            successRate: user.successCount / Math.max(1, user.successCount + user.errorCount),
            totalRequests: user.successCount + user.errorCount,
            upgradeEligible: user.upgradeEligible,
            nextTier: this.getNextTier(user.tier)
        };
    }

    // Get next tier information
    getNextTier(currentTier) {
        const tiers = ['newUser', 'regular', 'power', 'enterprise'];
        const currentIndex = tiers.indexOf(currentTier);
        
        if (currentIndex >= tiers.length - 1) return null;
        
        const nextTier = tiers[currentIndex + 1];
        const requirements = this.getTierRequirements(nextTier);
        
        return {
            tier: nextTier,
            requirements,
            currentLimit: this.baseLimits[nextTier].requests
        };
    }

    // Get requirements for next tier
    getTierRequirements(tier) {
        switch (tier) {
            case 'regular':
                return { minRequests: 50, minSuccessRate: 0.9 };
            case 'power':
                return { minRequests: 200, minSuccessRate: 0.95 };
            case 'enterprise':
                return { minRequests: 1000, minSuccessRate: 0.98 };
            default:
                return { minRequests: 0, minSuccessRate: 0 };
        }
    }

    // Load user data from disk
    loadUserData() {
        try {
            if (fs.existsSync('./user-limits.json')) {
                const data = JSON.parse(fs.readFileSync('./user-limits.json', 'utf8'));
                this.userLimits = new Map(Object.entries(data.userLimits));
                this.apiHealth = data.apiHealth;
            }
        } catch (error) {
            console.log('📁 No existing user data found, starting fresh');
        }
    }

    // Save user data to disk
    saveUserData() {
        try {
            const data = {
                userLimits: Object.fromEntries(this.userLimits),
                apiHealth: this.apiHealth,
                timestamp: Date.now()
            };
            fs.writeFileSync('./user-limits.json', JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('❌ Failed to save user data:', error.message);
        }
    }

    // Get system-wide statistics
    getSystemStats() {
        return {
            totalUsers: this.userLimits.size,
            apiHealth: this.apiHealth,
            tierDistribution: this.getTierDistribution(),
            recommendations: this.getRecommendations()
        };
    }

    // Get distribution of users across tiers
    getTierDistribution() {
        const distribution = {};
        for (const [_, user] of this.userLimits) {
            distribution[user.tier] = (distribution[user.tier] || 0) + 1;
        }
        return distribution;
    }

    // Get system recommendations
    getRecommendations() {
        const recommendations = [];
        
        if (this.apiHealth.successRate < 0.8) {
            recommendations.push('Consider reducing rate limits due to high error rate');
        }
        
        if (this.apiHealth.totalRequests > 10000) {
            recommendations.push('High request volume - consider scaling infrastructure');
        }
        
        return recommendations;
    }
}

module.exports = AdaptiveRateLimiter;
