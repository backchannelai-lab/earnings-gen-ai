export class DraftManager {
    constructor() {
        this.drafts = [];
        this.elements = {};
        this.currentDraftId = null;
    }

    initializeElements(draftsList, draftTitle, draftContent, draftType) {
        this.elements = {
            draftsList,
            draftTitle,
            draftContent,
            draftType
        };
    }

    setupEventListeners() {
        console.log('🔧 Setting up draft management...');
        
        // Load existing drafts
        this.loadDrafts();
        
        // Setup draft form handlers
        if (this.elements.draftTitle && this.elements.draftContent) {
            this.elements.draftTitle.addEventListener('input', () => {
                this.autoSaveDraft();
            });
            
            this.elements.draftContent.addEventListener('input', () => {
                this.autoSaveDraft();
            });
        }
        
        console.log('✅ Draft management setup complete');
    }

    loadDrafts() {
        try {
            const savedDrafts = localStorage.getItem('earningsGenDrafts');
            if (savedDrafts) {
                this.drafts = JSON.parse(savedDrafts);
                console.log('✅ Loaded drafts from localStorage:', this.drafts.length);
            } else {
                this.drafts = [];
                console.log('✅ No saved drafts found, starting fresh');
            }
            this.renderDraftsList();
        } catch (error) {
            console.error('❌ Error loading drafts:', error);
            this.drafts = [];
        }
    }

    saveDraft(title, content, type = 'script') {
        try {
            const draft = {
                id: Date.now().toString(),
                title: title.trim(),
                content: content.trim(),
                type: type,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                wordCount: this.countWords(content)
            };

            if (!draft.title || !draft.content) {
                console.warn('⚠️ Draft title or content is empty, not saving');
                return false;
            }

            // Check if we're updating an existing draft
            const existingIndex = this.drafts.findIndex(d => d.id === this.currentDraftId);
            if (existingIndex !== -1) {
                this.drafts[existingIndex] = { ...this.drafts[existingIndex], ...draft };
                console.log('✅ Updated existing draft:', draft.title);
            } else {
                this.drafts.unshift(draft);
                console.log('✅ Created new draft:', draft.title);
            }

            this.saveDraftsToStorage();
            this.renderDraftsList();
            this.currentDraftId = null;
            
            return true;
        } catch (error) {
            console.error('❌ Error saving draft:', error);
            return false;
        }
    }

    autoSaveDraft() {
        const title = this.elements.draftTitle?.value || '';
        const content = this.elements.draftContent?.value || '';
        
        if (title.trim() && content.trim()) {
            // Debounce auto-save to avoid excessive saves
            clearTimeout(this.autoSaveTimer);
            this.autoSaveTimer = setTimeout(() => {
                this.saveDraft(title, content);
            }, 2000);
        }
    }

    loadDraft(draftId) {
        const draft = this.drafts.find(d => d.id === draftId);
        if (draft) {
            this.currentDraftId = draftId;
            
            if (this.elements.draftTitle) {
                this.elements.draftTitle.value = draft.title;
            }
            if (this.elements.draftContent) {
                this.elements.draftContent.value = draft.content;
            }
            
            console.log('✅ Loaded draft:', draft.title);
            return true;
        }
        return false;
    }

    deleteDraft(draftId) {
        const index = this.drafts.findIndex(d => d.id === draftId);
        if (index !== -1) {
            const deletedDraft = this.drafts.splice(index, 1)[0];
            this.saveDraftsToStorage();
            this.renderDraftsList();
            
            if (this.currentDraftId === draftId) {
                this.currentDraftId = null;
                this.clearForm();
            }
            
            console.log('✅ Deleted draft:', deletedDraft.title);
            return true;
        }
        return false;
    }

    clearAllDrafts() {
        if (confirm('Are you sure you want to delete all drafts? This action cannot be undone.')) {
            this.drafts = [];
            this.currentDraftId = null;
            this.saveDraftsToStorage();
            this.renderDraftsList();
            this.clearForm();
            console.log('✅ All drafts cleared');
        }
    }

    exportDrafts() {
        try {
            const dataStr = JSON.stringify(this.drafts, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `earnings-gen-drafts-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            console.log('✅ Drafts exported successfully');
        } catch (error) {
            console.error('❌ Error exporting drafts:', error);
        }
    }

    renderDraftsList() {
        if (!this.elements.draftsList) {
            console.warn('⚠️ Drafts list element not found');
            return;
        }

        if (this.drafts.length === 0) {
            this.elements.draftsList.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <i class="fas fa-file-alt text-4xl mb-4"></i>
                    <p>No drafts saved yet</p>
                    <p class="text-sm">Start writing to automatically save your work</p>
                </div>
            `;
            return;
        }

        const draftsHtml = this.drafts.map(draft => this.createDraftItem(draft)).join('');
        this.elements.draftsList.innerHTML = draftsHtml;
        
        // Setup event listeners for draft items
        this.setupDraftItemHandlers();
        
        console.log('✅ Drafts list rendered');
    }

    createDraftItem(draft) {
        const date = new Date(draft.updatedAt).toLocaleDateString();
        const time = new Date(draft.updatedAt).toLocaleTimeString();
        
        return `
            <div class="bg-white border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow cursor-pointer" data-draft-id="${draft.id}">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <h4 class="font-medium text-gray-900 text-sm mb-1">${draft.title}</h4>
                        <p class="text-xs text-gray-500 mb-2">${draft.type} • ${draft.wordCount} words</p>
                        <p class="text-xs text-gray-400">Last updated: ${date} at ${time}</p>
                    </div>
                    <div class="flex space-x-2 ml-4">
                        <button class="text-blue-500 hover:text-blue-700 text-sm" onclick="window.draftManager.loadDraft('${draft.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="text-red-500 hover:text-red-700 text-sm" onclick="window.draftManager.deleteDraft('${draft.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    setupDraftItemHandlers() {
        const draftItems = this.elements.draftsList.querySelectorAll('[data-draft-id]');
        draftItems.forEach(item => {
            item.addEventListener('click', (event) => {
                // Don't trigger if clicking on buttons
                if (event.target.closest('button')) return;
                
                const draftId = item.dataset.draftId;
                this.loadDraft(draftId);
            });
        });
    }

    clearForm() {
        if (this.elements.draftTitle) this.elements.draftTitle.value = '';
        if (this.elements.draftContent) this.elements.draftContent.value = '';
    }

    countWords(htmlContent) {
        if (!htmlContent) return 0;
        const textContent = htmlContent.replace(/<[^>]*>/g, '');
        return textContent.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    saveDraftsToStorage() {
        try {
            localStorage.setItem('earningsGenDrafts', JSON.stringify(this.drafts));
        } catch (error) {
            console.error('❌ Error saving drafts to localStorage:', error);
        }
    }

    getDrafts() {
        return this.drafts;
    }

    getCurrentDraft() {
        if (this.currentDraftId) {
            return this.drafts.find(d => d.id === this.currentDraftId);
        }
        return null;
    }
}
