import AsyncStorage from "@react-native-async-storage/async-storage";


export async function saveCommand(commandName: string, command: string) {
  if (await fetchCommand("preset:" + commandName) !== null)
    return "Command already exists";

  try {
    await AsyncStorage.setItem("preset:" + commandName, command);
    return "Success";
  } catch (e) {
    return `${e}`;
  }
}

async function fetchCommand(commandName: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(commandName);

  } catch (err) {
    console.log(err);
    return `${err}`;
  }
}

export type Command = {
  name: string;
  command: string;
}
export async function fetchAllCommands(): Promise<Array<Command>> {
  const allCommands: Command[] = [];
  const allKeys = await AsyncStorage.getAllKeys();
  for (const key of allKeys) {
    if (key.startsWith("preset:")) {
      const cmd = await fetchCommand(key);
      if (cmd !== null) {
        allCommands.push({ name: key, command: cmd });
      }

    }
  }

  return allCommands;
}


export async function deleteCommand(commandName: string) {
  try {
    await AsyncStorage.removeItem(commandName);
  } catch (err) {
    return err;
  }
}