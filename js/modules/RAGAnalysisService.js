// RAG Analysis Service - Advanced Prompt Engineering Strategy
// Based on the provided framework for sophisticated financial analysis

class RAGAnalysisService {
    constructor() {
        this.analysisTypes = {
            'quick': { maxTokens: 1000, temperature: 0.3 },
            'detailed': { maxTokens: 2000, temperature: 0.3 }
        };
    }

    async analyzeSelection(selectedText, context, documents, analysisType = 'quick') {
        try {
            console.log('🔍 RAG: Starting advanced analysis');
            
            // 1. Classify the selection type
            const selectionType = this.classifySelectionType(selectedText);
            console.log('🔍 RAG: Selection classified as:', selectionType);
            
            // 2. Find relevant historical context
            const searchResults = this.findRelevantContext(selectedText, documents, selectionType);
            console.log('🔍 RAG: Found', searchResults.length, 'relevant passages');
            
            // 3. Build context-aware prompt
            const prompt = this.buildAnalysisPrompt(selectedText, searchResults, selectionType, analysisType);
            console.log('🔍 RAG: Built sophisticated prompt');
            
            // 4. Get analysis from Claude via server
            const response = await this.callClaudeAPI(prompt, analysisType);
            console.log('🔍 RAG: Claude analysis completed');
            
            // 5. Parse and structure the response
            return this.parseAnalysisResponse(response, searchResults, selectionType);
            
        } catch (error) {
            console.error('❌ RAG: Analysis failed:', error);
            throw new Error('Advanced analysis failed. Please try again.');
        }
    }

    classifySelectionType(text) {
        const lowerText = text.toLowerCase();
        
        // Financial metrics
        if (/\d+\.?\d*%|\d+\.?\d*\s*(billion|million|thousand)|revenue|ebitda|margin|ratio|growth/.test(lowerText)) {
            return 'financial_metric';
        }
        
        // Forward-looking statements
        if (/will|expect|anticipate|project|forecast|outlook|guidance|future|next|upcoming/.test(lowerText)) {
            return 'forward_looking';
        }
        
        // Risk factors
        if (/risk|challenge|uncertainty|volatility|headwind|pressure|concern|caution/.test(lowerText)) {
            return 'risk_factor';
        }
        
        // Positive indicators
        if (/strong|improved|growth|increase|positive|success|achievement|milestone/.test(lowerText)) {
            return 'positive_indicator';
        }
        
        return 'general_statement';
    }

    findRelevantContext(selectedText, documents, selectionType) {
        if (!documents || documents.length === 0) {
            return [];
        }

        const searchTerms = this.extractSearchTerms(selectedText);
        const relevantPassages = [];

        documents.forEach(doc => {
            const content = doc.text || doc.content || '';
            if (!content || content.length < 10) return;

            let relevanceScore = 0;
            let relevantText = '';

            // Calculate relevance based on search terms
            searchTerms.forEach(term => {
                const regex = new RegExp(term, 'gi');
                const matches = content.match(regex);
                if (matches) {
                    relevanceScore += matches.length * 0.1;
                }
            });

            // Boost score for document type relevance
            if (selectionType === 'financial_metric' && content.includes('%')) {
                relevanceScore += 0.5;
            }
            if (selectionType === 'forward_looking' && /will|expect|future/.test(content)) {
                relevanceScore += 0.3;
            }

            if (relevanceScore > 0.1) {
                // Extract relevant sentence around matches
                const sentences = this.extractSentences(content);
                const bestSentence = this.findBestSentence(sentences, searchTerms);
                
                relevantPassages.push({
                    document: doc.name,
                    text: bestSentence,
                    score: Math.min(relevanceScore, 10),
                    metadata: {
                        chunkType: this.classifySelectionType(bestSentence),
                        documentName: doc.name
                    }
                });
            }
        });

        // Sort by relevance and limit results
        return relevantPassages
            .sort((a, b) => b.score - a.score)
            .slice(0, analysisType === 'detailed' ? 8 : 5);
    }

    extractSearchTerms(text) {
        // Remove common words and extract meaningful terms
        const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those']);
        
        return text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.has(word))
            .slice(0, 8); // Limit to 8 most relevant terms
    }

    extractSentences(text) {
        return text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    }

    findBestSentence(sentences, searchTerms) {
        let bestSentence = sentences[0] || '';
        let bestScore = 0;

        sentences.forEach(sentence => {
            let score = 0;
            searchTerms.forEach(term => {
                if (sentence.toLowerCase().includes(term.toLowerCase())) {
                    score += 1;
                }
            });
            if (score > bestScore) {
                bestScore = score;
                bestSentence = sentence;
            }
        });

        return bestSentence.trim();
    }

    buildAnalysisPrompt(selectedText, searchResults, selectionType, analysisType) {
        const basePrompt = this.getBasePromptForType(selectionType, analysisType);
        const historicalContext = this.formatHistoricalContext(searchResults);
        const selectionContext = this.formatSelectionContext(selectedText);
        const analysisInstructions = this.getAnalysisInstructions(selectionType, analysisType);

        return `${basePrompt}

${historicalContext}

${selectionContext}

${analysisInstructions}`;
    }

    getBasePromptForType(selectionType, analysisType) {
        const baseRole = `You are an expert financial communications analyst specializing in earnings calls and investor relations. You help companies craft compelling, accurate, and consistent earnings narratives by analyzing draft content against historical communications.`;
        
        const specificExpertise = {
            'financial_metric': `You have deep expertise in financial metrics presentation, ensuring accuracy, context, and appropriate framing of numbers.`,
            'forward_looking': `You specialize in forward-looking statements, ensuring appropriate disclaimers, consistency with past guidance, and balanced tone.`,
            'risk_factor': `You focus on risk communication, helping balance transparency with confidence and comparing current risk discussions to historical patterns.`,
            'positive_indicator': `You analyze positive messaging for authenticity, support from data, and consistency with historical growth narratives.`,
            'general_statement': `You provide comprehensive analysis of messaging tone, clarity, and strategic positioning.`
        };
        
        return `${baseRole}

${specificExpertise[selectionType] || specificExpertise['general_statement']}

Your analysis should be ${analysisType === 'detailed' ? 'comprehensive and nuanced' : 'concise and actionable'}.`;
    }

    formatHistoricalContext(searchResults) {
        if (searchResults.length === 0) {
            return `HISTORICAL CONTEXT:
No directly relevant historical content found. Analysis will focus on general best practices.`;
        }
        
        const formattedResults = searchResults.map((result, index) => {
            const relevanceIndicator = result.score > 8 ? '🔥 HIGHLY RELEVANT' : 
                                     result.score > 6 ? '📊 RELEVANT' : 
                                     '📝 CONTEXTUAL';
            
            return `[SOURCE ${index + 1}] ${relevanceIndicator}
Document: ${result.document}
Content Type: ${result.metadata.chunkType || 'general'}
Relevance: ${(result.score).toFixed(1)}/10

"${result.text.trim()}"

---`;
        }).join('\n');
        
        return `HISTORICAL CONTEXT FROM YOUR DOCUMENTS:
${formattedResults}`;
    }

    formatSelectionContext(selectedText) {
        return `CURRENT DRAFT CONTENT:
Selected Text: "${selectedText}"

Please analyze this text against the historical context provided above.`;
    }

    getAnalysisInstructions(selectionType, analysisType) {
        const baseInstructions = `ANALYSIS INSTRUCTIONS:
Compare the selected draft text against the historical context and provide insights on:`;
        
        const detailedInstructions = {
            'financial_metric': `
1. ACCURACY & CONSISTENCY: How do the numbers align with historical reporting patterns?
2. CONTEXT & FRAMING: Is the metric presented with appropriate context and benchmarks?
3. LANGUAGE PATTERNS: Does the language around metrics match historical tone and style?
4. INVESTOR EXPECTATIONS: How might this compare to what investors expect based on historical communications?
${analysisType === 'detailed' ? `
5. DETAILED RECOMMENDATIONS: Specific suggestions for improvement or validation
6. RISK ASSESSMENT: Potential investor questions or concerns this might raise` : ''}`,

            'forward_looking': `
1. CONSISTENCY CHECK: How does this align with previous guidance and forward-looking statements?
2. TONE ANALYSIS: Is the confidence level appropriate compared to historical outlook discussions?
3. DISCLAIMER ALIGNMENT: Are forward-looking elements properly qualified?
4. CREDIBILITY ASSESSMENT: Does this maintain credibility based on historical track record?
${analysisType === 'detailed' ? `
5. SCENARIO PLANNING: How this compares to best/worst case historical communications
6. MARKET CONTEXT: How this positioning compares to historical market conditions` : ''}`,

            'risk_factor': `
1. TRANSPARENCY vs CONFIDENCE: How does this balance compare to historical risk discussions?
2. RISK EVOLUTION: How have similar risks been discussed previously?
3. MITIGATION MESSAGING: Does this align with historical approaches to risk mitigation?
4. STAKEHOLDER IMPACT: How might different stakeholders interpret this vs historical communications?
${analysisType === 'detailed' ? `
5. COMPETITIVE CONTEXT: How risk communication compares to historical competitive positioning
6. REGULATORY CONSIDERATIONS: Alignment with historical compliance and disclosure patterns` : ''}`,

            'general_statement': `
1. TONE CONSISTENCY: How does the tone match historical earnings communications?
2. MESSAGE CLARITY: Is the message as clear and impactful as historical best examples?
3. STRATEGIC ALIGNMENT: Does this support the strategic narrative seen in historical documents?
4. STAKEHOLDER RESONANCE: How might key stakeholders respond based on historical patterns?
${analysisType === 'detailed' ? `
5. NARRATIVE FLOW: How this fits into the broader earnings story arc
6. COMPETITIVE POSITIONING: Alignment with historical competitive messaging` : ''}`
        };
        
        const outputFormat = analysisType === 'detailed' ? `
OUTPUT FORMAT:
Provide your analysis in this structure:
**CONSISTENCY SCORE**: [1-10 with brief rationale]
**KEY INSIGHTS**: [2-3 main observations]
**RECOMMENDATIONS**: [Specific actionable suggestions]
**HISTORICAL COMPARISON**: [How this compares to past communications]
**POTENTIAL CONCERNS**: [What investors/stakeholders might question]
**CONFIDENCE LEVEL**: [High/Medium/Low with reasoning]` : `
OUTPUT FORMAT:
**CONSISTENCY SCORE**: [1-10 with brief rationale]
**KEY INSIGHT**: [Main observation in 1-2 sentences]
**RECOMMENDATION**: [One specific actionable suggestion]
**TONE**: [Conservative/Optimistic/Neutral/Cautious with brief reasoning]`;
        
        return `${baseInstructions}

${detailedInstructions[selectionType] || detailedInstructions['general_statement']}

${outputFormat}

Keep your analysis professional, specific, and actionable. Focus on helping improve the effectiveness of earnings communications.`;
    }

    async callClaudeAPI(prompt, analysisType) {
        try {
            console.log('🤖 AI: Calling Claude API via server');
            
            const response = await fetch('/api/analyze-context', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt,
                    documents: [], // We're sending the prompt directly
                    analysisType: analysisType
                })
            });
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('🤖 AI: Claude analysis completed via server');
            
            if (data.content && data.content[0] && data.content[0].text) {
                return data.content[0].text;
            } else {
                throw new Error('Invalid response format from server');
            }
            
        } catch (error) {
            console.error('🤖 AI: Error calling server:', error);
            throw new Error(`AI analysis failed: ${error.message}`);
        }
    }

    parseAnalysisResponse(responseText, searchResults, selectionType) {
        // Extract structured information from Claude's response
        const consistencyScore = this.extractConsistencyScore(responseText);
        const tone = this.extractTone(responseText);
        const recommendations = this.extractRecommendations(responseText);
        
        // Build source references
        const sources = searchResults.map((result, index) => ({
            documentId: result.document,
            documentName: result.document,
            excerpt: result.text.slice(0, 200) + (result.text.length > 200 ? '...' : ''),
            relevanceScore: result.score,
            sectionTitle: result.metadata.chunkType
        }));
        
        return {
            analysis: responseText,
            confidence: consistencyScore / 10, // Convert to 0-1 scale
            sources,
            suggestions: recommendations,
            tone,
            consistencyScore
        };
    }

    extractConsistencyScore(text) {
        const scoreMatch = text.match(/\*\*CONSISTENCY SCORE\*\*:\s*(\d+)/i);
        return scoreMatch ? parseInt(scoreMatch[1]) : 7; // Default to 7 if not found
    }

    extractTone(text) {
        const toneMatch = text.match(/\*\*TONE\*\*:\s*(conservative|optimistic|neutral|cautious)/i);
        return (toneMatch?.[1]?.toLowerCase()) || 'neutral';
    }

    extractRecommendations(text) {
        const recommendationMatch = text.match(/\*\*RECOMMENDATIONS?\*\*:\s*([^*]+)/i);
        if (!recommendationMatch) return [];
        
        return recommendationMatch[1]
            .split(/\n|\.\s+/)
            .map(rec => rec.trim())
            .filter(rec => rec.length > 10)
            .slice(0, 3); // Limit to 3 recommendations
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RAGAnalysisService;
} else {
    window.RAGAnalysisService = RAGAnalysisService;
}
