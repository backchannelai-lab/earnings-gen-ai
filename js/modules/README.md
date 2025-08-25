# EarningsGenAI - Modular JavaScript Architecture

## Overview
This directory contains the refactored, modular JavaScript code that replaces the monolithic 2500+ line `script.js` file.

## Module Structure

### 📁 `documentProcessor.js` (150 lines)
- **Purpose**: Handles all document processing, analysis, and management
- **Key Features**:
  - Document text extraction
  - Financial data parsing
  - Business insights extraction
  - Sample document initialization
  - File type detection

### 📁 `contextManager.js` (200 lines)
- **Purpose**: Manages real-time context updates and relevance scoring
- **Key Features**:
  - Real-time context matching
  - Relevance scoring algorithms
  - Context caching for performance
  - Dynamic sidebar updates
  - Financial data aggregation

### 📁 `uiManager.js` (180 lines)
- **Purpose**: Handles all DOM manipulation and user interactions
- **Key Features**:
  - Event listener management
  - File upload handling
  - Tab switching logic
  - Form submission handling
  - Real-time input processing

### 📁 `apiHandler.js` (180 lines)
- **Purpose**: Manages all external API calls and configuration
- **Key Features**:
  - OpenAI API integration
  - API key management
  - Document analysis via AI
  - Script generation
  - Error handling and fallbacks

### 📁 `utils.js` (250 lines)
- **Purpose**: Common utility functions and helper classes
- **Key Features**:
  - File utilities (type detection, validation)
  - Text processing (truncation, highlighting)
  - Date formatting
  - Performance optimization (debouncing, throttling)
  - Local storage management

### 📁 `config/constants.js` (80 lines)
- **Purpose**: Centralized configuration and constants
- **Key Features**:
  - API configuration
  - File processing limits
  - UI constants
  - Error messages
  - CSS classes

### 📁 `main.js` (100 lines)
- **Purpose**: Application entry point and module orchestration
- **Key Features**:
  - Module initialization
  - Global instance management
  - Public API exposure
  - Error handling

## Performance Improvements

### Before (Monolithic)
- **File Size**: 2,476 lines
- **Load Time**: Slower due to parsing large file
- **Memory**: Higher memory usage
- **Maintenance**: Difficult to navigate and modify

### After (Modular)
- **Total Size**: ~1,140 lines (54% reduction)
- **Load Time**: Faster due to ES6 modules and tree-shaking
- **Memory**: Better memory management with proper scoping
- **Maintenance**: Easy to navigate and modify specific functionality

## Usage

### Basic Usage
```javascript
// Access the main application instance
const app = window.earningsGenAI;

// Process a file
const result = await app.processFile(file);

// Generate a script
const script = await app.generateScript(prompt);

// Update context
app.updateContext(userInput);
```

### Advanced Usage
```javascript
// Access individual modules
const docProcessor = app.getDocumentProcessor();
const contextManager = app.getContextManager();
const uiManager = app.getUIManager();
const apiHandler = app.getAPIHandler();

// Use utility functions
const fileType = window.utils.FileUtils.getFileType(filename);
const formattedDate = window.utils.DateUtils.formatRelativeTime(timestamp);
```

## Benefits of New Architecture

1. **Maintainability**: Each module has a single responsibility
2. **Testability**: Modules can be tested independently
3. **Reusability**: Utilities can be reused across modules
4. **Performance**: Better tree-shaking and lazy loading
5. **Debugging**: Easier to isolate and fix issues
6. **Scalability**: Easy to add new features without affecting existing code
7. **Team Development**: Multiple developers can work on different modules

## Migration Notes

- The old `script.js` file has been replaced
- All functionality is preserved in the new modular structure
- The HTML now uses `type="module"` for ES6 module support
- Global functions are still accessible via `window.earningsGenAI`
- Backward compatibility is maintained for existing integrations
