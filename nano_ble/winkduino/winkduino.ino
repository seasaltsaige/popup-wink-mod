#include <ArduinoBLE.h>

// Pins to control left side
const int OUT_PIN_RIGHT_UP = 2;
const int OUT_PIN_RIGHT_DOWN = 3;

// Pins to control right side
const int OUT_PIN_LEFT_UP = 11;
const int OUT_PIN_LEFT_DOWN = 12;

int lastButtonStatus = -1;
// Should force "UP" state when HIGH
// Sets "OUT_PIN_RIGHT_DOWN" and "OUT_PIN_LEFT_DOWN" to LOW
// Sets "OUT_PIN_RIGHT_UP" and "OUT_PIN_LEFT_UP" to HIGH
const int INPUT_BUTTON_UP = 5;


// Will be used to track status
// Down will be 0, up will be 1
int leftStatus = -1;
int rightStatus = -1; 

// TODO: Time headlight movement
// Initial guess, 0.5s
const int HEADLIGHT_MOVEMENT_DELAY = 500;

// Nano BLE Service
const char* serviceUUID = "a144c6b0-5e1a-4460-bb92-3674b2f51520";
// Characteristic to be written to
const char* requestCharacteristicUUID = "a144c6b1-5e1a-4460-bb92-3674b2f51520";

BLEService service(serviceUUID);
BLEStringCharacteristic requestCharacteristic(requestCharacteristicUUID, BLEWrite, 4);

bool buttonInterrupt();
void syncHeadlights();

void setup() {
  // On setup, should call headlightSync, so the arduino can be aware of where everything is.

  // Basic BLE Setup.
  Serial.begin(9600);

  // Set pins
  pinMode(OUT_PIN_RIGHT_UP, OUTPUT);
  pinMode(OUT_PIN_RIGHT_DOWN, OUTPUT);
  pinMode(OUT_PIN_LEFT_UP, OUTPUT);
  pinMode(OUT_PIN_LEFT_UP, OUTPUT);
  
  // Using built in pullup resistor to eliminate variation in 12V -> opto-isolator input.
  pinMode(INPUT_BUTTON_UP, INPUT_PULLUP);

  // Sync headlights on initial boot of arduino, so it can know where it is.
  syncHeadlights();
  
  // NOTE: LOW means pressed in, HIGH means unpressed (INPUT_PULLUP) 
  lastButtonStatus = digitalRead(INPUT_BUTTON_UP);

  BLE.setDeviceName("Winkduino - Headlight Controller");
  BLE.setLocalName("Winkduino - Headlight Controller");
  Serial.println("Name set to: Winkduino - Headlight Controller");


  if (!BLE.begin()) {
    Serial.println("Starting Bluetooth® Low Energy module failed!");
    while (1);
  }

  BLE.setAdvertisedService(service);
  service.addCharacteristic(requestCharacteristic);

  BLE.addService(service);
  requestCharacteristic.writeValue("0");

  BLE.advertise();

  Serial.println("Arduino Nano 33 BLE (Peripheral Device)");
  Serial.println(" ");
}

void loop() {


  bool mainButtonInterrupt = buttonInterrupt();
  if (mainButtonInterrupt) 
    return;
  

  BLEDevice central = BLE.central();

  Serial.println("Discovering central device...");
  delay(500);

  if (central) {
    Serial.println("Connected to central device.");
    Serial.print("Device MAC address: ");
    Serial.println(central.address());
    Serial.println();


    while (central.connected()) {
      if (requestCharacteristic.written()) {
        bool mainButtonInterrupt = buttonInterrupt();
        if (mainButtonInterrupt)
          continue;

        String writtenValue = requestCharacteristic.value();

        int valueInt = writtenValue.toInt();


        // Logic to control pin output based on written value
        switch (valueInt) {
          // Both Up
          case 1:
            if (leftStatus != 1) {
              digitalWrite(OUT_PIN_LEFT_DOWN, LOW);
              digitalWrite(OUT_PIN_LEFT_UP, HIGH);
            }

            if (rightStatus != 1) {
              digitalWrite(OUT_PIN_RIGHT_DOWN, LOW);
              digitalWrite(OUT_PIN_RIGHT_UP, HIGH);
            }

            leftStatus = 1;
            rightStatus = 1;
          break;

          // Both Down
          case 2:
            if (leftStatus != 0) {
              digitalWrite(OUT_PIN_LEFT_DOWN, HIGH);
              digitalWrite(OUT_PIN_LEFT_UP, LOW);
            }

            if (rightStatus != 0) {
              digitalWrite(OUT_PIN_RIGHT_DOWN, HIGH);
              digitalWrite(OUT_PIN_RIGHT_UP, LOW);
            }

            leftStatus = 0;
            rightStatus = 0;
          break;

          // Both Blink
          case 3:
          // Should function regardless of current headlight position (ie: Left is up, right is down -> Blink Command -> Left Down Left Up AND Right Up Right Down)


          break;

          // Left Up
          case 4:

          break;

          // Left Down
          case 5:

          break;

          // Left Blink (Wink)
          case 6:

          break;

          // Right Up
          case 7:

          break;

          // Right Down
          case 8:

          break;

          // Right Blink (Wink)
          case 9:

          break;
          case 10:
            syncHeadlights();
          break;
          // Not sure if I will implement this yet.
          default:
            // Anything from 11-111 should be expected, allowing for a percentage up (sleepy eyes)
            // Slider on app, allowing to be set
            if (valueInt >= 11 && valueInt <= 111) {
              // TODO: Implement logic
            }

          break;
        }
        delay(HEADLIGHT_MOVEMENT_DELAY);
      }
    }

    Serial.println("Central device disconnected.");

  }
}

/**
  Allows built in headlight button in Miata to still be used as close to normal as possible, allowing close to normal headlight opperation, even in the case of use of BLE. 
*/
bool buttonInterrupt() {
  int readVal = digitalRead(INPUT_BUTTON_UP);
  if (readVal == lastButtonStatus)
    return false;
    
  if (readVal == LOW) {
    // Set headlights to UP
    if (leftStatus != 1) {
      digitalWrite(OUT_PIN_LEFT_DOWN, LOW);
      digitalWrite(OUT_PIN_LEFT_UP, HIGH);
    }
    if (rightStatus != 1) {
      digitalWrite(OUT_PIN_RIGHT_DOWN, LOW);
      digitalWrite(OUT_PIN_RIGHT_UP, HIGH);
    }
    leftStatus = 1;
    rightStatus = 1;
  } else if (readVal == HIGH) {
    // Set headlights to DOWN
    if (leftStatus != 0) {
      digitalWrite(OUT_PIN_LEFT_DOWN, HIGH);
      digitalWrite(OUT_PIN_LEFT_UP, LOW);
    }
    if (rightStatus != 0) {
      digitalWrite(OUT_PIN_RIGHT_DOWN, HIGH);
      digitalWrite(OUT_PIN_RIGHT_UP, LOW);
    }
    leftStatus = 0;
    rightStatus = 0;      
  }
  lastButtonStatus = !lastButtonStatus;
  delay(HEADLIGHT_MOVEMENT_DELAY);
  return true;
  
}

/**
  Will sync headlight position to arduino status in case headlights become un-synced somehow, or at initial startup. 
 */
void syncHeadlights() {
  // Should force headlights together
  if (rightStatus != 0)
    digitalWrite(OUT_PIN_RIGHT_DOWN, LOW);
  if (leftStatus != 0)
    digitalWrite(OUT_PIN_LEFT_DOWN, LOW);

  delay(HEADLIGHT_MOVEMENT_DELAY);

  // Ensure headlights move in unison
  digitalWrite(OUT_PIN_RIGHT_UP, HIGH);
  digitalWrite(OUT_PIN_LEFT_UP, HIGH);


  delay(HEADLIGHT_MOVEMENT_DELAY);

  // Reset to down position
  digitalWrite(OUT_PIN_RIGHT_DOWN, LOW);
  digitalWrite(OUT_PIN_LEFT_DOWN, LOW);
  
  delay(HEADLIGHT_MOVEMENT_DELAY);
  leftStatus = 0;
  rightStatus = 0;

  // Read oem button status
  int status = digitalRead(INPUT_BUTTON_UP);
  // If current button status is "LOW" or (UP), headlights should reset to up instead.
  if (status == LOW) {
    digitalWrite(OUT_PIN_RIGHT_UP, HIGH);
    digitalWrite(OUT_PIN_LEFT_UP, HIGH);
    leftStatus = 1;
    rightStatus = 1;
    delay(HEADLIGHT_MOVEMENT_DELAY);
  }

}