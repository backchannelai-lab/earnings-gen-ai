// simple-rag-service.js - NO LANGCHAIN DEPENDENCIES
const fs = require('fs');
const path = require('path');

class SimpleRAGService {
    constructor() {
        this.documents = [];
        this.chunks = [];
    }

    // Simple text chunking without LangChain
    chunkText(text, chunkSize = 1000, overlap = 200) {
        const chunks = [];
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
        let currentChunk = '';
        for (const sentence of sentences) {
            if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                // Add overlap by keeping last few sentences
                const words = currentChunk.split(' ');
                currentChunk = words.slice(-overlap/10).join(' ') + ' ' + sentence;
            } else {
                currentChunk += sentence + '. ';
            }
        }
        
        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }
        
        return chunks;
    }

    // Simple keyword-based search (no embeddings needed)
    searchRelevantChunks(query, limit = 5) {
        const queryWords = query.toLowerCase().split(/\s+/);
        
        const scored = this.chunks.map(chunk => {
            const chunkLower = chunk.text.toLowerCase();
            let score = 0;
            
            // Count keyword matches
            queryWords.forEach(word => {
                const matches = (chunkLower.match(new RegExp(word, 'g')) || []).length;
                score += matches;
            });
            
            // Boost score for exact phrases
            if (chunkLower.includes(query.toLowerCase())) {
                score += 10;
            }
            
            return { ...chunk, score };
        });
        
        return scored
            .filter(chunk => chunk.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    // Add document without LangChain processing
    async addDocument(content, filename) {
        const doc = {
            id: Date.now(),
            filename,
            content,
            addedAt: new Date()
        };
        
        this.documents.push(doc);
        
        // Chunk the document
        const chunks = this.chunkText(content);
        chunks.forEach((chunkText, index) => {
            this.chunks.push({
                id: `${doc.id}_${index}`,
                text: chunkText,
                docId: doc.id,
                filename,
                chunkIndex: index
            });
        });
        
        return doc;
    }

    // Get context for Claude
    getContext(query) {
        const relevantChunks = this.searchRelevantChunks(query);
        return relevantChunks.map(chunk => 
            `[${chunk.filename}] ${chunk.text}`
        ).join('\n\n');
    }

    // Get all documents
    getDocuments() {
        return this.documents;
    }

    // Clear all data
    clear() {
        this.documents = [];
        this.chunks = [];
    }
}

module.exports = SimpleRAGService;
