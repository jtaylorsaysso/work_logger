/**
 * Personal Logger Alpine.js Application
 * Handles quick entry, storage, and offline functionality
 */

// IndexedDB Database Manager
class LoggerDB {
    constructor() {
        this.dbName = 'PersonalLogger';
        this.version = 1;
        this.db = null;
    }

    /**
     * Initialize IndexedDB connection
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create entries store
                if (!db.objectStoreNames.contains('entries')) {
                    const store = db.createObjectStore('entries', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('type', 'type', { unique: false });
                }
            };
        });
    }

    /**
     * Save entry to IndexedDB
     */
    async saveEntry(entry) {
        const transaction = this.db.transaction(['entries'], 'readwrite');
        const store = transaction.objectStore('entries');
        return store.add(entry);
    }

    /**
     * Get recent entries from IndexedDB
     */
    async getRecentEntries(limit = 10) {
        const transaction = this.db.transaction(['entries'], 'readonly');
        const store = transaction.objectStore('entries');
        const index = store.index('timestamp');
        
        return new Promise((resolve, reject) => {
            const entries = [];
            const request = index.openCursor(null, 'prev');
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor && entries.length < limit) {
                    entries.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(entries);
                }
            };
            
            request.onerror = () => reject(request.error);
        });
    }
}

// Alpine.js Component
document.addEventListener('alpine:init', () => {
    Alpine.data('logger', () => ({
        // State
        showModal: false,
        currentType: '',
        entryText: '',
        isLoading: false,
        isOnline: navigator.onLine,
        showToast: false,
        toastMessage: '',
        recentEntries: [],
        isRecording: false,
        voiceSupported: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
        
        // Database instance
        db: new LoggerDB(),
        
        // Quick templates for common entries
        templates: {
            issue: [
                'Equipment malfunction',
                'Understaffed shift',
                'Supply shortage',
                'Customer complaint',
                'Safety concern'
            ],
            task: [
                'Restock supplies',
                'Clean equipment',
                'Update schedule',
                'Call supplier',
                'Train new staff'
            ],
            note: [
                'Shift handover',
                'Good performance',
                'Process improvement',
                'Customer feedback',
                'General observation'
            ]
        },

        /**
         * Initialize the application
         */
        async init() {
            try {
                await this.db.init();
                await this.loadRecentEntries();
                this.setupNetworkListeners();
                console.log('Personal Logger initialized successfully');
            } catch (error) {
                console.error('Failed to initialize:', error);
                this.showToastMessage('Failed to initialize app');
            }
        },

        /**
         * Setup network status listeners
         */
        setupNetworkListeners() {
            window.addEventListener('online', () => {
                this.isOnline = true;
                this.showToastMessage('Back online');
            });
            
            window.addEventListener('offline', () => {
                this.isOnline = false;
                this.showToastMessage('Working offline');
            });
        },

        /**
         * Open quick entry modal for specific type
         */
        quickEntry(type) {
            this.currentType = type;
            this.entryText = '';
            this.showModal = true;
            
            // Focus text input after modal opens
            this.$nextTick(() => {
                this.$refs.textInput?.focus();
            });
        },

        /**
         * Close the entry modal
         */
        closeModal() {
            this.showModal = false;
            this.entryText = '';
            this.currentType = '';
        },

        /**
         * Use a quick template
         */
        useTemplate(template) {
            this.entryText = template;
            this.$refs.textInput?.focus();
        },

        /**
         * Start voice input (if supported)
         */
        startVoiceInput() {
            if (!this.voiceSupported) {
                this.showToastMessage('Voice input not supported');
                return;
            }

            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            this.isRecording = true;

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.entryText = transcript;
                this.isRecording = false;
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showToastMessage('Voice input failed');
                this.isRecording = false;
            };

            recognition.onend = () => {
                this.isRecording = false;
            };

            recognition.start();
        },

        /**
         * Save the current entry
         */
        async saveEntry() {
            if (!this.entryText.trim()) {
                this.showToastMessage('Please enter some text');
                return;
            }

            this.isLoading = true;

            try {
                const entry = {
                    type: this.currentType,
                    content: this.entryText.trim(),
                    timestamp: new Date().toISOString(),
                    synced: false
                };

                await this.db.saveEntry(entry);
                await this.loadRecentEntries();
                
                this.closeModal();
                this.showToastMessage('Entry saved successfully');
                
                // Vibrate on mobile for feedback
                if ('vibrate' in navigator) {
                    navigator.vibrate(50);
                }
                
            } catch (error) {
                console.error('Failed to save entry:', error);
                this.showToastMessage('Failed to save entry');
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * Load recent entries from database
         */
        async loadRecentEntries() {
            try {
                this.recentEntries = await this.db.getRecentEntries(10);
            } catch (error) {
                console.error('Failed to load entries:', error);
            }
        },

        /**
         * Format timestamp for display
         */
        formatTime(timestamp) {
            const date = new Date(timestamp);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            
            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
            
            return date.toLocaleDateString();
        },

        /**
         * Show toast message
         */
        showToastMessage(message) {
            this.toastMessage = message;
            this.showToast = true;
            
            setTimeout(() => {
                this.showToast = false;
            }, 3000);
        }
    }));
});
