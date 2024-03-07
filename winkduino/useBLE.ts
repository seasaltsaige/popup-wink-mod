/* eslint-disable no-bitwise */
import { useMemo, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
} from "react-native-ble-plx";
import base64 from "react-native-base64";
import * as ExpoDevice from "expo-device";
const winkduinoServiceUUID = "a144c6b0-5e1a-4460-bb92-3674b2f51520";
const winkduinoResponseCharacteristicUUID = "a144c6b1-5e1a-4460-bb92-3674b2f51521";
const resetCharacteristicUUID = "a144c6b1-5e1a-4460-bb92-3674b2f51522";

const leftStatusUUID = "a144c6b1-5e1a-4460-bb92-3674b2f51523";
const rightStatusUUID = "a144c6b1-5e1a-4460-bb92-3674b2f51524";

interface BluetoothLowEnergyApi {
  requestPermissions(): Promise<boolean>;
  scanForPeripherals(): void;
  connectToDevice: (deviceId: Device) => Promise<void>;
  disconnectFromDevice: () => void;
  connectedDevice: Device | null;
  allDevices: Device[];
  isBusy: boolean;
  needsReset: boolean;
  leftStatus: number;
  rightStatus: number;
}

function useBLE(): BluetoothLowEnergyApi {
  const bleManager = useMemo(() => new BleManager(), []);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [needsReset, setNeedsReset] = useState(false);

  const [leftStatus, setLeftStatus] = useState(0);
  const [rightStatus, setRightStatus] = useState(0);

  const requestAndroid31Permissions = async () => {
    const bluetoothScanPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );
    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );
    const fineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );

    return (
      bluetoothScanPermission === "granted" &&
      bluetoothConnectPermission === "granted" &&
      fineLocationPermission === "granted"
    );
  };

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Bluetooth Low Energy requires Location",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const isAndroid31PermissionsGranted =
          await requestAndroid31Permissions();

        return isAndroid31PermissionsGranted;
      }
    } else {
      return true;
    }
  };

  const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1;

  const scanForPeripherals = () =>
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
      }
      if (device && device.name?.includes("Winkduino")) {
        setAllDevices((prevState: Device[]) => {
          if (!isDuplicteDevice(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        });
        console.log(device.name)
      }
    });

  const connectToDevice = async (device: Device) => {
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      bleManager.stopDeviceScan();
      deviceConnection.monitorCharacteristicForService(winkduinoServiceUUID, resetCharacteristicUUID, subscribeToReset);
      deviceConnection.monitorCharacteristicForService(winkduinoServiceUUID, leftStatusUUID, subscribeToLeft);
      deviceConnection.monitorCharacteristicForService(winkduinoServiceUUID, rightStatusUUID, subscribeToRight);

      // const leftCharacteristic = await deviceConnection.readCharacteristicForService(winkduinoServiceUUID, leftStatusUUID);
      // const rightCharacteristic = await deviceConnection.readCharacteristicForService(winkduinoServiceUUID, rightStatusUUID);
      // const resetCharacteristic = await deviceConnection.readCharacteristicForService(winkduinoServiceUUID, resetCharacteristicUUID);

      // setLeftStatus(parseFloat(base64.decode(leftCharacteristic.value!)));
      // setRightStatus(parseFloat(base64.decode(rightCharacteristic.value!)));

      // setNeedsReset(base64.decode(resetCharacteristic.value!) == "1");

      deviceConnection.monitorCharacteristicForService(winkduinoServiceUUID, winkduinoResponseCharacteristicUUID, subscribeToBusy);


    } catch (e) {
      console.log("FAILED TO CONNECT", e);
    }
  };

  const disconnectFromDevice = () => {
    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
      setAllDevices([]);
    }
  };

  const subscribeToBusy = (error: BleError | null, characteristic: Characteristic | null) => {
    if (error) {
      console.log(error);
    }

    if (base64.decode(characteristic?.value!) == "1") setIsBusy(true);
    else setIsBusy(false);
  }

  const subscribeToReset = (error: BleError | null, characteristic: Characteristic | null) => {
    if (error) {
      console.log(error);
    }
    console.log(base64.decode(characteristic?.value!));
    if (base64.decode(characteristic?.value!) == "1") setNeedsReset(true);
    else setNeedsReset(false);
  }

  const subscribeToLeft = (error: BleError | null, characteristic: Characteristic | null) => {
    if (error) {
      console.log(error);
    }
    setLeftStatus(parseFloat(base64.decode(characteristic?.value!)));
  }

  const subscribeToRight = (error: BleError | null, characteristic: Characteristic | null) => {
    if (error) {
      console.log(error);
    }
    setRightStatus(parseFloat(base64.decode(characteristic?.value!)));
  }

  return {
    scanForPeripherals,
    requestPermissions,
    connectToDevice,
    allDevices,
    connectedDevice,
    disconnectFromDevice,
    isBusy,
    needsReset,
    leftStatus,
    rightStatus,
  };
}

export default useBLE;
