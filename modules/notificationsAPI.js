import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import { getWeeklyInspirationsStatus } from './firebaseAPI';
import translate from '../utils/language';

export const registerWeeklyInspirationNotif = async (navigation) => {
  if (Constants.isDevice) {
    await Notifications.cancelScheduledNotificationAsync('weekly_inspiration');
    let settings = false;
    settings = await Notifications.getPermissionsAsync();

    if (!settings.granted) {
      settings = await Notifications.requestPermissionsAsync();
    }

    if (settings.status === 1 || settings.status === 'granted') {
    } else {
      //alert('Notifications could not be enabled');
      return;
    }

    const enabled = await getWeeklyInspirationsStatus();
    if (enabled) {
      const weeklyInspirationNotification = {
        title: translate('Weeklyphrases.notificationtitle'),
        body: translate('Weeklyphrases.notificationbody'),
        // categoryId: "challengeNotification",
      };
      console.log(weeklyInspirationNotification);
      Notifications.scheduleNotificationAsync({
        identifier: 'weekly_inspiration',
        content: weeklyInspirationNotification,
        trigger: {
          repeats: true,
          hour: 10,
          minute: 0,
          weekday: 2,
        },
      });
    }

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      if (response.notification.request.identifier === 'weekly_inspiration') {
        navigation.navigate('Phrase');
      }
    });
  } else {
    console.log('Must use physical device for Push Notifications');
  }
};
