import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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

// 0b0000001


// d(int) will not be sent as a command (gets parsed out app side), and instead, updates the delay characteristic on the arduino
// Maybe binary?

// I will also likely want to add a delay characteristic to allow that to be updated by the app
// Once the command finishes, I would probably reset it to default

// This would likely send each command one after the next

const CreatePresetModal = (props: CreatePresetModalProps) => {
  const { visible, close } = props;
  return (
    <Modal
      visible={visible}
    >
      {/*  */}
      <View>




        <TouchableOpacity style={styles.ctaButton} onPress={() => close()}>
          <Text style={styles.ctaButtonText}>
            Go Home
          </Text>
        </TouchableOpacity>
      </View>



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
    height: 50,
    marginHorizontal: 5,
    marginBottom: 10,
    borderRadius: 6,
    paddingHorizontal: 8,
  },
});