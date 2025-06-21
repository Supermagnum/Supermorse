// Morse Decoder with Adaptive Timing and Debounce

const int STRAIGHT_KEY_PIN = 2;
const int PADDLE_DIT_PIN = 3;
const int PADDLE_DAH_PIN = 4;

// Default thresholds
unsigned long DIT_THRESHOLD = 200;
unsigned long DAH_THRESHOLD = 600;

const unsigned long INTER_CHAR_TIMEOUT = 1000; // ms
const unsigned long DEBOUNCE_DELAY = 20; // ms

// Adaptive timing
bool adaptiveTimingEnabled = false;
unsigned long adaptiveDitAvg = DIT_THRESHOLD;
unsigned long adaptiveDahAvg = DAH_THRESHOLD;
const float adaptiveWeight = 0.2;  // smoothing factor

// Straight key debounce
unsigned long keyDownTime = 0, keyUpTime = 0;
bool keyWasDown = false;
bool lastStraightKeyState = HIGH;
unsigned long lastStraightDebounceTime = 0;

// Paddle debounce
bool lastDitState = HIGH, lastDahState = HIGH;
unsigned long lastDitDebounceTime = 0, lastDahDebounceTime = 0;

// Iambic state
bool ditLatch = false, dahLatch = false;
bool lastDitPressed = false, lastDahPressed = false;
unsigned long lastElementTime = 0;

// Morse decoding
String currentMorseSequence = "";

// Hardcoded mode: 0 = Straight Key, 1 = Single Paddle, 2 = Iambic A, 3 = Iambic B
const int mode = 0;

void setup() {
  pinMode(STRAIGHT_KEY_PIN, INPUT_PULLUP);
  pinMode(PADDLE_DIT_PIN, INPUT_PULLUP);
  pinMode(PADDLE_DAH_PIN, INPUT_PULLUP);

  Serial.begin(9600);
  Serial.println("Morse Decoder Ready.");
}

void loop() {
  handleSerialCommands();

  switch (mode) {
    case 0: handleStraightKey(); break;
    case 1: handleSinglePaddle(); break;
    case 2: handleIambic(true); break;
    case 3: handleIambic(false); break;
  }

  if (currentMorseSequence.length() > 0 && millis() - lastElementTime > INTER_CHAR_TIMEOUT) {
    decodeMorse(currentMorseSequence);
    currentMorseSequence = "";
  }
}

void handleStraightKey() {
  bool reading = digitalRead(STRAIGHT_KEY_PIN);

  if (reading != lastStraightKeyState) {
    lastStraightDebounceTime = millis();
  }

  if ((millis() - lastStraightDebounceTime) > DEBOUNCE_DELAY) {
    if (reading == LOW && !keyWasDown) {
      keyDownTime = millis();
      keyWasDown = true;
    }

    if (reading == HIGH && keyWasDown) {
      keyUpTime = millis();
      unsigned long duration = keyUpTime - keyDownTime;

      updateAdaptiveThresholds(duration);

      if (duration <= DIT_THRESHOLD) currentMorseSequence += ".";
      else if (duration <= DAH_THRESHOLD) currentMorseSequence += "-";

      Serial.print(currentMorseSequence.charAt(currentMorseSequence.length() - 1));
      lastElementTime = keyUpTime;
      keyWasDown = false;
    }
  }

  lastStraightKeyState = reading;
}

void handleSinglePaddle() {
  bool dit = debounceRead(PADDLE_DIT_PIN, lastDitState, lastDitDebounceTime);
  bool dah = debounceRead(PADDLE_DAH_PIN, lastDahState, lastDahDebounceTime);

  if (dit) {
    updateAdaptiveThresholds(DIT_THRESHOLD);
    currentMorseSequence += ".";
    Serial.print(".");
    delay(DIT_THRESHOLD);
    lastElementTime = millis();
  }
  if (dah) {
    updateAdaptiveThresholds(DAH_THRESHOLD);
    currentMorseSequence += "-";
    Serial.print("-");
    delay(DAH_THRESHOLD);
    lastElementTime = millis();
  }
}

void handleIambic(bool isA) {
  bool dit = debounceRead(PADDLE_DIT_PIN, lastDitState, lastDitDebounceTime);
  bool dah = debounceRead(PADDLE_DAH_PIN, lastDahState, lastDahDebounceTime);

  if (dit && !lastDitPressed) ditLatch = true;
  if (dah && !lastDahPressed) dahLatch = true;

  lastDitPressed = dit;
  lastDahPressed = dah;

  if (ditLatch) {
    sendElement('.');
    ditLatch = false;
    if (!isA && dah) dahLatch = true;
  } else if (dahLatch) {
    sendElement('-');
    dahLatch = false;
    if (!isA && dit) ditLatch = true;
  }
}

void sendElement(char symbol) {
  currentMorseSequence += symbol;
  Serial.print(symbol);
  delay(symbol == '.' ? DIT_THRESHOLD : DAH_THRESHOLD);
  lastElementTime = millis();
}

bool debounceRead(int pin, bool &lastState, unsigned long &lastDebounceTime) {
  bool reading = digitalRead(pin);
  if (reading != lastState) lastDebounceTime = millis();
  if ((millis() - lastDebounceTime) > DEBOUNCE_DELAY) {
    lastState = reading;
    return reading == LOW;
  }
  return false;
}

void updateAdaptiveThresholds(unsigned long inputDuration) {
  if (!adaptiveTimingEnabled) return;

  if (inputDuration <= 300) {
    adaptiveDitAvg = (1.0 - adaptiveWeight) * adaptiveDitAvg + adaptiveWeight * inputDuration;
    DIT_THRESHOLD = adaptiveDitAvg;
  } else if (inputDuration < 1000) {
    adaptiveDahAvg = (1.0 - adaptiveWeight) * adaptiveDahAvg + adaptiveWeight * inputDuration;
    DAH_THRESHOLD = adaptiveDahAvg;
  }

  if (DIT_THRESHOLD < 50) DIT_THRESHOLD = 50;
  if (DAH_THRESHOLD < DIT_THRESHOLD + 100) DAH_THRESHOLD = DIT_THRESHOLD + 100;
}

void handleSerialCommands() {
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();

    if (cmd.equalsIgnoreCase("ADAPTIVE ON")) {
      adaptiveTimingEnabled = true;
      Serial.println("Adaptive timing ENABLED.");
    } else if (cmd.equalsIgnoreCase("ADAPTIVE OFF")) {
      adaptiveTimingEnabled = false;
      Serial.println("Adaptive timing DISABLED.");
    } else {
      Serial.println("Unknown command.");
    }
  }
}

void decodeMorse(String morseCode) {
  if (morseCode == ".-") Serial.println(" A");
  else if (morseCode == "-...") Serial.println(" B");
  else if (morseCode == "-.-.") Serial.println(" C");
  else if (morseCode == "-..") Serial.println(" D");
  else if (morseCode == ".") Serial.println(" E");
  else if (morseCode == "..-.") Serial.println(" F");
  else if (morseCode == "--.") Serial.println(" G");
  else if (morseCode == "....") Serial.println(" H");
  else if (morseCode == "..") Serial.println(" I");
  else if (morseCode == ".---") Serial.println(" J");
  else if (morseCode == "-.-") Serial.println(" K");
  else if (morseCode == ".-..") Serial.println(" L");
  else if (morseCode == "--") Serial.println(" M");
  else if (morseCode == "-.") Serial.println(" N");
  else if (morseCode == "---") Serial.println(" O");
  else if (morseCode == ".--.") Serial.println(" P");
  else if (morseCode == "--.-") Serial.println(" Q");
  else if (morseCode == ".-.") Serial.println(" R");
  else if (morseCode == "...") Serial.println(" S");
  else if (morseCode == "-") Serial.println(" T");
  else if (morseCode == "..-") Serial.println(" U");
  else if (morseCode == "...-") Serial.println(" V");
  else if (morseCode == ".--") Serial.println(" W");
  else if (morseCode == "-..-") Serial.println(" X");
  else if (morseCode == "-.--") Serial.println(" Y");
  else if (morseCode == "--..") Serial.println(" Z");
  else Serial.println(" ?");
}
