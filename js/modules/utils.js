// Utilities Module
export const FileTypes = {
    PDF: 'PDF',
    WORD: 'Word',
    EXCEL: 'Excel',
    TEXT: 'Text',
    UNKNOWN: 'Unknown'
};

export const FileIcons = {
    [FileTypes.PDF]: '📄',
    [FileTypes.WORD]: '📝',
    [FileTypes.EXCEL]: '📊',
    [FileTypes.TEXT]: '📃',
    [FileTypes.UNKNOWN]: '📁'
};

export class FileUtils {
    static getFileType(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const typeMap = {
            'pdf': FileTypes.PDF,
            'doc': FileTypes.WORD,
            'docx': FileTypes.WORD,
            'xlsx': FileTypes.EXCEL,
            'xls': FileTypes.EXCEL,
            'txt': FileTypes.TEXT
        };
        return typeMap[ext] || FileTypes.UNKNOWN;
    }

    static getFileIcon(filename) {
        const fileType = this.getFileType(filename);
        return FileIcons[fileType];
    }

    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static isValidFileType(filename) {
        const validExtensions = ['.pdf', '.doc', '.docx', '.xlsx', '.xls', '.txt'];
        const ext = filename.toLowerCase();
        return validExtensions.some(validExt => ext.endsWith(validExt));
    }
}

export class TextUtils {
    static truncate(text, maxLength = 100) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    static extractSentences(text, maxSentences = 5) {
        return text.split(/[.!?]+/)
            .filter(s => s.trim().length > 20)
            .slice(0, maxSentences)
            .map(s => s.trim());
    }

    static highlightTerms(text, terms, highlightClass = 'bg-yellow-200') {
        if (!terms || terms.length === 0) return text;
        
        let highlightedText = text;
        terms.forEach(term => {
            if (term.length > 2) {
                const regex = new RegExp(`(${term})`, 'gi');
                highlightedText = highlightedText.replace(regex, `<span class="${highlightClass}">$1</span>`);
            }
        });
        
        return highlightedText;
    }

    static calculateReadability(text) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const words = text.split(/\s+/).filter(w => w.trim().length > 0);
        const syllables = this.countSyllables(text);
        
        if (sentences.length === 0 || words.length === 0) return 0;
        
        // Flesch Reading Ease Score
        const score = 206.835 - (1.015 * (words.length / sentences.length)) - (84.6 * (syllables / words.length));
        return Math.max(0, Math.min(100, score));
    }

    static countSyllables(text) {
        const words = text.toLowerCase().split(/\s+/);
        let syllableCount = 0;
        
        words.forEach(word => {
            if (word.length <= 3) {
                syllableCount += 1;
            } else {
                const syllables = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
                    .replace(/^y/, '')
                    .match(/[aeiouy]{1,2}/g);
                syllableCount += syllables ? syllables.length : 1;
            }
        });
        
        return syllableCount;
    }
}

export class DateUtils {
    static formatDate(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    static formatRelativeTime(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        
        return this.formatDate(date);
    }

    static isRecent(date, hours = 24) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        return diffInHours < hours;
    }
}

export class ValidationUtils {
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidApiKey(apiKey) {
        return apiKey && apiKey.length >= 20 && apiKey.startsWith('sk-');
    }

    static sanitizeInput(input) {
        return input.replace(/[<>]/g, '');
    }

    static validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const errors = [];
        
        if (file.size > maxSize) {
            errors.push('File size exceeds 10MB limit');
        }
        
        if (!FileUtils.isValidFileType(file.name)) {
            errors.push('Invalid file type. Supported: PDF, Word, Excel, Text');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

export class PerformanceUtils {
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static measurePerformance(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`${name} took ${(end - start).toFixed(2)}ms`);
        return result;
    }
}

export class StorageUtils {
    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            return false;
        }
    }

    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Failed to read from localStorage:', error);
            return defaultValue;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Failed to remove from localStorage:', error);
            return false;
        }
    }

    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
            return false;
        }
    }
}
