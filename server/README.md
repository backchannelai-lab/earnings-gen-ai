# Enhanced Real-time RAG Backend

This backend service provides real-time Retrieval-Augmented Generation (RAG) capabilities with live system prompt updating, document processing, and Claude API integration.

## Features

- **Live System Prompt Updating**: Real-time prompt rebuilding as users type (300ms debounce)
- **RAG Document Processing**: Automatic text chunking and embedding generation
- **Semantic Search**: Intelligent document retrieval based on user input
- **WebSocket Streaming**: Real-time communication with frontend
- **Claude API Integration**: Streaming responses with context-aware prompts
- **Document Management**: Upload, process, and manage document collections

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   WebSocket      │    │   Claude API    │
│   Client        │◄──►│   Server         │◄──►│   (Anthropic)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   RAG Service    │
                       │   (Embeddings)   │
                       └──────────────────┘
```

## Components

### 1. RAG Service (`rag-service.js`)
- Document processing and chunking
- OpenAI embeddings generation
- Semantic search and retrieval
- Document management

### 2. System Prompt Manager (`system-prompt-manager.js`)
- Dynamic prompt template management
- Context injection from retrieved documents
- Prompt validation and formatting

### 3. Enhanced Real-time Server (`enhanced-realtime-server.js`)
- WebSocket communication
- Real-time prompt updates
- Claude API streaming
- REST API endpoints

## Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Anthropic API key
- OpenAI API key (for embeddings)

### Installation

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Environment variables:**
   Create a `.env` file in the server directory:
   ```env
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=8000
   ```

3. **Start the server:**
   ```bash
   # Start enhanced RAG server
   npm run start:enhanced
   
   # Or start with nodemon for development
   npm run dev:enhanced
   ```

## API Endpoints

### WebSocket Messages

#### Client → Server
- `update_user_text`: Send user typing updates
- `upload_document`: Upload new document for processing
- `request_analysis`: Request Claude analysis
- `update_system_template`: Update system prompt template
- `get_document_stats`: Get current document statistics
- `clear_documents`: Clear all documents

#### Server → Client
- `system_prompt_update`: Updated system prompt
- `document_stats_update`: Document collection statistics
- `claude_chunk`: Streaming Claude response chunks
- `analysis_started`: Analysis initiation confirmation
- `document_upload_success/error`: Document processing results
- `template_update_success/error`: Template update results

### REST API Endpoints

#### Health & Status
- `GET /api/health` - Server health check
- `GET /api/test` - Claude API connection test

#### System Prompt Management
- `GET /api/system-prompt` - Get current system prompt
- `POST /api/system-template` - Update system template

#### Document Management
- `GET /api/documents` - Get document statistics
- `POST /api/documents` - Upload new document
- `DELETE /api/documents/:id` - Delete specific document
- `DELETE /api/documents` - Clear all documents

#### Legacy Support
- `POST /api/analyze-context` - Backward compatibility endpoint

## Usage Examples

### Frontend Integration

```javascript
// Initialize enhanced client
const client = new EnhancedRealtimeClient();

// Connect to server
client.autoConnect();

// Listen for prompt updates
client.on('prompt_update', (prompt) => {
    console.log('System prompt updated:', prompt);
});

// Update user text (triggers RAG context retrieval)
client.updateUserText('Analyze our Q4 revenue performance');

// Upload document
client.uploadDocument({
    name: 'Q4_earnings.pdf',
    text: 'Document content...',
    type: 'pdf'
});

// Request analysis
client.requestAnalysis('Selected text to analyze');
```

### Document Processing Flow

1. **Upload**: Document is sent to server via WebSocket
2. **Chunking**: Text is split into optimal chunks (1000 chars, 200 overlap)
3. **Embedding**: OpenAI generates vector embeddings for each chunk
4. **Storage**: Chunks and embeddings stored in memory
5. **Retrieval**: Semantic search finds relevant chunks for user queries
6. **Context Injection**: Retrieved chunks injected into system prompt
7. **Claude Analysis**: Enhanced prompt sent to Claude API

### System Prompt Template

The default template includes placeholders for dynamic content:

```
Analyze the following text and provide insights about:
- Key financial metrics and year-over-year trends
- Business performance highlights and operational results
- Strategic initiatives, investments, and their outcomes
- Risk factors, challenges, and opportunities
- Market position changes and competitive advantages

Reference only the uploaded project documents for additional context — do not make up data.

Historical Context (based only on uploaded documents and relevant to the typed terms):
{{RETRIEVED_CONTEXT}}

Text to Analyze:
{{USER_TEXT}}
```

## Configuration

### Debounce Timing
Adjust the debounce delay in `enhanced-realtime-server.js`:
```javascript
const DEBOUNCE_DELAY = 300; // 300ms debounce for user text updates
```

### Chunk Sizes
Modify text splitting parameters in `rag-service.js`:
```javascript
this.textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,        // Optimal chunk size for embeddings
    chunkOverlap: 200,      // Overlap to maintain context
    separators: ['\n\n', '\n', '. ', '! ', '? ', ' ', '']
});
```

### Claude Model
Change the Claude model in `enhanced-realtime-server.js`:
```javascript
const CLAUDE_MODEL = 'claude-sonnet-4-20250514'; // or other available models
```

## Performance Considerations

### Token Limits
- **Claude Sonnet 4**: ~200K context window
- **Conservative limit**: 150K tokens for safety
- **Chunk optimization**: 1000 chars per chunk balances context and efficiency

### Memory Usage
- **In-memory storage**: Documents and embeddings stored in memory
- **Chunk management**: Automatic cleanup when documents are deleted
- **Scaling**: Consider external vector database for large document collections

### API Rate Limits
- **OpenAI embeddings**: Monitor usage for large document collections
- **Claude API**: Respect rate limits and implement backoff strategies

## Error Handling

### Common Issues
1. **Missing API keys**: Check environment variables
2. **Document processing failures**: Verify text extraction and chunking
3. **Embedding generation errors**: Check OpenAI API quota and connectivity
4. **WebSocket connection issues**: Implement reconnection logic

### Debugging
Enable detailed logging by checking console output:
- Server startup messages
- Document processing logs
- WebSocket connection status
- Claude API request/response details

## Development

### Adding New Features
1. **New WebSocket message types**: Add to `handleWebSocketMessage`
2. **Additional API endpoints**: Extend REST API routes
3. **Custom RAG logic**: Modify `RAGService` class
4. **Template customization**: Update `SystemPromptManager`

### Testing
- **API endpoints**: Use tools like Postman or curl
- **WebSocket messages**: Test with WebSocket client tools
- **Document processing**: Upload various file types and sizes
- **Error scenarios**: Test with invalid inputs and API failures

## Production Deployment

### Environment Setup
- Set production environment variables
- Configure proper logging and monitoring
- Implement health checks and alerting
- Set up SSL/TLS for secure WebSocket connections

### Scaling Considerations
- **Load balancing**: Multiple server instances
- **External vector database**: Redis, Pinecone, or Weaviate
- **Document storage**: S3 or similar for large files
- **Caching**: Redis for frequently accessed data

### Monitoring
- **Performance metrics**: Response times, throughput
- **Error rates**: API failures, WebSocket disconnections
- **Resource usage**: Memory, CPU, API quota consumption
- **User experience**: Prompt update latency, analysis quality

## Troubleshooting

### Connection Issues
```bash
# Check server status
curl http://localhost:8000/api/health

# Test Claude API
curl http://localhost:8000/api/test

# Check WebSocket connection
# Use browser dev tools or WebSocket client
```

### Document Processing Issues
```bash
# Check document stats
curl http://localhost:8000/api/documents

# Verify embeddings
# Check server logs for OpenAI API errors
```

### Performance Issues
- Monitor chunk sizes and overlap settings
- Check embedding generation times
- Verify Claude API response times
- Review debounce timing settings

## Support

For issues and questions:
1. Check server logs for error details
2. Verify API key configuration
3. Test individual components separately
4. Review WebSocket connection status
5. Check document processing pipeline

## License

This project is part of the EarningsGen AI application. See main project license for details.
