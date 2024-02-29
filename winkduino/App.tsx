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
const winkduinoResponseCharacteristicUUID = "a144c6b1-5e1a-4460-bb92-3674b2f51521";

const App = () => {
  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    disconnectFromDevice,
  } = useBLE();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isBusy, setIsBusy] = useState(false);
  const scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      scanForPeripherals();
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
    setIsBusy(true);
    connectedDevice?.writeCharacteristicWithoutResponseForService(winkduinoServiceUUID, winkduinoRequestCharacteristicUUID, base64.encode(data.toString()));
    // Blocking to force buttons disable while winkduino is doing its thing
    while (true) {
      const characteristic = await connectedDevice?.readCharacteristicForService(winkduinoServiceUUID, winkduinoResponseCharacteristicUUID).then();
      const val = characteristic?.value;
      if (val === "1") continue;
      else if (val === "0") break;
    }

    setIsBusy(false);

    // TODO: When setting up buttons, disable them when busy is true.
    //

    console.log(data);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleWrapper}>
        {connectedDevice ? (
          <>
            {
              <Text>Connected to {connectedDevice.name}</Text>
            }

            {
              [[1, 2, 3], [4, 5, 6], [7, 8, 9]].map(
                a => (
                  a.map((n) => (
                    <Button title="Send Data" onPress={() => sendData(n)} />
                  ))
                )
              )
            }

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
