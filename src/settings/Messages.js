import translate from "../../utils/language";
import getNotificationCustom  from "../../modules/firebaseAPI.js";

mindfulMsgs = [] 
challengesMsgs = [] 
sleepMsgs = []   

/* loadMessages = async (type) => {
        const Notimindful = await getNotificationCustom(type);
        const notificationMsgs = {
        Mindful: Notimindful,
        Challenge: challengesMsgs,
        Sleep: sleepMsgs
        }
        return notificationMsgs;
        
    }
 */


export const notificationMsgs = {
    Mindful: mindfulMsgs,
    Challenge: challengesMsgs,
    Sleep: sleepMsgs
};