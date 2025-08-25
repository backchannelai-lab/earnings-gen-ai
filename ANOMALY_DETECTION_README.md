# 🔍 Anomaly Detection & Trend Validation System

## Overview

The EarningsGen AI system now includes comprehensive anomaly detection and trend validation capabilities that automatically identify unusual financial metrics and significant changes requiring verification. This system addresses the critical need for real-time validation of financial data in earnings communications.

## 🚨 What Gets Detected

### Critical Anomalies
- **MLR of 2.1%**: Immediately flagged as unusually low for health insurance (expected: 75-90%)
- **Efficiency Ratio of 15.2%**: Flagged as critically low for banking (expected: 50-70%)
- **Revenue Growth of 182.1%**: Flagged as dramatic change requiring immediate verification

### Warning Ranges
- **MLR of 95.2%**: Outside normal range but within acceptable limits
- **Net Interest Margin of 5.2%**: Above normal range but within acceptable limits

### Trend Deviations
- **100+ percentage point changes**: Automatically flagged as dramatic shifts
- **Quarter-over-quarter changes**: Tracked and categorized by magnitude
- **Cross-document consistency**: Validated against historical baselines

## 🏭 Industry-Specific Validation Rules

### Health Insurance
```javascript
'MLR': {
    normalRange: { min: 75, max: 90 },
    warningRange: { min: 70, max: 95 },
    criticalRange: { min: 0, max: 100 },
    unit: '%',
    description: 'Medical Loss Ratio',
    explanation: 'MLR represents the percentage of premium revenue spent on medical claims and quality improvement activities. Typical range is 75-90% for health insurers.'
}
```

### Banking
```javascript
'Efficiency_Ratio': {
    normalRange: { min: 50, max: 70 },
    warningRange: { min: 45, max: 75 },
    criticalRange: { min: 0, max: 100 },
    unit: '%',
    description: 'Efficiency Ratio',
    explanation: 'Measures non-interest expenses as a percentage of revenue. Lower is better, typical range is 50-70%.'
}
```

### General Metrics
```javascript
'Revenue_Growth': {
    normalRange: { min: -10, max: 30 },
    warningRange: { min: -20, max: 50 },
    criticalRange: { min: -50, max: 100 },
    unit: '%',
    description: 'Revenue Growth',
    explanation: 'Year-over-year revenue growth rate. Typical range varies by industry and economic conditions.'
}
```

## 📊 Change Magnitude Thresholds

| Category | Threshold | Action Required |
|----------|-----------|-----------------|
| **Minor** | < 5% | Monitor for trends |
| **Moderate** | 5-15% | Standard review |
| **Significant** | 15-30% | Additional explanation needed |
| **Dramatic** | > 50% | Immediate verification required |

## 🔧 How to Use

### 1. Automatic Detection
The system automatically analyzes any text you select in the editor:
- Select text containing financial metrics
- Click "🔍 Anomaly Detection" button
- Review validation results and trend analysis

### 2. Manual Testing
Use the test function in browser console:
```javascript
// Test with specific text
window.testAnomalyDetection("MLR improved to 2.1% this quarter");

// Test with default example
window.testAnomalyDetection();
```

### 3. Enhanced Context Analysis
Combine RAG analysis with anomaly detection:
```javascript
// Run both analyses
await window.simpleAI.enhancedContextAnalysis(selectedText);
```

## 📈 Historical Baseline Establishment

### Automatic Learning
- **First encounter**: Establishes baseline for future comparison
- **Subsequent updates**: Tracks changes and identifies trends
- **Persistent storage**: Maintains data across browser sessions

### Baseline Example
```javascript
{
    "health_insurance_MLR": {
        "value": 82.1,
        "metricType": "MLR",
        "industry": "health_insurance",
        "context": "Medical loss ratio was 82.1% for Q3...",
        "timestamp": "2024-01-15T10:30:00.000Z",
        "updateCount": 3
    }
}
```

## 🎯 Detection Examples

### Example 1: Critical MLR Anomaly
**Input**: "The company's medical loss ratio was 2.1% for Q3"

**Output**:
```
🚨 Critical Anomaly Detected:
• MLR: 2.1%
• Issue: 2.1% is significantly outside expected range
• Expected: MLR should be 75-90% for health insurers
• Action: Requires immediate verification against source documents
```

### Example 2: Dramatic Trend Change
**Input**: "MLR improved from 83.2% to 2.1%"

**Output**:
```
🔍 Trend Deviation Detected:
• MLR: 2.1% (baseline: 83.2%)
• Change: -81.1 percentage points (-97.5%)
• Magnitude: Dramatic change requiring immediate verification
• Action: Cross-check with source documents and business justification
```

### Example 3: Normal Range
**Input**: "Medical loss ratio was 82.1% for Q3"

**Output**:
```
✅ Validation Passed:
• MLR: 82.1%
• Status: Within normal range (75-90%)
• Trend: No significant changes detected
• Action: No verification required
```

## 🛠️ Technical Implementation

### Core Service
```javascript
import { AnomalyDetectionService } from './modules/AnomalyDetectionService.js';

// Initialize service
this.anomalyDetection = new AnomalyDetectionService();

// Process text for anomalies
const analysis = await this.anomalyDetection.processText(text, industry);
```

### Key Methods
- `extractAndValidateMetrics(text, industry)`: Identifies and validates financial metrics
- `validateMetric(value, metricType, industry)`: Applies industry-specific validation rules
- `analyzeTrend(value, metricType, industry)`: Compares against historical baselines
- `generateAnomalyReport(metrics)`: Creates comprehensive analysis report

### Data Storage
- **Local Storage**: Historical baselines and validation rules
- **Export/Import**: JSON format for data portability
- **Session Persistence**: Maintains data across browser sessions

## 🔄 Integration Points

### 1. Context Analysis
- Automatically runs when text is selected
- Integrates with existing RAG analysis system
- Provides anomaly detection button alongside context analysis

### 2. Document Processing
- Analyzes uploaded documents for baseline establishment
- Tracks metrics across multiple documents
- Validates consistency between sources

### 3. Chat System
- Responds to anomaly-related queries
- Provides explanations for flagged metrics
- Suggests verification actions

## 📋 Validation Workflow

### Step 1: Text Analysis
1. Extract financial metrics using regex patterns
2. Identify metric type from context
3. Suggest appropriate industry classification

### Step 2: Rule Application
1. Apply industry-specific validation rules
2. Categorize severity (success, warning, critical)
3. Generate explanatory messages

### Step 3: Trend Analysis
1. Compare against historical baselines
2. Calculate change magnitude
3. Flag changes requiring verification

### Step 4: Report Generation
1. Compile validation results
2. Identify anomalies and warnings
3. Provide actionable recommendations

## 🚀 Future Enhancements

### Planned Features
- **Machine Learning**: Adaptive threshold adjustment based on industry trends
- **External Data**: Integration with industry benchmarks and regulatory databases
- **Advanced Patterns**: Detection of complex financial relationships and ratios
- **Real-time Alerts**: Push notifications for critical anomalies

### Extensibility
- **Custom Rules**: User-defined validation criteria
- **Industry Templates**: Pre-built rule sets for specific sectors
- **API Integration**: Connect with external validation services

## 🧪 Testing & Validation

### Test Cases
1. **Critical Anomalies**: MLR 2.1%, Efficiency Ratio 15.2%
2. **Warning Ranges**: MLR 95.2%, Net Interest Margin 5.2%
3. **Normal Values**: MLR 82.1%, Efficiency Ratio 58.3%
4. **Trend Changes**: Dramatic shifts, moderate improvements

### Test Commands
```javascript
// Test anomaly detection
window.testAnomalyDetection("MLR improved to 2.1% this quarter");

// Export historical data
window.simpleAI.exportAnomalyData();

// View system status
console.log(window.simpleAI.anomalyDetection.exportHistoricalData());
```

## 📚 Best Practices

### For Users
- **Review all flags**: Don't ignore warning or critical alerts
- **Verify sources**: Cross-check flagged metrics against original documents
- **Document changes**: Keep records of verified anomalies and explanations
- **Regular updates**: Update baselines as new data becomes available

### For Developers
- **Extend rules**: Add industry-specific validation criteria
- **Customize thresholds**: Adjust sensitivity based on use case
- **Monitor performance**: Track detection accuracy and false positives
- **User feedback**: Incorporate user corrections into baseline updates

## 🔒 Security & Privacy

### Data Handling
- **Local Processing**: All analysis performed in browser
- **No External Storage**: Metrics never sent to external servers
- **User Control**: Full control over data export and deletion
- **Audit Trail**: Complete history of validation decisions

### Compliance
- **Regulatory Awareness**: Built-in knowledge of industry standards
- **Documentation**: Comprehensive audit trail for compliance reviews
- **Verification Support**: Tools to support regulatory requirements

## 📞 Support & Troubleshooting

### Common Issues
1. **No metrics detected**: Ensure text contains recognizable financial patterns
2. **False positives**: Adjust validation rules or thresholds as needed
3. **Missing baselines**: Upload historical documents to establish baselines
4. **Industry misclassification**: Manually specify industry if auto-detection fails

### Getting Help
- **Console logs**: Check browser console for detailed analysis
- **Test functions**: Use built-in test functions for validation
- **Export data**: Export analysis results for external review
- **Documentation**: Refer to this README for detailed guidance

---

## 🎯 Quick Start

1. **Open the application** and navigate to the editor
2. **Type or paste text** containing financial metrics
3. **Select the text** and click "🔍 Anomaly Detection"
4. **Review results** and take action on any flagged issues
5. **Export data** for external analysis or compliance review

The system will automatically learn from your documents and provide increasingly accurate anomaly detection over time.
