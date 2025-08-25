// Document Processing Module
export class DocumentProcessor {
    constructor() {
        this.processedDocuments = [];
        // No sample documents - only use actually uploaded documents
        this.loadDocumentsFromStorage();
    }

    // Remove sample document methods
    // initializeSampleDocuments() { ... }
    // loadSampleDocuments() { ... }

    async processDocument(file) {
        try {
            console.log(`🔄 Starting to process document: ${file.name} (${file.type}, ${file.size} bytes)`);
            
            const text = await this.extractTextFromFile(file);
            console.log(`📝 Extracted text length: ${text.length} characters`);
            
            const analysis = await this.analyzeDocument(text, file.name);
            console.log(`🔍 Document analysis completed for: ${file.name}`);
            
            const summary = this.generateDocumentSummary(text, analysis);
            console.log(`📋 Summary generated for: ${file.name}`);
            
            const processedDoc = {
                name: file.name,
                text,
                analysis,
                summary,
                timestamp: new Date().toISOString()
            };

            this.processedDocuments.push(processedDoc);
            this.saveDocumentsToStorage(); // Save to localStorage
            console.log(`✅ Successfully processed document: ${file.name}`);
            return processedDoc;
            
        } catch (error) {
            console.error(`❌ Error processing document ${file.name}:`, error);
            throw error;
        }
    }

    async extractTextFromFile(file) {
        return new Promise((resolve, reject) => {
            const fileName = file.name.toLowerCase();
            console.log(`📁 Processing file: ${fileName} (${file.type}, ${file.size} bytes)`);
            
            if (fileName.endsWith('.pdf')) {
                console.log(`📄 Detected PDF file, using PDF.js extraction...`);
                // Use PDF.js for proper PDF text extraction
                this.extractTextFromPDF(file)
                    .then(resolve)
                    .catch(reject);
            } else if (fileName.endsWith('.txt')) {
                console.log(`📝 Detected text file, using FileReader...`);
                // Plain text files
                const reader = new FileReader();
                reader.onload = (e) => {
                    console.log(`✅ Text file read successfully. Content length: ${e.target.result.length} characters`);
                    resolve(e.target.result);
                };
                reader.onerror = (error) => {
                    console.error(`❌ Error reading text file:`, error);
                    reject(new Error(`Failed to read text file ${file.name}: ${error.message || 'Unknown error'}`));
                };
                reader.readAsText(file);
            } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
                console.log(`📊 Detected Excel file, using limited text extraction...`);
                // Excel files - for now, we'll treat them as text
                // In production, you'd use a library like SheetJS
                const reader = new FileReader();
                reader.onload = (e) => {
                    console.log(`✅ Excel file processed (limited analysis)`);
                    resolve('Excel file content (analysis may be limited)');
                };
                reader.onerror = (error) => {
                    console.error(`❌ Error reading Excel file:`, error);
                    reject(new Error(`Failed to read Excel file ${file.name}: ${error.message || 'Unknown error'}`));
                };
                reader.readAsText(file);
            } else {
                console.log(`📎 Detected other file type, attempting text extraction...`);
                // Other file types
                const reader = new FileReader();
                reader.onload = (e) => {
                    console.log(`✅ Other file type processed (limited analysis)`);
                    resolve('File content extracted (analysis may be limited)');
                };
                reader.onerror = (error) => {
                    console.error(`❌ Error reading file:`, error);
                    reject(new Error(`Failed to read file ${file.name}: ${error.message || 'Unknown error'}`));
                };
                reader.readAsText(file);
            }
        });
    }

    async extractTextFromPDF(file) {
        try {
            console.log(`📄 Starting PDF text extraction for: ${file.name}`);
            
            // Check if pdfjsLib is available
            if (typeof pdfjsLib === 'undefined') {
                throw new Error('PDF.js library not loaded. Please refresh the page and try again.');
            }
            
            // Convert file to ArrayBuffer for PDF.js
            console.log(`🔄 Converting file to ArrayBuffer...`);
            const arrayBuffer = await file.arrayBuffer();
            console.log(`✅ File converted to ArrayBuffer (${arrayBuffer.byteLength} bytes)`);
            
            // Load the PDF document
            console.log(`📖 Loading PDF document...`);
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            console.log(`✅ PDF loaded successfully. Pages: ${pdf.numPages}`);
            
            let fullText = '';
            
            // Extract text from each page
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                console.log(`📄 Processing page ${pageNum}/${pdf.numPages}...`);
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                
                // Combine text items from the page
                const pageText = textContent.items
                    .map(item => item.str)
                    .join(' ');
                
                fullText += pageText + '\n';
                console.log(`✅ Page ${pageNum} processed. Text length: ${pageText.length} characters`);
            }
            
            // Clean up the extracted text
            console.log(`🧹 Cleaning extracted text...`);
            const cleanedText = this.cleanExtractedText(fullText);
            console.log(`✅ Text cleaned. Final length: ${cleanedText.length} characters`);
            
            if (cleanedText.trim().length < 50) {
                throw new Error('Extracted text is too short - PDF may be image-based or corrupted');
            }
            
            return cleanedText;
            
        } catch (error) {
            console.error(`❌ Error extracting text from PDF ${file.name}:`, error);
            
            // Provide more specific error messages
            if (error.message.includes('PDF.js library not loaded')) {
                throw new Error(`PDF.js library not loaded. Please refresh the page and try again.`);
            } else if (error.message.includes('Failed to read file')) {
                throw new Error(`Could not read the PDF file. The file may be corrupted or too large.`);
            } else if (error.message.includes('Invalid PDF')) {
                throw new Error(`The file does not appear to be a valid PDF. Please check the file format.`);
            } else {
                throw new Error(`Failed to extract text from PDF ${file.name}: ${error.message}`);
            }
        }
    }

    cleanExtractedText(text) {
        // Increase text length limit to preserve more content
        const maxLength = 100000; // Increased from 50KB to 100KB
        
        // First, clean up common PDF artifacts that can cause truncation
        let cleanedText = text
            // Remove PDF-specific artifacts that can break text flow
            .replace(/endstream\s+endobj/g, '')
            .replace(/stream\s+BT\s+ET\s+endstream/g, '')
            .replace(/BT\s+ET/g, '')
            // Remove coordinate patterns that can interfere with text
            .replace(/\b\d{1,2}\s+\d{1,2}\s+\d{1,2}\s+\d{1,2}\b/g, '')
            // Remove single character artifacts more carefully
            .replace(/\b(?<![A-Z])\b[a-zA-Z]\b(?![A-Z])\b/g, '')
            // Clean up excessive whitespace while preserving line breaks
            .replace(/\s+/g, ' ')
            .trim();

        // Check if we need to truncate after cleaning
        if (cleanedText.length > maxLength) {
            console.warn(`PDF text still too long after cleaning (${cleanedText.length} chars), truncating to ${maxLength} chars`);
            
            // Try to truncate at a sentence boundary to avoid cutting mid-sentence
            const truncated = cleanedText.substring(0, maxLength);
            const lastSentenceEnd = Math.max(
                truncated.lastIndexOf('.'),
                truncated.lastIndexOf('!'),
                truncated.lastIndexOf('?')
            );
            
            if (lastSentenceEnd > maxLength * 0.8) { // If we can find a sentence end in the last 20%
                cleanedText = truncated.substring(0, lastSentenceEnd + 1) + '... [truncated]';
            } else {
                cleanedText = truncated + '... [truncated]';
            }
        }
        
        return cleanedText;
    }

    async analyzeDocument(text, filename) {
        const financialData = this.extractFinancialData(text);
        const businessInsights = this.extractBusinessInsights(text);
        const compliancePatterns = this.extractCompliancePatterns(text);
        const period = this.extractDocumentPeriod(text);

        return {
            document_type: this.getFileType(filename),
            summary: this.generateSummary(text, financialData, businessInsights),
            financial_data: financialData,
            key_points: businessInsights,
            risk_factors: compliancePatterns,
            period
        };
    }

    extractFinancialData(text) {
        const patterns = {
            // Revenue patterns
            revenue: /(\$[\d,]+(?:\.\d+)?[MBK]?)\s*(?:revenue|sales|income)/gi,
            revenue_growth: /(\d+(?:\.\d+)?%)\s*(?:revenue\s+)?(?:growth|increase|decrease|decline)/gi,
            
            // Profitability patterns
            ebitda: /(\$[\d,]+(?:\.\d+)?[MBK]?)\s*(?:EBITDA|ebitda)/gi,
            net_income: /(\$[\d,]+(?:\.\d+)?[MBK]?)\s*(?:net\s+income|net\s+earnings|profit)/gi,
            operating_income: /(\$[\d,]+(?:\.\d+)?[MBK]?)\s*(?:operating\s+income|operating\s+earnings)/gi,
            
            // Margin patterns
            margin: /(\d+(?:\.\d+)?%)\s*(?:gross|operating|net|profit)\s*margin/gi,
            margin_absolute: /(\$[\d,]+(?:\.\d+)?[MBK]?)\s*margin/gi,
            
            // EPS patterns
            eps: /(\$[\d,]+(?:\.\d+)?)\s*(?:EPS|earnings\s+per\s+share)/gi,
            eps_growth: /(\d+(?:\.\d+)?%)\s*(?:EPS\s+)?(?:growth|increase|decrease)/gi,
            
            // Growth patterns
            growth: /(\d+(?:\.\d+)?%)\s*(?:growth|increase|decrease|decline|up|down|YoY|year-over-year|quarter-over-quarter)/gi,
            
            // Cash flow patterns
            cash_flow: /(\$[\d,]+(?:\.\d+)?[MBK]?)\s*(?:cash\s+flow|operating\s+cash|free\s+cash)/gi,
            
            // Balance sheet patterns
            assets: /(\$[\d,]+(?:\.\d+)?[MBK]?)\s*(?:total\s+)?assets/gi,
            liabilities: /(\$[\d,]+(?:\.\d+)?[MBK]?)\s*(?:total\s+)?liabilities/gi,
            equity: /(\$[\d,]+(?:\.\d+)?[MBK]?)\s*(?:shareholders\s+)?equity/gi,
            
            // Debt patterns
            debt: /(\$[\d,]+(?:\.\d+)?[MBK]?)\s*(?:debt|long-term\s+debt|total\s+debt)/gi,
            
            // Dividend patterns
            dividend: /(\$[\d,]+(?:\.\d+)?)\s*(?:dividend|dividend\s+per\s+share)/gi,
            
            // Market cap patterns
            market_cap: /(\$[\d,]+(?:\.\d+)?[MBK]?)\s*(?:market\s+cap|market\s+capitalization)/gi,
            
            // Quarter/Year patterns
            quarter: /Q[1-4]\s*(\d{4})/gi,
            year: /(\d{4})\s*(?:fiscal\s+)?year/gi
        };

        const data = {};
        Object.entries(patterns).forEach(([key, pattern]) => {
            const matches = text.match(pattern);
            if (matches) {
                data[key] = matches.slice(0, 5); // Keep up to 5 matches per pattern
            }
        });

        return data;
    }

    extractBusinessInsights(text) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
        return sentences.slice(0, 5).map(s => s.trim());
    }

    extractCompliancePatterns(text) {
        const riskPatterns = [
            /forward-looking statement/gi,
            /may face/gi,
            /subject to/gi,
            /regulatory hurdles/gi
        ];

        return riskPatterns
            .map(pattern => text.match(pattern))
            .filter(match => match)
            .map(match => match[0]);
    }

    extractDocumentPeriod(text) {
        const textLower = text.toLowerCase();
        console.log('🔍 Extracting period from text:', text.substring(0, 200) + '...');
        
        // Quarter patterns - more comprehensive
        const quarterPatterns = [
            /Q[1-4]\s*\d{4}/gi,  // Q1 2024, Q2 2025
            /(?:first|second|third|fourth)\s*quarter\s*\d{4}/gi,  // first quarter 2024
            /(?:1st|2nd|3rd|4th)\s*quarter\s*\d{4}/gi,  // 1st quarter 2024
            /quarter\s*[1-4]\s*\d{4}/gi  // quarter 1 2024
        ];
        
        for (const pattern of quarterPatterns) {
            const match = text.match(pattern);
            if (match) {
                // Standardize quarter format
                const matchText = match[0];
                if (matchText.includes('first') || matchText.includes('1st')) {
                    return `Q1 ${matchText.match(/\d{4}/)[0]}`;
                } else if (matchText.includes('second') || matchText.includes('2nd')) {
                    return `Q2 ${matchText.match(/\d{4}/)[0]}`;
                } else if (matchText.includes('third') || matchText.includes('3rd')) {
                    return `Q3 ${matchText.match(/\d{4}/)[0]}`;
                } else if (matchText.includes('fourth') || matchText.includes('4th')) {
                    return `Q4 ${matchText.match(/\d{4}/)[0]}`;
                }
                return matchText;
            }
        }
        
        // Year patterns - more comprehensive and prioritize recent years
        const yearPatterns = [
            /\b(20\d{2})\b/g,  // 2024, 2025
            /\b(19\d{2})\b/g,  // 1999, 2000 (for older documents)
            /year\s*ended\s*\d{4}/gi,  // year ended 2024
            /fiscal\s*year\s*\d{4}/gi,  // fiscal year 2024
            /FY\s*\d{4}/gi  // FY 2024
        ];
        
        // Find all years in the text
        const allYears = [];
        for (const pattern of yearPatterns) {
            const matches = text.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    const year = match.match(/\d{4}/)[0];
                    if (year && !allYears.includes(year)) {
                        allYears.push(year);
                    }
                });
            }
        }
        
        // If we found years, prioritize the most recent one that appears in context
        if (allYears.length > 0) {
            // Sort years descending (most recent first)
            allYears.sort((a, b) => parseInt(b) - parseInt(a));
            
            // Look for the most recent year that appears in meaningful context
            for (const year of allYears) {
                const yearContext = text.match(new RegExp(`\\b${year}\\b.*?(?:earnings|revenue|costs|medical|financial|quarter|period)`, 'gi'));
                if (yearContext) {
                    if (text.match(new RegExp(`\\b${year}\\b.*?(?:fiscal|FY)`, 'gi'))) {
                        return `FY ${year}`;
                    } else if (text.match(new RegExp(`\\b${year}\\b.*?(?:year ended)`, 'gi'))) {
                        return `Year ended ${year}`;
                    } else {
                        return year;
                    }
                }
            }
            
                    // If no contextual match, return the most recent year
        const result = allYears[0];
        console.log('🔍 Found period:', result);
        return result;
    }
    
    // Month patterns
        const monthPatterns = [
            /(?:january|february|march|april|may|june|july|august|september|october|november|december)\s*\d{4}/gi,
            /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*\d{4}/gi
        ];
        
        for (const pattern of monthPatterns) {
            const match = text.match(pattern);
            if (match) {
                return match[0];
            }
        }
        
        // Try to extract current year if no specific period found
        const currentYear = new Date().getFullYear();
        if (textLower.includes('current') || textLower.includes('present') || textLower.includes('now')) {
            return `Current (${currentYear})`;
        }
        
        console.log('🔍 No period found, returning Unknown');
        return 'Unknown';
    }

    generateDocumentSummary(text, analysis) {
        return `${analysis.period} ${analysis.document_type} analysis: ${analysis.summary}`;
    }

    generateSummary(text, financialData, businessInsights) {
        const financialSummary = Object.keys(financialData).length > 0 
            ? `Financial highlights include ${Object.keys(financialData).join(', ')}. `
            : '';
        
        return `${financialSummary}${businessInsights.slice(0, 2).join(' ')}`;
    }

    getFileType(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const typeMap = {
            'pdf': 'PDF',
            'doc': 'Word',
            'docx': 'Word',
            'xlsx': 'Excel',
            'xls': 'Excel',
            'txt': 'Text'
        };
        return typeMap[ext] || 'Unknown';
    }

    getDocuments() {
        return this.processedDocuments;
    }

    getDocumentCount() {
        return this.processedDocuments.length;
    }

    hasDocuments() {
        return this.processedDocuments.length > 0;
    }

    addDocument(doc) {
        this.processedDocuments.push(doc);
        this.saveDocumentsToStorage();
    }

    // Document persistence methods
    saveDocumentsToStorage() {
        try {
            // Convert documents to a storage-friendly format
            const documentsForStorage = this.processedDocuments.map(doc => ({
                name: doc.name,
                text: doc.text,
                analysis: doc.analysis,
                summary: doc.summary,
                timestamp: doc.timestamp
            }));
            
            const storageData = JSON.stringify(documentsForStorage);
            localStorage.setItem('earningsGenAI_documents', storageData);
            console.log(`💾 Saved ${this.processedDocuments.length} documents to localStorage`);
            console.log('💾 Storage data length:', storageData.length);
            console.log('💾 Document names saved:', documentsForStorage.map(d => d.name));
            console.log('💾 Document text lengths:', documentsForStorage.map(d => d.text ? d.text.length : 'undefined'));
            
            // Verify the save worked
            const verifyData = localStorage.getItem('earningsGenAI_documents');
            console.log('💾 Verification - localStorage contains:', verifyData ? verifyData.substring(0, 200) + '...' : 'null');
        } catch (error) {
            console.error('❌ Error saving documents to localStorage:', error);
            console.error('❌ Error details:', error.message);
        }
    }

    loadDocumentsFromStorage() {
        try {
            const storedDocuments = localStorage.getItem('earningsGenAI_documents');
            console.log('🔍 Checking localStorage for documents...');
            console.log('🔍 Raw localStorage value:', storedDocuments ? storedDocuments.substring(0, 200) + '...' : 'null');
            
            if (storedDocuments) {
                this.processedDocuments = JSON.parse(storedDocuments);
                console.log(`📂 Loaded ${this.processedDocuments.length} documents from localStorage`);
                console.log('📂 Document names:', this.processedDocuments.map(d => d.name));
                console.log('📂 Document text lengths:', this.processedDocuments.map(d => d.text ? d.text.length : 'undefined'));
            } else {
                console.log('📂 No stored documents found in localStorage');
            }
        } catch (error) {
            console.error('❌ Error loading documents from localStorage:', error);
            console.error('❌ Error details:', error.message);
            this.processedDocuments = [];
        }
    }

    clearDocuments() {
        this.processedDocuments = [];
        localStorage.removeItem('earningsGenAI_documents');
        console.log('🗑️ Cleared all documents from memory and storage');
    }

    removeDocument(documentName) {
        this.processedDocuments = this.processedDocuments.filter(doc => doc.name !== documentName);
        this.saveDocumentsToStorage();
        console.log(`🗑️ Removed document: ${documentName}`);
    }
}
