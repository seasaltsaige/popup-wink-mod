import { useState } from "react";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { Device } from "react-native-ble-plx"


interface DefaultModalProps {
  device: Device | null;
  visible: boolean;
  close: () => void;

  isBusy: boolean;
  needsReset: boolean;
  leftStatus: number;
  rightStatus: number;

  sendData: (data: number) => Promise<void>;
  // deviceUUID?: string;
}

const DefaultModal = (props: DefaultModalProps) => {
  const { device, visible, isBusy, needsReset, leftStatus, rightStatus, sendData, close } = props;

  const [text, setText] = useState("");

  return (
    <Modal
      transparent={false}
      visible={visible}
      animationType="slide"
    >
      <View style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

        <Text style={device === null ? { fontSize: 25, fontWeight: "bold", textAlign: "center", marginBottom: 30, color: "red" } : { fontSize: 25, fontWeight: "bold", textAlign: "center", marginBottom: 30 }}>
          {device === null ? "No device connected, try moving closer..." : `Connected to ${device!.name}`}
        </Text>


        <View style={{ display: "flex", flexDirection: "row", marginBottom: 20 }}>
          {/* View that will contain headlight status */}
          <View style={{ display: "flex", flexDirection: "column", marginRight: 10 }}>
            <Text style={{ fontSize: 20, textAlign: "center" }}>Left Headlight Status</Text>
            <Text style={{ textAlign: "center", fontSize: 25, fontWeight: "bold" }}>{leftStatus}</Text>
          </View>
          <View style={{ display: "flex", flexDirection: "column", marginLeft: 10 }}>
            <Text style={{ fontSize: 20, textAlign: "center" }}>Right Headlight Status</Text>
            <Text style={{ textAlign: "center", fontSize: 25, fontWeight: "bold" }}>{rightStatus}</Text>
          </View>
        </View>

        {
          <Text style={{ fontSize: 20, fontWeight: "bold", color: isBusy ? "red" : "black", textAlign: "center", marginBottom: 5 }}>
            {isBusy ? "Headlights Moving..." : "Ready for command"}
          </Text>
        }

        {
          <View style={styles.flexRow}>
            {[
              [
                { title: "Left Up", i: 4 },
                { title: "Left Down", i: 5 },
                { title: "Left Wink", i: 6 }
              ],
              [
                { title: "Both Up", i: 1 },
                { title: "Both Down", i: 2 },
                { title: "Both Blink", i: 3 }
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
                          <TouchableOpacity
                            style={(device === null || isBusy || needsReset) ? styles.ctaButtonDisabled : styles.ctaButton}
                            key={command.i}
                            disabled={device === null || isBusy || needsReset}
                            onPress={() => sendData(command.i)}
                          >
                            <Text
                              style={(device === null || isBusy || needsReset) ? styles.ctaButtonTextDisabled : styles.ctaButtonText}
                            >
                              {command.title}
                            </Text>
                          </TouchableOpacity>
                        ))
                      }
                    </View>
                  )
                )
              )}


          </View>
        }

        <View style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 5 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 5, marginTop: 10 }}>
            Wave
          </Text>

          <View style={{ display: "flex", flexDirection: "row", alignContent: "center" }}>

            <TouchableOpacity style={(device === null || needsReset || isBusy || leftStatus != 1 || rightStatus != 1) ? { ...styles.ctaButtonDisabled, marginRight: 10 } : { ...styles.ctaButton, marginRight: 10 }} disabled={leftStatus != 1 || rightStatus != 1} onPress={() => sendData(10)}>
              <Text style={(device === null || needsReset || isBusy || leftStatus != 1 || rightStatus != 1) ? styles.ctaButtonTextDisabled : styles.ctaButtonText}>
                Left Wave
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={(device === null || needsReset || isBusy || leftStatus != 1 || rightStatus != 1) ? { ...styles.ctaButtonDisabled, marginLeft: 10 } : { ...styles.ctaButton, marginLeft: 10 }} disabled={leftStatus != 1 || rightStatus != 1} onPress={() => sendData(11)}>
              <Text style={(device === null || needsReset || isBusy || leftStatus != 1 || rightStatus != 1) ? styles.ctaButtonTextDisabled : styles.ctaButtonText}>
                Right Wave
              </Text>
            </TouchableOpacity>

          </View>
        </View>

        <TouchableOpacity style={(!needsReset || isBusy || device === null) ? styles.resetButtonDisabled : styles.resetButton} onPress={() => sendData(12)} disabled={!needsReset}>
          <Text style={(!needsReset || isBusy || device === null) ? styles.ctaButtonTextDisabled : styles.ctaButtonText}>Sync Headlights</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 20, textAlign: "center", fontWeight: "bold" }}>Sleepy Eye</Text>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Enter a value from 1-100"
          style={{ width: 300, textAlign: "center", borderColor: "black", borderWidth: 1, padding: 0, marginVertical: 10 }}
        />
        <TouchableOpacity style={(device === null || needsReset || isBusy) ? styles.ctaButtonDisabled : styles.ctaButton} disabled={device === null || needsReset || isBusy} onPress={() => isNaN(parseInt(text)) ? "" : sendData(parseInt(text) + 13)}>
          <Text style={(device === null || needsReset || isBusy) ? styles.ctaButtonTextDisabled : styles.ctaButtonText}>
            Send Percentage
          </Text>
        </TouchableOpacity>



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



export default DefaultModal;