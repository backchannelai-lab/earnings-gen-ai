// simple-server.js - ZERO LANGCHAIN DEPENDENCIES
const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const SimpleRAGService = require('./simple-rag-service');
const SmartContentProcessor = require('./smart-content-processor');
const AdaptiveRateLimiter = require('./adaptive-rate-limiter');
const ContentCache = require('./content-cache');
require('dotenv').config();

const app = express();

// Port management with fallback options
function findAvailablePort(ports) {
    const net = require('net');
    for (const port of ports) {
        const server = net.createServer();
        try {
            server.listen(port);
            server.close();
            return port;
        } catch (e) {
            continue;
        }
    }
    return 8000; // fallback
}

const port = process.env.PORT || findAvailablePort([8000, 8001, 8002, 8003]);

// Initialize services
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const ragService = new SimpleRAGService();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '..'))); // Serve from parent directory

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Global Error Handler:', err);
    
    // Handle specific error types
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            error: 'Invalid JSON payload',
            details: 'Request body contains malformed JSON'
        });
    }
    
    if (err.type === 'entity.too.large') {
        return res.status(413).json({
            error: 'Payload too large',
            details: 'Request body exceeds 50MB limit'
        });
    }
    
    // Default error response
    res.status(500).json({
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
    next();
});

// CORS - Security hardened
app.use((req, res, next) => {
    // Restrict origins to localhost and specific domains
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:8000',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:8000'
    ];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'false');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Routes
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>EarningsGen AI Server</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                .endpoint { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
                .status { color: #28a745; font-weight: bold; }
                .test-btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
                .test-btn:hover { background: #0056b3; }
                .result { margin-top: 10px; padding: 10px; background: #e9ecef; border-radius: 3px; }
            </style>
        </head>
        <body>
            <h1>🚀 EarningsGen AI Server</h1>
            <p class="status">✅ Server Status: Running</p>
            <p>Timestamp: ${new Date().toISOString()}</p>
            
            <h2>Available Endpoints:</h2>
            <div class="endpoint">
                <h3>Health Check</h3>
                <p><code>/api/health</code> - Server status and document count</p>
                <button class="test-btn" onclick="testEndpoint('/api/health')">Test Health</button>
                <div id="health-result" class="result" style="display:none;"></div>
            </div>
            
            <div class="endpoint">
                <h3>Claude API Test</h3>
                <p><code>/api/test</code> - Test Claude API connection</p>
                <button class="test-btn" onclick="testEndpoint('/api/test')">Test Claude</button>
                <div id="test-result" class="result" style="display:none;"></div>
            </div>
            
            <div class="endpoint">
                <h3>Documents</h3>
                <p><code>/api/documents</code> - View uploaded documents</p>
                <button class="test-btn" onclick="testEndpoint('/api/documents')">View Documents</button>
                <div id="documents-result" class="result" style="display:none;"></div>
            </div>
            
            <script>
                async function testEndpoint(path) {
                    // Create a unique ID for the result div
                    const resultId = path.replace(/\//g, '-').substring(1) + '-result';
                    let resultDiv = document.getElementById(resultId);
                    
                    // If result div doesn't exist, create it
                    if (!resultDiv) {
                        resultDiv = document.createElement('div');
                        resultDiv.id = resultId;
                        resultDiv.className = 'result';
                        resultDiv.style.display = 'block';
                        
                        // Find the parent endpoint div and append the result
                        const endpointDiv = event.target.closest('.endpoint');
                        if (endpointDiv) {
                            endpointDiv.appendChild(resultDiv);
                        }
                    }
                    
                    resultDiv.style.display = 'block';
                    resultDiv.innerHTML = 'Testing...';
                    
                    try {
                        const response = await fetch(path);
                        const data = await response.json();
                        resultDiv.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                    } catch (error) {
                        resultDiv.innerHTML = 'Error: ' + error.message;
                    }
                }
            </script>
        </body>
        </html>
    `);
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        documents: ragService.getDocuments().length
    });
});

app.get('/api/test', async (req, res) => {
    try {
        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 100,
            messages: [{ role: 'user', content: 'Say "API working!"' }]
        });
        res.json({ success: true, response: message.content[0].text });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/documents', async (req, res) => {
    try {
        const { content, filename } = req.body;
        const doc = await ragService.addDocument(content, filename);
        res.json({ success: true, document: doc });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/documents', (req, res) => {
    res.json({ documents: ragService.getDocuments() });
});

// New endpoints for improved features
app.get('/api/stats', (req, res) => {
    const userId = req.headers['x-user-id'] || 'default';
    res.json({
        user: rateLimiter.getUserStats(userId),
        system: rateLimiter.getSystemStats(),
        cache: contentCache.getCacheStats(),
        processing: {
            smartChunking: true,
            contentCaching: true,
            adaptiveRateLimiting: true
        }
    });
});

app.get('/api/cache/clear', async (req, res) => {
    try {
        await contentCache.clearAllCache();
        res.json({ success: true, message: 'Cache cleared successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/cache/stats', (req, res) => {
    res.json(contentCache.getCacheStats());
});

app.get('/api/rate-limits', (req, res) => {
    const userId = req.headers['x-user-id'] || 'default';
    res.json({
        user: rateLimiter.getUserStats(userId),
        system: rateLimiter.getSystemStats()
    });
});

// Reset user rate limits (for development/testing)
app.post('/api/rate-limits/reset', (req, res) => {
    const userId = req.headers['x-user-id'] || 'default';
    try {
        // Reset the user's rate limit counters
        const user = rateLimiter.userLimits.get(userId);
        if (user) {
            user.requests = 0;
            user.lastRequest = 0;
            console.log(`🔄 Reset rate limits for user: ${userId}`);
        }
        res.json({ success: true, message: 'Rate limits reset successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get current rate limit status for a user
app.get('/api/rate-limits/status', (req, res) => {
    const userId = req.headers['x-user-id'] || 'default';
    const user = rateLimiter.userLimits.get(userId);
    const limit = rateLimiter.getUserLimit(userId);
    
    if (!user) {
        return res.json({ 
            status: 'new_user',
            message: 'User not found, will be created on first request'
        });
    }
    
    const now = Date.now();
    const timeSinceLastRequest = now - user.lastRequest;
    const windowRemaining = limit.window - timeSinceLastRequest;
    
    res.json({
        status: 'active',
        tier: user.tier,
        currentLimit: limit.requests,
        requestsUsed: user.requests,
        requestsRemaining: Math.max(0, limit.requests - user.requests),
        timeSinceLastRequest: Math.floor(timeSinceLastRequest / 1000),
        windowRemaining: Math.floor(windowRemaining / 1000),
        nextReset: new Date(user.lastRequest + limit.window).toISOString()
    });
});

// Initialize smart services
const smartProcessor = new SmartContentProcessor();
const rateLimiter = new AdaptiveRateLimiter();
const contentCache = new ContentCache();

// Helper function to check if a snippet is a disclaimer/intro section
const isDisclaimerSection = (snippet) => {
    const disclaimerKeywords = [
        'forward-looking', 'cautionary', 'disclaimer', 'moderator', 'welcome', 'recording',
        'securities', 'exchange commission', 'sec', 'investor relations', 'www.', 'website',
        'prepared remarks', 'question and answer', 'q&a', 'turn the conference over'
    ];
    
    const snippetLower = snippet.toLowerCase();
    const disclaimerMatches = disclaimerKeywords.filter(keyword => 
        snippetLower.includes(keyword)
    ).length;
    
    // If more than 2 disclaimer keywords found, consider it a disclaimer section
    return disclaimerMatches >= 2;
};

// Helper function to score financial data content
const calculateFinancialDataScore = (snippet) => {
    const financialPatterns = [
        /\$\d+\.?\d*\s*(billion|million|thousand)?/gi,  // Dollar amounts
        /\d+\.?\d*%/gi,                                   // Percentages
        /\d+\.?\d*\s*(billion|million|thousand)/gi,      // Number + unit
        /q[1-4]\s*\d{4}/gi,                              // Quarter references
        /year-over-year|yoy|quarter-over-quarter/gi,      // Comparison terms
        /revenue|earnings|profit|loss|margin|ratio/gi     // Financial terms
    ];
    
    let score = 0;
    financialPatterns.forEach(pattern => {
        const matches = (snippet.match(pattern) || []).length;
        score += matches * 10; // Boost score for financial data
    });
    
    return score;
};

// Helper function to extract relevant information from documents
const extractRelevantDocumentInfo = async (query, documents) => {
    try {
        console.log('🔍 Extracting relevant info for query:', query.substring(0, 100) + '...');
        
        // Enhanced keyword-based relevance scoring with financial data focus
        const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 3);
        const relevantSnippets = [];
        
        for (const doc of documents) {
            if (doc.text) {
                const docText = doc.text.toLowerCase();
                let relevanceScore = 0;
                let relevantSections = [];
                
                // Score relevance based on keyword matches
                for (const word of queryWords) {
                    try {
                        // Escape special regex characters to prevent errors
                        const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const matches = (docText.match(new RegExp(escapedWord, 'gi')) || []).length;
                        
                        if (matches > 0) {
                            relevanceScore += matches;
                            
                            // Find context around matches
                            const index = docText.indexOf(word);
                            if (index !== -1) {
                                const start = Math.max(0, index - 150);
                                const end = Math.min(docText.length, index + 150);
                                const snippet = doc.text.substring(start, end).trim();
                                
                                // Filter out disclaimer/intro sections and prioritize financial data
                                if (snippet.length > 50 && !isDisclaimerSection(snippet)) {
                                    // Boost score for snippets with financial data
                                    const financialDataScore = calculateFinancialDataScore(snippet);
                                    relevanceScore += financialDataScore;
                                    
                                    relevantSections.push({
                                        snippet: snippet,
                                        financialScore: financialDataScore
                                    });
                                }
                            }
                        }
                    } catch (error) {
                        console.log('⚠️ Skipping word due to regex error:', word, error.message);
                        continue;
                    }
                }
                
                // ADDITIONAL: Search for financial data even if query doesn't match exactly
                // This ensures we find relevant financial metrics for financial queries
                if (query.toLowerCase().includes('revenue') || 
                    query.toLowerCase().includes('trend') || 
                    query.toLowerCase().includes('financial') ||
                    query.toLowerCase().includes('earnings') ||
                    query.toLowerCase().includes('cost') ||
                    query.toLowerCase().includes('billion') ||
                    query.toLowerCase().includes('million')) {
                    
                    console.log('🔍 Financial query detected, searching for financial data sections...');
                    
                    // Find sections with financial data patterns
                    const financialPatterns = [
                        /\$\d+\.?\d*\s*(billion|million|thousand)/gi,
                        /\d+\.?\d*%/gi,
                        /q[1-4]\s*\d{4}/gi,
                        /year-over-year|yoy/gi
                    ];
                    
                    for (const pattern of financialPatterns) {
                        const matches = docText.match(pattern);
                        if (matches) {
                            for (const match of matches) {
                                const index = docText.indexOf(match);
                                if (index !== -1) {
                                    const start = Math.max(0, index - 200);
                                    const end = Math.min(docText.length, index + 200);
                                    const snippet = doc.text.substring(start, end).trim();
                                    
                                    if (snippet.length > 100 && !isDisclaimerSection(snippet)) {
                                        const financialScore = calculateFinancialDataScore(snippet);
                                        if (financialScore > 20) { // Only high-scoring financial snippets
                                            relevantSections.push({
                                                snippet: snippet,
                                                financialScore: financialScore,
                                                source: 'financial-pattern-match'
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                
                // If document is relevant, include it
                if (relevanceScore > 0 && relevantSections.length > 0) {
                    // Sort sections by financial data score
                    relevantSections.sort((a, b) => b.financialScore - a.financialScore);
                    
                    relevantSnippets.push({
                        source: doc.name || 'Document',
                        relevance: relevanceScore,
                        snippets: relevantSections.slice(0, 2).map(s => s.snippet) // Get top 2 snippets
                    });
                }
            }
        }
        
        // Sort by relevance and format
        relevantSnippets.sort((a, b) => b.relevance - a.relevance);
        
        if (relevantSnippets.length === 0) {
            return null;
        }
        
        // Format relevant information
        let formattedInfo = '';
        for (const snippet of relevantSnippets.slice(0, 3)) { // Top 3 most relevant
            formattedInfo += `Source: ${snippet.source}\n`;
            formattedInfo += `Relevance: ${snippet.relevance} matches\n`;
            formattedInfo += `Context: ${snippet.snippets.join(' ... ')}\n\n`;
        }
        
        console.log('✅ Extracted relevant info from', relevantSnippets.length, 'documents');
        console.log('📝 Extracted context preview:', formattedInfo.substring(0, 200) + '...');
        return formattedInfo.trim();
        
    } catch (error) {
        console.error('❌ Error extracting document info:', error);
        return null;
    }
};

// Add the missing analyze-context endpoint that the frontend expects
app.post('/api/analyze-context', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] || 'default';
        
        // Adaptive rate limiting check
        const rateLimitCheck = rateLimiter.isRequestAllowed(userId);
        if (!rateLimitCheck.allowed) {
            return res.status(429).json({ 
                error: 'Rate limit exceeded. Please wait before making another request.',
                retryAfter: rateLimitCheck.retryAfter,
                tier: rateLimiter.getUserLimit(userId).tier
            });
        }

        console.log('📝 Analyze-context request body:', req.body);
        
        const { prompt, documents } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }
        
        console.log('📚 Documents provided:', documents ? documents.length : 0);

        // Check cache first
        const cachedResult = await contentCache.getCachedContent(prompt, prompt);
        if (cachedResult) {
            console.log('⚡ Serving from cache');
            rateLimiter.recordRequest(userId, true);
            
            return res.json({ 
                success: true, 
                content: [{ text: cachedResult.content }],
                cached: true,
                userStats: rateLimiter.getUserStats(userId)
            });
        }

                // Enhanced context analysis with document search
        console.log('🧠 Sending enhanced context analysis request to Claude...');
        
        // Build enhanced prompt with document context
        let enhancedPrompt = prompt;
        
        if (documents && documents.length > 0) {
            console.log('🔍 Searching documents for relevant context...');
            
            // Extract relevant information from documents
            const relevantInfo = await extractRelevantDocumentInfo(prompt, documents);
            
            if (relevantInfo) {
                enhancedPrompt = `${prompt}

=== DOCUMENT CONTEXT AVAILABLE ===
The following information has been extracted from your uploaded memory documents and is available for analysis:

${relevantInfo}

=== INSTRUCTIONS ===
You MUST use this document context to provide specific, data-driven insights. Include:
- Specific numbers, metrics, and facts from the documents
- Source attribution (which document the data comes from)
- Comparative analysis when possible
- Historical trends if mentioned in the documents

IMPORTANT FORMATTING REQUIREMENTS:
- Do NOT start with "From the provided document context" or similar phrases
- Format your response with clear sections and bullet points
- Use proper line breaks between sections
- Make bullet points easy to read with proper spacing
- Include source attribution at the end, not in the opening

Do NOT say you don't have access to documents - you DO have access to the context above.`;
                
                console.log('📝 Enhanced prompt with document context');
            }
        }
        
        console.log('📝 Final prompt length:', enhancedPrompt.length);
        console.log('📝 Final prompt preview:', enhancedPrompt.substring(0, 300) + '...');
        console.log('📝 Document context included:', enhancedPrompt.includes('RELEVANT DOCUMENT CONTEXT:'));
        
        try {
            const response = await anthropic.messages.create({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 2000,
                messages: [{ 
                    role: 'user', 
                    content: enhancedPrompt 
                }]
            });
            
            if (response.content && response.content[0] && response.content[0].text) {
                const finalResponse = response.content[0].text;
                console.log('✅ Context analysis completed');
                console.log('📝 AI Response:', finalResponse);
                console.log('📝 Response length:', finalResponse.length);
                
                // Cache the result
                await contentCache.cacheContent(prompt, prompt, finalResponse, {
                    processingMethod: 'direct-context-analysis'
                });
                
                rateLimiter.recordRequest(userId, true);
                
                console.log('📤 Sending to frontend:', { text: finalResponse });
                res.json({
                    success: true,
                    content: [{ text: finalResponse }],
                    cached: false,
                    processingMethod: 'direct-context-analysis',
                    userStats: rateLimiter.getUserStats(userId)
                });
            } else {
                throw new Error('Invalid response from Claude');
            }
            
        } catch (error) {
            console.error('❌ Error in context analysis:', error.message);
            throw error;
        }
        
    } catch (error) {
        console.error('❌ Analyze-context API Error:', error);
        
        const userId = req.headers['x-user-id'] || 'default';
        rateLimiter.recordRequest(userId, false);
        
        if (error.message && error.message.includes('rate_limit')) {
            return res.status(429).json({ 
                error: 'Claude API rate limit exceeded. Please wait before trying again.',
                details: error.message,
                retryAfter: 60
            });
        }
        
        res.status(500).json({ 
            error: error.message, 
            details: 'Check server logs for more information' 
        });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] || 'default';
        
        // Adaptive rate limiting check
        const rateLimitCheck = rateLimiter.isRequestAllowed(userId);
        if (!rateLimitCheck.allowed) {
            return res.status(429).json({ 
                error: 'Rate limit exceeded. Please wait before making another request.',
                retryAfter: rateLimitCheck.retryAfter,
                tier: rateLimiter.getUserLimit(userId).tier
            });
        }

        console.log('📝 Chat request body:', req.body);
        
        // Handle both 'prompt' and 'message' fields for compatibility
        const { prompt, message, documents } = req.body;
        const content = prompt || message;

        if (!content) {
            console.error('❌ No prompt or message provided');
            return res.status(400).json({ 
                error: 'Either prompt or message is required',
                received: req.body 
            });
        }
        
        console.log('📚 Chat request includes', documents ? documents.length : 0, 'documents');

        // Check cache first
        const cachedResult = await contentCache.getCachedContent(content, message || prompt);
        if (cachedResult) {
            console.log('⚡ Serving from cache');
            rateLimiter.recordRequest(userId, true);
            
            return res.json({ 
                success: true, 
                response: cachedResult.content,
                content: [{ text: cachedResult.content }], // Backward compatibility with frontend
                contextUsed: false,
                cached: true,
                userStats: rateLimiter.getUserStats(userId)
            });
        }

        // Enhanced chat with document context
        console.log('🧠 Processing chat with document context...');
        
        // Build enhanced prompt with document context
        let enhancedPrompt = content;
        
        if (documents && documents.length > 0) {
            console.log('🔍 Searching documents for relevant context...');
            
            // Extract relevant information from documents
            const relevantInfo = await extractRelevantDocumentInfo(content, documents);
            
            if (relevantInfo) {
                enhancedPrompt = `${content}

=== DOCUMENT CONTEXT AVAILABLE ===
The following information has been extracted from your uploaded memory documents and is available for analysis:

${relevantInfo}

=== INSTRUCTIONS ===
You MUST use this document context to provide specific, data-driven insights. Include:
- Specific numbers, metrics, and facts from the documents
- Source attribution (which document the data comes from)
- Comparative analysis when possible
- Historical trends if mentioned in the documents

IMPORTANT FORMATTING REQUIREMENTS:
- Do NOT start with "From the provided document context" or similar phrases
- Format your response with clear sections and bullet points
- Use proper line breaks between sections
- Make bullet points easy to read with proper spacing
- Include source attribution at the end, not in the opening

Do NOT say you don't have access to documents - you DO have access to the context above.`;
                
                console.log('📝 Enhanced chat prompt with document context');
            }
        }
        
        // Smart content processing with enhanced prompt
        const processedChunks = smartProcessor.chunkContent(enhancedPrompt, message || prompt);
        const chunkSummary = smartProcessor.getChunkSummary(processedChunks);
        
        console.log(`📊 Smart chunking: ${chunkSummary.totalChunks} chunks, ${chunkSummary.totalContentLength} chars`);

        // Process chunks intelligently
        let finalResponse = '';
        let processedChunksCount = 0;
        
        for (const chunk of processedChunks) {
            if (processedChunksCount >= 3) { // Limit to 3 chunks to avoid rate limits
                console.log('⚠️ Limiting to 3 chunks to prevent rate limiting');
                break;
            }
            
            console.log(`🔄 Processing chunk ${processedChunksCount + 1}/${processedChunksCount.length}: ${chunk.content.length} chars`);
            
            try {
                const response = await anthropic.messages.create({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 2000,
                    messages: [{ role: 'user', content: chunk.content }]
                });
                
                if (response.content && response.content[0] && response.content[0].text) {
                    finalResponse += (finalResponse ? '\n\n' : '') + response.content[0].text;
                    processedChunksCount++;
                }
                
                // Small delay between chunks to be respectful to API
                if (processedChunksCount < processedChunks.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
            } catch (error) {
                console.error(`❌ Error processing chunk ${processedChunksCount + 1}:`, error.message);
                if (error.message.includes('rate_limit')) {
                    break; // Stop processing if we hit rate limits
                }
            }
        }
        
        if (!finalResponse) {
            throw new Error('Failed to process any content chunks');
        }
        
        console.log('✅ Content processing completed');
        
        // Cache the result for future use
        await contentCache.cacheContent(content, message || prompt, finalResponse, {
            chunksProcessed: processedChunksCount,
            totalChunks: processedChunks.length,
            processingMethod: 'smart-chunking'
        });
        
        // Record successful request
        rateLimiter.recordRequest(userId, true);
        
        res.json({ 
            success: true, 
            response: finalResponse,
            content: [{ text: finalResponse }], // Backward compatibility with frontend
            contextUsed: documents && documents.length > 0,
            cached: false,
            chunkSummary,
            userStats: rateLimiter.getUserStats(userId)
        });
        
    } catch (error) {
        console.error('❌ Chat API Error:', error);
        
        // Record failed request
        const userId = req.headers['x-user-id'] || 'default';
        rateLimiter.recordRequest(userId, false);
        
        // Handle specific Claude rate limit errors
        if (error.message && error.message.includes('rate_limit')) {
            return res.status(429).json({ 
                error: 'Claude API rate limit exceeded. Please wait before trying again.',
                details: error.message,
                retryAfter: 60
            });
        }
        
        res.status(500).json({ 
            error: error.message,
            details: 'Check server logs for more information'
        });
    }
});

// WebSocket server for real-time features
const server = app.listen(port, () => {
    console.log(`✅ Simple server running at http://localhost:${port}`);
    console.log(`✅ No LangChain dependencies!`);
    console.log(`✅ Claude model: claude-sonnet-4-20250514`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is busy. Trying ${port + 1}...`);
        app.listen(port + 1, () => {
            console.log(`✅ Server running on port ${port + 1} instead`);
        });
    } else {
        console.error('❌ Server error:', err);
    }
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('📱 WebSocket client connected');
    
    ws.on('message', async (data) => {
        try {
            const message = JSON.parse(data);
            
            if (message.type === 'chat') {
                const context = ragService.getContext(message.content);
                const prompt = context 
                    ? `Context:\n${context}\n\nUser: ${message.content}`
                    : message.content;
                    
                const response = await anthropic.messages.create({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 2000,
                    messages: [{ role: 'user', content: prompt }]
                });
                
                ws.send(JSON.stringify({
                    type: 'response',
                    content: response.content[0].text,
                    contextUsed: !!context
                }));
            }
            
            if (message.type === 'add_document') {
                const doc = await ragService.addDocument(
                    message.content, 
                    message.filename
                );
                ws.send(JSON.stringify({
                    type: 'document_added',
                    document: doc
                }));
            }
            
        } catch (error) {
            ws.send(JSON.stringify({
                type: 'error',
                message: error.message
            }));
        }
    });
    
    ws.on('close', () => {
        console.log('📱 WebSocket client disconnected');
    });
});

module.exports = app;
