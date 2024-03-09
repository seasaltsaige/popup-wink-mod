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
    connectToDevice,
    connectedDevice,
    disconnectFromDevice,
    isBusy,
    needsReset,
    leftStatus,
    rightStatus
  } = useBLE();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [text, setText] = useState<string>("");

  const scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      scanForPeripherals();
    }
  };

  useEffect(() => {
    scanForDevices();
  }, []);

  // const hideModal = () => {
  //   setIsModalVisible(false);
  // };

  // const openModal = async () => {
  //   scanForDevices();
  //   setIsModalVisible(true);
  // };

  async function sendData(data: number): Promise<void> {
    if (isBusy) return;
    try {
      await connectedDevice?.writeCharacteristicWithResponseForService(winkduinoServiceUUID, winkduinoRequestCharacteristicUUID, base64.encode(data.toString()));
    } catch (err) {
      console.log("ERROR Sending Data")
      console.log(err);
    }
  }

  const [rssi, setRSSI] = useState(0);

  const [defaultModalVisible, setDefaultModalVisible] = useState(false);
  const [createPresetModalVisible, setCreatePresetModalVisible] = useState(false);
  const [presetsModalVisible, setPresetsModalVisible] = useState(false);


  const closeDefault = () => {
    setDefaultModalVisible(false);
  }


  return (

    <SafeAreaView style={styles.container}>
      <View style={styles.titleWrapper}>
        {
          connectedDevice ?
            <View>
              <Text style={styles.titleText}>Connected to {connectedDevice.name}</Text>


              <TouchableOpacity style={styles.ctaButton} onPress={() => setDefaultModalVisible(true)}>
                <Text style={styles.ctaButtonText}>
                  Go to default commands
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
                sendData={sendData}
                key={1}
              />


            </View> :
            (allDevices.length > 1 ?
              (
                allDevices.map((device) => (
                  <Text>
                    Device '{device.name}' RSSI: {device.rssi}
                  </Text>
                ))
              ) :
              <Text style={styles.titleText}>Scanning for device...</Text>)
        }

      </View>
    </SafeAreaView >
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


// import React from "react";
// import { NavigationContainer } from "@react-navigation/native";
// import { createStackNavigator } from "@react-navigation/stack";
// import Home from "./pages/Home";

// const Stack = createStackNavigator();

// const App = () => {

//   return (
//     <NavigationContainer>
//       <Stack.Navigator
//         screenOptions={{ headerShown: false }}
//         initialRouteName="Home">

//         <Stack.Screen
//           name="Home"
//           component={Home}
//         />

//       </Stack.Navigator>
//     </NavigationContainer>
//   )

// }


// export default App;
