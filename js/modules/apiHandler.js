// Simple API Handler - Direct Claude communication
export class APIHandler {
    constructor() {
        this.baseUrl = '/api';
    }

    async analyzeContext(userInput, documents) {
        if (!documents || documents.length === 0) {
            return "No documents available for analysis.";
        }

        try {
            // For context analysis, send the userInput directly as the prompt
            // This preserves the focused analysis request
            const prompt = userInput;

            console.log('🚀 Sending focused prompt to Claude:', prompt.substring(0, 200) + '...');
            console.log('🔍 Full prompt being sent:', prompt);

            const response = await fetch(`${this.baseUrl}/analyze-context`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    prompt,
                    documents: documents // Include documents for context
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Claude response received');
            console.log('🔍 Response data:', data);
            return data.content[0].text;
            
        } catch (error) {
            console.error('❌ API Error:', error);
            return "Error getting response from Claude. Please try again.";
        }
    }

    async chat(userInput, documents) {
        if (!documents || documents.length === 0) {
            return "No documents available for analysis.";
        }

        try {
            console.log('🚀 Sending chat request to Claude:', userInput.substring(0, 200) + '...');
            console.log('📚 Including', documents.length, 'documents for context');

            const response = await fetch(`${this.baseUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message: userInput,
                    documents: documents // Include documents for context
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Claude chat response received');
            console.log('🔍 Response data:', data);
            return data.content[0].text;
            
        } catch (error) {
            console.error('❌ Chat API Error:', error);
            return "Error getting response from Claude. Please try again.";
        }
    }
}
