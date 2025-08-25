export class EditorManager {
    constructor(contextManager) {
        this.contextManager = contextManager;
        this.elements = {};
        this.debounceTimers = {};
    }

    initializeElements(articleEditor, articleTitle, articleSubtitle) {
        this.elements = {
            articleEditor,
            articleTitle,
            articleSubtitle
        };
    }

    setupEventListeners() {
        console.log('🔧 Setting up editor functionality...');
        
        if (this.elements.articleEditor) {
            this.elements.articleEditor.addEventListener('input', (event) => {
                this.debounce('editor', () => {
                    this.updateContextFromEditor(event.target.value);
                }, 800);
            });
            console.log('✅ Article editor input handler set up');
        }

        if (this.elements.articleTitle) {
            this.elements.articleTitle.addEventListener('input', (event) => {
                this.debounce('title', () => {
                    this.updateContextFromTitle();
                }, 500);
            });
            console.log('✅ Article title input handler set up');
        }

        if (this.elements.articleSubtitle) {
            this.elements.articleSubtitle.addEventListener('input', (event) => {
                this.debounce('subtitle', () => {
                    this.updateContextFromSubtitle();
                }, 500);
            });
            console.log('✅ Article subtitle input handler set up');
        }

        console.log('✅ Editor functionality setup complete');
    }

    debounce(key, func, delay) {
        if (this.debounceTimers[key]) {
            clearTimeout(this.debounceTimers[key]);
        }
        this.debounceTimers[key] = setTimeout(func, delay);
    }

    updateContextFromEditor(editorText) {
        if (!editorText || editorText.trim().length < 15) return;
        
        console.log('🔄 Updating context from editor input');
        
        if (this.contextManager) {
            const keyTerms = this.extractKeyTerms(editorText);
            if (keyTerms.length > 0) {
                console.log('🔑 Key terms extracted:', keyTerms);
                this.contextManager.updateContext(keyTerms.join(' '));
            } else {
                const contextPhrase = this.extractContextPhrase(editorText);
                if (contextPhrase) {
                    console.log('📝 Context phrase extracted:', contextPhrase);
                    this.contextManager.updateContext(contextPhrase);
                }
            }
            
            this.showContextPullingIndicator(editorText);
            this.autoSwitchToContextTab();
        }
    }

    updateContextFromTitle() {
        const title = this.elements.articleTitle?.value?.trim();
        if (!title || title.length < 3) return;
        
        console.log('🔄 Updating context from title:', title);
        
        if (this.contextManager) {
            this.contextManager.updateContext(title);
            this.showContextPullingIndicator(title);
            this.autoSwitchToContextTab();
        }
    }

    updateContextFromSubtitle() {
        const subtitle = this.elements.articleSubtitle?.value?.trim();
        if (!subtitle || subtitle.length < 3) return;
        
        console.log('🔄 Updating context from subtitle:', subtitle);
        
        if (this.contextManager) {
            this.contextManager.updateContext(subtitle);
            this.showContextPullingIndicator(subtitle);
            this.autoSwitchToContextTab();
        }
    }

    extractKeyTerms(text) {
        const financialTerms = [
            'earnings', 'revenue', 'profit', 'loss', 'growth', 'decline', 'quarter', 'annual',
            'margin', 'EBITDA', 'cash flow', 'debt', 'equity', 'dividend', 'stock', 'shares',
            'market', 'competition', 'strategy', 'acquisition', 'merger', 'restructuring',
            'inflation', 'interest rates', 'economic', 'industry', 'sector', 'guidance',
            'forecast', 'outlook', 'risk', 'opportunity', 'investment', 'capital', 'ROI'
        ];

        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        const meaningfulWords = words.filter(word => 
            word.length > 3 && 
            !['this', 'that', 'with', 'from', 'they', 'have', 'will', 'been', 'said', 'each', 'which', 'their', 'time', 'would', 'there', 'could', 'other', 'about', 'many', 'then', 'them', 'these', 'people', 'some', 'into', 'more', 'very', 'just', 'over', 'think', 'also', 'after', 'years', 'never', 'before', 'because', 'through', 'during', 'those', 'under', 'while', 'should', 'where', 'against', 'between', 'within', 'without', 'among', 'toward', 'towards', 'throughout', 'despite', 'beneath', 'beyond', 'except', 'including', 'regarding', 'concerning', 'considering', 'despite', 'excepting', 'excluding', 'following', 'including', 'notwithstanding', 'pending', 'regarding', 'respecting', 'touching'].includes(word)
        );

        const keyTerms = meaningfulWords.filter(word => 
            financialTerms.includes(word) || 
            (word.length > 5 && meaningfulWords.filter(w => w === word).length > 1)
        );

        return [...new Set(keyTerms)].slice(0, 5);
    }

    extractContextPhrase(text) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
        if (sentences.length === 0) return null;
        
        const lastSentence = sentences[sentences.length - 1].trim();
        const words = lastSentence.split(' ').filter(w => w.length > 3);
        
        if (words.length < 3) return null;
        
        // Take 3-5 meaningful words from the end of the last sentence
        const phraseLength = Math.min(5, Math.max(3, words.length));
        return words.slice(-phraseLength).join(' ');
    }

    autoSwitchToContextTab() {
        if (this.contextManager) {
            this.contextManager.switchToContextTab();
            this.showContextUpdateIndicator();
        }
    }

    showContextUpdateIndicator() {
        // This will be implemented by UIManager
        console.log('🔄 Context update indicator shown');
    }

    showContextPullingIndicator(text) {
        // This will be implemented by UIManager
        console.log('🔄 Context pulling indicator shown for:', text.substring(0, 50) + '...');
    }

    hideContextPullingIndicator() {
        // This will be implemented by UIManager
        console.log('🔄 Context pulling indicator hidden');
    }

    getCurrentInputValue() {
        return {
            editor: this.elements.articleEditor?.value || '',
            title: this.elements.articleTitle?.value || '',
            subtitle: this.elements.articleSubtitle?.value || ''
        };
    }

    setContent(content) {
        if (this.elements.articleEditor) {
            this.elements.articleEditor.value = content;
        }
    }

    setTitle(title) {
        if (this.elements.articleTitle) {
            this.elements.articleTitle.value = title;
        }
    }

    setSubtitle(subtitle) {
        if (this.elements.articleSubtitle) {
            this.elements.articleSubtitle.value = subtitle;
        }
    }

    clearContent() {
        this.setContent('');
        this.setTitle('');
        this.setSubtitle('');
    }
}
