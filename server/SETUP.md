# RAG Backend Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   # Create .env file
   touch .env
   ```

3. **Add your API keys to .env:**
   ```env
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=8000
   ```

4. **Start the enhanced RAG server:**
   ```bash
   npm run start:enhanced
   ```

## API Keys Required

### Anthropic API Key
- **Purpose**: Claude API access for analysis
- **Get it from**: [Anthropic Console](https://console.anthropic.com/)
- **Format**: `sk-ant-api03-...`

### OpenAI API Key
- **Purpose**: Text embeddings for RAG functionality
- **Get it from**: [OpenAI Platform](https://platform.openai.com/api-keys)
- **Format**: `sk-...`

## Server Options

### Enhanced RAG Server (Recommended)
```bash
npm run start:enhanced    # Production
npm run dev:enhanced      # Development with auto-reload
```

### Legacy Servers
```bash
npm start                 # Basic server
npm run realtime         # Original real-time server
npm run dev              # Development mode
```

## Testing

Run the test suite to verify everything is working:
```bash
npm test
```

## Troubleshooting

### Common Issues

1. **Missing API keys**: Check your .env file
2. **Port conflicts**: Change PORT in .env
3. **Dependencies**: Run `npm install` again
4. **API limits**: Check your API quotas

### Health Check

Test server status:
```bash
curl http://localhost:8000/api/health
```

Test Claude connection:
```bash
curl http://localhost:8000/api/test
```

## Next Steps

After setup, integrate with your frontend using the `EnhancedRealtimeClient` class.
