#include <ArduinoBLE.h>

// Will use a single integer value to determine what command was sent.
int PIN_DECODE = -1;

// Pins to control left side
const int OUT_PIN_RIGHT_UP = 2;
const int OUT_PIN_RIGHT_DOWN = 3;

// Pins to control right side
const int OUT_PIN_LEFT_UP = 11;
const int OUT_PIN_LEFT_DOWN = 12;

// Should force "UP" state when active HIGH
// Sets "OUT_PIN_RIGHT_DOWN" and "OUT_PIN_LEFT_DOWN" to active LOW
// Sets "OUT_PIN_RIGHT_UP" and "OUT_PIN_LEFT_UP" to active HIGH
const int INPUT_BUTTON_UP = 5;


// Will be used to track status
// TODO: Implement gaurd clauses to prevent unnecessary execution of logic (ex: Headlights up, "LEFT UP" is pressed. --> No code execution)
int leftStatus = -1;
int rightStatus = -1; 


const char* serviceUUID = "a144c6b0-5e1a-4460-bb92-3674b2f51520";
const char* requestCharacteristicUUID = "a144c6b1-5e1a-4460-bb92-3674b2f51520";
const char* responseCharacteristicUUID = "a144c6b1-5e1a-4460-bb92-3674b2f51521";

BLEService service(serviceUUID);
BLEStringCharacteristic requestCharacteristic(requestCharacteristicUUID, BLEWrite, 4);
BLEStringCharacteristic responseCharacteristic(responseCharacteristicUUID, BLENotify, 4);

bool buttonInterrupt();
void syncHeadlights();

void setup() {
  // Basic BLE Setup.
  Serial.begin(9600);

  // Set pins
  pinMode(OUT_PIN_RIGHT_UP, OUTPUT);
  pinMode(OUT_PIN_RIGHT_DOWN, OUTPUT);
  pinMode(OUT_PIN_LEFT_UP, OUTPUT);
  pinMode(OUT_PIN_LEFT_UP, OUTPUT);
  
  pinMode(INPUT_BUTTON_UP, INPUT);
  
  BLE.setDeviceName("Winkduino - Headlight Controller");
  BLE.setLocalName("Winkduino - Headlight Controller");


  if (!BLE.begin()) {
    Serial.println("Starting Bluetooth® Low Energy module failed!");
    while (1);
  }

  BLE.setAdvertisedService(service);
  service.addCharacteristic(requestCharacteristic);
  service.addCharacteristic(responseCharacteristic);

  BLE.addService(service);
  responseCharacteristic.writeValue("0");

  BLE.advertise();

  Serial.println("Arduino Nano 33 BLE (Peripheral Device)");
  Serial.println(" ");
}

void loop() {


  bool mainButtonInterrupt = buttonInterrupt();
  if (mainButtonInterrupt) {
    digitalWrite(OUT_PIN_RIGHT_DOWN, LOW);
    digitalWrite(OUT_PIN_LEFT_DOWN, LOW);
    
    digitalWrite(OUT_PIN_RIGHT_UP, HIGH);
    digitalWrite(OUT_PIN_LEFT_UP, HIGH);

    return;
  }

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
        if (mainButtonInterrupt) {
          digitalWrite(OUT_PIN_RIGHT_DOWN, LOW);
          digitalWrite(OUT_PIN_LEFT_DOWN, LOW);

          digitalWrite(OUT_PIN_RIGHT_UP, HIGH);
          digitalWrite(OUT_PIN_LEFT_UP, HIGH);

          continue;
        }

        String writtenValue = requestCharacteristic.value();

        int valueInt = writtenValue.toInt();


        // Logic to control pin output based on written value
        switch (valueInt) {
          // Both Up
          case 1:

          break;

          // Both Down
          case 2:

          break;

          // Both Blink
          case 3:

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
        }

      }
    }

    Serial.println("Central device disconnected.");

  }
}


bool buttonInterrupt() {
  int readVal = digitalRead(INPUT_BUTTON_UP);
  if (readVal == HIGH) return true;
  else return false;
}

/**
  Will sync headlight position to arduino status in case headlights become un-synced somehow, or at initial startup. 
  TODO: Set headlights to down, then up, then down.
 */
void syncHeadlights() {

}