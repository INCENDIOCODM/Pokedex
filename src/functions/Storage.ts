import AsyncStorage from "@react-native-async-storage/async-storage";

async function storePokemons(key: string, value: any) {
	try {
		await AsyncStorage.setItem(key, JSON.stringify(value));
	} catch (error) {
		console.log(error);
	}
}

async function getPokemons(key :string){
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    const data =  JSON.parse(jsonValue || "{}")
    return data;
    
  } catch (error) {
    console.log(error);
  }
}

export const storeData = async (key: string, value: string) => {
	try {
		await AsyncStorage.setItem(key, value);
	} catch (e) {
		console.error("Error storing data", e);
	}
};

export const getData = async (key: string) => {
	try {
		const value = await AsyncStorage.getItem(key);
		return value;
	} catch (e) {
		console.error("Error retrieving data", e);
		return null;
	}
};
