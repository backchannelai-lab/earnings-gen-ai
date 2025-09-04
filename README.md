# EarningsGen AI - AI-Powered Earnings Call Script Generator

A fully functional, AI-powered application that analyzes financial documents and generates professional earnings call scripts with accurate financial data extraction and compliance checking.

## 📚 Documentation

This project includes comprehensive documentation organized by topic:

- **[🤖 Claude AI Integration](claude.md)** - AI features, configuration, and usage patterns
- **[🛠️ Technical Stack](tech_stack.md)** - Architecture, implementation, and development details  
- **[🎨 Design & UX](design.md)** - UI/UX patterns, responsive design, and accessibility
- **[🔒 Security & Privacy](security.md)** - Security measures, privacy protection, and compliance

## 🚀 Quick Start

1. **Clone the repository** and navigate to the project directory
2. **Set up your API key** by copying `env.template` to `.env` and adding your Anthropic API key
3. **Start the server** with `cd server && npm install && npm start`
4. **Open the application** by navigating to `http://localhost:8000` in your browser
5. **Upload documents** and start generating earnings call scripts!

For detailed setup instructions, see the [Technical Stack documentation](tech_stack.md).

## 🚀 Features

### Core Functionality
- **Intelligent Document Processing**: Analyzes PDFs, Excel files, text documents, and more
- **AI-Powered Analysis**: Uses Anthropic Claude to extract financial insights and context
- **Real Financial Data Extraction**: Automatically identifies numbers, percentages, dates, and key metrics
- **Dynamic Script Generation**: Creates contextually accurate scripts based on uploaded documents
- **Source Tracking**: Click any sentence to see its source document and supporting data
- **Compliance Checking**: Identifies potential regulatory and compliance issues
- **Multi-Format Support**: Handles PDFs, Excel, CSV, JSON, and text files
- **🔍 Anomaly Detection**: Automatically flags unusual financial metrics and trend deviations

### Advanced Capabilities
- **PDF.js Integration**: Advanced PDF text extraction with fallback support
- **Financial Pattern Recognition**: Regex-based extraction of currency amounts, percentages, and metrics
- **Context-Aware Generation**: Scripts are tailored to the specific documents and request
- **Real-time Processing**: Live document analysis with progress indicators
- **Session Management**: Save and manage documents across browser sessions
- **Industry-Specific Validation**: Built-in rules for health insurance, banking, and general financial metrics
- **Historical Baseline Tracking**: Learns from documents to establish trend analysis baselines

## 🛠️ Setup

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Anthropic API key (required for AI functionality)

### Installation
1. Clone or download this repository
2. Open `index.html` in your web browser
3. Configure your Anthropic API key (see Configuration section)

### Configuration
1. **Get Anthropic API Key**: 
   - Visit [Anthropic Console](https://console.anthropic.com/)
   - Create a new API key
   - Copy the key (starts with `sk-ant-`)

2. **Configure API Key**:
   - Set the `ANTHROPIC_API_KEY` environment variable with your API key
   - Or configure it in your server environment
   - The app will automatically load your configuration

## 📖 Usage

### Step 1: Configure API Key
1. Set the `ANTHROPIC_API_KEY` environment variable with your Anthropic API key
2. Start the server with `npm start` or `node server/simple-server.js`
3. Verify the API status shows "✅ API key configured and ready"

### Step 2: Upload Documents
1. Click the "Upload Documents" area in the sidebar
2. Select financial documents (earnings reports, press releases, financial statements, etc.)
3. Supported formats: PDF, Excel (.xlsx, .xls), CSV, JSON, text files
4. Documents are automatically processed and analyzed

### Step 2: Generate Scripts
1. Type your request in the chat input (e.g., "Generate CEO opening remarks for Q3 earnings call")
2. Press Enter or click the send button
3. The AI will analyze your documents and generate a professional script
4. Scripts include proper HTML formatting for easy reading

### Step 3: Review and Context
1. **Click any sentence** in the generated script to see its source in the right sidebar
2. **View financial data** extracted from source documents
3. **Check compliance flags** for potential regulatory issues in the right sidebar
4. **Save documents** for future sessions
5. **Interactive Analysis**: Use the right sidebar to analyze script content and identify sources

## 🔍 Document Analysis

### What Gets Extracted
- **Financial Metrics**: Revenue, EBITDA, EPS, margins, growth rates
- **Time Periods**: Quarters, years, specific dates
- **Business Context**: Strategy updates, market conditions, risk factors
- **Document Types**: Earnings reports, press releases, financial statements

### AI Analysis Process
1. **Text Extraction**: Converts documents to searchable text
2. **Pattern Recognition**: Identifies financial data using regex patterns
3. **AI Analysis**: Claude analyzes content for business insights
4. **Data Consolidation**: Combines insights across multiple documents
5. **Context Mapping**: Links script content to source documents

## 📊 Script Generation

### Input Examples
- "Draft the CFO's financial highlights section"
- "Create opening remarks for Q4 earnings call"
- "Generate guidance discussion based on our documents"
- "Write a summary of our strategic initiatives"

### Output Features
- **Structured Format**: Clear sections with headings
- **Financial Accuracy**: Real numbers from source documents
- **Professional Tone**: Business-appropriate language
- **Source Attribution**: Every sentence traceable to source
- **Compliance Aware**: Identifies potential regulatory issues
- **Interactive Context**: Right sidebar shows source documents and compliance analysis

## 🚨 Compliance & Risk Management

### Automatic Checks
- **Forward-Looking Statements**: Identifies optimistic projections
- **Regulatory Language**: Flags potentially problematic phrasing
- **Risk Disclosure**: Ensures appropriate risk factor mentions
- **Financial Accuracy**: Validates numbers against source documents

### Best Practices
- Review all compliance flags before using scripts
- Ensure forward-looking statements include appropriate disclaimers
- Verify financial data accuracy against official filings
- Consider legal review for public company communications

## 🔧 Technical Details

### Architecture
- **Frontend**: Vanilla JavaScript with modern ES6+ features
- **AI Integration**: Anthropic Claude API for document analysis and script generation
- **Document Processing**: PDF.js for PDF extraction, FileReader API for other formats
- **Storage**: Local browser storage for API keys and session data

### API Usage
- **Document Analysis**: ~1000-1500 tokens per document
- **Script Generation**: ~2000-2500 tokens per script
- **Model**: Claude for best accuracy and financial understanding
- **Rate Limits**: Subject to Anthropic API rate limits

### Performance
- **Processing Time**: 5-15 seconds per document depending on size
- **Memory Usage**: Efficient text extraction with configurable page limits
- **Scalability**: Handles multiple documents simultaneously
- **Offline Capability**: Basic functionality without API key

## 🚀 Advanced Features

### Document Management
- **Session Persistence**: Documents saved across browser sessions
- **File Organization**: Separate current session and saved documents
- **Processing Status**: Visual indicators for document analysis progress
- **Error Handling**: Graceful fallbacks for unsupported file types

### AI Customization
- **Temperature Control**: Adjustable creativity vs. accuracy balance
- **Context Length**: Optimized for financial document analysis
- **Prompt Engineering**: Specialized prompts for financial content
- **Multi-Document Synthesis**: Intelligent combination of insights

## 🔒 Security & Privacy

### Data Handling
- **Local Processing**: Documents processed in your browser
- **No Server Storage**: Files never uploaded to external servers
- **API Key Security**: Stored locally in browser storage
- **Privacy First**: Your financial data stays on your device

### API Security
- **HTTPS Only**: All API calls use secure connections
- **Key Validation**: API keys are tested before use
- **Error Handling**: Secure error messages without data exposure
- **Rate Limiting**: Respects OpenAI API limits

## 🐛 Troubleshooting

### Common Issues
1. **API Key Not Working**
   - Verify key starts with `sk-ant-`
   - Check Anthropic account status and billing
   - Ensure key has sufficient credits

2. **Document Processing Fails**
   - Check file format compatibility
   - Ensure file isn't corrupted or password-protected
   - Try smaller files for large documents

3. **Script Generation Issues**
   - Verify documents contain relevant financial data
   - Check API key configuration
   - Review browser console for error messages

### Performance Tips
- **PDF Processing**: Limit to first 10 pages for large documents
- **File Size**: Keep individual files under 10MB for best performance
- **Document Quality**: Use high-quality, text-based PDFs when possible
- **Browser**: Use modern browsers for best compatibility

## 📈 Future Enhancements

### Planned Features
- **Multi-Language Support**: International financial document analysis
- **Advanced Analytics**: Financial trend analysis and forecasting
- **Template Library**: Pre-built script templates for common scenarios
- **Collaboration Tools**: Team editing and approval workflows
- **Export Options**: Word, PDF, and presentation export formats

### Integration Possibilities
- **CRM Systems**: Salesforce, HubSpot integration
- **Financial Platforms**: Bloomberg, Reuters data feeds
- **Document Management**: SharePoint, Google Drive connectivity
- **Regulatory Compliance**: SEC filing integration

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Set up local development environment
3. Make your changes
4. Test thoroughly with various document types
5. Submit a pull request

### Areas for Contribution
- **Document Processing**: Enhance PDF, Excel, and other format support
- **AI Prompts**: Improve financial analysis accuracy
- **UI/UX**: Better user experience and accessibility
- **Testing**: Comprehensive test coverage and validation
- **Documentation**: User guides and technical documentation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This application is designed to assist with financial document analysis and script generation. It is not a substitute for professional financial advice, legal counsel, or regulatory compliance review. Users are responsible for:

- Verifying the accuracy of generated content
- Ensuring compliance with applicable regulations
- Obtaining appropriate legal and financial review
- Using generated scripts in accordance with company policies

## 🆘 Support

### Getting Help
- **Documentation**: Review this README and inline code comments
- **Console Logs**: Check browser console for detailed error information
- **API Status**: Verify Anthropic API service status
- **Community**: Check GitHub issues for known problems

### Contact
For technical support or feature requests, please open an issue on the GitHub repository.

---

**EarningsGen AI** - Transforming financial document analysis with AI-powered intelligence.
