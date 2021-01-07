import * as localVariables from './localVariables.js';
import * as Matomo from "react-native-matomo";

export const matomoTrack = async (type, name) => {
    let optOut = await localVariables.getOptOut();
    if (optOut !== 'enabled'){
        switch (type) {
            case 'screen':
                Matomo.trackScreen("/" + name, name);
                break;
            case 'content':
                Matomo.trackEvent("content", "Play", name);
                break;
            case 'challenge':
                Matomo.trackEvent("challenge", name);
                break;
            case 'purchase':
                Matomo.trackEvent("purchase", name);
                break;                
            default:
                break;
        }
    };
};
