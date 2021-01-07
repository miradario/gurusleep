import * as Localization from "expo-localization";
import i18n from "i18n-js";
import AsyncStorage from "@react-native-community/async-storage";

i18n.fallbacks = true;
i18n.translations = {
    ge: require("../assets/translations/DE-de.json"),
    en: require("../assets/translations/UK-en.json"),
};
const read_localStorage = async () => {
    try {
        const value = await AsyncStorage.getItem("language");
        if (value !== null) {
            i18n.locale = value;
        } else {
            i18n.locale = "en";
        }
    } catch (error) {
        // Error retrieving data
    }
};

read_localStorage();
i18n.changelocale = false;

export default i18n.translate.bind(i18n);
