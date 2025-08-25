export class SettingsManager {
    constructor() {
        this.defaultRules = [
            'Focus on quarterly performance trends',
            'Prioritize revenue and earnings metrics',
            'Include strategic business insights',
            'Highlight financial risks and opportunities'
        ];
        
        this.presetCategories = {
            financial: [
                'Focus on quarterly performance trends',
                'Prioritize revenue and earnings metrics',
                'Include margin and profitability analysis',
                'Track cash flow and liquidity metrics'
            ],
            operational: [
                'Focus on operational efficiency metrics',
                'Include capacity and utilization data',
                'Highlight productivity improvements',
                'Track quality and performance metrics'
            ],
            growth: [
                'Emphasize growth and expansion initiatives',
                'Include market expansion strategies',
                'Track customer acquisition metrics',
                'Highlight partnership and acquisition opportunities'
            ],
            risk: [
                'Focus on risk management and compliance',
                'Include regulatory and governance issues',
                'Highlight liability and exposure factors',
                'Track audit and compliance metrics'
            ]
        };
        
        this.rules = this.loadRules();
        this.setupEventListeners();
    }
    
    loadRules() {
        const saved = localStorage.getItem('analysisRules');
        return saved ? JSON.parse(saved) : [...this.defaultRules];
    }
    
    saveRules() {
        localStorage.setItem('analysisRules', JSON.stringify(this.rules));
    }
    
    addRule(rule) {
        const cleanRule = rule.trim();
        if (cleanRule && !this.rules.includes(cleanRule)) {
            this.rules.push(cleanRule);
            this.saveRules();
            this.renderCurrentRules();
            return true;
        }
        return false;
    }
    
    removeRule(rule) {
        const index = this.rules.indexOf(rule);
        if (index > -1) {
            this.rules.splice(index, 1);
            this.saveRules();
            this.renderCurrentRules();
            return true;
        }
        return false;
    }
    
    addCategory(category) {
        const categoryRules = this.presetCategories[category] || [];
        let addedCount = 0;
        
        categoryRules.forEach(rule => {
            if (!this.rules.includes(rule)) {
                this.rules.push(rule);
                addedCount++;
            }
        });
        
        if (addedCount > 0) {
            this.saveRules();
            this.renderCurrentRules();
        }
        
        return addedCount;
    }
    
    resetToDefaults() {
        this.rules = [...this.defaultRules];
        this.saveRules();
        this.renderCurrentRules();
    }
    
    getRules() {
        return [...this.rules];
    }
    
    renderCurrentRules() {
        const container = document.getElementById('currentRules');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (this.rules.length === 0) {
            container.innerHTML = '<p class="text-sm text-gray-500 italic">No rules added yet</p>';
            return;
        }
        
        this.rules.forEach(rule => {
            const ruleElement = document.createElement('div');
            ruleElement.className = 'flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg';
            ruleElement.innerHTML = `
                <span class="text-sm text-gray-700">${rule}</span>
                <button class="remove-rule-btn text-red-500 hover:text-red-700 transition-colors" data-rule="${rule}">
                    <i class="fas fa-times text-xs"></i>
                </button>
            `;
            container.appendChild(ruleElement);
        });
        
        // Add event listeners to remove buttons
        container.querySelectorAll('.remove-rule-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const rule = e.currentTarget.dataset.rule;
                this.removeRule(rule);
            });
        });
    }
    
    setupEventListeners() {
        // Settings button
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.openSettings());
        }
        
        // Close settings button
        const closeSettingsBtn = document.getElementById('closeSettingsBtn');
        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        }
        
        // Add rule button
        const addRuleBtn = document.getElementById('addRuleBtn');
        if (addRuleBtn) {
            addRuleBtn.addEventListener('click', () => this.handleAddRule());
        }
        
        // New rule input (Enter key)
        const newRuleInput = document.getElementById('newRuleInput');
        if (newRuleInput) {
            newRuleInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleAddRule();
                }
            });
        }
        
        // Preset rule category buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('preset-rule-btn')) {
                const category = e.target.dataset.category;
                this.handleAddCategory(category);
            }
        });
        
        // Save settings button
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => this.closeSettings());
        }
        
        // Reset to defaults button
        const resetToDefaultsBtn = document.getElementById('resetToDefaultsBtn');
        if (resetToDefaultsBtn) {
            resetToDefaultsBtn.addEventListener('click', () => this.handleResetToDefaults());
        }
        
        // Close modal when clicking outside
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) {
            settingsModal.addEventListener('click', (e) => {
                if (e.target === settingsModal) {
                    this.closeSettings();
                }
            });
        }
    }
    
    openSettings() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.renderCurrentRules();
            
            // Focus on input
            const input = document.getElementById('newRuleInput');
            if (input) {
                input.focus();
            }
        }
    }
    
    closeSettings() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.classList.add('hidden');
            
            // Clear input
            const input = document.getElementById('newRuleInput');
            if (input) {
                input.value = '';
            }
        }
    }
    
    handleAddRule() {
        const input = document.getElementById('newRuleInput');
        if (!input) return;
        
        const rule = input.value.trim();
        if (rule) {
            if (this.addRule(rule)) {
                input.value = '';
                // Show success feedback
                this.showFeedback('Rule added successfully!', 'success');
            } else {
                this.showFeedback('Rule already exists or is invalid', 'error');
            }
        }
    }
    
    handleAddCategory(category) {
        const addedCount = this.addCategory(category);
        if (addedCount > 0) {
            this.showFeedback(`Added ${addedCount} rules from ${category} category`, 'success');
        } else {
            this.showFeedback('All rules from this category are already added', 'info');
        }
    }
    
    handleResetToDefaults() {
        if (confirm('Are you sure you want to reset to default rules? This will remove all custom rules.')) {
            this.resetToDefaults();
            this.showFeedback('Reset to default rules', 'success');
        }
    }
    
    showFeedback(message, type = 'info') {
        // Create feedback element
        const feedback = document.createElement('div');
        feedback.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white text-sm z-50 transition-all duration-300 transform translate-x-full`;
        
        // Set color based on type
        switch (type) {
            case 'success':
                feedback.className += ' bg-green-500';
                break;
            case 'error':
                feedback.className += ' bg-red-500';
                break;
            case 'info':
            default:
                feedback.className += ' bg-blue-500';
                break;
        }
        
        feedback.textContent = message;
        document.body.appendChild(feedback);
        
        // Animate in
        setTimeout(() => {
            feedback.classList.remove('translate-x-full');
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            feedback.classList.add('translate-x-full');
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        }, 3000);
    }
}
