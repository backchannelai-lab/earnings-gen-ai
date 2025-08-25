// Application Configuration and Constants
export const CONFIG = {
    // API Configuration
    API: {
        BASE_URL: 'https://api.openai.com/v1',
        MODEL: 'gpt-4',
        MAX_TOKENS: 2000,
        TEMPERATURE: 0.7,
        TIMEOUT: 30000
    },
    
    // File Processing
    FILES: {
        MAX_SIZE: 10 * 1024 * 1024, // 10MB
        SUPPORTED_TYPES: ['.pdf', '.doc', '.docx', '.xlsx', '.xls', '.txt'],
        BATCH_SIZE: 5
    },
    
    // UI Configuration
    UI: {
        DEBOUNCE_DELAY: 300,
        LOADING_TIMEOUT: 5000,
        ANIMATION_DURATION: 200,
        MAX_CONTEXT_ITEMS: 10
    },
    
    // Context Configuration
    CONTEXT: {
        MIN_RELEVANCE_SCORE: 0.3,
        MAX_DOCUMENTS: 3,
        CACHE_SIZE: 100,
        UPDATE_DELAY: 500
    },
    
    // Performance
    PERFORMANCE: {
        MAX_CACHE_SIZE: 50,
        CLEANUP_INTERVAL: 300000, // 5 minutes
        MEMORY_THRESHOLD: 100
    }
};

export const MESSAGES = {
    SUCCESS: {
        FILE_UPLOADED: 'File uploaded successfully!',
        SCRIPT_GENERATED: 'Script generated successfully!',
        CONTEXT_UPDATED: 'Context updated successfully!',
        API_KEY_SAVED: 'API key saved successfully!'
    },
    
    ERROR: {
        FILE_TOO_LARGE: 'File size exceeds 10MB limit',
        INVALID_FILE_TYPE: 'Invalid file type. Supported: PDF, Word, Excel, Text',
        API_KEY_MISSING: 'API key not configured',
        GENERATION_FAILED: 'Failed to generate script. Please try again.',
        UPLOAD_FAILED: 'Failed to upload file. Please try again.'
    },
    
    INFO: {
        PROCESSING: 'Processing file...',
        GENERATING: 'Generating script...',
        ANALYZING: 'Analyzing document...',
        LOADING: 'Loading...'
    }
};

export const CSS_CLASSES = {
    // Button states
    BUTTON: {
        PRIMARY: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors',
        SECONDARY: 'bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors',
        SUCCESS: 'bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors',
        DANGER: 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors'
    },
    
    // Card styles
    CARD: {
        DEFAULT: 'bg-white rounded-lg border border-gray-200 p-4 shadow-sm',
        HIGHLIGHTED: 'bg-blue-50 border-blue-200',
        SUCCESS: 'bg-green-50 border-green-200',
        WARNING: 'bg-yellow-50 border-yellow-200',
        ERROR: 'bg-red-50 border-red-200'
    },
    
    // Text styles
    TEXT: {
        HEADING: 'text-lg font-semibold text-gray-900',
        SUBHEADING: 'text-md font-medium text-gray-800',
        BODY: 'text-sm text-gray-700',
        CAPTION: 'text-xs text-gray-500',
        LINK: 'text-blue-600 hover:text-blue-800 underline'
    }
};

export const EVENTS = {
    // Custom events
    CONTEXT_UPDATED: 'contextUpdated',
    DOCUMENT_PROCESSED: 'documentProcessed',
    SCRIPT_GENERATED: 'scriptGenerated',
    FILE_UPLOADED: 'fileUploaded',
    ERROR_OCCURRED: 'errorOccurred'
};

export const STORAGE_KEYS = {
    API_KEY: 'openai_api_key',
    USER_PREFERENCES: 'user_preferences',
    DOCUMENT_CACHE: 'document_cache',
    CONTEXT_HISTORY: 'context_history'
};
