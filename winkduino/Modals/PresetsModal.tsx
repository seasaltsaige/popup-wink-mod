import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Device } from "react-native-ble-plx";
import { Command, fetchAllCommands } from "../AsyncStorage/Store";
import { COMMAND_SEPERATOR, HEADLIGHT_MOVEMENT_DELAY, delay, winkduinoServiceUUID } from "../Constants";
import base64 from "react-native-base64";

const customCommandCharacteristicUUID = "a144c6b1-5e1a-4460-bb92-3674b2f51525";

interface PresetsModalProps {
  visible: boolean;
  close: () => void;
  rightStatus: number;
  leftStatus: number;
  isBusy: boolean;
  device: Device;
}

const PresetsModal = (props: PresetsModalProps) => {
  const { close, visible, device, isBusy, leftStatus, rightStatus } = props;
  const [commandList, setCommandList] = useState<Command[]>([]);
  const fetchCmds = async () => {
    // Debug, remove all items to restart
    // await AsyncStorager.clear();
    const cmds = await fetchAllCommands();
    setCommandList(cmds);
  }

  useEffect(() => {
    let interval = setInterval(() => {
      fetchCmds();
    }, 1000);

    return () => clearInterval(interval);

  }, []);


  const sendCommand = async (command: string) => {
    const commandParts = command.split(COMMAND_SEPERATOR);

    for (const cmd of commandParts) {

      if (!cmd.startsWith("d")) {
        try {
          await device.writeCharacteristicWithResponseForService(winkduinoServiceUUID, customCommandCharacteristicUUID, base64.encode(cmd));
        } catch (err) {
          console.log(err);
        }

        if (cmd === "3" || cmd === "6" || cmd === "9") await delay(HEADLIGHT_MOVEMENT_DELAY * 2);
        else if (cmd === "10" || cmd === "11") await delay(HEADLIGHT_MOVEMENT_DELAY * 4);
        else await delay(HEADLIGHT_MOVEMENT_DELAY);
      } else {
        const delayTime = parseInt(cmd.split("d")[1])
        await delay(delayTime);
      }
    }
  }


  return (
    <Modal
      transparent={false}
      animationType="slide"
      visible={visible}
    >
      <View style={{ flex: 1, justifyContent: "center", display: "flex", flexDirection: "column", alignItems: "center", alignContent: "center" }}>



        <Text style={{ fontSize: 30, fontWeight: "bold" }}>Presets Pallete</Text>

        <View style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", marginVertical: 30 }}>
          {
            commandList.length < 1 ?
              <Text style={{ color: "red", fontSize: 25, fontWeight: "bold" }}>No presets saved; try making one!</Text>
              : commandList.map((cmd) => (
                <TouchableOpacity style={isBusy ? styles.ctaButtonDisabled : styles.ctaButton} disabled={isBusy} onPress={() => sendCommand(cmd.command)}>
                  <Text style={isBusy ? styles.ctaButtonTextDisabled : styles.ctaButtonText}>
                    {cmd.name.slice("preset:".length, cmd.name.length)}
                  </Text>
                </TouchableOpacity>
              ))
          }
        </View>


      </View>

      <TouchableOpacity style={styles.ctaButton} onPress={() => close()}>
        <Text style={styles.ctaButtonText}>
          Go Home
        </Text>
      </TouchableOpacity>
    </Modal>
  )

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

export default PresetsModal;