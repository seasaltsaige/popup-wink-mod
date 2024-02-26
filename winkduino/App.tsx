import React, { useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import useBLE from "./useBLE";
import DeviceModal from "./DeviceConnectionModal";

export default function App() {

  const { requestPermissions, scanForPeripherals, allDevices } = useBLE();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const scanForDevice = async () => {
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      scanForPeripherals();
    }
  }

  const hideModal = () => {
    setIsModalVisible(false);
  }
  const openModal = () => {
    setIsModalVisible(true);
  }


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.main}>
        {
          isConnected ?
            <View></View> :
            <Text style={{ fontSize: 20 }}>Please connect to winkduino device.</Text>
        }
      </View>

      <TouchableOpacity onPress={openModal}
        style={styles.ctaButton}
      >
        <Text style={styles.ctaButtonText}>
          {"Connect"}
        </Text>
      </TouchableOpacity>
      <DeviceModal
        closeModal={hideModal}
        connectToPeripheral={() => { }}
        visible={isModalVisible}
        devices={allDevices}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
