import AsyncStorage from '@react-native-community/async-storage';

export const getOptOut = async () => {
    let optOutStatus = 'disabled';
    try {
        const value = await AsyncStorage.getItem("@optout");
        if (value !== null) {
            optOutStatus = value;
            // value previously stored
        }
    } catch (e) {
        // error reading value
    }
    return optOutStatus;
};

export const setOptOut = async (value) => {
    let optOutStatus = false;
    try {
        await AsyncStorage.setItem('@optout', value)
    } catch (e) {
        // error reading value
    }
};
