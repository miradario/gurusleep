import moment from 'moment';
import * as Permissions from 'expo-permissions';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import translate from '../utils/language';
import React, { DeviceEventEmitter } from 'react-native';
//import Notification from 'react-native-android-local-notification';

const notificationMsg = [
  {
    title: translate('Notification.title1'),
    body: translate('Notification.body1'),
  },
  {
    title: translate('Notification.title2'),
    body: translate('Notification.body2'),
  },
  {
    title: translate('Notification.title3'),
    body: translate('Notification.body3'),
  },
  {
    title: translate('Notification.title4'),
    body: translate('Notification.body4'),
  },
  {
    title: translate('Notification.title5'),
    body: translate('Notification.body5'),
  },
  {
    title: translate('Notification.title6'),
    body: translate('Notification.body6'),
  },
  {
    title: translate('Notification.title7'),
    body: translate('Notification.body7'),
  },
];

export const today = () => {
  return moment(new Date());
};

export const today_plus = (cant) => {
  let tomorrow = new Date();
  return moment(tomorrow).add(cant, 'day').format('YYYY-MM-DD');
};

export const completed_days = (x) => {
  let cant = 0;
  for (i = 1; i <= 21; i++) {
    cant = cant + parseInt(x['day' + i]);
  }

  return cant;
};

export const current_day = (daystarted) => {
  const today = moment(new Date());
  const startday = moment(daystarted, 'YYYY-MM-DD');
  let curr = today.diff(startday, 'days') + 1;
  if (startday > today) {
    return -1;
  }
  if (curr >= 21) {
    return 21;
  } else {
    return curr;
  }
};

export const notStarted = (daystart) => {
  const today = moment(new Date());
  const startday = moment(daystart, 'YYYY-MM-DD');
  if (startday > today) {
    return true;
  } else {
    return false;
  }
};

export const finished = (currentday) => {
  if (currentday >= 21) {
    return true;
  } else {
    return false;
  }
};

export const abandoned = (finished, daychecked, completed, current_day) => {
  let todaynotabadon = 0;
  if (daychecked == 0 && finished == 0) {
    todaynotabadon = 1;
  }

  let abandon = current_day - completed - todaynotabadon;
  return abandon;
};

const addOneDay = (date) => {
  date.setDate(date.getDate() + 1);
  let time = date.getTime();
  return time;
};

const getNotificationTime = (h, m, s) => {
  let notificationTime = 0;
  let dateNotification = new Date(Date.now());
  dateNotification.setHours(h);
  dateNotification.setMinutes(m);
  dateNotification.setMilliseconds(s);

  if (dateNotification.getTime() < Date.now()) {
    notificationTime = addOneDay(dateNotification);
  } else {
    notificationTime = dateNotification.getTime();
  }
  return notificationTime;
};

export const resetNotifications = async (prefix) => {
  for (let index = 1; index < 8; index++) {
    identifier = prefix + '_' + index;
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }
};

export const registerForLocalNotifications = async (notificationList, days, hours, minutes, prefix) => {
  if (Constants.isDevice) {
    let settings = false;
    settings = await Notifications.getPermissionsAsync();

    if (!settings.granted) {
      settings = await Notifications.requestPermissionsAsync();
    }

    if (settings.status === 1 || settings.status === 'granted') {
    } else {
      alert('Notifications could not be enabled');
      return;
    }
    await resetNotifications(prefix);
    for (let index = 0; index < notificationList.length; index++) {
      let identifierNum = index + 1;
      if (days[index] === 1) {
        const tlexNotification = {
          title: notificationList[index].title,
          body: notificationList[index].body,
          // categoryId: "challengeNotification",
        };
        Notifications.scheduleNotificationAsync({
          identifier: prefix + '_' + identifierNum,
          content: tlexNotification,
          trigger: {
            repeats: true,
            hour: hours,
            minute: minutes,
            weekday: index + 1,
          },
        });
      }
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }
};
