#include <ArduinoBLE.h>


// TODO: Use these to better track each headlights position, specifically when doing sleepy eye, so resetting them doesnt cause UP or DOWN voltage to be applied for too long
double leftPercentageFromTop = 1;
double rightPercentageFromTop = 1;

// Pins to control left side
const int OUT_PIN_RIGHT_DOWN = 2;
const int OUT_PIN_RIGHT_UP = 3;

// Pins to control right side
const int OUT_PIN_LEFT_DOWN = 11;
const int OUT_PIN_LEFT_UP = 12;

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
// Initial guess, 0.5s --> felt too short, : 0.75s
const int HEADLIGHT_MOVEMENT_DELAY = 750;

// Nano BLE Service
const char* serviceUUID = "a144c6b0-5e1a-4460-bb92-3674b2f51520";
// Characteristic to be written to
const char* requestCharacteristicUUID = "a144c6b1-5e1a-4460-bb92-3674b2f51520";

// Potentially will be used to write to when busy and when available (forcing buttons to be pressed at normal times)
// Not entirely necessary if this app is just for me, but nice for a public thing.
const char* responseCharacteristicUUID = "a144c6b1-5e1a-4460-bb92-3674b2f51521";


// EASIST THING TO DO TO PREVENT HURTING MOTORS
const char* resetCharacteristicUUID = "a144c6b1-5e1a-4460-bb92-3674b2f51522";

BLEService service(serviceUUID);
BLEStringCharacteristic requestCharacteristic(requestCharacteristicUUID, BLEWrite, 4);
BLEStringCharacteristic responseCharacteristic(responseCharacteristicUUID, BLENotify, 4);
BLEStringCharacteristic resetCharacteristic(resetCharacteristicUUID, BLENotify, 4);

bool buttonInterrupt();
void syncHeadlights();
void percentageDrop(long percentage);
void setAllOff();

void setup() {
  // On setup, should call headlightSync, so the arduino can be aware of where everything is.

  // Basic BLE Setup.
  Serial.begin(115200);
  
  delay(500);
  Serial.println("Starting arduino from boot");
  
  // Set pins
  pinMode(OUT_PIN_RIGHT_UP, OUTPUT);
  pinMode(OUT_PIN_RIGHT_DOWN, OUTPUT);
  pinMode(OUT_PIN_LEFT_UP, OUTPUT);
  pinMode(OUT_PIN_LEFT_UP, OUTPUT);
  
  // Using built in pullup resistor to eliminate variation in 12V -> opto-isolator input.
  pinMode(INPUT_BUTTON_UP, INPUT_PULLUP);

  // Sync headlights on initial boot of arduino, so it can know where it is.
  syncHeadlights();
  delay(HEADLIGHT_MOVEMENT_DELAY);
  setAllOff();
  
  // NOTE: LOW means pressed in, HIGH means unpressed (INPUT_PULLUP) 
  lastButtonStatus = digitalRead(INPUT_BUTTON_UP);

  BLE.setDeviceName("Winkduino");
  BLE.setLocalName("Winkduino");
  Serial.println("Name set to: Winkduino - Headlight Controller");


  if (!BLE.begin()) {
    Serial.println("Starting Bluetooth® Low Energy module failed!");
    while (1);
  }

  BLE.setAdvertisedService(service);
  service.addCharacteristic(requestCharacteristic);
  service.addCharacteristic(responseCharacteristic);
  service.addCharacteristic(resetCharacteristic);
  BLE.addService(service);
  requestCharacteristic.writeValue("0");
  responseCharacteristic.setValue("0");
  resetCharacteristic.setValue("0");

  BLE.advertise();

  Serial.println("Arduino Nano 33 BLE (Peripheral Device)");
  Serial.println(" ");
}

void loop() {


  bool interrupt = buttonInterrupt();
  if (interrupt) return;
  

  BLEDevice central = BLE.central();

  Serial.println("Discovering central device...");
  delay(500);

  if (central) {
    Serial.println("Connected to central device.");
    Serial.print("Device MAC address: ");
    Serial.println(central.address());
    Serial.println();


    while (central.connected()) {
      // Moved so it actually works to interrupt
      bool interrupt = buttonInterrupt();
      if (interrupt) return;

      if (requestCharacteristic.written()) {
        String writtenValue = requestCharacteristic.value();
        Serial.println(writtenValue);

        int valueInt = writtenValue.toInt();

        responseCharacteristic.setValue("1");
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
            if (leftStatus != 1) {
              digitalWrite(OUT_PIN_LEFT_DOWN, LOW);
              digitalWrite(OUT_PIN_LEFT_UP, HIGH);
              leftStatus = 1;
            } else {
              digitalWrite(OUT_PIN_LEFT_DOWN, HIGH);
              digitalWrite(OUT_PIN_LEFT_UP, LOW);
              leftStatus = 0;
            }

            if (rightStatus != 1) {
              digitalWrite(OUT_PIN_RIGHT_DOWN, LOW);
              digitalWrite(OUT_PIN_RIGHT_UP, HIGH);
              rightStatus = 1;
            } else {
              digitalWrite(OUT_PIN_RIGHT_DOWN, HIGH);
              digitalWrite(OUT_PIN_RIGHT_UP, LOW);
              rightStatus = 0;
            }

            delay(HEADLIGHT_MOVEMENT_DELAY);

            if (leftStatus != 1) {
              digitalWrite(OUT_PIN_LEFT_DOWN, LOW);
              digitalWrite(OUT_PIN_LEFT_UP, HIGH);
              leftStatus = 1;
            } else {
              digitalWrite(OUT_PIN_LEFT_DOWN, HIGH);
              digitalWrite(OUT_PIN_LEFT_UP, LOW);
              leftStatus = 0;
            }

            if (rightStatus != 1) {
              digitalWrite(OUT_PIN_RIGHT_DOWN, LOW);
              digitalWrite(OUT_PIN_RIGHT_UP, HIGH);
              rightStatus = 1;
            } else {
              digitalWrite(OUT_PIN_RIGHT_DOWN, HIGH);
              digitalWrite(OUT_PIN_RIGHT_UP, LOW);
              rightStatus = 0;
            }

          break;

          // Left Up
          case 4:
            if (leftStatus != 1) {
              digitalWrite(OUT_PIN_LEFT_DOWN, LOW);
              digitalWrite(OUT_PIN_LEFT_UP, HIGH);
              leftStatus = 1;
            }
            
          break;

          // Left Down
          case 5:
            if (leftStatus != 0) {
              // Serial.println(leftStatus)
              digitalWrite(OUT_PIN_LEFT_DOWN, HIGH);
              digitalWrite(OUT_PIN_LEFT_UP, LOW);
              leftStatus = 0;
            }
          break;

          // Left Blink (Wink)
          case 6:
            if (leftStatus != 1) {
              digitalWrite(OUT_PIN_LEFT_DOWN, LOW);
              digitalWrite(OUT_PIN_LEFT_UP, HIGH);
              leftStatus = 1;
            } else {
              digitalWrite(OUT_PIN_LEFT_DOWN, HIGH);
              digitalWrite(OUT_PIN_LEFT_UP, LOW);
              leftStatus = 0;
            }

            delay(HEADLIGHT_MOVEMENT_DELAY);

            if (leftStatus != 1) {
              digitalWrite(OUT_PIN_LEFT_DOWN, LOW);
              digitalWrite(OUT_PIN_LEFT_UP, HIGH);
              leftStatus = 1;
            } else {
              digitalWrite(OUT_PIN_LEFT_DOWN, HIGH);
              digitalWrite(OUT_PIN_LEFT_UP, LOW);
              leftStatus = 0;
            }

          break;

          // Right Up
          case 7:
            if (rightStatus != 1) {
              digitalWrite(OUT_PIN_RIGHT_DOWN, LOW);
              digitalWrite(OUT_PIN_RIGHT_UP, HIGH);
              rightStatus = 1;
            }
          break;

          // Right Down
          case 8:
            if (rightStatus != 0) {
              digitalWrite(OUT_PIN_RIGHT_UP, LOW);
              digitalWrite(OUT_PIN_RIGHT_DOWN, HIGH);
              rightStatus = 0;
            }
          break;

          // Right Blink (Wink)
          case 9:
            if (rightStatus != 1) {
              digitalWrite(OUT_PIN_RIGHT_DOWN, LOW);
              digitalWrite(OUT_PIN_RIGHT_UP, HIGH);
              rightStatus = 1;
            } else {
              digitalWrite(OUT_PIN_RIGHT_DOWN, HIGH);
              digitalWrite(OUT_PIN_RIGHT_UP, LOW);
              rightStatus = 0;
            }

            delay(HEADLIGHT_MOVEMENT_DELAY);

            if (rightStatus != 1) {
              digitalWrite(OUT_PIN_RIGHT_DOWN, LOW);
              digitalWrite(OUT_PIN_RIGHT_UP, HIGH);
              rightStatus = 1;
            } else {
              digitalWrite(OUT_PIN_RIGHT_DOWN, HIGH);
              digitalWrite(OUT_PIN_RIGHT_UP, LOW);
              rightStatus = 0;
            }

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
              int v = valueInt-11;
              double scaled = ((double)1/((double)100))*(double)v;
              Serial.println("SCALED");
              Serial.println(scaled);

              syncHeadlights();
              delay(HEADLIGHT_MOVEMENT_DELAY);

              setAllOff();
              
              percentageDrop(scaled);
              leftPercentageFromTop = scaled;
              rightPercentageFromTop = scaled;
              resetCharacteristic.setValue("1");
            }

          break;
        }
        delay(HEADLIGHT_MOVEMENT_DELAY);
        setAllOff();
        responseCharacteristic.setValue("0");
      }
    }

    Serial.println("Central device disconnected.");

  }
}

// HUH WHY
// Setting all pins to high at the same time for some reason actually turns them all off even though the opposite of this happens with individual pins elsewhere....
void setAllOff() {
  digitalWrite(OUT_PIN_LEFT_DOWN, HIGH);
  digitalWrite(OUT_PIN_LEFT_UP, HIGH);
  digitalWrite(OUT_PIN_RIGHT_DOWN, HIGH);
  digitalWrite(OUT_PIN_RIGHT_UP, HIGH);
}

// Sleepy eye working!
void percentageDrop(double percentage) {
  Serial.println(percentage);
  Serial.println("IN DROP");

  digitalWrite(OUT_PIN_LEFT_DOWN, HIGH);
  digitalWrite(OUT_PIN_RIGHT_DOWN, HIGH);
  digitalWrite(OUT_PIN_LEFT_UP, LOW);
  digitalWrite(OUT_PIN_RIGHT_UP, LOW);

  Serial.println("DOWN");

  delay(percentage * HEADLIGHT_MOVEMENT_DELAY);

  Serial.println("ALL OFF");
  setAllOff();
}

/**
  Allows built in headlight button in Miata to still be used as close to normal as possible, allowing close to normal headlight opperation, even in the case of use of BLE. 
*/
bool buttonInterrupt() {
  int readVal = digitalRead(INPUT_BUTTON_UP);

  if (readVal == lastButtonStatus)
    return false;
    
  responseCharacteristic.setValue("1");
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

  setAllOff();

  responseCharacteristic.setValue("0");
  return true;
  
}

/**
  Will sync headlight position to arduino status in case headlights become un-synced somehow, or at initial startup. 
 */
void syncHeadlights() {
  // Set status to busy
  responseCharacteristic.setValue("1");

  digitalWrite(OUT_PIN_RIGHT_DOWN, HIGH);
  digitalWrite(OUT_PIN_RIGHT_UP, LOW);
  digitalWrite(OUT_PIN_LEFT_DOWN, HIGH);
  digitalWrite(OUT_PIN_LEFT_UP, LOW);

  delay(HEADLIGHT_MOVEMENT_DELAY * (1-leftPercentageFromTop));

  Serial.println(HEADLIGHT_MOVEMENT_DELAY * (leftPercentageFromTop));
  Serial.println(HEADLIGHT_MOVEMENT_DELAY * (1-leftPercentageFromTop));

  // Ensure headlights move in unison
  // Move to up position
  digitalWrite(OUT_PIN_RIGHT_UP, HIGH);
  digitalWrite(OUT_PIN_LEFT_UP, HIGH);
  digitalWrite(OUT_PIN_RIGHT_DOWN, LOW);
  digitalWrite(OUT_PIN_LEFT_DOWN, LOW);

  leftPercentageFromTop = 0;
  rightPercentageFromTop = 0;


  resetCharacteristic.setValue("0");

  responseCharacteristic.setValue("0");

}