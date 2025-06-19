/**
 * lessonManager.js
 * Manages the learning progression and session timing
 */

const LESSON_MANAGER = (function() {
    // Learning stages
    const STAGES = {
        CORE: 1,
        REGIONAL: 2,
        PROSIGNS: 3,
        SPECIAL: 4,
        CONFUSION: 5
    };
    
    // Settings
    const settings = {
        country: 'international',
        wpm: 15,
        farnsworthSpacing: true,
        masteryThreshold: 0.9, // 90% accuracy required for mastery
        sessionDuration: 30 * 60 * 1000, // 30 minutes in milliseconds
        breakDuration: 60 * 60 * 1000 // 1 hour in milliseconds
    };
    
    // Current learning state
    let learningState = {
        stage: STAGES.CORE,
        knownCharacters: [],
        currentCharacter: null,
        characterProgress: {}, // Character -> accuracy mapping
        sessionStartTime: null,
        sessionEndTime: null,
        breakEndTime: null,
        isInSession: false
    };
    
    // Callbacks
    let onStateUpdated = null;
    let onNewCharacter = null;
    let onSessionEnd = null;
    
    /**
     * Initialize the lesson manager
     * @param {Object} options - Configuration options
     */
    function initialize(options = {}) {
        // Apply options
        if (options.country) settings.country = options.country;
        if (options.wpm) settings.wpm = options.wpm;
        if (options.farnsworthSpacing !== undefined) settings.farnsworthSpacing = options.farnsworthSpacing;
        if (options.masteryThreshold) settings.masteryThreshold = options.masteryThreshold;
        
        // Reset learning state
        resetLearningState();
        
        // Set up initial characters (first two from the learning order)
        const initialChars = ALPHABETS.getLearningOrder(settings.country, STAGES.CORE).slice(0, 2);
        initialChars.forEach(char => {
            learningState.knownCharacters.push(char);
            learningState.characterProgress[char] = 0;
        });
        
        // Set current character to the first one
        learningState.currentCharacter = initialChars[0];
        
        // Notify listeners
        if (onStateUpdated) {
            onStateUpdated(getLearningState());
        }
    }
    
    /**
     * Reset the learning state
     */
    function resetLearningState() {
        learningState = {
            stage: STAGES.CORE,
            knownCharacters: [],
            currentCharacter: null,
            characterProgress: {},
            sessionStartTime: null,
            sessionEndTime: null,
            breakEndTime: null,
            isInSession: false
        };
    }
    
    /**
     * Start a new learning session
     */
    function startSession() {
        // Check if we're in a break period
        if (learningState.breakEndTime && Date.now() < learningState.breakEndTime) {
            console.warn('Starting session during recommended break time');
        }
        
        // Set session start time
        learningState.sessionStartTime = Date.now();
        learningState.sessionEndTime = learningState.sessionStartTime + settings.sessionDuration;
        learningState.isInSession = true;
        
        // Notify listeners
        if (onStateUpdated) {
            onStateUpdated(getLearningState());
        }
        
        // Set up session timer
        startSessionTimer();
    }
    
    /**
     * Start the session timer
     */
    function startSessionTimer() {
        // Clear any existing timer
        if (window.sessionTimerId) {
            clearTimeout(window.sessionTimerId);
        }
        
        // Calculate time remaining
        const timeRemaining = learningState.sessionEndTime - Date.now();
        
        if (timeRemaining <= 0) {
            // Session is over
            endSession();
            return;
        }
        
        // Set up timer for the end of the session
        window.sessionTimerId = setTimeout(() => {
            endSession();
        }, timeRemaining);
    }
    
    /**
     * End the current learning session
     */
    function endSession() {
        // Clear session timer
        if (window.sessionTimerId) {
            clearTimeout(window.sessionTimerId);
            window.sessionTimerId = null;
        }
        
        // Update session state
        learningState.isInSession = false;
        learningState.sessionEndTime = Date.now();
        learningState.breakEndTime = learningState.sessionEndTime + settings.breakDuration;
        
        // Notify listeners
        if (onStateUpdated) {
            onStateUpdated(getLearningState());
        }
        
        if (onSessionEnd) {
            onSessionEnd(getLearningState());
        }
    }
    
    /**
     * Get the current learning state
     * @returns {Object} Current learning state
     */
    function getLearningState() {
        return { ...learningState };
    }
    
    /**
     * Update character progress based on session results
     * @param {Object} sessionStats - Statistics from a practice session
     */
    function updateProgress(sessionStats) {
        if (!sessionStats || !sessionStats.charAccuracy) {
            return;
        }
        
        // Update progress for each character
        Object.keys(sessionStats.charAccuracy).forEach(char => {
            const accuracy = sessionStats.charAccuracy[char].accuracy;
            
            // If character is not in our known set, ignore it
            if (!learningState.characterProgress.hasOwnProperty(char)) {
                return;
            }
            
            // Update progress (weighted average: 30% new, 70% existing)
            const currentProgress = learningState.characterProgress[char] || 0;
            learningState.characterProgress[char] = 
                currentProgress * 0.7 + accuracy * 0.3;
        });
        
        // Check if we should introduce a new character
        checkForProgression();
        
        // Notify listeners
        if (onStateUpdated) {
            onStateUpdated(getLearningState());
        }
    }
    
    /**
     * Check if we should progress to a new character or stage
     */
    function checkForProgression() {
        // Check if all current characters meet the mastery threshold
        const allMastered = learningState.knownCharacters.every(char => 
            learningState.characterProgress[char] >= settings.masteryThreshold);
            
        if (!allMastered) {
            return; // Not ready for a new character yet
        }
        
        // Get the next character based on the current stage
        const nextChar = getNextCharacter();
        
        if (nextChar) {
            // Add the new character to known characters
            learningState.knownCharacters.push(nextChar);
            learningState.characterProgress[nextChar] = 0;
            learningState.currentCharacter = nextChar;
            
            // Notify listeners
            if (onNewCharacter) {
                onNewCharacter(nextChar);
            }
        } else {
            // No more characters in this stage, move to the next stage
            progressToNextStage();
        }
    }
    
    /**
     * Get the next character to learn
     * @returns {string|null} Next character or null if no more characters
     */
    function getNextCharacter() {
        // Get all characters for the current stage
        const allCharsInStage = ALPHABETS.getLearningOrder(settings.country, learningState.stage);
        
        // Find the first character that's not already known
        for (const char of allCharsInStage) {
            if (!learningState.knownCharacters.includes(char)) {
                return char;
            }
        }
        
        return null; // No more characters in this stage
    }
    
    /**
     * Progress to the next learning stage
     */
    function progressToNextStage() {
        // Move to the next stage
        learningState.stage++;
        
        // Check if we've reached the confusion mode
        if (learningState.stage === STAGES.CONFUSION) {
            enterConfusionMode();
            return;
        }
        
        // Get the first character of the new stage
        const nextChar = getNextCharacter();
        
        if (nextChar) {
            // Add the new character to known characters
            learningState.knownCharacters.push(nextChar);
            learningState.characterProgress[nextChar] = 0;
            learningState.currentCharacter = nextChar;
            
            // Notify listeners
            if (onNewCharacter) {
                onNewCharacter(nextChar);
            }
        } else {
            // No more characters in any stage, enter confusion mode
            enterConfusionMode();
        }
    }
    
    /**
     * Enter confusion mode (focused practice on confused characters)
     */
    function enterConfusionMode() {
        learningState.stage = STAGES.CONFUSION;
        
        // Get confusion pairs from the input checker
        const confusionPairs = INPUT_CHECKER.getConfusionPairs();
        
        if (confusionPairs.length > 0) {
            // Focus on the most confused character
            learningState.currentCharacter = confusionPairs[0].expected;
        } else {
            // No confusion pairs, just pick the first character
            learningState.currentCharacter = learningState.knownCharacters[0];
        }
        
        // Notify listeners
        if (onStateUpdated) {
            onStateUpdated(getLearningState());
        }
    }
    
    /**
     * Generate a practice sequence using the current known characters
     * @param {number} length - Length of the sequence
     * @returns {string} Practice sequence
     */
    function generatePracticeSequence(length = 5) {
        if (learningState.knownCharacters.length === 0) {
            return '';
        }
        
        let sequence = '';
        
        // Generate random sequence from known characters
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * learningState.knownCharacters.length);
            sequence += learningState.knownCharacters[randomIndex];
        }
        
        return sequence;
    }
    
    /**
     * Update settings
     * @param {Object} newSettings - New settings to apply
     */
    function updateSettings(newSettings) {
        // Update settings
        if (newSettings.country) {
            settings.country = newSettings.country;
            
            // Reset learning state if country changes
            resetLearningState();
            initialize({ country: settings.country });
        }
        
        if (newSettings.wpm) settings.wpm = newSettings.wpm;
        if (newSettings.farnsworthSpacing !== undefined) settings.farnsworthSpacing = newSettings.farnsworthSpacing;
        if (newSettings.masteryThreshold) settings.masteryThreshold = newSettings.masteryThreshold;
        
        // Update audio settings
        MORSE_AUDIO.updateSettings({
            wpm: settings.wpm,
            farnsworthSpacing: settings.farnsworthSpacing
        });
        
        // Notify listeners
        if (onStateUpdated) {
            onStateUpdated(getLearningState());
        }
    }
    
    /**
     * Get the current settings
     * @returns {Object} Current settings
     */
    function getSettings() {
        return { ...settings };
    }
    
    /**
     * Set callback for when the learning state is updated
     * @param {function} callback - Function to call with updated state
     */
    function setStateUpdatedCallback(callback) {
        onStateUpdated = callback;
    }
    
    /**
     * Set callback for when a new character is introduced
     * @param {function} callback - Function to call with the new character
     */
    function setNewCharacterCallback(callback) {
        onNewCharacter = callback;
    }
    
    /**
     * Set callback for when a session ends
     * @param {function} callback - Function to call with the learning state
     */
    function setSessionEndCallback(callback) {
        onSessionEnd = callback;
    }
    
    /**
     * Get the time remaining in the current session
     * @returns {number} Time remaining in milliseconds
     */
    function getSessionTimeRemaining() {
        if (!learningState.isInSession || !learningState.sessionEndTime) {
            return 0;
        }
        
        return Math.max(0, learningState.sessionEndTime - Date.now());
    }
    
    /**
     * Get the time remaining until the next recommended session
     * @returns {number} Time remaining in milliseconds
     */
    function getBreakTimeRemaining() {
        if (!learningState.breakEndTime) {
            return 0;
        }
        
        return Math.max(0, learningState.breakEndTime - Date.now());
    }
    
    /**
     * Check if the user is ready for 20 WPM
     * @returns {boolean} Whether the user is ready for 20 WPM
     */
    function isReadyFor20WPM() {
        // Check if all characters in the core set are mastered at 100%
        const coreChars = ALPHABETS.getLearningOrder(settings.country, STAGES.CORE);
        
        return coreChars.every(char => 
            learningState.characterProgress[char] >= 1.0);
    }
    
    // Public API
    return {
        initialize,
        startSession,
        endSession,
        getLearningState,
        updateProgress,
        generatePracticeSequence,
        updateSettings,
        getSettings,
        setStateUpdatedCallback,
        setNewCharacterCallback,
        setSessionEndCallback,
        getSessionTimeRemaining,
        getBreakTimeRemaining,
        isReadyFor20WPM,
        STAGES
    };
})();