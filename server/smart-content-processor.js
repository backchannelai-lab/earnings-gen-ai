// smart-content-processor.js - Intelligent content processing
const fs = require('fs');

console.log('🚀 SmartContentProcessor module loaded!');

class SmartContentProcessor {
    constructor() {
        this.maxChunkSize = 25000; // Claude's safe limit with buffer
        this.overlapSize = 1000; // Maintain context between chunks
    }

    // Intelligent chunking by semantic boundaries
    chunkContent(content, query = '') {
        console.log(`🔍 chunkContent called with ${content.length} chars`);
        
        if (content.length <= this.maxChunkSize) {
            console.log(`📏 Content within limit, returning single chunk`);
            return [{ content, relevance: this.calculateRelevance(content, query) }];
        }

        console.log(`🧠 Smart chunking: ${content.length} chars → multiple chunks`);
        
        // Split by major sections first
        console.log(`🔧 Calling splitBySections...`);
        const sections = this.splitBySections(content);
        console.log(`📊 Got ${sections.length} sections from splitBySections`);
        
        const chunks = [];
        
        for (const section of sections) {
            if (section.length <= this.maxChunkSize) {
                chunks.push({
                    content: section,
                    relevance: this.calculateRelevance(section, query),
                    type: 'section'
                });
            } else {
                // Further split long sections by paragraphs
                const paragraphChunks = this.splitByParagraphs(section);
                chunks.push(...paragraphChunks.map(chunk => ({
                    ...chunk,
                    type: 'paragraph'
                })));
            }
        }

        // Sort by relevance and filter out low-quality content
        chunks.sort((a, b) => b.relevance - a.relevance);
        
        // Filter out chunks with very low relevance (disclaimers, legal text)
        // Use a lower threshold to avoid filtering out too much content
        const filteredChunks = chunks.filter(chunk => chunk.relevance > -0.5);
        
        if (filteredChunks.length < chunks.length) {
            console.log(`🧹 Filtered out ${chunks.length - filteredChunks.length} low-relevance chunks`);
        }
        
        // Ensure we have at least some content
        if (filteredChunks.length === 0) {
            console.log(`⚠️ All chunks filtered out, keeping top 2 chunks for processing`);
            return this.addOverlap(chunks.slice(0, 2));
        }
        
        // Add overlap between chunks for context continuity
        return this.addOverlap(filteredChunks);
    }

    // Split by major document sections
    splitBySections(content) {
        console.log(`🔍 Splitting content: ${content.length} characters`);
        
        const sectionPatterns = [
            /\n\s*#{1,6}\s+.+/g,           // Markdown headers
            /\n\s*[A-Z][A-Z\s]{2,}\n/g,    // ALL CAPS section headers
            /\n\s*\d+\.\s+[A-Z][^.]*\n/g,  // Numbered sections
            /\n\s*[A-Z][^.]*:\n/g,         // Colon-terminated headers
        ];

        let sections = [content];
        
        for (const pattern of sectionPatterns) {
            const matches = content.match(pattern);
            if (matches && matches.length > 1) {
                sections = this.splitByPattern(content, pattern);
                break;
            }
        }
        
        console.log(`📊 Initial sections: ${sections.length}`);

        // Filter out disclaimer sections more aggressively
        const filteredSections = sections.filter(section => {
            const sectionLower = section.toLowerCase();
            
            // Check for disclaimer content
            const disclaimerKeywords = [
                'disclaimer', 'legal', 'forward-looking', 'cautionary',
                'apologize', 'notice', 'standard', 'portion', 'moderator',
                'introduction', 'opening remarks', 'good morning', 'welcome'
            ];
            
            const businessKeywords = [
                'revenue', 'earnings', 'profit', 'growth', 'financial',
                'quarter', 'performance', 'strategy', 'initiative',
                'business', 'operational', 'market', 'segment',
                'medical', 'health', 'care', 'provider', 'network',
                'medicare', 'medicaid', 'aca', 'employer', 'portfolio',
                'billion', 'million', 'cost', 'trend', 'utilization'
            ];
            
            const disclaimerCount = disclaimerKeywords.filter(keyword => 
                sectionLower.includes(keyword)
            ).length;
            
            const businessCount = businessKeywords.filter(keyword => 
                sectionLower.includes(keyword)
            ).length;
            
            // Less aggressive filtering - keep sections with substantial business content
            // Allow some disclaimer content as long as there's significant business content
            const shouldKeep = businessCount >= 2 || (businessCount >= 1 && disclaimerCount < 3);
            
            if (!shouldKeep) {
                console.log(`🚫 Filtering section: business=${businessCount}, disclaimer=${disclaimerCount}`);
                console.log(`📝 Section preview: ${section.substring(0, 100)}...`);
            }
            
            return shouldKeep;
        });

        if (filteredSections.length < sections.length) {
            console.log(`🧹 Filtered out ${sections.length - filteredSections.length} disclaimer sections`);
        }

        console.log(`📊 After filtering: ${filteredSections.length} sections`);
        
        const finalSections = filteredSections.filter(s => s.trim().length > 100);
        console.log(`📊 Final sections (length > 100): ${finalSections.length}`);
        
        return finalSections;
    }

    // Split by paragraphs with smart boundaries
    splitByParagraphs(content) {
        const paragraphs = content.split(/\n\s*\n/);
        const chunks = [];
        let currentChunk = '';

        for (const paragraph of paragraphs) {
            if ((currentChunk + paragraph).length <= this.maxChunkSize) {
                currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
            } else {
                if (currentChunk) {
                    chunks.push({
                        content: currentChunk.trim(),
                        relevance: this.calculateRelevance(currentChunk, ''),
                        type: 'paragraph'
                    });
                }
                currentChunk = paragraph;
            }
        }

        if (currentChunk.trim()) {
            chunks.push({
                content: currentChunk.trim(),
                relevance: this.calculateRelevance(currentChunk, ''),
                type: 'paragraph'
            });
        }

        return chunks;
    }

    // Calculate relevance score based on query
    calculateRelevance(content, query) {
        if (!query) return 0.5; // Default relevance for no query
        
        const queryWords = query.toLowerCase().split(/\s+/);
        const contentLower = content.toLowerCase();
        
        let score = 0;
        let exactMatches = 0;
        
        // Penalize disclaimer/legal content
        const disclaimerPatterns = [
            /disclaimer/i, /legal/i, /forward-looking/i, /cautionary/i,
            /moderator/i, /introduction/i, /opening remarks/i,
            /apologize/i, /notice/i, /standard/i, /portion/i
        ];
        
        for (const pattern of disclaimerPatterns) {
            if (pattern.test(contentLower)) {
                score -= 5; // Heavy penalty for disclaimer content
            }
        }
        
        // Boost for financial/business content
        const businessPatterns = [
            /revenue/i, /earnings/i, /profit/i, /growth/i, /financial/i,
            /quarter/i, /performance/i, /strategy/i, /initiative/i,
            /business/i, /operational/i, /market/i, /segment/i,
            /medical/i, /health/i, /care/i, /provider/i, /network/i,
            /utilization/i, /quality/i, /satisfaction/i, /investment/i
        ];
        
        for (const pattern of businessPatterns) {
            if (pattern.test(contentLower)) {
                score += 3; // Boost for business content
            }
        }
        
        // Word matching
        for (const word of queryWords) {
            if (word.length < 3) continue; // Skip short words
            
            try {
                // Escape special regex characters to prevent errors
                const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(escapedWord, 'gi');
                const matches = (contentLower.match(regex) || []).length;
                score += matches;
                
                // Boost score for exact phrases
                if (contentLower.includes(word)) {
                    exactMatches++;
                }
            } catch (error) {
                console.warn(`⚠️ Regex error with word "${word}":`, error.message);
                // Fallback to simple string matching
                const matches = (contentLower.match(new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length;
                score += matches;
            }
        }
        
        // Normalize and ensure minimum score
        const normalizedScore = Math.min(1.0, Math.max(0.0, (score + exactMatches * 2) / (queryWords.length * 10)));
        return normalizedScore;
    }

    // Add overlap between chunks for context continuity
    addOverlap(chunks) {
        if (chunks.length <= 1) return chunks;
        
        const enhancedChunks = [];
        
        for (let i = 0; i < chunks.length; i++) {
            let enhancedContent = chunks[i].content;
            
            // Add overlap from previous chunk
            if (i > 0) {
                const prevChunk = chunks[i - 1];
                const overlapText = prevChunk.content.slice(-this.overlapSize);
                enhancedContent = `[Previous context: ${overlapText}]\n\n${enhancedContent}`;
            }
            
            // Add overlap to next chunk
            if (i < chunks.length - 1) {
                const nextChunk = chunks[i + 1];
                const overlapText = nextChunk.content.slice(0, this.overlapSize);
                enhancedContent = `${enhancedContent}\n\n[Next context: ${overlapText}]`;
            }
            
            enhancedChunks.push({
                ...chunks[i],
                content: enhancedContent,
                originalLength: chunks[i].content.length,
                enhancedLength: enhancedContent.length
            });
        }
        
        return enhancedChunks;
    }

    // Split content by specific pattern
    splitByPattern(content, pattern) {
        const matches = content.match(pattern);
        if (!matches) return [content];
        
        const sections = [];
        let lastIndex = 0;
        
        for (const match of matches) {
            const matchIndex = content.indexOf(match, lastIndex);
            if (matchIndex > lastIndex) {
                sections.push(content.slice(lastIndex, matchIndex).trim());
            }
            lastIndex = matchIndex;
        }
        
        // Add remaining content
        if (lastIndex < content.length) {
            sections.push(content.slice(lastIndex).trim());
        }
        
        return sections.filter(s => s.length > 100);
    }

    // Get chunk summary for user feedback
    getChunkSummary(chunks) {
        return {
            totalChunks: chunks.length,
            totalContentLength: chunks.reduce((sum, chunk) => sum + chunk.originalLength, 0),
            chunkDetails: chunks.map((chunk, index) => ({
                chunkNumber: index + 1,
                originalLength: chunk.originalLength,
                enhancedLength: chunk.enhancedLength,
                relevance: chunk.relevance.toFixed(2),
                type: chunk.type,
                preview: chunk.content.substring(0, 100) + '...'
            }))
        };
    }
}

module.exports = SmartContentProcessor;
