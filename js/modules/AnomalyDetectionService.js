// Anomaly Detection and Trend Validation Service
// Provides comprehensive validation for financial metrics with industry-specific rules

export class AnomalyDetectionService {
    constructor() {
        // Industry-specific validation rules
        this.industryRules = {
            'health_insurance': {
                'MLR': {
                    normalRange: { min: 75, max: 90 },
                    warningRange: { min: 70, max: 95 },
                    criticalRange: { min: 0, max: 100 },
                    unit: '%',
                    description: 'Medical Loss Ratio',
                    explanation: 'MLR represents the percentage of premium revenue spent on medical claims and quality improvement activities. Typical range is 75-90% for health insurers.'
                },
                'Efficiency_Ratio': {
                    normalRange: { min: 15, max: 25 },
                    warningRange: { min: 10, max: 30 },
                    criticalRange: { min: 0, max: 100 },
                    unit: '%',
                    description: 'Efficiency Ratio',
                    explanation: 'Measures administrative costs as a percentage of premium revenue. Lower is better, typical range is 15-25%.'
                }
            },
            'banking': {
                'Efficiency_Ratio': {
                    normalRange: { min: 50, max: 70 },
                    warningRange: { min: 45, max: 75 },
                    criticalRange: { min: 0, max: 100 },
                    unit: '%',
                    description: 'Efficiency Ratio',
                    explanation: 'Measures non-interest expenses as a percentage of revenue. Lower is better, typical range is 50-70%.'
                },
                'Net_Interest_Margin': {
                    normalRange: { min: 2.5, max: 4.5 },
                    warningRange: { min: 2.0, max: 5.0 },
                    criticalRange: { min: 0, max: 10 },
                    unit: '%',
                    description: 'Net Interest Margin',
                    explanation: 'Difference between interest earned and interest paid, divided by average earning assets. Typical range is 2.5-4.5%.'
                }
            },
            'general': {
                'Revenue_Growth': {
                    normalRange: { min: -10, max: 30 },
                    warningRange: { min: -20, max: 50 },
                    criticalRange: { min: -50, max: 100 },
                    unit: '%',
                    description: 'Revenue Growth',
                    explanation: 'Year-over-year revenue growth rate. Typical range varies by industry and economic conditions.'
                },
                'EBITDA_Margin': {
                    normalRange: { min: 10, max: 30 },
                    warningRange: { min: 5, max: 40 },
                    criticalRange: { min: -10, max: 60 },
                    unit: '%',
                    description: 'EBITDA Margin',
                    explanation: 'EBITDA as a percentage of revenue. Typical range varies by industry, generally 10-30%.'
                }
            }
        };

        // Historical baseline storage
        this.historicalBaselines = this.loadHistoricalBaselines();
        
        // Change magnitude thresholds
        this.changeThresholds = {
            'minor': 5,      // 5% change
            'moderate': 15,  // 15% change
            'significant': 30, // 30% change
            'dramatic': 50   // 50% change
        };
    }

    // Load historical baselines from localStorage
    loadHistoricalBaselines() {
        try {
            const stored = localStorage.getItem('earningsGenAI_historicalBaselines');
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Error loading historical baselines:', error);
            return {};
        }
    }

    // Save historical baselines to localStorage
    saveHistoricalBaselines() {
        try {
            localStorage.setItem('earningsGenAI_historicalBaselines', JSON.stringify(this.historicalBaselines));
        } catch (error) {
            console.error('Error saving historical baselines:', error);
        }
    }

    // Extract and validate financial metrics from text
    extractAndValidateMetrics(text, industry = 'general') {
        const metrics = [];
        const patterns = [
            // Percentage patterns
            { regex: /(\d+\.?\d*)%/g, type: 'percentage' },
            // Ratio patterns
            { regex: /(\d+\.?\d*)\s*(ratio|ratio\s+of|ratio\s+to)/gi, type: 'ratio' },
            // Currency patterns
            { regex: /\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(billion|million|thousand)?/gi, type: 'currency' },
            // Growth patterns
            { regex: /(\d+\.?\d*)%\s*(growth|increase|decrease|change)/gi, type: 'growth' }
        ];

        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.regex.exec(text)) !== null) {
                const value = parseFloat(match[1].replace(/,/g, ''));
                const context = this.extractContext(text, match.index, 100);
                
                if (!isNaN(value)) {
                    const metric = this.createMetricObject(value, pattern.type, context, industry);
                    if (metric) {
                        metrics.push(metric);
                    }
                }
            }
        });

        return metrics;
    }

    // Create a metric object with validation
    createMetricObject(value, type, context, industry) {
        // Try to identify the specific metric type
        const metricType = this.identifyMetricType(context, value, industry);
        
        if (!metricType) return null;

        const validation = this.validateMetric(value, metricType, industry);
        const trend = this.analyzeTrend(value, metricType, industry);
        
        return {
            value: value,
            type: type,
            metricType: metricType,
            context: context,
            industry: industry,
            validation: validation,
            trend: trend,
            timestamp: new Date().toISOString()
        };
    }

    // Identify the specific metric type from context
    identifyMetricType(context, value, industry) {
        const lowerContext = context.toLowerCase();
        
        // Health insurance metrics
        if (industry === 'health_insurance' || industry === 'general') {
            if (/medical\s+loss\s+ratio|mlr|loss\s+ratio/.test(lowerContext)) {
                return 'MLR';
            }
            if (/efficiency\s+ratio|admin\s+ratio|operational\s+efficiency/.test(lowerContext)) {
                return 'Efficiency_Ratio';
            }
        }
        
        // Banking metrics
        if (industry === 'banking' || industry === 'general') {
            if (/efficiency\s+ratio|cost\s+to\s+income/.test(lowerContext)) {
                return 'Efficiency_Ratio';
            }
            if (/net\s+interest\s+margin|interest\s+margin/.test(lowerContext)) {
                return 'Net_Interest_Margin';
            }
        }
        
        // General metrics
        if (/revenue\s+growth|sales\s+growth|top\s+line\s+growth/.test(lowerContext)) {
            return 'Revenue_Growth';
        }
        if (/ebitda\s+margin|operating\s+margin|profit\s+margin/.test(lowerContext)) {
            return 'EBITDA_Margin';
        }
        
        return null;
    }

    // Validate a metric against industry rules
    validateMetric(value, metricType, industry) {
        const rules = this.industryRules[industry] || this.industryRules.general;
        const rule = rules[metricType];
        
        if (!rule) {
            return {
                isValid: true,
                severity: 'info',
                message: `No validation rules found for ${metricType}`,
                rule: null
            };
        }

        let severity = 'info';
        let message = '';

        // Check if value is within normal range
        if (value >= rule.normalRange.min && value <= rule.normalRange.max) {
            severity = 'success';
            message = `✅ ${rule.description} of ${value}${rule.unit} is within normal range (${rule.normalRange.min}-${rule.normalRange.max}${rule.unit})`;
        }
        // Check if value is within warning range
        else if (value >= rule.warningRange.min && value <= rule.warningRange.max) {
            severity = 'warning';
            message = `⚠️ ${rule.description} of ${value}${rule.unit} is outside normal range but within acceptable limits`;
        }
        // Value is critical
        else {
            severity = 'critical';
            message = `🚨 ${rule.description} of ${value}${rule.unit} is significantly outside expected range`;
        }

        return {
            isValid: severity !== 'critical',
            severity: severity,
            message: message,
            rule: rule,
            explanation: rule.explanation
        };
    }

    // Analyze trends and changes
    analyzeTrend(value, metricType, industry) {
        const baseline = this.getHistoricalBaseline(metricType, industry);
        
        if (!baseline) {
            return {
                hasBaseline: false,
                message: 'No historical baseline available for trend analysis',
                change: null,
                magnitude: null
            };
        }

        const change = value - baseline.value;
        const changePercent = (change / baseline.value) * 100;
        const magnitude = this.categorizeChangeMagnitude(Math.abs(changePercent));

        let message = '';
        if (change > 0) {
            message = `📈 ${metricType} increased by ${changePercent.toFixed(1)}% from baseline of ${baseline.value}`;
        } else if (change < 0) {
            message = `📉 ${metricType} decreased by ${Math.abs(changePercent).toFixed(1)}% from baseline of ${baseline.value}`;
        } else {
            message = `➡️ ${metricType} unchanged from baseline of ${baseline.value}`;
        }

        // Add anomaly detection for dramatic changes
        if (magnitude === 'dramatic') {
            message += `\n🔍 DRAMATIC CHANGE: This represents a ${magnitude} change that requires immediate verification`;
        } else if (magnitude === 'significant') {
            message += `\n⚠️ SIGNIFICANT CHANGE: This change may require additional explanation`;
        }

        return {
            hasBaseline: true,
            baseline: baseline,
            change: change,
            changePercent: changePercent,
            magnitude: magnitude,
            message: message,
            requiresVerification: magnitude === 'dramatic' || magnitude === 'significant'
        };
    }

    // Categorize change magnitude
    categorizeChangeMagnitude(changePercent) {
        if (changePercent >= this.changeThresholds.dramatic) return 'dramatic';
        if (changePercent >= this.changeThresholds.significant) return 'significant';
        if (changePercent >= this.changeThresholds.moderate) return 'moderate';
        if (changePercent >= this.changeThresholds.minor) return 'minor';
        return 'minimal';
    }

    // Get historical baseline for a metric
    getHistoricalBaseline(metricType, industry) {
        const key = `${industry}_${metricType}`;
        return this.historicalBaselines[key] || null;
    }

    // Update historical baseline
    updateHistoricalBaseline(metricType, industry, value, context) {
        const key = `${industry}_${metricType}`;
        this.historicalBaselines[key] = {
            value: value,
            metricType: metricType,
            industry: industry,
            context: context,
            timestamp: new Date().toISOString(),
            updateCount: (this.historicalBaselines[key]?.updateCount || 0) + 1
        };
        this.saveHistoricalBaselines();
    }

    // Extract context around a match
    extractContext(text, index, contextLength) {
        const start = Math.max(0, index - contextLength);
        const end = Math.min(text.length, index + contextLength);
        return text.substring(start, end).trim();
    }

    // Generate comprehensive anomaly report
    generateAnomalyReport(metrics) {
        if (!metrics || metrics.length === 0) {
            return {
                hasAnomalies: false,
                message: 'No metrics found for analysis'
            };
        }

        const anomalies = [];
        const warnings = [];
        const trends = [];

        metrics.forEach(metric => {
            // Check for validation anomalies
            if (metric.validation.severity === 'critical') {
                anomalies.push({
                    type: 'validation',
                    metric: metric.metricType,
                    value: metric.value,
                    message: metric.validation.message,
                    explanation: metric.validation.explanation
                });
            }

            // Check for trend anomalies
            if (metric.trend.requiresVerification) {
                trends.push({
                    type: 'trend',
                    metric: metric.metricType,
                    value: metric.value,
                    change: metric.trend.changePercent,
                    magnitude: metric.trend.magnitude,
                    message: metric.trend.message
                });
            }

            // Check for warnings
            if (metric.validation.severity === 'warning') {
                warnings.push({
                    type: 'warning',
                    metric: metric.metricType,
                    value: metric.value,
                    message: metric.validation.message
                });
            }
        });

        return {
            hasAnomalies: anomalies.length > 0 || trends.length > 0,
            anomalies: anomalies,
            warnings: warnings,
            trends: trends,
            totalMetrics: metrics.length,
            summary: this.generateSummary(anomalies, warnings, trends)
        };
    }

    // Generate summary of findings
    generateSummary(anomalies, warnings, trends) {
        let summary = '';

        if (anomalies.length > 0) {
            summary += `🚨 ${anomalies.length} critical anomaly(ies) detected\n`;
        }
        if (trends.length > 0) {
            summary += `🔍 ${trends.length} significant trend change(s) requiring verification\n`;
        }
        if (warnings.length > 0) {
            summary += `⚠️ ${warnings.length} warning(s) identified\n`;
        }
        if (anomalies.length === 0 && trends.length === 0 && warnings.length === 0) {
            summary += '✅ All metrics appear within normal ranges';
        }

        return summary;
    }

    // Process text and return comprehensive analysis
    async processText(text, industry = 'general') {
        try {
            console.log('🔍 Starting anomaly detection analysis...');
            
            // Extract and validate metrics
            const metrics = this.extractAndValidateMetrics(text, industry);
            console.log(`📊 Found ${metrics.length} metrics for analysis`);
            
            // Generate anomaly report
            const report = this.generateAnomalyReport(metrics);
            
            // Update baselines for future trend analysis
            metrics.forEach(metric => {
                if (metric.metricType) {
                    this.updateHistoricalBaseline(metric.metricType, industry, metric.value, metric.context);
                }
            });
            
            console.log('✅ Anomaly detection analysis completed');
            
            return {
                metrics: metrics,
                report: report,
                industry: industry,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('❌ Error in anomaly detection:', error);
            throw new Error('Anomaly detection failed: ' + error.message);
        }
    }

    // Get industry suggestions based on content
    suggestIndustry(text) {
        const lowerText = text.toLowerCase();
        
        if (/health|medical|insurance|mlr|medical loss ratio|premium|claims/.test(lowerText)) {
            return 'health_insurance';
        }
        if (/bank|financial|interest|margin|deposit|loan/.test(lowerText)) {
            return 'banking';
        }
        
        return 'general';
    }

    // Export historical data for analysis
    exportHistoricalData() {
        return {
            baselines: this.historicalBaselines,
            rules: this.industryRules,
            thresholds: this.changeThresholds
        };
    }

    // Import historical data
    importHistoricalData(data) {
        if (data.baselines) {
            this.historicalBaselines = { ...this.historicalBaselines, ...data.baselines };
        }
        this.saveHistoricalBaselines();
    }
}
