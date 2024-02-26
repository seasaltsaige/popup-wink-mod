/* eslint-disable no-bitwise */

import { useMemo, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { BleManager, Device } from "react-native-ble-plx";

import * as ExpoDevice from "expo-device";

interface BluetoothLowEnergyApi {
  requestPermissions(): Promise<boolean>;
  scanForPeripherals(): void;
  allDevices: Device[];
}

function useBLE(): BluetoothLowEnergyApi {
  const bleManager = useMemo(() => new BleManager(), []);

  const [allDevices, setAllDevices] = useState<Device[]>([]);

  const requestAndroid31Permissions = async () => {
    const bluetoothScanPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: "Scan Permission",
        message: "App requires Bluetooth Scanning",
        buttonPositive: "OK",
      },
    );
    const bluetoothConnectPermissions = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Connect Permission",
        message: "App requires Bluetooth Connecting",
        buttonPositive: "OK",
      },
    );
    const bluetoothFineLocationPermissions = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Fine Location Permission",
        message: "App requires access to fine location",
        buttonPositive: "OK",
      },
    );

    return (
      bluetoothConnectPermissions === "granted" &&
      bluetoothScanPermission === "granted" &&
      bluetoothFineLocationPermissions === "granted"
    );
  };

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Bluetooth requires location",
            buttonPositive: "OK",
          }
        )

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const isAndroid31PermsGranted = await requestAndroid31Permissions();
        return isAndroid31PermsGranted;
      }
    } else {
      return true;
    }
  }

  const scanForPeripherals = () => {
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error)
        console.log(error);

      if (device && device.name?.includes("PLACEHOLDERNAME_NANO_BLE")) {
        setAllDevices((prevState) => {
          if (!isDuplicateDevice(prevState, device)) {
            return [...prevState, device];
          } else return prevState;
        })
      }
    })

  }

  const isDuplicateDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1;



  return {
    scanForPeripherals,
    requestPermissions,
    allDevices
  }

}





export default useBLE;