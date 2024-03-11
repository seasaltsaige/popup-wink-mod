import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import base64 from "react-native-base64";
import useBLE from "./useBLE";
import DefaultModal from "./Modals/DefaultModal";
import PresetsModal from "./Modals/PresetsModal";
import CreatePresetModal from "./Modals/CreatePresetModal";
// import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import Home from "./pages/Home";

const winkduinoServiceUUID = "a144c6b0-5e1a-4460-bb92-3674b2f51520";
const winkduinoRequestCharacteristicUUID = "a144c6b1-5e1a-4460-bb92-3674b2f51520";

// const Stack = createNativeStackNavigator();


const App = () => {
  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectedDevice,
    disconnectFromDevice,
    isBusy,
    needsReset,
    leftStatus,
    rightStatus
  } = useBLE();


  const scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      scanForPeripherals();
    }
  };

  useEffect(() => {
    scanForDevices();
  }, []);

  async function sendDefaultData(data: number): Promise<void> {
    if (isBusy) return;
    try {
      await connectedDevice?.writeCharacteristicWithResponseForService(winkduinoServiceUUID, winkduinoRequestCharacteristicUUID, base64.encode(data.toString()));
    } catch (err) {
      console.log("ERROR Sending Data")
      console.log(err);
    }
  }

  const [defaultModalVisible, setDefaultModalVisible] = useState(false);
  const [createPresetModalVisible, setCreatePresetModalVisible] = useState(false);
  const [presetsModalVisible, setPresetsModalVisible] = useState(false);


  const closeDefault = () => {
    setDefaultModalVisible(false);
  }
  const closePresets = () => {
    setPresetsModalVisible(false);
  }
  const closeCreatePresets = () => {
    setCreatePresetModalVisible(false);
  }


  return (

    <SafeAreaView style={styles.container}>
      <View style={styles.titleWrapper}>

        <View>
          {
            connectedDevice === null ?
              <Text style={{ fontSize: 25, fontWeight: "bold" }}>Scanning for device...</Text> :
              <Text style={styles.titleText}>Connected to {connectedDevice.name}</Text>
          }

          <TouchableOpacity style={styles.ctaButton} onPress={() => setDefaultModalVisible(true)} key={5}>
            <Text style={styles.ctaButtonText}>
              Go to default commands
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.ctaButton} onPress={() => setPresetsModalVisible(true)} key={6}>
            <Text style={styles.ctaButtonText}>
              Go to presets
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.ctaButton} onPress={() => setCreatePresetModalVisible(true)} key={7}>
            <Text style={styles.ctaButtonText}>
              Create a preset
            </Text>
          </TouchableOpacity>

          <DefaultModal
            close={closeDefault}
            visible={defaultModalVisible}
            device={connectedDevice}
            isBusy={isBusy}
            leftStatus={leftStatus}
            needsReset={needsReset}
            rightStatus={rightStatus}
            sendData={sendDefaultData}
            key={1}
          />

          <PresetsModal
            visible={presetsModalVisible}
            close={closePresets}
            isBusy={isBusy}
            leftStatus={leftStatus}
            rightStatus={rightStatus}
            device={connectedDevice!}
            key={2}
          />

          <CreatePresetModal
            visible={createPresetModalVisible}
            close={closeCreatePresets}
            key={3}
          />


        </View>
      </View>
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
    alignContent: "center",
    justifyContent: "center",

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
    marginHorizontal: 5,
    marginBottom: 10,
    borderRadius: 6,
    paddingHorizontal: 8,
  },
  ctaButtonDisabled: {
    backgroundColor: "lightgrey",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    marginHorizontal: 5,
    marginBottom: 10,
    borderRadius: 6,
    paddingHorizontal: 8,
  },
  resetButton: {
    backgroundColor: "#FF6020",
    justifyContent: "center",
    alignSelf: "center",
    height: 40,
    width: 250,
    marginBottom: 20,
    borderRadius: 5,
  },
  resetButtonDisabled: {
    backgroundColor: "lightgrey",
    justifyContent: "center",
    alignItems: "center",
    height: 40,
    width: 250,
    marginBottom: 20,
    borderRadius: 5,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  ctaButtonTextDisabled: {
    fontSize: 18,
    fontWeight: "bold",
    color: "grey",
    textAlign: "center",
  },
  sendButton: {
    margin: 10,
  }
});

export default App;