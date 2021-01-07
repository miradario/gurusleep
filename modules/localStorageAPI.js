// @flow
import * as FileSystem from "expo-file-system";

const audioRoute = "https://tlexeurope.s3.eu-central-1.amazonaws.com/audios/Audio/";
const videoRoute = "https://tlexeurope.s3.eu-central-1.amazonaws.com/videos/";
const imgRoute = "https://tlexeurope.s3.eu-central-1.amazonaws.com/images/portaits/";

export const storeOfflineAsset = async (key, type) => {
    let download;
    if (type === "audio") {
        download = await FileSystem.downloadAsync(`${audioRoute + key}.mp3`, `${FileSystem.documentDirectory + key}.mp3`);
        console.log(`${audioRoute + key}.mp3`)
        console.log(`${FileSystem.documentDirectory + key}.mp3`)
    } else {
        download = await FileSystem.downloadAsync(`${videoRoute + key}.mp4`, `${FileSystem.documentDirectory + key}.mp4`);
    }
    return download;
};

export const storeOfflineImages = async (key) => {
    await FileSystem.downloadAsync(`${imgRoute + key}_cover.jpg`, `${FileSystem.documentDirectory + key}_cover.jpg`);
    await FileSystem.downloadAsync(`${imgRoute + key}_thumb.png`, `${FileSystem.documentDirectory + key}_thumb.png`);
};

export const getOfflineRoute = (key, type) => {
    if (type === "audio") {
        return { uri: `${FileSystem.documentDirectory + key}.mp3` };
    }
    return { uri: `${FileSystem.documentDirectory + key}.mp4` };
};

export const getImageOfflineRoute = name => ({ uri: `${FileSystem.documentDirectory + name}.jpg` });

export const deleteOfflineAsset = async (key, type) => {
    if (type === "audio") {
        await FileSystem.deleteAsync(`${FileSystem.documentDirectory + key}.mp3`, {idempotent: true});
    } else {
        await FileSystem.deleteAsync(`${FileSystem.documentDirectory + key}.mp4`, {idempotent: true});
    }
    await FileSystem.deleteAsync(`${FileSystem.documentDirectory + key}_cover.jpg`, {idempotent: true});
    await FileSystem.deleteAsync(`${FileSystem.documentDirectory + key}_thumb.png`, {idempotent: true});
};
