/**
 * alphabets.js
 * Contains Morse code mappings for different character sets
 */

const ALPHABETS = (function() {
    // International standard Morse code (letters and numbers)
    const internationalMorse = {
        'A': '.-',
        'B': '-...',
        'C': '-.-.',
        'D': '-..',
        'E': '.',
        'F': '..-.',
        'G': '--.',
        'H': '....',
        'I': '..',
        'J': '.---',
        'K': '-.-',
        'L': '.-..',
        'M': '--',
        'N': '-.',
        'O': '---',
        'P': '.--.',
        'Q': '--.-',
        'R': '.-.',
        'S': '...',
        'T': '-',
        'U': '..-',
        'V': '...-',
        'W': '.--',
        'X': '-..-',
        'Y': '-.--',
        'Z': '--..',
        '0': '-----',
        '1': '.----',
        '2': '..---',
        '3': '...--',
        '4': '....-',
        '5': '.....',
        '6': '-....',
        '7': '--...',
        '8': '---..',
        '9': '----.'
    };

    // Regional characters by country
    const regionalMorse = {
        // Norwegian
        'norway': {
            'Æ': '.-.-',
            'Ø': '---.',
            'Å': '.--.-'
        },
        // Swedish
        'sweden': {
            'Å': '.--.-',
            'Ä': '.-.-',
            'Ö': '---.'
        },
        // German
        'germany': {
            'Ä': '.-.-',
            'Ö': '---.',
            'Ü': '..--',
            'ß': '...--..'
        },
        // French
        'france': {
            'É': '..-..',
            'È': '.-..-',
            'Ç': '-.-..',
            'À': '.--.-',
            'Ù': '..--'
        },
        // Spanish
        'spain': {
            'Ñ': '--.--',
            'Á': '.--.-',
            'É': '..-..',
            'Í': '..',
            'Ó': '---',
            'Ú': '..--'
        },
        // Danish
        'denmark': {
            'Æ': '.-.-',
            'Ø': '---.',
            'Å': '.--.-'
        },
        // Finnish
        'finland': {
            'Å': '.--.-',
            'Ä': '.-.-',
            'Ö': '---.'
        },
        // Icelandic/Faroese/Elfdalian
        'iceland': {
            'Æ': '.-.-',
            'Ð': '..-.',  // Eth
            'Þ': '.--.', // Thorn
            'Á': '.--.-',
            'É': '..-..',
            'Í': '..',
            'Ó': '---',
            'Ú': '..--',
            'Ý': '-.--',
            'Ö': '---.'
        },
        // Faroe Islands
        'faroe': {
            'Æ': '.-.-',
            'Ð': '..-.',  // Eth
            'Ø': '---.',
            'Á': '.--.-',
            'Í': '..',
            'Ó': '---',
            'Ú': '..--',
            'Ý': '-.--'
        },
        // Italian
        'italy': {
            'È': '.-..-',
            'É': '..-..',
            'Ò': '---.',
            'Ç': '-.-...'
        },
        // Polish
        'poland': {
            'Ą': '.-.-',
            'Ć': '-.-..',
            'Ę': '..-..',
            'Ł': '.-..-',
            'Ń': '--.--',
            'Ó': '---.',
            'Ś': '...-...',
            'Ź': '--..-.',
            'Ż': '--..-'
        },
        // Czech
        'czech': {
            'Á': '.--.-',
            'Č': '-.-..',
            'Ď': '..-..',
            'É': '..-..',
            'Ě': '..-..',
            'Í': '..',
            'Ň': '--.--',
            'Ó': '---',
            'Ř': '.-..',
            'Š': '...-...',
            'Ť': '-.',
            'Ú': '..--',
            'Ů': '..--',
            'Ý': '-.--',
            'Ž': '--..'
        }
    };

    // Prosigns (procedural signals)
    const prosigns = {
        'AR': '.-.-.', // End of message
        'SK': '...-.-', // End of contact
        'BT': '-...-', // Break (new paragraph)
        'KN': '-.--.' // Go ahead, specific station
    };

    // Punctuation and special characters
    const specialCharacters = {
        '.': '.-.-.-',
        ',': '--..--',
        '?': '..--..',
        '!': '-.-.--',
        '/': '-..-.',
        '(': '-.--.',
        ')': '-.--.-',
        '&': '.-...',
        ':': '---...',
        ';': '-.-.-.',
        '=': '-...-',
        '+': '.-.-.',
        '-': '-....-',
        '_': '..--.-',
        '"': '.-..-.',
        '$': '...-..-',
        '@': '.--.-.',
        '\'': '.----.'
    };

    // Suggested learning order for international characters
    // Based on character frequency and learning difficulty
    const internationalLearningOrder = [
        'K', 'M', // First two characters to learn (distinct sounds)
        'R', 'S', 'U', 'A', 'T', // Common and simple patterns
        'O', 'E', 'I', 'N', 'D', // More common letters
        'W', 'G', 'H', 'J', 'P', // Medium difficulty
        'B', 'F', 'L', 'V', 'X', // Less common or more complex
        'C', 'Y', 'Z', 'Q', // Least common letters
        '5', '0', // Numbers starting with simplest
        '9', '1', '2', '3', '4', '6', '7', '8' // Remaining numbers
    ];

    // Learning order for regional characters by country (after mastering international)
    const regionalLearningOrder = {
        'norway': ['Æ', 'Ø', 'Å'],
        'sweden': ['Å', 'Ä', 'Ö'],
        'germany': ['Ä', 'Ö', 'Ü', 'ß'],
        'france': ['É', 'È', 'Ç', 'À', 'Ù'],
        'spain': ['Ñ', 'Á', 'É', 'Í', 'Ó', 'Ú'],
        'denmark': ['Æ', 'Ø', 'Å'],
        'finland': ['Å', 'Ä', 'Ö'],
        'iceland': ['Æ', 'Ð', 'Þ', 'Á', 'É', 'Í', 'Ó', 'Ú', 'Ý', 'Ö'],
        'faroe': ['Æ', 'Ð', 'Ø', 'Á', 'Í', 'Ó', 'Ú', 'Ý'],
        'italy': ['È', 'É', 'Ò', 'Ç'],
        'poland': ['Ą', 'Ć', 'Ę', 'Ł', 'Ń', 'Ó', 'Ś', 'Ź', 'Ż'],
        'czech': ['Á', 'Č', 'Ď', 'É', 'Ě', 'Í', 'Ň', 'Ó', 'Ř', 'Š', 'Ť', 'Ú', 'Ů', 'Ý', 'Ž']
    };

    // Learning order for prosigns (after mastering letters and numbers)
    const prosignsLearningOrder = ['AR', 'SK', 'BT', 'KN'];

    // Learning order for special characters (after mastering letters and numbers)
    const specialCharactersLearningOrder = [
        '.', ',', '?', '/', // Most common punctuation first
        '!', ':', ';', '(', ')', // Secondary punctuation
        '=', '+', '-', '@', // Mathematical and common symbols
        '&', '_', '"', '$', '\'' // Less common symbols
    ];

    /**
     * Get all Morse code mappings for a specific country
     * @param {string} country - The country code (e.g., 'international', 'norway', 'germany', etc.)
     * @returns {Object} Combined Morse code mappings
     */
    function getMorseAlphabet(country) {
        let alphabet = { ...internationalMorse };
        
        // Add regional characters based on country
        if (country !== 'international' && regionalMorse[country]) {
            alphabet = { ...alphabet, ...regionalMorse[country] };
        }
        
        return alphabet;
    }

    /**
     * Get all Morse code mappings including special characters and prosigns
     * @returns {Object} Complete Morse code mappings
     */
    function getCompleteMorseAlphabet() {
        let completeAlphabet = {
            ...internationalMorse,
            ...prosigns,
            ...specialCharacters
        };
        
        // Add all regional characters from all countries
        Object.values(regionalMorse).forEach(countryChars => {
            completeAlphabet = { ...completeAlphabet, ...countryChars };
        });
        
        return completeAlphabet;
    }

    /**
     * Get the learning order for a specific country and stage
     * @param {string} country - The country code (e.g., 'international', 'norway', 'germany', etc.)
     * @param {number} stage - The learning stage (1: core, 2: regional, 3: prosigns, 4: special)
     * @returns {Array} Array of characters in recommended learning order
     */
    function getLearningOrder(country, stage) {
        switch (stage) {
            case 1: // Core international
                return internationalLearningOrder;
            case 2: // Regional characters
                return (country !== 'international' && regionalLearningOrder[country]) 
                    ? regionalLearningOrder[country] 
                    : [];
            case 3: // Prosigns
                return prosignsLearningOrder;
            case 4: // Special characters
                return specialCharactersLearningOrder;
            default:
                return internationalLearningOrder;
        }
    }

    /**
     * Convert a character to its Morse code representation
     * @param {string} char - The character to convert
     * @returns {string} Morse code representation or empty string if not found
     */
    function charToMorse(char) {
        const upperChar = char.toUpperCase();
        const completeAlphabet = getCompleteMorseAlphabet();
        return completeAlphabet[upperChar] || '';
    }

    /**
     * Convert a Morse code sequence to its character representation
     * @param {string} morse - The Morse code sequence
     * @returns {string} Character representation or empty string if not found
     */
    function morseToChar(morse) {
        const completeAlphabet = getCompleteMorseAlphabet();
        for (const [char, code] of Object.entries(completeAlphabet)) {
            if (code === morse) {
                return char;
            }
        }
        return '';
    }

    // Public API
    return {
        getMorseAlphabet,
        getCompleteMorseAlphabet,
        getLearningOrder,
        charToMorse,
        morseToChar
    };
})();