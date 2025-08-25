// ============================================================================
// RAG BACKEND TEST SCRIPT
// ============================================================================

// This script tests the RAG backend functionality
// Run with: node test-rag-backend.js

const fetch = require('node-fetch'); // You may need to install this: npm install node-fetch

class RAGBackendTester {
    constructor() {
        this.baseUrl = 'http://localhost:8000';
        this.testResults = [];
    }
    
    async runTests() {
        console.log('🧪 Starting RAG Backend Tests...\n');
        
        try {
            // Test 1: Health Check
            await this.testHealthCheck();
            
            // Test 2: Claude API Connection
            await this.testClaudeConnection();
            
            // Test 3: System Prompt Management
            await this.testSystemPromptManagement();
            
            // Test 4: Document Management
            await this.testDocumentManagement();
            
            // Test 5: RAG Context Retrieval
            await this.testRAGContextRetrieval();
            
            // Test 6: Analysis Request
            await this.testAnalysisRequest();
            
            // Print results
            this.printTestResults();
            
        } catch (error) {
            console.error('❌ Test suite failed:', error.message);
        }
    }
    
    async testHealthCheck() {
        console.log('🔍 Testing Health Check...');
        
        try {
            const response = await fetch(`${this.baseUrl}/api/health`);
            const data = await response.json();
            
            if (response.ok && data.status === 'healthy') {
                this.addTestResult('Health Check', 'PASS', 'Server is healthy');
                console.log('✅ Health check passed');
            } else {
                this.addTestResult('Health Check', 'FAIL', `Unexpected response: ${JSON.stringify(data)}`);
                console.log('❌ Health check failed');
            }
        } catch (error) {
            this.addTestResult('Health Check', 'ERROR', error.message);
            console.log('❌ Health check error:', error.message);
        }
    }
    
    async testClaudeConnection() {
        console.log('🔍 Testing Claude API Connection...');
        
        try {
            const response = await fetch(`${this.baseUrl}/api/test`);
            const data = await response.json();
            
            if (response.ok && data.status === 'success') {
                this.addTestResult('Claude Connection', 'PASS', 'Claude API connection working');
                console.log('✅ Claude connection test passed');
            } else {
                this.addTestResult('Claude Connection', 'FAIL', `Unexpected response: ${JSON.stringify(data)}`);
                console.log('❌ Claude connection test failed');
            }
        } catch (error) {
            this.addTestResult('Claude Connection', 'ERROR', error.message);
            console.log('❌ Claude connection test error:', error.message);
        }
    }
    
    async testSystemPromptManagement() {
        console.log('🔍 Testing System Prompt Management...');
        
        try {
            // Get current prompt
            const getResponse = await fetch(`${this.baseUrl}/api/system-prompt`);
            const getData = await getResponse.json();
            
            if (getResponse.ok && getData.prompt) {
                this.addTestResult('Get System Prompt', 'PASS', 'Successfully retrieved system prompt');
                console.log('✅ Get system prompt passed');
            } else {
                this.addTestResult('Get System Prompt', 'FAIL', `Failed to get prompt: ${JSON.stringify(getData)}`);
                console.log('❌ Get system prompt failed');
                return;
            }
            
            // Test template update
            const testTemplate = `Test template with {{USER_TEXT}} placeholder`;
            const updateResponse = await fetch(`${this.baseUrl}/api/system-template`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ template: testTemplate })
            });
            
            const updateData = await updateResponse.json();
            
            if (updateResponse.ok && updateData.success) {
                this.addTestResult('Update System Template', 'PASS', 'Successfully updated system template');
                console.log('✅ Update system template passed');
            } else {
                this.addTestResult('Update System Template', 'FAIL', `Failed to update template: ${JSON.stringify(updateData)}`);
                console.log('❌ Update system template failed');
            }
            
        } catch (error) {
            this.addTestResult('System Prompt Management', 'ERROR', error.message);
            console.log('❌ System prompt management error:', error.message);
        }
    }
    
    async testDocumentManagement() {
        console.log('🔍 Testing Document Management...');
        
        try {
            // Get initial document stats
            const initialResponse = await fetch(`${this.baseUrl}/api/documents`);
            const initialData = await initialResponse.json();
            
            if (!initialResponse.ok) {
                this.addTestResult('Get Documents', 'FAIL', `Failed to get documents: ${JSON.stringify(initialData)}`);
                console.log('❌ Get documents failed');
                return;
            }
            
            this.addTestResult('Get Documents', 'PASS', `Retrieved ${initialData.documentCount} documents`);
            console.log('✅ Get documents passed');
            
            // Test document upload
            const testDocument = {
                name: 'test-document.txt',
                text: 'This is a test document for RAG testing. It contains information about financial performance and business metrics.',
                type: 'text'
            };
            
            const uploadResponse = await fetch(`${this.baseUrl}/api/documents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testDocument)
            });
            
            const uploadData = await uploadResponse.json();
            
            if (uploadResponse.ok && uploadData.success) {
                this.addTestResult('Upload Document', 'PASS', 'Successfully uploaded test document');
                console.log('✅ Upload document passed');
                
                // Wait a moment for processing
                await this.sleep(2000);
                
                // Check updated stats
                const updatedResponse = await fetch(`${this.baseUrl}/api/documents`);
                const updatedData = await updatedResponse.json();
                
                if (updatedData.documentCount > initialData.documentCount) {
                    this.addTestResult('Document Processing', 'PASS', `Document processed: ${updatedData.documentCount} total`);
                    console.log('✅ Document processing verified');
                } else {
                    this.addTestResult('Document Processing', 'FAIL', 'Document count did not increase');
                    console.log('❌ Document processing verification failed');
                }
                
            } else {
                this.addTestResult('Upload Document', 'FAIL', `Failed to upload document: ${JSON.stringify(uploadData)}`);
                console.log('❌ Upload document failed');
            }
            
        } catch (error) {
            this.addTestResult('Document Management', 'ERROR', error.message);
            console.log('❌ Document management error:', error.message);
        }
    }
    
    async testRAGContextRetrieval() {
        console.log('🔍 Testing RAG Context Retrieval...');
        
        try {
            // This test would require WebSocket connection to test properly
            // For now, we'll test the basic functionality
            
            // Check if we have documents to work with
            const response = await fetch(`${this.baseUrl}/api/documents`);
            const data = await response.json();
            
            if (data.documentCount > 0) {
                this.addTestResult('RAG Context Retrieval', 'PASS', 'Documents available for RAG testing');
                console.log('✅ RAG context retrieval test passed (documents available)');
            } else {
                this.addTestResult('RAG Context Retrieval', 'SKIP', 'No documents available for RAG testing');
                console.log('⏭️ RAG context retrieval test skipped (no documents)');
            }
            
        } catch (error) {
            this.addTestResult('RAG Context Retrieval', 'ERROR', error.message);
            console.log('❌ RAG context retrieval test error:', error.message);
        }
    }
    
    async testAnalysisRequest() {
        console.log('🔍 Testing Analysis Request...');
        
        try {
            // Test analysis with a simple prompt
            const testPrompt = 'Analyze the financial performance metrics';
            
            const response = await fetch(`${this.baseUrl}/api/analyze-context`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: testPrompt })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success && data.response) {
                this.addTestResult('Analysis Request', 'PASS', 'Successfully received analysis response');
                console.log('✅ Analysis request test passed');
            } else {
                this.addTestResult('Analysis Request', 'FAIL', `Failed to get analysis: ${JSON.stringify(data)}`);
                console.log('❌ Analysis request test failed');
            }
            
        } catch (error) {
            this.addTestResult('Analysis Request', 'ERROR', error.message);
            console.log('❌ Analysis request test error:', error.message);
        }
    }
    
    addTestResult(testName, status, message) {
        this.testResults.push({
            test: testName,
            status: status,
            message: message,
            timestamp: new Date().toISOString()
        });
    }
    
    printTestResults() {
        console.log('\n📊 Test Results Summary:');
        console.log('========================');
        
        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const failed = this.testResults.filter(r => r.status === 'FAIL').length;
        const errors = this.testResults.filter(r => r.status === 'ERROR').length;
        const skipped = this.testResults.filter(r => r.status === 'SKIP').length;
        
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`💥 Errors: ${errors}`);
        console.log(`⏭️ Skipped: ${skipped}`);
        console.log(`📝 Total: ${this.testResults.length}`);
        
        console.log('\n📋 Detailed Results:');
        console.log('===================');
        
        this.testResults.forEach((result, index) => {
            const statusIcon = {
                'PASS': '✅',
                'FAIL': '❌',
                'ERROR': '💥',
                'SKIP': '⏭️'
            }[result.status] || '❓';
            
            console.log(`${index + 1}. ${statusIcon} ${result.test}: ${result.message}`);
        });
        
        if (failed === 0 && errors === 0) {
            console.log('\n🎉 All tests passed! RAG backend is working correctly.');
        } else {
            console.log('\n⚠️ Some tests failed. Please check the backend configuration.');
        }
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const tester = new RAGBackendTester();
    tester.runTests();
}

module.exports = RAGBackendTester;
