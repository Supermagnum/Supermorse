/**
 * app.js
 * Main application logic that ties all modules together
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const elements = {
        // Connection status
        connectionIndicator: document.getElementById('connection-indicator'),
        connectButton: document.getElementById('connect-button'),
        
        // Settings
        countrySelect: document.getElementById('country-select'),
        speedSelect: document.getElementById('speed-select'),
        farnsworthToggle: document.getElementById('farnsworth-toggle'),
        keyTypeSelect: document.getElementById('key-type-select'),
        
        // Current lesson
        currentCharacter: document.getElementById('current-character'),
        currentMorse: document.getElementById('current-morse'),
        knownCharacters: document.getElementById('known-characters'),
        startLessonButton: document.getElementById('start-lesson'),
        playCharacterButton: document.getElementById('play-character'),
        
        // Practice area
        expectedSequence: document.getElementById('expected-sequence'),
        userInput: document.getElementById('user-input'),
        accuracyValue: document.getElementById('accuracy-value'),
        startPracticeButton: document.getElementById('start-practice'),
        
        // Progress
        progressBars: document.getElementById('progress-bars'),
        
        // Session info
        sessionTimer: document.getElementById('session-timer'),
        breakTimer: document.getElementById('break-timer'),
        cooldownTimer: document.getElementById('cooldown-timer'),
        sessionMessage: document.getElementById('session-message')
    };
    
    // Application state
    const appState = {
        isConnected: false,
        isInLearnMode: false,
        isInPracticeMode: false,
        currentPracticeSequence: '',
        keyType: 'straight' // Default key type
    };
    
    // Initialize modules
    initializeApp();
    
    /**
     * Initialize the application
     */
    function initializeApp() {
        // Set up event listeners
        setupEventListeners();
        
        // Initialize lesson manager
        LESSON_MANAGER.initialize({
            country: elements.countrySelect.value,
            wpm: parseInt(elements.speedSelect.value, 10),
            farnsworthSpacing: elements.farnsworthToggle.checked
        });
        
        // Set up callbacks
        setupCallbacks();
        
        // Update UI with initial state
        updateUI();
        
        // Start timers
        startTimers();
    }
    
    /**
     * Set up event listeners for UI elements
     */
    function setupEventListeners() {
        // Connection
        elements.connectButton.addEventListener('click', handleConnect);
        
        // Settings
        elements.countrySelect.addEventListener('change', handleSettingsChange);
        elements.speedSelect.addEventListener('change', handleSettingsChange);
        elements.farnsworthToggle.addEventListener('change', handleSettingsChange);
        elements.keyTypeSelect.addEventListener('change', handleKeyTypeChange);
        
        // Lesson controls
        elements.startLessonButton.addEventListener('click', handleStartLesson);
        elements.playCharacterButton.addEventListener('click', handlePlayCharacter);
        
        // Practice controls
        elements.startPracticeButton.addEventListener('click', handleStartPractice);
    }
    
    /**
     * Set up callbacks for modules
     */
    function setupCallbacks() {
        // Serial reader callbacks
        SERIAL_READER.setConnectionCallback(handleConnectionChange);
        SERIAL_READER.setCharacterCallback(handleReceivedCharacter);
        
        // Input checker callbacks
        INPUT_CHECKER.setInputUpdatedCallback(handleInputUpdated);
        INPUT_CHECKER.setSessionCompleteCallback(handleSessionComplete);
        
        // Lesson manager callbacks
        LESSON_MANAGER.setStateUpdatedCallback(handleLearningStateUpdated);
        LESSON_MANAGER.setNewCharacterCallback(handleNewCharacter);
        LESSON_MANAGER.setSessionEndCallback(handleLessonSessionEnd);
    }
    
    /**
     * Start timers for updating UI elements
     */
    function startTimers() {
        // Update session timer every second
        setInterval(updateTimers, 1000);
    }
    
    /**
     * Update timers in the UI
     */
    function updateTimers() {
        // Update session timer if in a session
        const sessionTimeRemaining = LESSON_MANAGER.getSessionTimeRemaining();
        if (sessionTimeRemaining > 0) {
            elements.sessionTimer.textContent = formatTime(sessionTimeRemaining);
        } else {
            elements.sessionTimer.textContent = '00:00:00';
        }
        
        // Update break timer if in a break
        const breakTimeRemaining = LESSON_MANAGER.getBreakTimeRemaining();
        if (breakTimeRemaining > 0) {
            elements.breakTimer.classList.remove('hidden');
            elements.cooldownTimer.textContent = formatTime(breakTimeRemaining);
        } else {
            elements.breakTimer.classList.add('hidden');
        }
    }
    
    /**
     * Format milliseconds as HH:MM:SS
     * @param {number} ms - Time in milliseconds
     * @returns {string} Formatted time string
     */
    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            seconds.toString().padStart(2, '0')
        ].join(':');
    }
    
    /**
     * Update the UI based on the current state
     */
    function updateUI() {
        // Update connection status
        updateConnectionUI();
        
        // Update learning state
        updateLearningUI();
        
        // Update practice state
        updatePracticeUI();
        
        // Update progress bars
        updateProgressBars();
        
        // Check if 20 WPM should be unlocked
        if (LESSON_MANAGER.isReadyFor20WPM()) {
            elements.speedSelect.querySelector('option[value="20"]').disabled = false;
        }
        
        // Update UI for special language modes
        updateLanguageModeUI();
    }
    
    /**
     * Update UI elements specific to certain language modes
     */
    function updateLanguageModeUI() {
        const country = elements.countrySelect.value;
        
        // Handle special display for Chinese Telegraph Code mode
        if (country === 'chinese-telegraph') {
            // In a real implementation, we might add a special display area for the Chinese character
            // and its corresponding 4-digit telegraph code
            if (!document.getElementById('telegraph-display')) {
                const telegraphDisplay = document.createElement('div');
                telegraphDisplay.id = 'telegraph-display';
                telegraphDisplay.className = 'telegraph-display';
                telegraphDisplay.innerHTML = `
                    <h3>Chinese Telegraph Code</h3>
                    <div class="telegraph-info">
                        <div>Character: <span id="chinese-char"></span></div>
                        <div>Code: <span id="telegraph-code"></span></div>
                    </div>
                `;
                elements.currentCharacter.parentNode.appendChild(telegraphDisplay);
            }
        } else {
            // Remove telegraph display if not in Chinese Telegraph mode
            const telegraphDisplay = document.getElementById('telegraph-display');
            if (telegraphDisplay) {
                telegraphDisplay.remove();
            }
        }
        
        // Handle special display for Japanese Wabun mode
        if (country === 'japanese-wabun') {
            // In a real implementation, we might add a special display for Katakana
            if (!document.getElementById('wabun-display')) {
                const wabunDisplay = document.createElement('div');
                wabunDisplay.id = 'wabun-display';
                wabunDisplay.className = 'wabun-display';
                wabunDisplay.innerHTML = `
                    <h3>Wabun Code</h3>
                    <div class="wabun-info">
                        <div>Katakana: <span id="katakana-char"></span></div>
                        <div>Romaji: <span id="romaji-equiv"></span></div>
                    </div>
                `;
                elements.currentCharacter.parentNode.appendChild(wabunDisplay);
            }
        } else {
            // Remove wabun display if not in Japanese Wabun mode
            const wabunDisplay = document.getElementById('wabun-display');
            if (wabunDisplay) {
                wabunDisplay.remove();
            }
        }
    }
    
    /**
     * Update connection status UI
     */
    function updateConnectionUI() {
        if (appState.isConnected) {
            elements.connectionIndicator.textContent = 'Connected';
            elements.connectionIndicator.classList.remove('disconnected');
            elements.connectionIndicator.classList.add('connected');
            elements.connectButton.textContent = 'Disconnect';
        } else {
            elements.connectionIndicator.textContent = 'Disconnected';
            elements.connectionIndicator.classList.remove('connected');
            elements.connectionIndicator.classList.add('disconnected');
            elements.connectButton.textContent = 'Connect Morse Key';
        }
    }
    
    /**
     * Update learning UI based on current state
     */
    function updateLearningUI() {
        const learningState = LESSON_MANAGER.getLearningState();
        const country = elements.countrySelect.value;
        
        // Update current character display
        if (learningState.currentCharacter) {
            elements.currentCharacter.textContent = learningState.currentCharacter;
            elements.currentMorse.textContent = ALPHABETS.charToMorse(learningState.currentCharacter, country);
            elements.playCharacterButton.disabled = false;
            
            // Special handling for Chinese Telegraph Code
            if (country === 'chinese-telegraph') {
                const chineseChar = document.getElementById('chinese-char');
                const telegraphCode = document.getElementById('telegraph-code');
                
                if (chineseChar && telegraphCode) {
                    const code = ALPHABETS.charToTelegraphCode(learningState.currentCharacter);
                    chineseChar.textContent = learningState.currentCharacter;
                    telegraphCode.textContent = code;
                }
            }
            
            // Special handling for Japanese Wabun Code
            if (country === 'japanese-wabun') {
                const katakanaChar = document.getElementById('katakana-char');
                const romajiEquiv = document.getElementById('romaji-equiv');
                
                if (katakanaChar && romajiEquiv) {
                    // This is a simplified mapping - a real implementation would have a complete mapping
                    const romajiMap = {
                        'ア': 'A', 'イ': 'I', 'ウ': 'U', 'エ': 'E', 'オ': 'O',
                        'カ': 'KA', 'キ': 'KI', 'ク': 'KU', 'ケ': 'KE', 'コ': 'KO'
                        // ... more mappings would be added in a real implementation
                    };
                    
                    katakanaChar.textContent = learningState.currentCharacter;
                    romajiEquiv.textContent = romajiMap[learningState.currentCharacter] || '';
                }
            }
        } else {
            elements.currentCharacter.textContent = '';
            elements.currentMorse.textContent = '';
            elements.playCharacterButton.disabled = true;
        }
        
        // Update known characters
        elements.knownCharacters.innerHTML = '';
        learningState.knownCharacters.forEach(char => {
            const charElement = document.createElement('span');
            charElement.classList.add('character-badge');
            charElement.textContent = char;
            elements.knownCharacters.appendChild(charElement);
        });
        
        // Update practice button state
        elements.startPracticeButton.disabled = 
            !appState.isConnected || 
            learningState.knownCharacters.length === 0;
    }
    
    /**
     * Update practice UI based on current state
     */
    function updatePracticeUI() {
        if (appState.isInPracticeMode) {
            // Show expected sequence
            elements.expectedSequence.textContent = appState.currentPracticeSequence;
            
            // Get formatted input with correct/incorrect highlighting
            const formattedInput = INPUT_CHECKER.getFormattedInput();
            elements.userInput.innerHTML = '';
            
            formattedInput.forEach(item => {
                const charSpan = document.createElement('span');
                charSpan.textContent = item.char;
                charSpan.classList.add(item.isCorrect ? 'correct' : 'incorrect');
                elements.userInput.appendChild(charSpan);
            });
            
            // Update accuracy
            const stats = INPUT_CHECKER.calculateSessionStats();
            if (stats) {
                elements.accuracyValue.textContent = `${Math.round(stats.accuracy * 100)}%`;
            }
        } else {
            // Clear practice area
            elements.expectedSequence.textContent = '';
            elements.userInput.innerHTML = '';
            elements.accuracyValue.textContent = '0%';
        }
    }
    
    /**
     * Update progress bars for each character
     */
    function updateProgressBars() {
        const learningState = LESSON_MANAGER.getLearningState();
        elements.progressBars.innerHTML = '';
        
        // Create progress bar for each known character
        learningState.knownCharacters.forEach(char => {
            const progress = learningState.characterProgress[char] || 0;
            const percentage = Math.round(progress * 100);
            
            const progressItem = document.createElement('div');
            progressItem.classList.add('progress-item');
            
            const charLabel = document.createElement('div');
            charLabel.textContent = char;
            progressItem.appendChild(charLabel);
            
            const progressBar = document.createElement('div');
            progressBar.classList.add('progress-bar');
            
            const progressFill = document.createElement('div');
            progressFill.classList.add('progress-fill');
            progressFill.style.width = `${percentage}%`;
            
            progressBar.appendChild(progressFill);
            progressItem.appendChild(progressBar);
            
            const percentageLabel = document.createElement('div');
            percentageLabel.textContent = `${percentage}%`;
            progressItem.appendChild(percentageLabel);
            
            elements.progressBars.appendChild(progressItem);
        });
    }
    
    /**
     * Handle connect button click
     */
    async function handleConnect() {
        if (appState.isConnected) {
            // Disconnect
            try {
                await SERIAL_READER.disconnect();
            } catch (error) {
                console.error('Error disconnecting:', error);
                alert('Error disconnecting from Morse key: ' + error.message);
            }
        } else {
            // Connect
            try {
                if (!SERIAL_READER.isSupported()) {
                    alert('Web Serial API is not supported in this browser. Please use Chrome or Edge.');
                    return;
                }
                
                await SERIAL_READER.connect();
            } catch (error) {
                console.error('Error connecting:', error);
                alert('Error connecting to Morse key: ' + error.message);
            }
        }
    }
    
    /**
     * Handle connection status change
     * @param {boolean} connected - Whether connected to a device
     */
    function handleConnectionChange(connected) {
        appState.isConnected = connected;
        
        // If we just connected, send the current key type
        if (connected && appState.keyType) {
            SERIAL_READER.setKeyType(appState.keyType);
        }
        
        updateUI();
    }
    
    /**
     * Handle settings change
     */
    function handleSettingsChange() {
        LESSON_MANAGER.updateSettings({
            country: elements.countrySelect.value,
            wpm: parseInt(elements.speedSelect.value, 10),
            farnsworthSpacing: elements.farnsworthToggle.checked
        });
        
        updateUI();
    }
    
    /**
     * Handle key type change
     */
    function handleKeyTypeChange() {
        const keyType = elements.keyTypeSelect.value;
        
        // Send command to Arduino if connected
        if (SERIAL_READER.isConnected()) {
            SERIAL_READER.setKeyType(keyType);
        }
        
        // Store the setting for when we connect
        appState.keyType = keyType;
    }
    
    /**
     * Handle start lesson button click
     */
    function handleStartLesson() {
        // Start a new learning session
        LESSON_MANAGER.startSession();
        
        // Enter learn mode
        appState.isInLearnMode = true;
        appState.isInPracticeMode = false;
        
        // Play the current character
        playCurrentCharacter();
        
        // Update UI
        updateUI();
        
        // Enable practice button after 30 seconds
        setTimeout(() => {
            elements.startPracticeButton.disabled = !appState.isConnected;
        }, 30000);
    }
    
    /**
     * Handle play character button click
     */
    function handlePlayCharacter() {
        playCurrentCharacter();
    }
    
    /**
     * Play the current character with audio and visual feedback
     */
    function playCurrentCharacter() {
        const learningState = LESSON_MANAGER.getLearningState();
        const country = elements.countrySelect.value;
        
        if (!learningState.currentCharacter) return;
        
        // Highlight the character
        elements.currentCharacter.classList.add('highlight');
        
        // Special handling for Chinese Telegraph Code
        if (country === 'chinese-telegraph') {
            const code = ALPHABETS.charToTelegraphCode(learningState.currentCharacter);
            if (code) {
                // Play the 4-digit code as individual digits
                MORSE_AUDIO.playText(code, () => {
                    elements.currentCharacter.classList.remove('highlight');
                });
                return;
            }
        }
        
        // Play the character with the current country context
        MORSE_AUDIO.playCharacter(learningState.currentCharacter, () => {
            // Remove highlight when done
            elements.currentCharacter.classList.remove('highlight');
        }, country);
    }
    
    /**
     * Handle start practice button click
     */
    function handleStartPractice() {
        const country = elements.countrySelect.value;
        
        // Generate a practice sequence
        appState.currentPracticeSequence = LESSON_MANAGER.generatePracticeSequence(5);
        
        // Start a new practice session
        INPUT_CHECKER.startSession(appState.currentPracticeSequence);
        
        // Enter practice mode
        appState.isInLearnMode = false;
        appState.isInPracticeMode = true;
        
        // Special handling for Chinese Telegraph Code
        if (country === 'chinese-telegraph') {
            // For Chinese Telegraph, we'd play the 4-digit codes for each character
            const telegraphSequence = appState.currentPracticeSequence.split('').map(char => {
                return ALPHABETS.charToTelegraphCode(char);
            }).join(' ');
            
            // Play the sequence without showing it
            elements.expectedSequence.textContent = '?????';
            MORSE_AUDIO.playText(telegraphSequence, () => {
                // Ready for input
                elements.userInput.innerHTML = '';
            });
        } else {
            // Play the sequence without showing it
            elements.expectedSequence.textContent = '?????';
            MORSE_AUDIO.playText(appState.currentPracticeSequence, () => {
                // Ready for input
                elements.userInput.innerHTML = '';
            }, country);
        }
        
        // Update UI
        updateUI();
    }
    
    /**
     * Handle received character from the Arduino
     * @param {string} char - The received character
     */
    function handleReceivedCharacter(char) {
        if (!appState.isInPracticeMode) return;
        
        // Process the character
        INPUT_CHECKER.processCharacter(char);
    }
    
    /**
     * Handle input updated event
     * @param {Object} sessionData - Current session data
     */
    function handleInputUpdated(sessionData) {
        updatePracticeUI();
    }
    
    /**
     * Handle session complete event
     * @param {Object} stats - Session statistics
     */
    function handleSessionComplete(stats) {
        // Update progress based on results
        LESSON_MANAGER.updateProgress(stats);
        
        // Exit practice mode
        appState.isInPracticeMode = false;
        
        // Show the expected sequence
        elements.expectedSequence.textContent = appState.currentPracticeSequence;
        
        // Update UI
        updateUI();
        
        // Show session results
        const accuracy = Math.round(stats.accuracy * 100);
        elements.sessionMessage.textContent = 
            `Practice complete! Accuracy: ${accuracy}%`;
            
        // If accuracy is high enough, offer to start a new practice
        if (accuracy >= 90) {
            setTimeout(() => {
                if (confirm('Great job! Ready for another practice sequence?')) {
                    handleStartPractice();
                }
            }, 2000);
        }
    }
    
    /**
     * Handle learning state updated event
     * @param {Object} state - Current learning state
     */
    function handleLearningStateUpdated(state) {
        updateUI();
    }
    
    /**
     * Handle new character introduction
     * @param {string} char - The new character
     */
    function handleNewCharacter(char) {
        // Show message
        elements.sessionMessage.textContent = 
            `New character introduced: ${char} (${ALPHABETS.charToMorse(char)})`;
            
        // Enter learn mode to introduce the character
        appState.isInLearnMode = true;
        appState.isInPracticeMode = false;
        
        // Play the new character
        playCurrentCharacter();
        
        // Update UI
        updateUI();
        
        // Enable practice button after 30 seconds
        setTimeout(() => {
            elements.startPracticeButton.disabled = !appState.isConnected;
        }, 30000);
    }
    
    /**
     * Handle lesson session end
     * @param {Object} state - Current learning state
     */
    function handleLessonSessionEnd(state) {
        // Show session end message
        elements.sessionMessage.textContent = 
            '✅ Session complete! Great work — take a 1-hour break before your next session. ' +
            'Stretch, get something to drink, and let your brain absorb what you just learned. 😊';
            
        // Update UI
        updateUI();
    }
});