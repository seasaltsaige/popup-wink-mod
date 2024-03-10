import React, { useEffect, useState } from "react";
import { Button, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { saveCommand, deleteCommand, fetchAllCommands, Command } from "../AsyncStorage/Store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COMMAND_SEPERATOR } from "../Constants";

interface CreatePresetModalProps {
  visible: boolean;
  close: () => void;
}

// NOTE: Might not even be viable with BLE
// TODO: Implement presets
// My thinking currently is to have it saved in Async storage, as a string of commands, seperated by some seperator, maybe a "-"

// There could be different commands like
// 5 -> left down -> sendData(5)
// 4 -> left up -> sendData(4)
// 8 -> right down -> sendData(8)
// 7 -> right up -> sendData(7)
// 2 -> both down sendData(2)
// 1 -> both up -> sendData(1)

// d(int) -> delay for int ms (required between commands): ex: d500 waits for 500ms before the next command is sent/run
// Probably will need to update arduino code into separate functions so that they can be called individually
// On arduino side, split

// D(double) -> Not sure, but potentially a command to go down by a certain percentage | This would have delay build in to it, as its calculated Arduino side
// U(double) -> Same as D(double), but up instead



// MAYBE instead of sending the entire command, i can send it part by part.
// Store the entire thing, but then only send one little bit at a time.
// Loop through client side


// d(int) will not be sent as a command (gets parsed out app side), and instead, updates the delay characteristic on the arduino
// Maybe binary?

// I will also likely want to add a delay characteristic to allow that to be updated by the app
// Once the command finishes, I would probably reset it to default

// This would likely send each command one after the next

const CreatePresetModal = (props: CreatePresetModalProps) => {
  const { visible, close } = props;
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Editing Command");
  const [commandName, setCommandName] = useState<string>("");
  const [commandBody, setCommandBody] = useState<{ title: string, i?: number; delay?: number }[]>([]);
  const [commandList, setCommandList] = useState<Command[]>([]);
  const [delay, setDelay] = useState<string>("");

  const parseCommandArray: () => string = () => {
    let command = "";

    for (let i = 0; i < commandBody.length; i++) {
      if (commandBody[i].delay !== undefined) {
        command += `d${commandBody[i].delay}`;
      } else command += commandBody[i].i;
      if (i !== commandBody.length - 1) command += COMMAND_SEPERATOR;
    }

    return command;
  }

  const parseCommandArrayHumanReadable: () => string = () => {
    let command = "";

    for (let i = 0; i < commandBody.length; i++) {
      command += commandBody[i].title;
      if (i !== commandBody.length - 1) command += ", ";
    }

    return command;

  }

  const fetchCmds = async () => {
    // Debug, remove all items to restart
    // await AsyncStorage.clear();
    const cmds = await fetchAllCommands();
    setCommandList(cmds);
  }

  useEffect(() => {
    fetchCmds();
  }, [commandName]);


  const deleteCmd = async (cmdName: string) => {
    try {
      await deleteCommand(cmdName);
      await fetchCmds();
    } catch (err) {

    }
  }

  const updateDelay = (delay: string) => {
    if (isNaN(parseInt(delay))) return;
    else setDelay(delay);
  }

  const save = async () => {
    if (commandName === "") {
      setError("Can't save command with no name.");
      setTimeout(() => setError(""), 2000);
    }

    if (commandBody.length < 1) {
      setError("Can't save command with no values.");
      setTimeout(() => setError(""), 2000);
    }

    try {
      const res = await saveCommand(commandName, parseCommandArray());
      await fetchCmds();
      if (typeof res === "string") {
        if (res === "Success") setStatus(res);
        else setError(res);
        setTimeout(() => setStatus("Editing command"), 2000);
        setTimeout(() => setError(""), 2000);
      }

      setCommandBody([]);
    } catch (err) {
      console.log(err);
    }

  }

  return (
    <Modal
      transparent={false}
      animationType="slide"
      visible={visible}
    >
      <View style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

        <Text
          style={error !== "" ? { fontSize: 20, fontWeight: "bold", color: "red", marginTop: 10 } : { fontSize: 20, fontWeight: "bold", color: "black", marginTop: 10 }}
        >
          Status: {error || status}
        </Text>


        <Text style={{ fontSize: 20, marginTop: 10 }}>
          Current command sequence: {parseCommandArrayHumanReadable()}
        </Text>

        <Text style={{ fontSize: 20, marginTop: 10, fontWeight: "500" }}>
          Preset Name
        </Text>
        <TextInput
          value={commandName}
          onChangeText={setCommandName}
          placeholder="Command name"
          keyboardType="default"
          style={{ width: 300, textAlign: "center", borderColor: "black", borderWidth: 1, padding: 0, marginVertical: 10 }}
        />


        <Text style={{ fontSize: 25, fontWeight: "bold", marginVertical: 10 }}>
          Command Palette
        </Text>
        <View style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", marginHorizontal: 20, alignContent: "center", justifyContent: "center" }}>

          {
            [
              { title: "Both Up", i: 1 },
              { title: "Both Down", i: 2 },
              { title: "Both Blink", i: 3 },
              { title: "Left Up", i: 4 },
              { title: "Left Down", i: 5 },
              { title: "Left Wink", i: 6 },
              { title: "Left Wave", i: 10 },
              { title: "Right Up", i: 7 },
              { title: "Right Down", i: 8 },
              { title: "Right Wink", i: 9 },
              { title: "Right Wave", i: 11 },
            ].map((val) => (
              <View>

                <TouchableOpacity style={styles.ctaButton} onPress={() => setCommandBody((prev) => [...prev, val])}>
                  <Text style={styles.ctaButtonText}>
                    {val.title}
                  </Text>
                </TouchableOpacity>

              </View>
            ))
          }
        </View>

        <Text style={{ marginTop: 20, fontWeight: "bold", fontSize: 25, }}>
          Add a delay
        </Text>
        <View>

          <TextInput
            value={delay}
            onChangeText={(s) => updateDelay(s)}
            placeholder="Enter a delay, given in milliseconds"
            keyboardType="numeric"
            style={{ width: 300, textAlign: "center", borderColor: "black", borderWidth: 1, padding: 0, marginVertical: 10 }}
          />
          <TouchableOpacity style={styles.ctaButton} onPress={() => setCommandBody((prev) => [...prev, { title: "Delay", delay: parseInt(delay) }])}>
            <Text style={styles.ctaButtonText}>
              Add Delay
            </Text>
          </TouchableOpacity>
        </View>


        <View style={{ marginVertical: 10, display: "flex", flexDirection: "row" }}>
          <TouchableOpacity style={{ ...styles.ctaButton, backgroundColor: "#57d979" }} onPress={() => save()}>
            <Text style={styles.ctaButtonText}>
              Save Command
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ ...styles.ctaButton }} onPress={() => setCommandBody((prev) => prev.slice(0, prev.length - 1))}>
            <Text style={styles.ctaButtonText}>
              Remove Last Command
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginBottom: 5 }}>
          {commandList.map((c, i) => (
            <View style={{ backgroundColor: "#f0f0f0", padding: 10, borderRadius: 5 }}>
              <Text style={{ fontSize: 18, fontWeight: "500" }}>
                #{i + 1} - {(c.name.slice("preset:".length, c.name.length))} || {c.command.length > 20 ? `${c.command.slice(0, 20)} ...` : c.command}
              </Text>
              <TouchableOpacity style={{ ...styles.ctaButton, height: 25, width: 100, alignSelf: "center" }} onPress={() => deleteCmd(c.name)}>
                <Text style={{ color: "white" }}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>


      </View>


      <TouchableOpacity style={styles.ctaButton} onPress={() => close()}>
        <Text style={styles.ctaButtonText}>
          Go Home
        </Text>
      </TouchableOpacity>

    </Modal>
  )
}


const styles = StyleSheet.create({
  ctaButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  ctaButton: {
    backgroundColor: "#FF6060",
    justifyContent: "center",
    alignItems: "center",
    height: 40,
    marginHorizontal: 5,
    marginBottom: 4,
    borderRadius: 6,
    paddingHorizontal: 8,
  },
});


export default CreatePresetModal;