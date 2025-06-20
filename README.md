# Supermorse

Progressive Morse Code Training with a real Morse key by a Arduino.

![Supermorse Screenshot](http://0.0.0.0:8000/http___0_0_0_0_8000_-1750369349324.jpeg)

## Overview

Supermorse is a web-based Morse code training application designed to teach Morse code progressively using sound output and a real physical Morse key connected through an Arduino. The application implements the Koch method, a scientifically-backed learning approach that has proven to be one of the most effective ways to learn Morse code.

### The Koch Method

The Koch method, named after German psychologist Ludwig Koch from Technische Hochschule, Braunschweig, in 1931, uses the full target speed from the outset but begins with just two characters. Once strings containing those two characters can be copied with 90% accuracy, an additional character is added, and so on until the full character set is mastered.

What makes this method so effective:

- **Full Speed from the Start**: Unlike other methods that start slow and speed up, Koch uses the target speed immediately, training your brain to recognize the sounds at the speed you'll actually use.
- **Progressive Character Introduction**: By starting with just two characters and adding more only after mastery, the method prevents overwhelm.
- **Proven Results**: Koch himself, with hand-picked students, got a group to master receiving Morse code at 13 WPM in a mere 13.5 hours - much faster than any other method in the psychological literature.
- **Based on Learned Reflexes**: The method builds muscle memory and auditory reflexes, making it effective for both receiving and sending Morse code.

Supermorse implements this method while adding modern features like regional character support, visual feedback, and integration with physical keys through Arduino.

## Features

- **Progressive Learning**: Start with just two characters and expand as you master them
- **Audio and Visual Feedback**: Characters are played as audio and shown visually during learning
- **Physical Key Integration**: Practice with a real Morse key connected via Arduino
- **Real-time Feedback**: Immediate color-coded feedback on your keying accuracy
- **Adaptive Difficulty**: New characters are introduced only when you reach 90% accuracy
- **Multiple Learning Stages**:
  - Core International Morse (letters and numbers)
  - Regional Characters (country-specific letters)
  - Prosigns & Symbols
  - Confusion Mode (focused practice on characters you struggle with)
- **Regional Support**: Includes special characters for multiple countries
- **Session Management**: Recommended 30-minute sessions with breaks
- **Adjustable Speed**: Supports Farnsworth timing and different WPM settings

## Requirements

- Web browser with Web Serial API support (Chrome or Edge recommended)
- Arduino board (Uno, Nano, or similar)
- Morse key (straight key or paddle)
- USB cable to connect Arduino to computer

## Hardware Setup

### Key Types and Connections

The application supports three different key types:

#### 1. Straight Key

A straight key is the simplest form of Morse key, consisting of a single lever that closes a circuit when pressed.

1. Connect one terminal of the straight key to digital pin 2 on the Arduino
2. Connect the other terminal to GND (ground) on the Arduino
3. The Arduino's internal pull-up resistor will be enabled in the code
4. Select "Straight Key" in the application settings

```
Arduino       Straight Key
--------      ------------
Pin 2    --------- Terminal 1
GND      --------- Terminal 2
```

#### 2. Paddle (Single Lever Mode)

A paddle is a more advanced Morse key that has two levers - one for dots and one for dashes. In single lever mode, we use only one side of the paddle.

1. Connect the common/ground terminal of the paddle to GND on the Arduino
2. Connect either the dot or dash terminal (your preference) to digital pin 2 on the Arduino
3. Leave the unused terminal disconnected
4. Select "Paddle (Single Lever)" in the application settings

```
Arduino       Paddle (Single Lever)
--------      --------------------
Pin 2    ----- Dot Terminal (or Dash Terminal)
GND      ----- Common/Ground Terminal
```

#### 3. Paddle (Iambic Mode A)

In iambic Mode A, both levers of the paddle are used, allowing for more efficient keying. This mode implements the true Curtis-A chip behavior, where you can release the paddles after the final element is sent but before the next element begins, and no additional elements will be sent.

1. Connect the common/ground terminal of the paddle to GND on the Arduino
2. Connect the dot terminal to digital pin 2 on the Arduino
3. Connect the dash terminal to digital pin 3 on the Arduino
4. Select "Paddle (Iambic Mode A)" in the application settings

```
Arduino       Paddle (Iambic)
--------      --------------
Pin 2    ----- Dot Terminal
Pin 3    ----- Dash Terminal
GND      ----- Common/Ground Terminal
```

The advantage of Mode A is that you can release the paddles after you have heard the complete letter, making it more forgiving for beginners.

#### 4. Paddle (Iambic Mode B)

Iambic Mode B is similar to Mode A, but with a key difference in timing behavior. In Mode B, if you release the paddles, the keyer completes the element in progress and then sends one more alternating element.

1. Connect the common/ground terminal of the paddle to GND on the Arduino
2. Connect the dot terminal to digital pin 2 on the Arduino
3. Connect the dash terminal to digital pin 3 on the Arduino
4. Select "Paddle (Iambic Mode B)" in the application settings

```
Arduino       Paddle (Iambic)
--------      --------------
Pin 2    ----- Dot Terminal
Pin 3    ----- Dash Terminal
GND      ----- Common/Ground Terminal
```

Mode B is preferred by some experienced operators who have developed their timing to account for the extra element.

> **Note on Iambic Modes**: Many modern "Mode A" implementations fail to correctly emulate the original Curtis-A chip behavior. The issue is what happens when you release a squeeze after the final element is sent but before the next element begins. Our implementation correctly follows the original Curtis-A behavior, allowing you to release the paddles after you've heard the complete letter.

## Software Setup

### Flashing the Arduino Firmware

1. **Install the Arduino IDE**:
   - Download and install the [Arduino IDE](https://www.arduino.cc/en/software) for your operating system
   - Launch the Arduino IDE after installation

2. **Connect your Arduino**:
   - Connect your Arduino board (Uno, Nano, or similar) to your computer using a USB cable
   - Wait for your computer to recognize the device

3. **Open the Firmware File**:
   - In the Arduino IDE, go to File > Open
   - Navigate to the `arduino/morse_decoder.ino` file in the Supermorse project
   - Click "Open" to load the firmware

4. **Select Board and Port**:
   - Go to Tools > Board and select your Arduino model (e.g., "Arduino Uno")
   - Go to Tools > Port and select the port where your Arduino is connected
     - On Windows, this will be a COM port (e.g., COM3)
     - On macOS, this will be something like "/dev/cu.usbmodem1101"
     - On Linux, this will be something like "/dev/ttyACM0" or "/dev/ttyUSB0"

5. **Upload the Firmware**:
   - Click the Upload button (right arrow icon) in the Arduino IDE toolbar
   - Wait for the "Done uploading" message to appear in the status bar
   - The Arduino's built-in LED may flash during the upload process

6. **Verify Installation**:
   - The Arduino IDE should show "Upload complete" in the status bar
   - You may see "Morse Decoder Ready" in the Serial Monitor (Tools > Serial Monitor)
   - The Arduino is now ready to be used with the Supermorse application

### Setting Up the Web Application

1. Host the web application files on a web server or run locally
   - For local testing, you can use Python's built-in HTTP server:
     ```
     python -m http.server 8000
     ```
     or
     ```
     python3 -m http.server 8000
     ```
   - Then open http://localhost:8000 in your browser

2. Open the application in a supported browser (Chrome or Edge recommended)

3. Click "Connect Morse Key" to establish a connection with the Arduino

## Using the Application

### Initial Setup

1. Select your country from the dropdown to include regional characters
2. Choose your preferred speed (15 WPM default)
3. Ensure Farnsworth spacing is enabled for beginners

### Learning Process

1. **Character Introduction**:
   - The app starts with two characters (K and M)
   - Each character is played as audio and shown visually for 30 seconds
   - Listen carefully and observe the Morse pattern

2. **Practice Mode**:
   - Click "Start Practice" to begin
   - The app sends a 5-character sequence via audio
   - Send your guess using your Morse key
   - Correct characters turn green, incorrect ones turn red

3. **Progression**:
   - Once you reach 90% accuracy with the current character set, a new character is introduced
   - The new character is first played and shown for 30 seconds
   - Then it's added to your practice pool

4. **Session Management**:
   - Each session lasts a maximum of 30 minutes
   - Take a 1-hour break between sessions for optimal learning
   - The app shows a cooldown timer for your next recommended session

## Learning Stages

1. **Core International Morse**: Letters and numbers
2. **Regional Characters**: Country-specific letters (e.g., Æ, Ø, Å for Norway)
3. **Prosigns & Symbols**: Special Morse code procedural signals and punctuation
4. **Confusion Mode**: Focused practice on characters you frequently confuse

## Timing Modes

- **Farnsworth Timing**: Character speed is fixed, but spacing is extended (recommended for beginners)
- **Standard Timing**: Both character speed and spacing follow standard Morse timing
- **Speed Options**: 15 WPM (default), 20 WPM (unlocked after mastering 15 WPM)

## Arduino Firmware Details

The Arduino firmware (`morse_decoder.ino`) handles:

- Reading the Morse key input (press/release timings)
- Calculating element durations (dots, dashes, spaces)
- Mapping valid sequences to characters
- Sending decoded characters over serial to the browser

The firmware supports:
- International Morse code (A-Z, 0-9)
- Regional characters from multiple countries
- Prosigns (AR, SK, BT, KN)
- Punctuation and special characters

## Troubleshooting

### Connection Issues

- Ensure the Arduino is properly connected via USB
- Check that the correct firmware is uploaded
- Make sure you're using a supported browser (Chrome or Edge)
- Try a different USB port or cable

### Decoding Problems

- Adjust your keying technique - be consistent with timing
- Check the physical connections to your Morse key
- Ensure the key makes good electrical contact when pressed

### Browser Compatibility

- The Web Serial API is only supported in Chrome, Edge, and some Chromium-based browsers
- Firefox and Safari do not currently support the Web Serial API
- On Linux, the Web Serial API works when opening HTML files directly (file:// protocol)
- On Windows and macOS, the Web Serial API typically requires a secure context (HTTPS) or localhost

## Technical Details

- **Web Technologies**: HTML, CSS, JavaScript
- **Arduino**: C++ firmware for decoding Morse input
- **Communication**: Web Serial API for browser-Arduino communication
- **Audio**: Web Audio API for generating Morse tones

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Special thanks to the Morse code community for preserving this historic communication method
- Inspired by modern spaced-repetition learning techniques
