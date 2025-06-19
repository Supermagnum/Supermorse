/**
 * serialReader.js
 * Handles communication with Arduino via Web Serial API
 */

const SERIAL_READER = (function() {
    // Serial port instance
    let port = null;
    
    // Reader and writer for the port
    let reader = null;
    let writer = null;
    
    // Connection status
    let connected = false;
    
    // Callback for when a character is received
    let onCharacterReceived = null;
    
    // Callback for connection status changes
    let onConnectionChange = null;
    
    // Default serial options
    const serialOptions = {
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        bufferSize: 255,
        flowControl: 'none'
    };
    
    /**
     * Check if Web Serial API is supported
     * @returns {boolean} Whether Web Serial is supported
     */
    function isSupported() {
        return 'serial' in navigator;
    }
    
    /**
     * Connect to an Arduino device
     * @returns {Promise} Resolves when connected, rejects on error
     */
    async function connect() {
        if (!isSupported()) {
            throw new Error('Web Serial API is not supported in this browser');
        }
        
        try {
            // Request port from user
            port = await navigator.serial.requestPort();
            
            // Open the port
            await port.open(serialOptions);
            
            // Set up the reader
            setupReader();
            
            // Set up the writer
            const textEncoder = new TextEncoder();
            writer = port.writable.getWriter();
            
            // Update connection status
            connected = true;
            if (onConnectionChange) {
                onConnectionChange(true);
            }
            
            return true;
        } catch (error) {
            console.error('Error connecting to serial device:', error);
            
            // Update connection status
            connected = false;
            if (onConnectionChange) {
                onConnectionChange(false);
            }
            
            throw error;
        }
    }
    
    /**
     * Set up the serial port reader
     */
    async function setupReader() {
        if (!port) return;
        
        // Create a reader
        const textDecoder = new TextDecoder();
        reader = port.readable.getReader();
        
        try {
            // Read data loop
            while (true) {
                const { value, done } = await reader.read();
                
                if (done) {
                    // Reader has been canceled
                    break;
                }
                
                // Decode the received data
                const text = textDecoder.decode(value);
                
                // Process each character
                for (const char of text) {
                    if (onCharacterReceived) {
                        onCharacterReceived(char);
                    }
                }
            }
        } catch (error) {
            console.error('Error reading from serial port:', error);
        } finally {
            // Release the reader
            reader.releaseLock();
            reader = null;
            
            // Update connection status if port is closed
            if (port && !port.readable) {
                connected = false;
                if (onConnectionChange) {
                    onConnectionChange(false);
                }
            }
        }
    }
    
    /**
     * Disconnect from the Arduino device
     * @returns {Promise} Resolves when disconnected
     */
    async function disconnect() {
        if (!port) return;
        
        try {
            // Close the reader if it exists
            if (reader) {
                await reader.cancel();
                reader.releaseLock();
                reader = null;
            }
            
            // Close the writer if it exists
            if (writer) {
                await writer.close();
                writer.releaseLock();
                writer = null;
            }
            
            // Close the port
            await port.close();
            port = null;
            
            // Update connection status
            connected = false;
            if (onConnectionChange) {
                onConnectionChange(false);
            }
        } catch (error) {
            console.error('Error disconnecting from serial device:', error);
            throw error;
        }
    }
    
    /**
     * Send a command to the Arduino
     * @param {string} command - The command to send
     * @returns {Promise} Resolves when the command is sent
     */
    async function sendCommand(command) {
        if (!writer) {
            throw new Error('Serial port is not connected');
        }
        
        const textEncoder = new TextEncoder();
        await writer.write(textEncoder.encode(command + '\n'));
    }
    
    /**
     * Set the key type mode on the Arduino
     * @param {string} keyType - The key type ('straight', 'paddle-single', 'paddle-iambic-a', 'paddle-iambic-b')
     * @returns {Promise} Resolves when the command is sent
     */
    async function setKeyType(keyType) {
        if (!isConnected()) {
            console.warn('Cannot set key type: not connected to device');
            return;
        }
        
        let command = '';
        
        switch (keyType) {
            case 'straight':
                command = 'S'; // Straight key mode
                break;
            case 'paddle-single':
                command = 'P'; // Single paddle mode
                break;
            case 'paddle-iambic-a':
                command = 'A'; // Iambic paddle mode A (Curtis A)
                break;
            case 'paddle-iambic-b':
                command = 'B'; // Iambic paddle mode B
                break;
            default:
                console.warn('Unknown key type:', keyType);
                return;
        }
        
        try {
            await sendCommand(command);
            console.log('Key type set to:', keyType);
        } catch (error) {
            console.error('Error setting key type:', error);
        }
    }
    
    /**
     * Set the callback for when a character is received
     * @param {function} callback - Function to call with the received character
     */
    function setCharacterCallback(callback) {
        onCharacterReceived = callback;
    }
    
    /**
     * Set the callback for connection status changes
     * @param {function} callback - Function to call with the connection status
     */
    function setConnectionCallback(callback) {
        onConnectionChange = callback;
        
        // Call immediately with current status
        if (callback) {
            callback(connected);
        }
    }
    
    /**
     * Get the current connection status
     * @returns {boolean} Whether connected to a device
     */
    function isConnected() {
        return connected;
    }
    
    /**
     * Set up automatic reconnection
     * @param {number} interval - Interval in milliseconds to attempt reconnection
     * @returns {number} Interval ID for clearing
     */
    function setupAutoReconnect(interval = 5000) {
        // Check if navigator.serial.getPorts() is available (Chrome 89+)
        if (!navigator.serial.getPorts) {
            console.warn('Auto-reconnect is not supported in this browser');
            return null;
        }
        
        const intervalId = setInterval(async () => {
            if (connected) return;
            
            try {
                // Get previously connected ports
                const ports = await navigator.serial.getPorts();
                
                if (ports.length > 0) {
                    // Try to reconnect to the first available port
                    port = ports[0];
                    await port.open(serialOptions);
                    
                    // Set up the reader
                    setupReader();
                    
                    // Set up the writer
                    const textEncoder = new TextEncoder();
                    writer = port.writable.getWriter();
                    
                    // Update connection status
                    connected = true;
                    if (onConnectionChange) {
                        onConnectionChange(true);
                    }
                }
            } catch (error) {
                console.error('Auto-reconnect failed:', error);
            }
        }, interval);
        
        return intervalId;
    }
    
    // Public API
    return {
        isSupported,
        connect,
        disconnect,
        sendCommand,
        setCharacterCallback,
        setConnectionCallback,
        isConnected,
        setupAutoReconnect,
        setKeyType
    };
})();