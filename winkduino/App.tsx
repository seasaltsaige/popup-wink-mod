import React, { useState } from "react";
import {
  Button,
  GestureResponderEvent,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DeviceModal from "./DeviceConnectionModal";
import base64 from "react-native-base64";
import useBLE from "./useBLE";

const winkduinoServiceUUID = "a144c6b0-5e1a-4460-bb92-3674b2f51520";
const winkduinoRequestCharacteristicUUID = "a144c6b1-5e1a-4460-bb92-3674b2f51520";

const App = () => {
  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    disconnectFromDevice,
    isBusy
  } = useBLE();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      scanForPeripherals();
      console.log("Scanning")
    }
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const openModal = async () => {
    scanForDevices();
    setIsModalVisible(true);
  };

  async function sendData(data: number): Promise<void> {

    try {
      const characteristic = await connectedDevice?.writeCharacteristicWithResponseForService(winkduinoServiceUUID, winkduinoRequestCharacteristicUUID, base64.encode(data.toString()));
      console.log(characteristic?.value);
    } catch (err) {
      console.log("ERROR Sending Data")
      console.log(err);
    }
    console.log(data);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleWrapper}>
        {connectedDevice ? (
          <>
            {
              <Text style={{ fontSize: 20, color: isBusy ? "red" : "black" }}>{isBusy ? "Headlights Moving..." : "Ready for command"}</Text>
            }

            {
              <Text style={{ fontSize: 25 }}>Connected to {connectedDevice.name}</Text>
            }

            {
              <View style={styles.flexRow}>
                {[
                  [
                    { title: "Both Up", i: 1 },
                    { title: "Both Down", i: 2 },
                    { title: "Both Blink", i: 3 }
                  ],
                  [
                    { title: "Left Up", i: 4 },
                    { title: "Left Down", i: 5 },
                    { title: "Left Wink", i: 6 }
                  ],
                  [
                    { title: "Right Up", i: 7 },
                    { title: "Right Down", i: 8 },
                    { title: "Right Wink", i: 9 }
                  ]].map(
                    (
                      (part) => (
                        <View style={styles.flexCol}>
                          {
                            part.map((command) => (
                              <Button disabled={isBusy} title={command.title} onPress={() => sendData(command.i)} />
                            ))
                          }
                        </View>
                      )
                    )
                  )}


              </View>
            }



            <Button disabled={isBusy} title="Sync Headlights" onPress={() => sendData(10)} />
          </>
        ) : (
          <Text style={styles.titleText}>
            Please connect to winkduino device...
          </Text>
        )}
      </View>
      <TouchableOpacity
        onPress={connectedDevice ? disconnectFromDevice : openModal}
        style={styles.ctaButton}
      >
        <Text style={styles.ctaButtonText}>
          {connectedDevice ? "Disconnect" : "Connect"}
        </Text>
      </TouchableOpacity>
      <DeviceModal
        closeModal={hideModal}
        visible={isModalVisible}
        connectToPeripheral={connectToDevice}
        devices={allDevices}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  titleWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  flexRow: {
    display: "flex",
    flexDirection: "row",
  },
  flexCol: {
    display: "flex",
    flexDirection: "column",
  },
  titleText: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginHorizontal: 20,
    color: "black",
  },
  ctaButton: {
    backgroundColor: "#FF6060",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    marginHorizontal: 20,
    marginBottom: 5,
    borderRadius: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});

export default App;
