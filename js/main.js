// Simple, Direct System - No Managers, No Complexity
// All code in one file - no modules needed

// Import DocumentProcessor for localStorage persistence
import { DocumentProcessor } from './modules/documentProcessor.js';
import { AnomalyDetectionService } from './modules/AnomalyDetectionService.js';

class SimpleAI {
    constructor() {
        // Initialize DocumentProcessor for proper localStorage persistence
        this.documentProcessor = new DocumentProcessor();
        this.documents = this.documentProcessor.getDocuments(); // Get documents from processor
        
        // Initialize Anomaly Detection Service
        this.anomalyDetection = new AnomalyDetectionService();
        
        this.currentTab = 'context';
        this.init();
    }

    init() {
        console.log('🚀 Initializing SimpleAI system...');
        
        // Initialize sidebar buttons
        this.initSidebarButtons();
        
        // Initialize file upload
        this.initFileUpload();
        
        // Initialize context analysis
        this.initContextAnalysis();
        
        // Initialize floating chat
        this.initFloatingChat();
        
        // Load any existing documents from localStorage
        this.loadExistingDocuments();
        
        // Initialize Drafts tab content
        this.updateDraftsTab();
        
        // Add a direct test function to window for debugging
        window.testSave = () => {
            console.log('🧪 Test save function called');
            this.saveDocument();
        };
        
        // Add a test function to manually open a draft
        window.testOpenDraft = (docId) => {
            console.log('🧪 Test open draft function called with ID:', docId);
            this.openSavedDocument(docId);
        };
        
        // Add a function to list all drafts
        window.listDrafts = () => {
            const stored = localStorage.getItem('earningsGenAI_savedDocuments');
            if (stored) {
                const drafts = JSON.parse(stored);
                console.log('📋 All saved drafts:', drafts);
                drafts.forEach((draft, index) => {
                    console.log(`📄 Draft ${index + 1}: ID=${draft.id}, Title="${draft.title}", OriginalTitle="${draft.originalTitle}"`);
                });
                return drafts;
            } else {
                console.log('📋 No drafts found in localStorage');
                return [];
            }
        };
        
        console.log('✅ Simple system ready!');
        console.log('🧪 Test save function available at window.testSave()');
        console.log('🧪 Test open draft function available at window.testOpenDraft(docId)');
        console.log('🧪 List drafts function available at window.listDrafts()');
        
        // Add a simple function to load drafts directly
        window.loadDraftDirectly = (docId) => {
            console.log('🧪 Load draft directly called with ID:', docId);
            this.loadDraftDirectly(docId);
        };
        
        console.log('🧪 Load draft directly function available at window.loadDraftDirectly(docId)');
        
        // Add anomaly detection test function
        window.testAnomalyDetection = (text) => {
            console.log('🧪 Testing anomaly detection with:', text);
            this.analyzeTextForAnomalies(text || 'The company reported an MLR of 2.1% for Q3, which represents a significant improvement from the previous quarter.');
        };
        
        console.log('🧪 Anomaly detection test function available at window.testAnomalyDetection(text)');
    }

    // Load existing documents from localStorage
    loadExistingDocuments() {
        // The DocumentProcessor automatically loads from localStorage in its constructor
        this.documents = this.documentProcessor.getDocuments();
        if (this.documents.length > 0) {
            console.log(`📂 Loaded ${this.documents.length} documents from localStorage`);
            this.updateFileList();
        } else {
            console.log('📂 No existing documents found in localStorage');
        }
    }

    // ============================================================================
    // SIDEBAR BUTTON SYSTEM
    // ============================================================================
    
    initSidebarButtons() {
        const settingsBtn = document.getElementById('settingsBtn');
        const editorBtn = document.getElementById('editorBtn');
        const folderBtn = document.getElementById('folderBtn');
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettings();
            });
        }
        
        if (editorBtn) {
            editorBtn.addEventListener('click', () => {
                this.focusEditor();
            });
        }
        
        if (folderBtn) {
            folderBtn.addEventListener('click', () => {
                this.showDocuments();
            });
        }
        
        const saveBtn = document.getElementById('saveBtn');
        console.log('🔍 Looking for save button...');
        console.log('🔍 Save button element:', saveBtn);
        console.log('🔍 Save button exists:', !!saveBtn);
        
        if (saveBtn) {
            console.log('✅ Save button found, adding event listener');
            console.log('✅ Save button innerHTML:', saveBtn.innerHTML);
            console.log('✅ Save button className:', saveBtn.className);
            
            // Remove any existing event listeners
            const newSaveBtn = saveBtn.cloneNode(true);
            saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
            
            newSaveBtn.addEventListener('click', (e) => {
                console.log('🔥🔥🔥 SAVE BUTTON CLICKED! 🔥🔥🔥');
                console.log('🔥 Event:', e);
                console.log('🔥 Target:', e.target);
                e.preventDefault();
                e.stopPropagation();
                this.saveDocument();
            });
            
            // Also add a test click handler
            newSaveBtn.addEventListener('mousedown', () => {
                console.log('🖱️ Save button mouse down');
            });
            
            newSaveBtn.addEventListener('mouseup', () => {
                console.log('🖱️ Save button mouse up');
            });
            
            console.log('✅ Event listeners added to save button');
        } else {
            console.error('❌ Save button not found in DOM');
            console.error('❌ Available elements with IDs:', Array.from(document.querySelectorAll('[id]')).map(el => el.id));
        }
        
        // Initialize sidebar toggle functionality
        this.initSidebarToggle();
        
        // Also initialize right panel tab switching
        this.initRightPanelTabs();
    }
    
    initSidebarToggle() {
        const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
        const contextPanel = document.getElementById('contextPanel');
        const sidebarToggleIcon = document.getElementById('sidebarToggleIcon');
        const restoreBtn = document.getElementById('sidebarRestoreBtn');
        
        if (sidebarToggleBtn && contextPanel) {
            // Button positioning handled by inline styles
            console.log('🚀 Toggle button initialized');
            
            sidebarToggleBtn.addEventListener('click', () => {
                this.toggleSidebar(contextPanel, sidebarToggleIcon);
            });
            
            // Add keyboard shortcut (Ctrl/Cmd + B) to toggle sidebar
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                    e.preventDefault();
                    this.toggleSidebar(contextPanel, sidebarToggleIcon);
                }
            });
        }
        
        // Initialize restore button functionality
        if (restoreBtn && contextPanel) {
            restoreBtn.addEventListener('click', () => {
                this.toggleSidebar(contextPanel, sidebarToggleIcon);
            });
        }
    }
    
    toggleSidebar(panel, icon) {
        const isCollapsed = panel.getAttribute('data-collapsed') === 'true';
        const restoreBtn = document.getElementById('sidebarRestoreBtn');
        const main = document.querySelector('main');
        const toggleBtn = document.getElementById('sidebarToggleBtn');
        
        if (isCollapsed) {
            // Expand sidebar
            panel.setAttribute('data-collapsed', 'false');
            panel.style.width = '500px';
            icon.className = 'fas fa-chevron-left';
            
            // Button position is now handled by CSS
            console.log('🔽 Sidebar expanded - button positioned at sidebar edge');
            
            // Hide restore button
            if (restoreBtn) {
                restoreBtn.classList.remove('show');
            }
            
            // Adjust main content margin
            if (main) {
                main.style.marginRight = '24px';
            }
            
            console.log('🔽 Sidebar expanded');
        } else {
            // Collapse sidebar completely
            panel.setAttribute('data-collapsed', 'true');
            panel.style.width = '0';
            icon.className = 'fas fa-chevron-right';
            
            // Button position is now handled by CSS
            console.log('🔼 Sidebar collapsed - button positioned at page edge');
            
            // Show restore button
            if (restoreBtn) {
                restoreBtn.classList.add('show');
            }
            
            // Adjust main content margin to use full width
            if (main) {
                main.style.marginRight = '24px';
            }
            
            console.log('🔼 Sidebar collapsed completely');
        }
    }
    
    initRightPanelTabs() {
        const contextTabHeader = document.getElementById('contextTabHeader');
        const knowledgeTabHeader = document.getElementById('knowledgeTabHeader');
        const draftsTabHeader = document.getElementById('draftsTabHeader');
        
        if (contextTabHeader) {
            contextTabHeader.addEventListener('click', () => {
                this.switchRightTab('context');
            });
        }
        
        if (knowledgeTabHeader) {
            knowledgeTabHeader.addEventListener('click', () => {
                this.switchRightTab('knowledge');
            });
        }
        
        if (draftsTabHeader) {
            draftsTabHeader.addEventListener('click', () => {
                this.switchRightTab('drafts');
            });
        }
    }
    
    showSettings() {
        console.log('⚙️ Settings clicked');
        
        // Create and show settings modal
        this.showSettingsModal();
    }

    showSettingsModal() {
        // Remove existing modal if any
        const existingModal = document.getElementById('settingsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create settings modal
        const modal = document.createElement('div');
        modal.id = 'settingsModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[95vh] overflow-y-auto">
                <div class="p-6 border-b border-slate-200">
                    <div class="flex items-center justify-between">
                        <h2 class="text-2xl font-bold text-slate-800">Settings & Company Configuration</h2>
                        <button onclick="this.closest('#settingsModal').remove()" class="text-slate-400 hover:text-slate-600 transition-colors">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>
                
                <div class="p-6 space-y-8">
                    <!-- Company Information Section -->
                    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                        <h3 class="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                            <i class="fas fa-building mr-3"></i>Company Focus Configuration
                        </h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-blue-700 mb-2">Company Ticker</label>
                                <input type="text" id="companyTicker" placeholder="e.g., UNH, JPM, AAPL" 
                                       class="w-full px-4 py-3 border border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-blue-700 mb-2">Company Name</label>
                                <input type="text" id="companyName" placeholder="e.g., UnitedHealth Group, JPMorgan Chase" 
                                       class="w-full px-4 py-3 border border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-blue-700 mb-2">Industry Focus</label>
                                <select id="industryFocus" class="w-full px-4 py-3 border border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none">
                                    <option value="auto">Auto-detect from documents</option>
                                    <option value="health_insurance">Health Insurance</option>
                                    <option value="banking">Banking</option>
                                    <option value="technology">Technology</option>
                                    <option value="retail">Retail</option>
                                    <option value="manufacturing">Manufacturing</option>
                                    <option value="energy">Energy</option>
                                    <option value="general">General</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-blue-700 mb-2">Reporting Period</label>
                                <select id="reportingPeriod" class="w-full px-4 py-3 border border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none">
                                    <option value="quarterly">Quarterly</option>
                                    <option value="annual">Annual</option>
                                    <option value="both">Both</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Key Metrics & Drivers Section -->
                    <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                        <h3 class="text-lg font-semibold text-green-800 mb-4 flex items-center">
                            <i class="fas fa-chart-line mr-3"></i>Key Metrics & Drivers
                        </h3>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-green-700 mb-2">Primary Financial Metrics (Auto-detected from documents)</label>
                                <div id="primaryMetrics" class="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <!-- Auto-populated from documents -->
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-green-700 mb-2">Key Performance Drivers</label>
                                <div id="keyDrivers" class="space-y-2">
                                    <!-- Auto-populated from documents -->
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-green-700 mb-2">Custom Metric Thresholds</label>
                                <div id="customThresholds" class="space-y-3">
                                    <!-- User-defined thresholds -->
                                </div>
                                <button onclick="window.simpleAI.addCustomThreshold()" class="mt-3 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm">
                                    <i class="fas fa-plus mr-2"></i>Add Custom Threshold
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Operational Themes Section -->
                    <div class="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200">
                        <h3 class="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                            <i class="fas fa-lightbulb mr-3"></i>Operational Themes & Initiatives
                        </h3>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-purple-700 mb-2">Strategic Initiatives (Auto-extracted from documents)</label>
                                <div id="strategicInitiatives" class="space-y-2">
                                    <!-- Auto-populated from documents -->
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-purple-700 mb-2">Operational Focus Areas</label>
                                <div id="operationalFocus" class="space-y-2">
                                    <!-- Auto-populated from documents -->
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-purple-700 mb-2">Risk Factors & Challenges</label>
                                <div id="riskFactors" class="space-y-2">
                                    <!-- Auto-populated from documents -->
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- AI Prompt Customization Section -->
                    <div class="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200">
                        <h3 class="text-lg font-semibold text-orange-800 mb-4 flex items-center">
                            <i class="fas fa-robot mr-3"></i>AI Analysis Prompts
                        </h3>
                        
                        <div class="space-y-6">
                            <div>
                                <h4 class="text-sm font-semibold text-orange-700 mb-3">Context Analysis Prompt</h4>
                                <p class="text-sm text-orange-600 mb-3">Customize how the AI analyzes selected text. Use {selectedText} as a placeholder for the selected text.</p>
                                <textarea id="contextPrompt" rows="10" class="w-full p-4 border border-orange-300 rounded-xl focus:border-orange-500 focus:outline-none font-mono text-sm">SELECTED TEXT ANALYSIS SYSTEM
PRIMARY DIRECTIVE
The selected text below is your ONLY focus. Every insight must directly explain, support, contradict, or provide context specifically for this exact text selection.

SELECTED TEXT (YOUR FOCUS)
"{selectedText}"

ANALYSIS APPROACH
Text-First: Start with the selected text - what does it claim, suggest, or imply?
Document Mining: Search documents specifically for information that relates to this exact text
Direct Connection: Every insight must answer "How does this document information relate to my selected text?"

SOURCE DOCUMENTS
{documents}

FORBIDDEN APPROACHES
❌ General document summaries
❌ Insights not directly tied to selected text
❌ Background information unless it explains the selected text
❌ Related but tangential topics

REQUIRED APPROACH
✅ Find document data that explains WHY the selected text is true/false
✅ Locate specific evidence that supports/contradicts the selected text
✅ Identify consequences or implications OF the selected text
✅ Find historical context that led TO the selected text situation

ANALYSIS QUESTIONS TO GUIDE YOU
What evidence in documents proves/disproves this selected text?
What caused the situation described in the selected text?
What are the consequences of what's stated in selected text?
How do the documents quantify or measure what's mentioned in selected text?
Who or what is affected by the selected text content?

OUTPUT FORMAT (ULTRA-CONCISE)
• PROVES: [Document evidence supporting selected text]
• CONTRADICTS: [Document evidence opposing selected text]
• EXPLAINS: [Why selected text happened/exists]
• IMPACT: [Consequence of selected text]
Choose 3-4 most relevant insight types. Maximum 8 words per bullet.

INSIGHT TYPE OPTIONS
PROVES: Document confirms selected text
CONTRADICTS: Document disputes selected text
EXPLAINS: Document shows why selected text occurred
QUANTIFIES: Document provides numbers for selected text
CAUSED: Document shows what led to selected text
IMPACTS: Document shows effects of selected text
WARNS: Document shows risks from selected text
COMPARES: Document contrasts selected text with alternatives

VALIDATION CHECK
Before outputting, ask yourself: "Does each insight directly relate to understanding, validating, or explaining the specific text the user selected?" If no, revise.

FALLBACK
If documents contain no information directly relating to the selected text: "No direct information found about selected text."</textarea>
                            </div>
                            
                            <div>
                                <h4 class="text-sm font-semibold text-orange-700 mb-3">Chat Analysis Prompt</h4>
                                <p class="text-sm text-orange-600 mb-3">Customize how the AI responds to chat queries. Use {query} as a placeholder for the user's question.</p>
                                <textarea id="chatPrompt" rows="8" class="w-full p-4 border border-orange-300 rounded-xl focus:border-orange-500 focus:outline-none font-mono text-sm">EXECUTIVE BRIEF: Answer this query using available documents.

QUERY: {query}

DOCUMENTS: {documents}

REQUIREMENTS:
- 4-5 bullet points maximum
- Use ONLY data from documents above
- Focus on business implications
- Executive-level, concise language
- No generic advice or assumptions

FORMAT:
• Key insight 1 (with specific data)
• Key insight 2 (with specific data)
• Key insight 3 (with specific data)
• Key insight 4 (with specific data)
• Strategic implication

Answer:</textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Anomaly Detection Settings -->
                    <div class="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 border border-red-200">
                        <h3 class="text-lg font-semibold text-red-800 mb-4 flex items-center">
                            <i class="fas fa-exclamation-triangle mr-3"></i>Anomaly Detection Configuration
                        </h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-red-700 mb-2">Sensitivity Level</label>
                                <select id="anomalySensitivity" class="w-full px-4 py-3 border border-red-300 rounded-lg focus:border-red-500 focus:outline-none">
                                    <option value="conservative">Conservative (fewer alerts)</option>
                                    <option value="standard" selected>Standard</option>
                                    <option value="aggressive">Aggressive (more alerts)</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-red-700 mb-2">Auto-flag Threshold</label>
                                <select id="anomalyAutoFlag" class="w-full px-4 py-3 border border-red-300 rounded-lg focus:border-red-500 focus:outline-none">
                                    <option value="critical">Critical anomalies only</option>
                                    <option value="warning" selected>Warnings and critical</option>
                                    <option value="all">All anomalies</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="mt-4">
                            <button onclick="window.simpleAI.exportAnomalyData()" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm mr-3">
                                <i class="fas fa-download mr-2"></i>Export Anomaly Data
                            </button>
                            <button onclick="window.simpleAI.importAnomalyData()" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm">
                                <i class="fas fa-upload mr-2"></i>Import Anomaly Data
                            </button>
                        </div>
                    </div>
                    
                    <!-- Save Button -->
                    <div class="flex justify-end space-x-3 pt-6 border-t border-slate-200">
                        <button onclick="this.closest('#settingsModal').remove()" class="px-6 py-3 text-slate-600 hover:text-slate-800 transition-colors">
                            Cancel
                        </button>
                        <button onclick="window.simpleAI.saveSettings()" class="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors">
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Load current settings and populate company-specific data
        this.loadSettings();
        this.populateCompanyData();
    }

    loadSettings() {
        const contextPrompt = localStorage.getItem('earningsGenAI_contextPrompt');
        const chatPrompt = localStorage.getItem('earningsGenAI_chatPrompt');
        const companyTicker = localStorage.getItem('earningsGenAI_companyTicker');
        const companyName = localStorage.getItem('earningsGenAI_companyName');
        const industryFocus = localStorage.getItem('earningsGenAI_industryFocus');
        const reportingPeriod = localStorage.getItem('earningsGenAI_reportingPeriod');
        const anomalySensitivity = localStorage.getItem('earningsGenAI_anomalySensitivity');
        const anomalyAutoFlag = localStorage.getItem('earningsGenAI_anomalyAutoFlag');
        
        if (contextPrompt) {
            const contextTextarea = document.getElementById('contextPrompt');
            if (contextTextarea) contextTextarea.value = contextPrompt;
        }
        
        if (chatPrompt) {
            const chatTextarea = document.getElementById('chatPrompt');
            if (chatTextarea) chatTextarea.value = chatPrompt;
        }
        
        if (companyTicker) {
            const tickerInput = document.getElementById('companyTicker');
            if (tickerInput) tickerInput.value = companyTicker;
        }
        
        if (companyName) {
            const nameInput = document.getElementById('companyName');
            if (nameInput) nameInput.value = companyName;
        }
        
        if (industryFocus) {
            const industrySelect = document.getElementById('industryFocus');
            if (industrySelect) industrySelect.value = industryFocus;
        }
        
        if (reportingPeriod) {
            const periodSelect = document.getElementById('reportingPeriod');
            if (periodSelect) periodSelect.value = reportingPeriod;
        }
        
        if (anomalySensitivity) {
            const sensitivitySelect = document.getElementById('anomalySensitivity');
            if (sensitivitySelect) sensitivitySelect.value = anomalySensitivity;
        }
        
        if (anomalyAutoFlag) {
            const autoFlagSelect = document.getElementById('anomalyAutoFlag');
            if (autoFlagSelect) autoFlagSelect.value = anomalyAutoFlag;
        }
    }

    async saveSettings() {
        const contextPrompt = document.getElementById('contextPrompt')?.value;
        const chatPrompt = document.getElementById('chatPrompt')?.value;
        const companyTicker = document.getElementById('companyTicker')?.value;
        const companyName = document.getElementById('companyName')?.value;
        const industryFocus = document.getElementById('industryFocus')?.value;
        const reportingPeriod = document.getElementById('reportingPeriod')?.value;
        const anomalySensitivity = document.getElementById('anomalySensitivity')?.value;
        const anomalyAutoFlag = document.getElementById('anomalyAutoFlag')?.value;
        
        try {
            // Save to localStorage
            if (contextPrompt) {
                localStorage.setItem('earningsGenAI_contextPrompt', contextPrompt);
            }
            
            if (chatPrompt) {
                localStorage.setItem('earningsGenAI_chatPrompt', chatPrompt);
            }
            
            if (companyTicker) {
                localStorage.setItem('earningsGenAI_companyTicker', companyTicker);
            }
            
            if (companyName) {
                localStorage.setItem('earningsGenAI_companyName', companyName);
            }
            
            if (industryFocus) {
                localStorage.setItem('earningsGenAI_industryFocus', industryFocus);
            }
            
            if (reportingPeriod) {
                localStorage.setItem('earningsGenAI_reportingPeriod', reportingPeriod);
            }
            
            if (anomalySensitivity) {
                localStorage.setItem('earningsGenAI_anomalySensitivity', anomalySensitivity);
            }
            
            if (anomalyAutoFlag) {
                localStorage.setItem('earningsGenAI_anomalyAutoFlag', anomalyAutoFlag);
            }
            
            // Send updated prompts to server
            const response = await fetch('/api/prompts/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contextPrompt: contextPrompt,
                    chatPrompt: chatPrompt
                })
            });
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('✅ Server prompts updated:', result);
            
            // Close modal
            const modal = document.getElementById('settingsModal');
            if (modal) {
                modal.remove();
            }
            
            // Show success message
            this.showToast('Settings saved successfully!', 'success');
            
        } catch (error) {
            console.error('❌ Error saving settings:', error);
            this.showToast('Settings saved locally but server update failed', 'error');
            
            // Still close modal and save locally
            const modal = document.getElementById('settingsModal');
            if (modal) {
                modal.remove();
            }
                }
    }
    
    // Populate company-specific data from uploaded documents
    populateCompanyData() {
        try {
            console.log('🏢 Populating company data from documents...');
            
            // Populate primary metrics
            this.populatePrimaryMetrics();
            
            // Populate key drivers
            this.populateKeyDrivers();
            
            // Populate strategic initiatives
            this.populateStrategicInitiatives();
            
            // Populate operational focus areas
            this.populateOperationalFocus();
            
            // Populate risk factors
            this.populateRiskFactors();
            
        } catch (error) {
            console.error('❌ Error populating company data:', error);
        }
    }
    
    // Extract and display primary financial metrics
    populatePrimaryMetrics() {
        const primaryMetricsDiv = document.getElementById('primaryMetrics');
        if (!primaryMetricsDiv) return;
        
        const metrics = this.extractMetricsFromDocuments();
        if (metrics.length === 0) {
            primaryMetricsDiv.innerHTML = '<p class="text-sm text-gray-500 italic">No metrics detected yet. Upload documents to auto-populate.</p>';
            return;
        }
        
        const metricsHtml = metrics.map(metric => `
            <div class="p-3 bg-green-100 border border-green-200 rounded-lg">
                <div class="font-medium text-green-800">${metric.name}</div>
                <div class="text-sm text-green-600">${metric.value}${metric.unit}</div>
                <div class="text-xs text-green-500">${metric.frequency} mentions</div>
            </div>
        `).join('');
        
        primaryMetricsDiv.innerHTML = metricsHtml;
    }
    
    // Extract and display key performance drivers
    populateKeyDrivers() {
        const keyDriversDiv = document.getElementById('keyDrivers');
        if (!keyDriversDiv) return;
        
        const drivers = this.extractDriversFromDocuments();
        if (drivers.length === 0) {
            keyDriversDiv.innerHTML = '<p class="text-sm text-gray-500 italic">No drivers identified yet. Upload documents to auto-populate.</p>';
            return;
        }
        
        const driversHtml = drivers.map(driver => `
            <div class="p-3 bg-blue-100 border border-blue-200 rounded-lg">
                <div class="font-medium text-blue-800">${driver.name}</div>
                <div class="text-sm text-blue-600">${driver.description}</div>
                <div class="text-xs text-blue-500">${driver.impact}</div>
            </div>
        `).join('');
        
        keyDriversDiv.innerHTML = driversHtml;
    }
    
    // Extract and display strategic initiatives
    populateStrategicInitiatives() {
        const initiativesDiv = document.getElementById('strategicInitiatives');
        if (!initiativesDiv) return;
        
        const initiatives = this.extractInitiativesFromDocuments();
        if (initiatives.length === 0) {
            initiativesDiv.innerHTML = '<p class="text-sm text-gray-500 italic">No initiatives identified yet. Upload documents to auto-populate.</p>';
            return;
        }
        
        const initiativesHtml = initiatives.map(initiative => `
            <div class="p-3 bg-purple-100 border border-purple-200 rounded-lg">
                <div class="font-medium text-purple-800">${initiative.name}</div>
                <div class="text-sm text-purple-600">${initiative.description}</div>
                <div class="text-xs text-purple-500">${initiative.status}</div>
            </div>
        `).join('');
        
        initiativesDiv.innerHTML = initiativesHtml;
    }
    
    // Extract and display operational focus areas
    populateOperationalFocus() {
        const focusDiv = document.getElementById('operationalFocus');
        if (!focusDiv) return;
        
        const focusAreas = this.extractFocusAreasFromDocuments();
        if (focusAreas.length === 0) {
            focusDiv.innerHTML = '<p class="text-sm text-gray-500 italic">No focus areas identified yet. Upload documents to auto-populate.</p>';
            return;
        }
        
        const focusHtml = focusAreas.map(area => `
            <div class="p-3 bg-indigo-100 border border-indigo-200 rounded-lg">
                <div class="font-medium text-indigo-800">${area.name}</div>
                <div class="text-sm text-indigo-600">${area.description}</div>
                <div class="text-xs text-indigo-500">${area.priority}</div>
            </div>
        `).join('');
        
        focusDiv.innerHTML = focusHtml;
    }
    
    // Extract and display risk factors
    populateRiskFactors() {
        const risksDiv = document.getElementById('riskFactors');
        if (!risksDiv) return;
        
        const risks = this.extractRisksFromDocuments();
        if (risks.length === 0) {
            risksDiv.innerHTML = '<p class="text-sm text-gray-500 italic">No risk factors identified yet. Upload documents to auto-populate.</p>';
            return;
        }
        
        const risksHtml = risks.map(risk => `
            <div class="p-3 bg-red-100 border border-red-200 rounded-lg">
                <div class="font-medium text-red-800">${risk.name}</div>
                <div class="text-sm text-red-600">${risk.description}</div>
                <div class="text-xs text-red-500">${risk.severity}</div>
            </div>
        `).join('');
        
        risksDiv.innerHTML = risksHtml;
    }
    
    // Extract metrics from uploaded documents
    extractMetricsFromDocuments() {
        if (!this.documents || this.documents.length === 0) return [];
        
        const metrics = [];
        const metricPatterns = [
            { name: 'Revenue', pattern: /revenue|sales|top\s*line/gi, unit: '' },
            { name: 'EBITDA', pattern: /ebitda|operating\s*income/gi, unit: '' },
            { name: 'MLR', pattern: /medical\s*loss\s*ratio|mlr/gi, unit: '%' },
            { name: 'Efficiency Ratio', pattern: /efficiency\s*ratio/gi, unit: '%' },
            { name: 'Growth Rate', pattern: /growth|increase|decrease/gi, unit: '%' }
        ];
        
        metricPatterns.forEach(metric => {
            let count = 0;
            this.documents.forEach(doc => {
                const matches = doc.text.match(metric.pattern);
                if (matches) count += matches.length;
            });
            
            if (count > 0) {
                metrics.push({
                    name: metric.name,
                    value: 'Auto-detected',
                    unit: metric.unit,
                    frequency: count
                });
            }
        });
        
        return metrics;
    }
    
    // Extract drivers from documents
    extractDriversFromDocuments() {
        if (!this.documents || this.documents.length === 0) return [];
        
        const drivers = [];
        const driverKeywords = [
            'cost management', 'operational efficiency', 'market expansion', 
            'digital transformation', 'customer acquisition', 'product innovation'
        ];
        
        driverKeywords.forEach(keyword => {
            let count = 0;
            this.documents.forEach(doc => {
                const regex = new RegExp(keyword, 'gi');
                const matches = doc.text.match(regex);
                if (matches) count += matches.length;
            });
            
            if (count > 0) {
                drivers.push({
                    name: keyword.replace(/\b\w/g, l => l.toUpperCase()),
                    description: 'Identified in documents',
                    impact: `${count} mentions`
                });
            }
        });
        
        return drivers;
    }
    
    // Extract initiatives from documents
    extractInitiativesFromDocuments() {
        if (!this.documents || this.documents.length === 0) return [];
        
        const initiatives = [];
        const initiativeKeywords = [
            'strategic', 'initiative', 'transformation', 'program', 'project',
            'investment', 'expansion', 'restructuring', 'optimization'
        ];
        
        initiativeKeywords.forEach(keyword => {
            let count = 0;
            this.documents.forEach(doc => {
                const regex = new RegExp(keyword, 'gi');
                const matches = doc.text.match(regex);
                if (matches) count += matches.length;
            });
            
            if (count > 0) {
                initiatives.push({
                    name: keyword.replace(/\b\w/g, l => l.toUpperCase()),
                    description: 'Strategic focus area',
                    status: `${count} mentions`
                });
            }
        });
        
        return initiatives;
    }
    
    // Extract focus areas from documents
    extractFocusAreasFromDocuments() {
        if (!this.documents || this.documents.length === 0) return [];
        
        const focusAreas = [];
        const focusKeywords = [
            'operational', 'efficiency', 'quality', 'service', 'delivery',
            'process', 'workflow', 'automation', 'technology', 'innovation'
        ];
        
        focusKeywords.forEach(keyword => {
            let count = 0;
            this.documents.forEach(doc => {
                const regex = new RegExp(keyword, 'gi');
                const matches = doc.text.match(regex);
                if (matches) count += matches.length;
            });
            
            if (count > 0) {
                focusAreas.push({
                    name: keyword.replace(/\b\w/g, l => l.toUpperCase()),
                    description: 'Operational priority',
                    priority: `${count} mentions`
                });
            }
        });
        
        return focusAreas;
    }
    
    // Extract risks from documents
    extractRisksFromDocuments() {
        if (!this.documents || this.documents.length === 0) return [];
        
        const risks = [];
        const riskKeywords = [
            'risk', 'challenge', 'uncertainty', 'volatility', 'headwind',
            'pressure', 'concern', 'caution', 'adverse', 'negative'
        ];
        
        riskKeywords.forEach(keyword => {
            let count = 0;
            this.documents.forEach(doc => {
                const regex = new RegExp(keyword, 'gi');
                const matches = doc.text.match(regex);
                if (matches) count += matches.length;
            });
            
            if (count > 0) {
                risks.push({
                    name: keyword.replace(/\b\w/g, l => l.toUpperCase()),
                    description: 'Risk factor identified',
                    severity: `${count} mentions`
                });
            }
        });
        
        return risks;
    }
    
    // Add custom metric threshold
    addCustomThreshold() {
        const customThresholdsDiv = document.getElementById('customThresholds');
        if (!customThresholdsDiv) return;
        
        const thresholdHtml = `
            <div class="p-3 bg-gray-100 border border-gray-200 rounded-lg">
                <div class="grid grid-cols-3 gap-3">
                    <input type="text" placeholder="Metric name" class="px-3 py-2 border border-gray-300 rounded text-sm">
                    <input type="number" placeholder="Min value" class="px-3 py-2 border border-gray-300 rounded text-sm">
                    <input type="number" placeholder="Max value" class="px-3 py-2 border border-gray-300 rounded text-sm">
                </div>
            </div>
        `;
        
        customThresholdsDiv.insertAdjacentHTML('beforeend', thresholdHtml);
    }
    
    // Import anomaly detection data
    importAnomalyData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        this.anomalyDetection.importHistoricalData(data);
                        this.showToast('Anomaly detection data imported successfully!', 'success');
                    } catch (error) {
                        this.showToast('Failed to import data: Invalid format', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }
    
    showToast(message, type = 'info') {
        // Remove existing toast if any
        const existingToast = document.getElementById('toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = `fixed top-4 right-4 px-6 py-3 rounded-xl text-white z-50 transition-all duration-300 ${
            type === 'success' ? 'bg-green-500' : 'bg-blue-500'
        }`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 3000);
    }
    
    focusEditor() {
        console.log('✏️ Editor clicked');
        const articleEditor = document.getElementById('articleEditor');
        if (articleEditor) {
            articleEditor.focus();
            // Scroll to editor
            articleEditor.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    showDocuments() {
        console.log('📁 Folder clicked - navigating to folders page');
        // Navigate to the new folders page
        window.location.href = 'folders.html';
    }
    
    saveDocument() {
        console.log('💾💾💾 SAVE DOCUMENT FUNCTION CALLED! 💾💾💾');
        console.log('💾 This context:', this);
        console.log('💾 Function scope:', typeof this.saveDocument);
        
        try {
            // Get current document content
            const titleInput = document.getElementById('articleTitle');
            const editorContent = document.getElementById('articleEditor');
            
            console.log('📝 Title input element:', titleInput);
            console.log('📝 Editor content element:', editorContent);
            console.log('📝 Title input exists:', !!titleInput);
            console.log('📝 Editor content exists:', !!editorContent);
            
            if (!titleInput || !editorContent) {
                console.error('❌ Could not find title or editor elements');
                console.error('❌ Available elements:', {
                    articleTitle: document.getElementById('articleTitle'),
                    articleEditor: document.getElementById('articleEditor'),
                    allIds: Array.from(document.querySelectorAll('[id]')).map(el => el.id)
                });
                alert('ERROR: Could not find editor elements. Check console for details.');
                return;
            }
            
            // Test if we can read the content
            const originalTitle = titleInput.value.trim() || 'Untitled Document';
            const content = editorContent.innerText || editorContent.textContent || '';
            const htmlContent = editorContent.innerHTML || '';
            
            // Create date-time prefix (YYYY-MM-DD_HH-MM format)
            const now = new Date();
            console.log('🕒 Current date object:', now);
            console.log('🕒 Year:', now.getFullYear());
            console.log('🕒 Month:', now.getMonth() + 1);
            console.log('🕒 Date:', now.getDate());
            console.log('🕒 Hours:', now.getHours());
            console.log('🕒 Minutes:', now.getMinutes());
            
            const dateStr = now.getFullYear() + '-' + 
                           String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                           String(now.getDate()).padStart(2, '0');
            const timeStr = String(now.getHours()).padStart(2, '0') + '-' + 
                           String(now.getMinutes()).padStart(2, '0');
            const dateTimePrefix = dateStr + '_' + timeStr;
            
            // Combine prefix with original title
            const title = dateTimePrefix + '_' + originalTitle;
            
            console.log('📝 Original title:', originalTitle);
            console.log('📝 Date string:', dateStr);
            console.log('📝 Time string:', timeStr);
            console.log('📝 Date-time prefix:', dateTimePrefix);
            console.log('📝 Final title:', title);
            console.log('📝 Content length:', content.length);
            console.log('📝 HTML content length:', htmlContent.length);
            console.log('📝 Content preview:', content.substring(0, 100));
            
            if (!content.trim()) {
                alert('Document is empty. Please add some content before saving.');
                return;
            }
            
            // Create document object
            const docObject = {
                id: Date.now().toString(),
                title: title,
                originalTitle: originalTitle, // Keep original title for reference
                text: content, // Use 'text' to match the folders.html structure
                html: htmlContent, // Use 'html' to match the folders.html structure
                wordCount: content.split(/\s+/).filter(word => word.length > 0).length,
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                folderId: 'drafts-default', // Save to Drafts folder by default
                type: 'draft' // Mark as draft document
            };
            
            console.log('📄 Document object created:', docObject);
            
            // Load existing documents
            let savedDocuments = [];
            const stored = localStorage.getItem('earningsGenAI_savedDocuments');
            if (stored) {
                try {
                    savedDocuments = JSON.parse(stored);
                } catch (error) {
                    console.error('❌ Error parsing saved documents:', error);
                    savedDocuments = [];
                }
            }
            
            // Add new document
            savedDocuments.push(docObject);
            
            // Save to localStorage
            try {
                console.log('💾 About to save to localStorage. Final docObject:', docObject);
                localStorage.setItem('earningsGenAI_savedDocuments', JSON.stringify(savedDocuments));
                console.log('✅ Document saved to localStorage. Title saved:', title);
                console.log('✅ Full saved data:', JSON.stringify(savedDocuments));
                
                // Update the Drafts tab content
                this.updateDraftsTab();
                
                // Success message removed - no more annoying notifications
                
            } catch (error) {
                console.error('❌ Error saving document:', error);
                alert('Failed to save document. Please try again.');
            }
            
        } catch (error) {
            console.error('❌❌❌ CRITICAL ERROR IN SAVE FUNCTION:', error);
            alert('Critical error in save function: ' + error.message);
        }
    }
    


    updateDraftsTab() {
        // Load saved documents from localStorage
        let savedDocuments = [];
        const stored = localStorage.getItem('earningsGenAI_savedDocuments');
        console.log('🔍 Raw stored drafts data:', stored);
        
        if (stored) {
            try {
                savedDocuments = JSON.parse(stored);
                console.log('📝 Parsed saved documents:', savedDocuments);
                console.log('📝 Document types:', savedDocuments.map(doc => ({ title: doc.title, type: doc.type, folderId: doc.folderId })));
            } catch (error) {
                console.error('❌ Error parsing saved documents:', error);
                savedDocuments = [];
            }
        }

        // Filter to only show actual drafts (not memory files)
        const actualDrafts = savedDocuments.filter(doc => doc.type === 'draft' || !doc.type);
        console.log('📝 Filtered drafts:', actualDrafts);

        // Update the Drafts tab content
        const draftsContent = document.getElementById('draftsContent');
        if (draftsContent) {
            if (actualDrafts.length === 0) {
                draftsContent.innerHTML = `
                    <div class="text-center py-8 text-slate-600">
                        <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-file-alt text-2xl text-slate-400"></i>
                        </div>
                        <h3 class="text-lg font-medium text-slate-900 mb-2">No saved drafts yet</h3>
                        <p class="text-slate-500">Save documents from the editor to see them here</p>
                    </div>
                `;
            } else {
                let draftsHTML = '<div class="space-y-1 px-4 py-4">';
                draftsHTML += '<h3 class="text-sm font-medium text-slate-700 mb-3">Drafts</h3>';
                
                actualDrafts.forEach((doc, index) => {
                    const wordCount = doc.wordCount || 0;
                    const modifiedDate = new Date(doc.modified).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    
                    // Show original title (without date-time prefix) for cleaner display
                    const displayTitle = doc.originalTitle || doc.title;
                    
                    draftsHTML += `
                        <div class="flex items-center py-1 px-2 hover:bg-slate-50 rounded cursor-pointer text-sm" onclick="window.simpleAI.loadDraftDirectly('${doc.id}')">
                            <i class="fas fa-file-alt text-slate-400 w-4 mr-3"></i>
                            <span class="flex-1 text-slate-800 truncate">${displayTitle}</span>
                            <span class="text-xs text-slate-500 ml-2 whitespace-nowrap">${modifiedDate}</span>
                            <span class="text-xs text-slate-400 ml-2 w-12 text-right">${wordCount}w</span>
                        </div>
                    `;
                });
                
                draftsHTML += '</div>';
                draftsContent.innerHTML = draftsHTML;
            }
        }
        
        console.log('📝 Drafts tab updated with', actualDrafts.length, 'draft documents');
    }

    openSavedDocument(docId) {
        console.log('🔥 Opening saved document:', docId);
        
        // Load saved documents
        let savedDocuments = [];
        const stored = localStorage.getItem('earningsGenAI_savedDocuments');
        if (stored) {
            try {
                savedDocuments = JSON.parse(stored);
            } catch (error) {
                console.error('❌ Error parsing saved documents:', error);
                return;
            }
        }

        // Find the document
        const document = savedDocuments.find(doc => doc.id === docId);
        if (!document) {
            console.error('❌ Document not found:', docId);
            return;
        }

        console.log('📄 Found document:', document.title);

        // Load document into editor
        const titleInput = document.getElementById('articleTitle');
        const editorContent = document.getElementById('articleEditor');
        
        console.log('📝 Title element:', titleInput);
        console.log('📝 Editor element:', editorContent);
        
        if (titleInput && editorContent) {
            // Use original title (without date-time prefix) when loading back to editor
            const titleToLoad = document.originalTitle || document.title;
            titleInput.value = titleToLoad;
            editorContent.innerHTML = document.html || document.text || '';
            
            // Switch to context tab to show the loaded content
            this.switchRightTab('context');
            
            console.log('✅ Document loaded into editor:', titleToLoad);
            console.log('✅ Title input value set to:', titleInput.value);
            console.log('✅ Editor content set to:', editorContent.innerHTML.substring(0, 200) + '...');
            
            // Show a brief success message (using alert for now)
            alert(`"${titleToLoad}" loaded into editor successfully!`);
        } else {
            console.error('❌ Could not find title or editor elements');
        }
    }
    
    switchRightTab(tabName) {
        console.log(`🔄 Switching right panel to: ${tabName}`);
        
        // Update tab headers
        const contextTabHeader = document.getElementById('contextTabHeader');
        const knowledgeTabHeader = document.getElementById('knowledgeTabHeader');
        const draftsTabHeader = document.getElementById('draftsTabHeader');
        
        // Reset all tabs to inactive state
        if (contextTabHeader) {
            contextTabHeader.className = 'flex-1 px-6 py-4 text-sm font-medium text-slate-600 hover:text-slate-800 border-b-2 border-transparent hover:border-slate-300 transition-all duration-300 hover:bg-slate-50/50';
            contextTabHeader.classList.remove('active');
            console.log('🔵 Context tab reset to inactive');
        }
        if (knowledgeTabHeader) {
            knowledgeTabHeader.className = 'flex-1 px-6 py-4 text-sm font-medium text-slate-600 hover:text-slate-800 border-b-2 border-transparent hover:border-slate-300 transition-all duration-300 hover:bg-slate-50/50';
            knowledgeTabHeader.classList.remove('active');
            console.log('🔵 Memory tab reset to inactive');
        }
        if (draftsTabHeader) {
            draftsTabHeader.className = 'flex-1 px-6 py-4 text-sm font-medium text-slate-600 hover:text-slate-800 border-b-2 border-transparent hover:border-slate-300 transition-all duration-300 hover:bg-slate-50/50';
            draftsTabHeader.classList.remove('active');
            console.log('🔵 Drafts tab reset to inactive');
        }
        
        if (tabName === 'context' && contextTabHeader) {
            contextTabHeader.className = 'flex-1 px-6 py-4 text-sm font-semibold text-blue-700 border-b-2 border-blue-500 bg-blue-50/80 backdrop-blur-sm';
            contextTabHeader.classList.add('active');
            console.log('🔵 Context tab set to active');
        } else if (tabName === 'knowledge' && knowledgeTabHeader) {
            knowledgeTabHeader.className = 'flex-1 px-6 py-4 text-sm font-semibold text-blue-700 border-b-2 border-blue-500 bg-blue-50/80 backdrop-blur-sm';
            knowledgeTabHeader.classList.add('active');
            console.log('🔵 Memory tab set to active');
        } else if (tabName === 'drafts' && draftsTabHeader) {
            draftsTabHeader.className = 'flex-1 px-6 py-4 text-sm font-semibold text-blue-700 border-b-2 border-blue-500 bg-blue-50/80 backdrop-blur-sm';
            draftsTabHeader.classList.add('active');
            console.log('🔵 Drafts tab set to active');
        }
        
        // Update tab content visibility
        const contextContent = document.getElementById('contextContent');
        const knowledgeContent = document.getElementById('knowledgeContent');
        const draftsContent = document.getElementById('draftsContent');
        
        if (contextContent) contextContent.classList.add('hidden');
        if (knowledgeContent) knowledgeContent.classList.add('hidden');
        if (draftsContent) draftsContent.classList.add('hidden');
        
        if (tabName === 'context' && contextContent) {
            contextContent.classList.remove('hidden');
        } else if (tabName === 'knowledge' && knowledgeContent) {
            knowledgeContent.classList.remove('hidden');
        } else if (tabName === 'drafts' && draftsContent) {
            draftsContent.classList.remove('hidden');
        }
        
        console.log(`✅ Right panel switched to: ${tabName}`);
    }

    // ============================================================================
    // FILE UPLOAD SYSTEM
    // ============================================================================
    
    initFileUpload() {
        const fileUploadBox = document.getElementById('fileUploadBox');
        const fileInput = document.getElementById('fileInput');
        
        if (fileUploadBox && fileInput) {
            fileUploadBox.addEventListener('click', () => {
                fileInput.click();
            });
            
            fileInput.addEventListener('change', (e) => {
                this.handleFileUpload(e.target.files);
            });
            
            // Drag and drop
            fileUploadBox.addEventListener('dragover', (e) => {
                e.preventDefault();
                fileUploadBox.classList.add('border-blue-400', 'bg-blue-50');
            });
            
            fileUploadBox.addEventListener('dragleave', () => {
                fileUploadBox.classList.remove('border-blue-400', 'bg-blue-50');
            });
            
            fileUploadBox.addEventListener('drop', (e) => {
                e.preventDefault();
                fileUploadBox.classList.remove('border-blue-400', 'bg-blue-50');
                this.handleFileUpload(e.dataTransfer.files);
            });
        }
    }
    
    async handleFileUpload(files) {
        for (const file of files) {
            try {
                const text = await this.readFileAsText(file);
                // Add document to DocumentProcessor (which saves to localStorage)
                this.documentProcessor.addDocument({
                    name: file.name,
                    text: text,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified
                });
                
                // Refresh documents array from processor
                this.documents = this.documentProcessor.getDocuments();
                
                console.log(`✅ File uploaded: ${file.name}`);
                this.updateFileList();
            } catch (error) {
                console.error(`❌ Error reading file ${file.name}:`, error);
                alert(`Error reading file ${file.name}. Please try again.`);
            }
        }
    }
    
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
    
    updateFileList() {
        const fileList = document.getElementById('fileList');
        if (!fileList) return;
        
        fileList.innerHTML = '';
        
        this.documents.forEach((doc, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <i class="fas fa-file-alt text-blue-500 mr-3"></i>
                        <div>
                            <h4 class="font-semibold text-slate-800">${doc.name}</h4>
                            <p class="text-sm text-slate-600">${this.formatFileSize(doc.size)} • ${this.formatDate(doc.lastModified)}</p>
                        </div>
                    </div>
                    <button class="text-red-500 hover:text-red-700 transition-colors" onclick="window.simpleAI.deleteDocument(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            fileList.appendChild(fileItem);
        });
    }
    
    deleteDocument(index) {
        if (confirm('Are you sure you want to delete this document?')) {
            const docToDelete = this.documents[index];
            if (docToDelete) {
                this.documentProcessor.removeDocument(docToDelete.name);
                this.documents = this.documentProcessor.getDocuments(); // Refresh documents array
                this.updateFileList();
                console.log('🗑️ Document deleted:', docToDelete.name);
            }
        }
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    formatDate(timestamp) {
        return new Date(timestamp).toLocaleDateString();
    }

    // ============================================================================
    // CONTEXT ANALYSIS SYSTEM
    // ============================================================================
    
    initContextAnalysis() {
        const articleEditor = document.getElementById('articleEditor');
        if (articleEditor) {
            // Only handle text selection, not clicks
            articleEditor.addEventListener('mouseup', (e) => {
                const selection = window.getSelection();
                const selectedText = selection.toString().trim();
                
                console.log('Mouse up event, selected text:', selectedText);
                
                if (selectedText) {
                    // Store the last selected text for anomaly detection
                    this.lastSelectedText = selectedText;
                    
                    // User has selected text, show context button
                    const range = selection.getRangeAt(0);
                    const rect = range.getBoundingClientRect();
                    const x = rect.left + rect.width/2;
                    const y = rect.top - 10; // Position above the text
                    
                    console.log('Showing context button at:', x, y);
                    this.showContextButton(selectedText, x, y);
                } else {
                    // No text selected, hide context button
                    this.hideContextButton();
                }
            });
            
            // Hide context button when clicking elsewhere
            document.addEventListener('click', (e) => {
                if (!e.target.closest('#contextButton') && !e.target.closest('#articleEditor')) {
                    this.hideContextButton();
                }
            });
        }
    }
    
    showContextButton(text, x, y) {
        // Remove existing context button
        this.hideContextButton();
        
        // Create new context button
        const contextButton = document.createElement('button');
        contextButton.id = 'contextButton';
        contextButton.className = 'context-button';
        contextButton.innerHTML = '<i class="fas fa-lightbulb mr-2"></i>Get Context';
        contextButton.style.left = x + 'px';
        contextButton.style.top = y + 'px';
        
        contextButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            this.analyzeContext(text);
            this.hideContextButton();
        });
        
        document.body.appendChild(contextButton);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            this.hideContextButton();
        }, 10000);
    }
    
    hideContextButton() {
        const existingButton = document.getElementById('contextButton');
        if (existingButton) {
            existingButton.remove();
        }
    }
    
    async analyzeContext(text) {
        if (!text || text.trim().length === 0) {
            alert('Please select some text for analysis.');
            return;
        }

        console.log('🔍 Starting RAG context analysis for:', text);
        
        // Show loading status immediately
        this.showLoadingStatus(text);
        
        try {
            // Use the actual RAG backend to get real context
            const response = await fetch('/api/analyze-context', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: text,
                    documents: this.documents // Include uploaded documents for context
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const analysis = await response.json();
            this.hideLoadingStatus();
            this.displayRAGContextAnalysis(analysis, text);
            console.log('✅ RAG context analysis completed successfully');
            
        } catch (error) {
            console.error('❌ RAG context analysis error:', error);
            this.hideLoadingStatus();
            // Fallback to simple analysis if RAG fails
            const fallbackAnalysis = this.generateContextAnalysis(text);
            this.displayContextAnalysis(fallbackAnalysis);
        }
    }
    
    generateContextAnalysis(text) {
        // Always use RAG analysis instead of fallback
        // This method is now just a backup if the server completely fails
        const lowerText = text.toLowerCase().trim();
        
        // Handle longer text
        const keywords = lowerText.match(/\b\w{4,}\b/g) || [];
        const uniqueKeywords = [...new Set(keywords)].slice(0, 10);
        
        return {
            text: text,
            keywords: uniqueKeywords,
            analysis: `Analysis of: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"\n\nKey topics identified:\n${uniqueKeywords.map(kw => `• ${kw}`).join('\n')}\n\nThis appears to be financial/earnings related content. Consider analyzing revenue trends, growth metrics, and market performance.`
        };
    }
    
    // generateSingleWordAnalysis method removed - now always uses RAG analysis
    
    displayRAGContextAnalysis(analysis, selectedText) {
        const contextContent = document.getElementById('contextContent');
        if (!contextContent) return;
        
        console.log('🎯 Displaying RAG context analysis for:', selectedText);
        console.log('📊 Analysis content:', analysis);
        
        contextContent.innerHTML = `
            <div class="space-y-4">
                <div class="border-b border-slate-200 pb-4">
                    <h3 class="text-sm font-semibold text-slate-800">"${selectedText}"</h3>
                </div>
                
                <div class="border-b border-slate-200 pb-3">
                    <h4 class="font-semibold text-slate-800 mb-2">Context:</h4>
                    <div class="text-sm text-slate-700 leading-relaxed">${this.formatBulletPoints(analysis.content && analysis.content[0] ? analysis.content[0].text : 'No analysis available')}</div>
                </div>
                
                ${analysis.context ? `
                    <div class="border-b border-slate-200 pb-3">
                        <h4 class="font-semibold text-slate-800 mb-2">Relevant Context from Documents:</h4>
                        <div class="text-sm text-slate-700 leading-relaxed">
                            ${analysis.context}
                        </div>
                    </div>
                ` : ''}
                
                ${analysis.sources && analysis.sources.length > 0 ? `
                    <div>
                        <h4 class="font-semibold text-slate-800 mb-2">Sources:</h4>
                        <div class="space-y-1">
                            ${analysis.sources.map(source => `
                                <div class="text-xs text-slate-600">
                                    📄 ${source.filename || 'Unknown source'}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="flex space-x-2">
                    <button onclick="window.simpleAI.clearContextAnalysis()" class="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200">
                        Clear Analysis
                    </button>
                    <button onclick="window.simpleAI.enhancedContextAnalysis(window.simpleAI.lastSelectedText || '')" class="flex-1 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors">
                        🔍 Anomaly Detection
                    </button>
                </div>
            </div>
        `;
    }
    
    displayContextAnalysis(analysis) {
        const contextContent = document.getElementById('contextContent');
        if (!contextContent) return;
        
        contextContent.innerHTML = `
            <div class="space-y-4">
                <div class="border-b border-slate-200 pb-4">
                    <h3 class="text-sm font-semibold text-slate-800">"${analysis.text.substring(0, 200)}${analysis.text.length > 200 ? '...' : ''}"</h3>
                </div>
                
                <div class="border-b border-slate-200 pb-3">
                    <h4 class="font-semibold text-slate-800 mb-2">Key Topics:</h4>
                    <div class="flex flex-wrap gap-2 mb-4">
                        ${analysis.keywords.map(kw => `<span class="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium border border-slate-200">${kw}</span>`).join('')}
                    </div>
                </div>
                
                <div>
                    <h4 class="font-semibold text-slate-800 mb-2">Context:</h4>
                    <div class="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">${analysis.analysis}</div>
                </div>
                
                <div class="flex space-x-2">
                    <button onclick="window.simpleAI.clearContextAnalysis()" class="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200">
                        Clear Analysis
                    </button>
                    <button onclick="window.simpleAI.enhancedContextAnalysis(window.simpleAI.lastSelectedText || '')" class="flex-1 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors">
                        🔍 Anomaly Detection
                    </button>
                </div>
            </div>
        `;
    }
    
    clearContextAnalysis() {
        const contextContent = document.getElementById('contextContent');
        if (contextContent) {
            // Return to default context view
            contextContent.innerHTML = `
                <div class="text-center py-8 text-slate-600">
                    <p class="text-sm text-slate-600 mb-6">Click on any sentence in your draft to get relevant context</p>
                    <div class="border border-slate-200 rounded-lg p-6 text-left bg-slate-50">
                        <p class="text-sm font-semibold text-slate-800 mb-3 flex items-center">
                            <i class="fas fa-info-circle mr-2 text-slate-600"></i>How to use:
                        </p>
                        <ul class="text-sm text-slate-700 space-y-2">
                            <li class="flex items-center">
                                <span class="w-2 h-2 bg-slate-400 rounded-full mr-3"></span>
                                Type or paste content in the editor
                            </li>
                            <li class="flex items-center">
                                <span class="w-2 h-2 bg-slate-400 rounded-full mr-3"></span>
                                Click on any sentence to get context
                            </li>
                            <li class="flex items-center">
                                <span class="w-2 h-2 bg-slate-400 rounded-full mr-3"></span>
                                Use the floating chat button for questions
                            </li>
                            <li class="flex items-center">
                                <span class="w-2 h-2 bg-slate-400 rounded-full mr-3"></span>
                                Upload documents in the Memory tab
                            </li>
                        </ul>
                    </div>
                </div>
            `;
        }
    }

    // Ask for clarification about the context analysis
    async askContextClarification() {
        const input = document.getElementById('contextClarifyInput');
        if (!input || !input.value.trim()) {
            alert('Please enter a question first.');
            return;
        }

        const question = input.value.trim();
        console.log('🤔 Asking for clarification:', question);

        try {
            // Show loading state
            input.disabled = true;
            const askButton = input.nextElementSibling;
            if (askButton) {
                askButton.textContent = 'Asking...';
                askButton.disabled = true;
            }

            // Send the question to the chat API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: question,
                    documents: this.documents
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Clarification response:', result);

            // Display the clarification response
            this.displayClarificationResponse(question, result.content[0].text);

        } catch (error) {
            console.error('❌ Error asking for clarification:', error);
            alert('Failed to get clarification. Please try again.');
        } finally {
            // Reset input state
            input.disabled = false;
            if (askButton) {
                askButton.textContent = 'Ask';
                askButton.disabled = false;
            }
        }
    }

    // Display the clarification response
    displayClarificationResponse(question, answer) {
        const contextContent = document.getElementById('contextContent');
        if (!contextContent) return;

        // Add the clarification Q&A below the existing content
        const clarificationSection = document.createElement('div');
        clarificationSection.className = 'border-t border-slate-200 pt-4 mt-4';
        clarificationSection.innerHTML = `
            <div class="space-y-3">
                <h4 class="font-semibold text-slate-800">Clarification:</h4>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p class="text-sm font-medium text-blue-800 mb-2">Q: ${question}</p>
                    <div class="text-sm text-blue-700 whitespace-pre-wrap leading-relaxed">${answer}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="text-xs text-slate-500 hover:text-slate-700">
                    Remove this clarification
                </button>
            </div>
        `;

        // Insert before the "Ask for Clarification" section
        const askSection = contextContent.querySelector('.border-t.border-slate-200.pt-4');
        if (askSection) {
            askSection.parentNode.insertBefore(clarificationSection, askSection);
        } else {
            contextContent.appendChild(clarificationSection);
        }

        // Clear the input
        const input = document.getElementById('contextClarifyInput');
        if (input) {
            input.value = '';
        }
    }

    // ============================================================================
    // FLOATING CHAT SYSTEM
    // ============================================================================
    
    initFloatingChat() {
        const chatToggleBtn = document.getElementById('chatToggleBtn');
        const chatInterface = document.getElementById('chatInterface');
        const closeChatBtn = document.getElementById('closeChatBtn');
        const chatPromptForm = document.getElementById('chatPromptForm');
        const chatPromptInput = document.getElementById('chatPromptInput');
        
        if (chatToggleBtn) {
            chatToggleBtn.addEventListener('click', () => {
                this.toggleChat();
            });
        }
        
        if (closeChatBtn) {
            closeChatBtn.addEventListener('click', () => {
                this.toggleChat();
            });
        }
        
        if (chatPromptForm) {
            chatPromptForm.addEventListener('click', () => {
                this.sendChatMessage();
            });
        }
        
        if (chatPromptInput) {
            chatPromptInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage();
                }
            });
            
            // Add input event to hide placeholder text when typing
            chatPromptInput.addEventListener('input', () => {
                this.hideChatPlaceholder();
            });
        }
        
        // Add ESC key functionality
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && chatInterface && !chatInterface.classList.contains('hidden')) {
                this.toggleChat();
            }
        });
        
        // Quick example buttons
        const quickExampleBtns = document.querySelectorAll('.quick-example-btn');
        quickExampleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const text = btn.textContent.replace(/"/g, '');
                if (chatPromptInput) {
                    chatPromptInput.value = text;
                    chatPromptInput.focus();
                    this.hideChatPlaceholder();
                }
            });
        });
    }
    
    toggleChat() {
        const chatInterface = document.getElementById('chatInterface');
        const chatIcon = document.getElementById('chatIcon');
        
        if (chatInterface && chatIcon) {
            if (chatInterface.classList.contains('hidden')) {
                chatInterface.classList.remove('hidden');
                chatIcon.className = 'fas fa-comments text-xl';
            } else {
                chatInterface.classList.add('hidden');
                chatIcon.className = 'fas fa-plus text-xl';
            }
        }
    }
    
    async sendChatMessage() {
        const chatPromptInput = document.getElementById('chatPromptInput');
        const chatHistory = document.getElementById('chatHistory');
        
        if (!chatPromptInput || !chatHistory) return;
        
        const message = chatPromptInput.value.trim();
        if (!message) return;
        
        // Add user message
        const userMessage = document.createElement('div');
        userMessage.className = 'chat-message ml-auto bg-blue-500 text-white';
        userMessage.textContent = message;
        chatHistory.appendChild(userMessage);
        
        // Clear input and show placeholder again
        chatPromptInput.value = '';
        this.showChatPlaceholder();
        
        // Scroll to bottom
        chatHistory.scrollTop = chatHistory.scrollHeight;
        
        // Show typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'chat-message bg-slate-100 text-slate-700';
        typingIndicator.innerHTML = '<i class="fas fa-circle animate-pulse"></i> <i class="fas fa-circle animate-pulse"></i> <i class="fas fa-circle animate-pulse"></i>';
        chatHistory.appendChild(typingIndicator);
        
        // Simulate AI response
        setTimeout(() => {
            typingIndicator.remove();
            
            const aiMessage = document.createElement('div');
            aiMessage.className = 'chat-message bg-slate-100 text-slate-700';
            aiMessage.innerHTML = this.generateAIResponse(message);
            chatHistory.appendChild(aiMessage);
            
            chatHistory.scrollTop = chatHistory.scrollHeight;
        }, 1500);
    }
    
    generateAIResponse(message) {
        const responses = [
            "I can help you analyze that financial data. What specific aspects would you like me to focus on?",
            "That's an interesting question about earnings. Let me break down the key metrics for you.",
            "I can see you're looking at revenue trends. Would you like me to compare this with previous quarters?",
            "Great question! Let me analyze the EBITDA growth and provide some insights.",
            "I can help you understand the market performance. What specific data points are you most interested in?"
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Hide chat placeholder when user starts typing
    hideChatPlaceholder() {
        const chatPlaceholder = document.getElementById('chatPlaceholder');
        if (chatPlaceholder) {
            chatPlaceholder.style.display = 'none';
        }
    }

    // Show chat placeholder when input is cleared
    showChatPlaceholder() {
        const chatPlaceholder = document.getElementById('chatPlaceholder');
        if (chatPlaceholder) {
            chatPlaceholder.style.display = 'block';
        }
    }

    // Show loading status while analyzing
    showLoadingStatus(selectedText) {
        const contextContent = document.getElementById('contextContent');
        if (!contextContent) return;
        
        contextContent.innerHTML = `
            <div class="space-y-6">
                <div class="text-center">
                    <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                    <h3 class="text-sm font-semibold text-slate-800 mb-2">Analyzing Context...</h3>
                    <p class="text-sm text-slate-600">AI is analyzing your selected text</p>
                </div>
                
                <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-6 shadow-sm">
                    <h4 class="font-semibold text-blue-800 mb-3">Selected Text:</h4>
                    <p class="text-sm text-blue-700 mb-4 italic">"${selectedText}"</p>
                    
                    <div class="flex items-center justify-center space-x-2 text-blue-600">
                        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span class="text-sm">Processing with Claude AI...</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Format bullet points to ensure consistent spacing
    formatBulletPoints(text) {
        if (!text) return 'No analysis available';
        
        // Split by lines and process each bullet point
        const lines = text.split('\n');
        const formattedLines = lines.map(line => {
            line = line.trim();
            
            // If it's a bullet point (starts with - or •)
            if (line.startsWith('-') || line.startsWith('•')) {
                // Ensure consistent spacing after the bullet
                return line.replace(/^[-•]\s*/, '- ');
            }
            
            // If it's not a bullet point, return as is
            return line;
        });
        
        // Join lines with consistent spacing
        return formattedLines
            .filter(line => line.trim() !== '') // Remove empty lines
            .join('<br><br>'); // Use double <br> for more spacing between bullet points
    }

    // Hide loading status
    hideLoadingStatus() {
        // Clear the loading state immediately
        const contextContent = document.getElementById('contextContent');
        if (contextContent) {
            contextContent.innerHTML = '';
        }
    }

    // ============================================================================
    // ANOMALY DETECTION AND TREND VALIDATION
    // ============================================================================

    // Analyze text for anomalies and trends
    async analyzeTextForAnomalies(text) {
        try {
            console.log('🔍 Starting anomaly detection analysis...');
            
            // Suggest industry based on content
            const suggestedIndustry = this.anomalyDetection.suggestIndustry(text);
            console.log(`🏭 Suggested industry: ${suggestedIndustry}`);
            
            // Process text for anomalies
            const analysis = await this.anomalyDetection.processText(text, suggestedIndustry);
            
            // Display anomaly analysis results
            this.displayAnomalyAnalysis(analysis, text);
            
            console.log('✅ Anomaly detection completed');
            return analysis;
            
        } catch (error) {
            console.error('❌ Anomaly detection error:', error);
            this.showToast('Anomaly detection failed: ' + error.message, 'error');
        }
    }

    // Display anomaly analysis results
    displayAnomalyAnalysis(analysis, selectedText) {
        const contextContent = document.getElementById('contextContent');
        if (!contextContent) return;

        let html = `
            <div class="space-y-4">
                <div class="border-b border-slate-200 pb-4">
                    <h3 class="text-sm font-semibold text-slate-800">Anomaly Detection Analysis</h3>
                    <p class="text-sm text-slate-600 mt-1">"${selectedText.substring(0, 100)}${selectedText.length > 100 ? '...' : ''}"</p>
                </div>
                
                <div class="border-b border-slate-200 pb-3">
                    <h4 class="font-semibold text-slate-800 mb-2">Industry Context:</h4>
                    <div class="text-sm text-slate-700">
                        <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">${analysis.industry.replace('_', ' ').toUpperCase()}</span>
                    </div>
                </div>
        `;

        // Display metrics found
        if (analysis.metrics && analysis.metrics.length > 0) {
            html += `
                <div class="border-b border-slate-200 pb-3">
                    <h4 class="font-semibold text-slate-800 mb-2">Metrics Analyzed (${analysis.metrics.length}):</h4>
                    <div class="space-y-2">
            `;

            analysis.metrics.forEach(metric => {
                const severityClass = this.getSeverityClass(metric.validation.severity);
                html += `
                    <div class="p-3 rounded-lg border ${severityClass.border} ${severityClass.bg}">
                        <div class="flex items-center justify-between mb-2">
                            <span class="font-medium text-sm">${metric.metricType}</span>
                            <span class="text-lg font-bold">${metric.value}${metric.validation.rule?.unit || ''}</span>
                        </div>
                        <div class="text-xs ${severityClass.text}">${metric.validation.message}</div>
                        ${metric.trend.hasBaseline ? `
                            <div class="text-xs text-slate-600 mt-1">${metric.trend.message}</div>
                        ` : ''}
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        }

        // Display anomaly report
        if (analysis.report.hasAnomalies) {
            html += `
                <div class="border-b border-slate-200 pb-3">
                    <h4 class="font-semibold text-red-800 mb-2">🚨 Anomalies Detected:</h4>
                    <div class="space-y-2">
            `;

            // Critical anomalies
            if (analysis.report.anomalies.length > 0) {
                analysis.report.anomalies.forEach(anomaly => {
                    html += `
                        <div class="p-3 rounded-lg border border-red-200 bg-red-50">
                            <div class="text-sm font-medium text-red-800">${anomaly.metric}: ${anomaly.value}</div>
                            <div class="text-xs text-red-700 mt-1">${anomaly.message}</div>
                            ${anomaly.explanation ? `<div class="text-xs text-red-600 mt-1 italic">${anomaly.explanation}</div>` : ''}
                        </div>
                    `;
                });
            }

            // Trend anomalies
            if (analysis.report.trends.length > 0) {
                analysis.report.trends.forEach(trend => {
                    html += `
                        <div class="p-3 rounded-lg border border-orange-200 bg-orange-50">
                            <div class="text-sm font-medium text-orange-800">${trend.metric}: ${trend.value} (${trend.change > 0 ? '+' : ''}${trend.change.toFixed(1)}%)</div>
                            <div class="text-xs text-orange-700 mt-1">${trend.message}</div>
                        </div>
                    `;
                });
            }

            html += `
                    </div>
                </div>
            `;
        }

        // Display warnings
        if (analysis.report.warnings.length > 0) {
            html += `
                <div class="border-b border-slate-200 pb-3">
                    <h4 class="font-semibold text-yellow-800 mb-2">⚠️ Warnings:</h4>
                    <div class="space-y-2">
            `;

            analysis.report.warnings.forEach(warning => {
                html += `
                    <div class="p-3 rounded-lg border border-yellow-200 bg-yellow-50">
                        <div class="text-sm font-medium text-yellow-800">${warning.metric}: ${warning.value}</div>
                        <div class="text-xs text-yellow-700 mt-1">${warning.message}</div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        }

        // Summary and actions
        html += `
                <div class="border-b border-slate-200 pb-3">
                    <h4 class="font-semibold text-slate-800 mb-2">Summary:</h4>
                    <div class="text-sm text-slate-700 whitespace-pre-line">${analysis.report.summary}</div>
                </div>
                
                <div class="flex space-x-2">
                    <button onclick="window.simpleAI.clearContextAnalysis()" class="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200">
                        Clear Analysis
                    </button>
                    <button onclick="window.simpleAI.exportAnomalyData()" class="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                        Export Data
                    </button>
                </div>
            </div>
        `;

        contextContent.innerHTML = html;
    }

    // Get CSS classes based on severity
    getSeverityClass(severity) {
        switch (severity) {
            case 'critical':
                return { border: 'border-red-200', bg: 'bg-red-50', text: 'text-red-700' };
            case 'warning':
                return { border: 'border-yellow-200', bg: 'bg-yellow-50', text: 'text-yellow-700' };
            case 'success':
                return { border: 'border-green-200', bg: 'bg-green-50', text: 'text-green-700' };
            default:
                return { border: 'border-slate-200', bg: 'bg-slate-50', text: 'text-slate-700' };
        }
    }

    // Export anomaly detection data
    exportAnomalyData() {
        try {
            const data = this.anomalyDetection.exportHistoricalData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `anomaly-detection-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('Anomaly detection data exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showToast('Failed to export data', 'error');
        }
    }

    // Enhanced context analysis with anomaly detection
    async enhancedContextAnalysis(text) {
        try {
            // First, run the regular RAG analysis
            await this.analyzeContext(text);
            
            // Then, run anomaly detection
            await this.analyzeTextForAnomalies(text);
            
        } catch (error) {
            console.error('Enhanced context analysis failed:', error);
            this.showToast('Enhanced analysis failed', 'error');
        }
    }
    
    loadDraftDirectly(docId) {
        console.log('🔥 Loading draft directly:', docId);
        
        try {
            // Get saved documents
            const stored = localStorage.getItem('earningsGenAI_savedDocuments');
            if (!stored) {
                alert('No saved documents found');
                return;
            }
            
            const savedDocuments = JSON.parse(stored);
            const doc = savedDocuments.find(d => d.id === docId);
            
            if (!doc) {
                alert('Document not found');
                return;
            }
            
            console.log('📄 Found document:', doc);
            
            // Load into editor
            const titleInput = document.getElementById('articleTitle');
            const editorContent = document.getElementById('articleEditor');
            
            if (titleInput && editorContent) {
                // Use original title (without date-time prefix)
                const titleToLoad = doc.originalTitle || doc.title;
                titleInput.value = titleToLoad;
                editorContent.innerHTML = doc.html || doc.text || '';
                
                console.log('✅ Draft loaded successfully:', titleToLoad);
            } else {
                alert('Could not find editor elements');
            }
            
        } catch (error) {
            console.error('❌ Error loading draft:', error);
            alert('Error loading draft: ' + error.message);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.simpleAI = new SimpleAI();
});
