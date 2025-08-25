export class TabManager {
    constructor() {
        this.elements = {};
        this.activeLeftTab = 'context';
        this.activeRightTab = 'drafts';
    }

    initializeElements(leftSidebar, rightSidebar, contextContent, knowledgeContent, draftsContent) {
        this.elements = {
            leftSidebar,
            rightSidebar,
            contextContent,
            knowledgeContent,
            draftsContent
        };
    }

    setupEventListeners() {
        console.log('🔧 Setting up tab switching...');
        
        // Left sidebar tabs (Context, Memory)
        if (this.elements.leftSidebar) {
            const contextTab = this.elements.leftSidebar.querySelector('[data-tab="context"]');
            const knowledgeTab = this.elements.leftSidebar.querySelector('[data-tab="knowledge"]');
            
            if (contextTab) {
                contextTab.addEventListener('click', () => this.switchToContextTab());
            }
            
            if (knowledgeTab) {
                knowledgeTab.addEventListener('click', () => this.switchToKnowledgeTab());
            }
        }
        
        // Right sidebar tabs (Drafts, Chat)
        if (this.elements.rightSidebar) {
            const draftsTab = this.elements.rightSidebar.querySelector('[data-tab="drafts"]');
            const chatTab = this.elements.rightSidebar.querySelector('[data-tab="chat"]');
            
            if (draftsTab) {
                draftsTab.addEventListener('click', () => this.switchToDraftsTab());
            }
            
            if (chatTab) {
                chatTab.addEventListener('click', () => this.switchToChatTab());
            }
        }
        
        console.log('✅ Tab switching setup complete');
    }

    switchToContextTab() {
        console.log('🔄 Switching to Context tab');
        this.activeLeftTab = 'context';
        this.updateLeftSidebarActiveState('context');
        this.showTabContent('contextContent');
    }

    switchToKnowledgeTab() {
        console.log('🔄 Switching to Memory tab');
        this.activeLeftTab = 'knowledge';
        this.updateLeftSidebarActiveState('knowledge');
        this.showTabContent('knowledgeContent');
    }

    switchToDraftsTab() {
        console.log('🔄 Switching to Drafts tab');
        this.activeRightTab = 'drafts';
        this.updateRightSidebarActiveState('drafts');
        this.showTabContent('draftsContent');
    }

    switchToChatTab() {
        console.log('🔄 Switching to Chat tab');
        this.activeRightTab = 'chat';
        this.updateRightSidebarActiveState('chat');
        this.showTabContent('chatContent');
    }

    updateLeftSidebarActiveState(activeTabId) {
        if (!this.elements.leftSidebar) return;
        
        // Remove active state from all tabs
        const allTabs = this.elements.leftSidebar.querySelectorAll('[data-tab]');
        allTabs.forEach(tab => {
            tab.classList.remove('bg-blue-100', 'text-blue-700', 'border-blue-500');
            tab.classList.add('bg-white', 'text-gray-600', 'border-transparent');
        });
        
        // Add active state to selected tab
        const activeTab = this.elements.leftSidebar.querySelector(`[data-tab="${activeTabId}"]`);
        if (activeTab) {
            activeTab.classList.remove('bg-white', 'text-gray-600', 'border-transparent');
            activeTab.classList.add('bg-blue-100', 'text-blue-700', 'border-blue-500');
        }
    }

    updateRightSidebarActiveState(activeTabHeaderId) {
        if (!this.elements.rightSidebar) return;
        
        // Remove active state from all tab headers
        const allTabHeaders = this.elements.rightSidebar.querySelectorAll('[data-tab]');
        allTabHeaders.forEach(header => {
            header.classList.remove('bg-gray-100', 'text-gray-900');
            header.classList.add('bg-white', 'text-gray-600');
        });
        
        // Add active state to selected tab header
        const activeTabHeader = this.elements.rightSidebar.querySelector(`[data-tab="${activeTabHeaderId}"]`);
        if (activeTabHeader) {
            activeTabHeader.classList.remove('bg-white', 'text-gray-600');
            activeTabHeader.classList.add('bg-gray-100', 'text-gray-900');
        }
    }

    showTabContent(activeContentId) {
        // Hide all content sections
        const contentSections = [
            'contextContent',
            'knowledgeContent', 
            'draftsContent',
            'chatContent'
        ];
        
        contentSections.forEach(contentId => {
            const element = this.elements[contentId];
            if (element) {
                element.style.display = 'none';
            }
        });
        
        // Show the active content section
        const activeElement = this.elements[activeContentId];
        if (activeElement) {
            activeElement.style.display = 'block';
            console.log('✅ Showing content:', activeContentId);
        }
    }

    showEditorInterface() {
        console.log('🔄 Showing editor interface');
        // This method can be extended to show/hide the main editor
    }

    getActiveLeftTab() {
        return this.activeLeftTab;
    }

    getActiveRightTab() {
        return this.activeRightTab;
    }

    // Method to programmatically switch tabs (useful for other managers)
    switchToTab(side, tabName) {
        if (side === 'left') {
            if (tabName === 'context') {
                this.switchToContextTab();
            } else if (tabName === 'knowledge') {
                this.switchToKnowledgeTab();
            }
        } else if (side === 'right') {
            if (tabName === 'drafts') {
                this.switchToDraftsTab();
            } else if (tabName === 'chat') {
                this.switchToChatTab();
            }
        }
    }
}
