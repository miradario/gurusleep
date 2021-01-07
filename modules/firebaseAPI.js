import moment from 'moment';
import * as firebase from 'firebase';
import * as challengesAPI from '../modules/challengesAPI.js';
import AsyncStorage from '@react-native-community/async-storage';

//import react in our code.
import { Alert } from 'react-native';
import i18n from 'i18n-js';

// export const firebaseDatabase = firebase.database()

const storeJsonLocally = async (key, json) => {
  try {
    const jsonValue = JSON.stringify(json);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.log(e);
  }
};

export const createUser = (name, workshopcode, language, email, password, optOutValue) => {
  firebase
    .auth()
    .createUserWithEmailAndPassword(email.trim(), password)
    .then((res) => {
      firebase
        .database()
        .ref('Users/' + res.user.uid)
        .set({
          email: email,
          name: name,
          workshopcode: workshopcode,
          language: language,
          creationdate: new Date().getTime(),
          purchases: '',
          optout: optOutValue,
        })
        .catch((error) => Alert.alert('Database Error', 'create user : ' + error));
    })
    .catch((error) => Alert.alert('Login Error', 'Create user error: ' + error));
};

export const getUser = async () => {
  const database = firebase.database();
  const userId = firebase.auth().currentUser.uid;
  const source = database.ref('/Users/' + userId);

  const result = await source.once('value');
  return result.val();
};

export const setPassword = (actualpassword, newpassword) => {
  var user = firebase.auth().currentUser;

  const credential = firebase.auth.EmailAuthProvider.credential(user.email, actualpassword);

  // Now you can use that to reauthenticate
  return user
    .reauthenticateWithCredential(credential)
    .then(function () {
      return user
        .updatePassword(newpassword)
        .then(function () {
          Alert.alert('Your password has been changed.');
          return true;
        })
        .catch(function (error) {
          Alert.alert('Password could not change it.' + error);
          return false;
        });
    })
    .catch(function (error) {
      Alert.alert('Actual password is incorrect' + error);
      return false;
    });
};

export const setEmail = (actualpassword, newemail) => {
  var user = firebase.auth().currentUser;
  const credential = firebase.auth.EmailAuthProvider.credential(user.email, actualpassword);

  // Now you can use that to reauthenticate
  return user
    .reauthenticateWithCredential(credential)
    .then(function () {
      return user
        .updateEmail(newemail)
        .then(function () {
          Alert.alert('Your email has been changed.');
          return true;
        })
        .catch(function (error) {
          Alert.alert('Email could not change it.' + error);
          return false;
        });
    })
    .catch(function (error) {
      Alert.alert('Actual password is incorrect' + error);
      return false;
    });
};

export const getUserChallenges = async () => {
  const database = firebase.database();
  const userId = firebase.auth().currentUser.uid;
  const source = database.ref('/Users/' + userId + '/Challenge');
  const result = await source.once('value');
  let challenges = [];
  result.forEach((data) => {
    let challenge = data.val();
    let currentday = challengesAPI.current_day(challenge.daystart);
    let finished = challengesAPI.finished(currentday);
    if (challenge.active == 'current' && !finished) {
      challenge.key = data.key;
      challenges.push(challenge);
    }
  });
  return challenges;
};

export const getSutras = async () => {
  const database = firebase.database();
  const source = database.ref('/sutras');
  const result = await source.once('value');
  const sutras = [];
  result.forEach((data) => {
    let sutra = data.val();
    sutra.key = data.key;
    sutras.push(sutra);
  });
  return sutras;
};

export const getNotificationStatus = async () => {
  const database = firebase.database();
  const userId = firebase.auth().currentUser.uid;
  let notificationsEnabled = false;
  userData = await database.ref('/Users/' + userId).once('value');
  if (userData.hasChild('notifications')) {
    if (userData.notifications == 1) {
      notificationsEnabled = true;
    }
  }
  return notificationsEnabled;
};

export const getWeeklyInspirationsStatus = async () => {
  const database = firebase.database();
  const userId = firebase.auth().currentUser.uid;
  let weeklyInspirationsEnabled = true;
  userData = await database.ref('/Users/' + userId).once('value');
  if (userData.hasChild('weeklyInspirationsEnabled')) {
    if (!userData.val().weeklyInspirationsEnabled) {
      weeklyInspirationsEnabled = false;
    }
  }
  return weeklyInspirationsEnabled;
};

export const saveWeeklyNotificationStatus = async (value) => {
  const database = firebase.database();
  const userId = firebase.auth().currentUser.uid;
  database.ref('/Users/' + userId).update({ weeklyInspirationsEnabled: value });
};

export const getLastReceipt = async () => {
  const database = firebase.database();
  const userId = firebase.auth().currentUser.uid;
  userData = await database.ref('/Users/' + userId).once('value');
  if (userData.hasChild('lastReceipt')) {
    return userData.val().lastReceipt;
  } else {
    return false;
  }
};

export const setNotificationCustom = async (type, days, time, allow) => {
  const database = firebase.database();
  const userId = firebase.auth().currentUser.uid;

  const update = {
    days: days,
    time: time,
    allow: allow,
  };

  database.ref('/Users/' + userId + '/notifications/' + type).update(update);
};

export const setUserLastEnter = async () => {
  const database = firebase.database();
  const userId = firebase.auth().currentUser.uid;
  //const today = moment(new Date());
  const today = moment(new Date(), 'YYYY-MM-DD');
  const date = today.format('YYYY-MM-DD');
  const updates = {
    lastenterdate: date,
  };
  console.log('Grabó!');
  database.ref('/Users/' + userId + '/weekly/').update(updates);
};

export const getUserLastEnter = async () => {
  const database = firebase.database();
  const userId = firebase.auth().currentUser.uid;
  const userData = await database.ref('/Users/' + userId + '/weekly').once('value');
  console.log;
  if (userData.hasChild('lastenterdate')) {
    return userData.val().lastenterdate;
  } else {
    return false;
  }
};

export const getNotificationCustom = async (type) => {
  const database = firebase.database();
  const userId = firebase.auth().currentUser.uid;
  let result = -1;
  const notif = await database.ref('/Users/' + userId).once('value');
  if (notif.hasChild('notifications')) {
    const existtpye = await database.ref('/Users/' + userId + '/notifications').once('value');
    if (existtpye.hasChild(type)) {
      const source = database.ref('/Users/' + userId + '/notifications/' + type);
      const res = await source.once('value');
      result = res.val();
    }
  }
  return result;
};

export const getNotificationContent = async (type) => {
  const database = firebase.database();
  const lang = i18n.locale.toUpperCase();
  const source = database.ref('/Notification/' + lang + '/' + type);
  const result = await source.once('value');

  const notifications = [];
  const dataobj = result.val();
  for (let i = 1; i <= 7; i++) {
    let resource = {};

    resource.title = dataobj['title' + i];
    resource.body = dataobj['body' + i];
    notifications.push(resource);
  }

  return notifications;
};

export const getOptOutStatus = async () => {
  const database = firebase.database();
  const userId = firebase.auth().currentUser.uid;
  let optOutEnabled = false;
  userData = await database.ref('/Users/' + userId).once('value');
  if (userData.hasChild('optout')) {
    if (userData.optout) {
      optOutEnabled = true;
    }
  }
  return optOutEnabled;
};

export const saveOptoutValue = async (optOutValue) => {
  const database = firebase.database();
  const userId = firebase.auth().currentUser.uid;
  database.ref('/Users/' + userId).update({ optout: optOutValue });
};

export const saveNotificationValue = async (notificationValue) => {
  const database = firebase.database();
  const userId = firebase.auth().currentUser.uid;
  database.ref('/Users/' + userId).update({ notifications: notificationValue });
};

export const savePremiumValue = async (premium_value) => {
  const database = firebase.database();
  const userId = firebase.auth().currentUser.uid;
  database.ref('/Users/' + userId).update({ premium: premium_value });
};

export const saveLifeTimePremiumValue = async (lifetimeValue) => {
  const database = firebase.database();
  const userId = firebase.auth().currentUser.uid;
  database.ref('/Users/' + userId).update({ lifetime: lifetimeValue });
};

export const savePurchaseData = async (orderID, purchaseTime, productID, receipt) => {
  const database = firebase.database();
  const userId = firebase.auth().currentUser.uid;
  let newPurchase = await database.ref('/Users/' + userId + '/purchases').push();
  newPurchase.update({
    orderid: orderID,
    purchasetime: purchaseTime,
    productid: productID,
  });
  await database.ref('/Users/' + userId).update({ lastReceipt: receipt });
};

export const saveDownloadData = async (downloadKey, downloadData) => {
  const database = firebase.database();
  const userId = firebase.auth().currentUser.uid;
  let newDownload = database.ref('/Users/' + userId + '/Downloads').child(downloadKey);
  newDownload.update({
    ...downloadData,
  });
};

export const saveReceiptData = async (receipt) => {
  console.log('saving receipt');
  const database = firebase.database();
  const userId = firebase.auth().currentUser.uid;
  database.ref('/Users/' + userId).update({ receipt: receipt });
};

export const getWorkshop = async (workshopcode) => {
  const database = firebase.database();
  const source = database.ref('/Workshop/' + workshopcode);
  const result = await source.once('value');
  return result.val();
};

export const getTeachers = async () => {
  const database = firebase.database();
  const lang = i18n.locale.toUpperCase();
  const source = database.ref('/Trainers/' + lang);
  const result = await source.once('value');
  const teachers = [];
  result.forEach((data) => {
    let teacher = data.val();
    teacher.key = data.key;
    teachers.push(teacher);
  });
  return teachers;
};

export const getCurrentWeeklyNotification = async () => {
  const database = firebase.database();
  const lang = i18n.locale.toUpperCase();
  const source = database.ref('/WeeklyPhrases/' + lang);
  const result = await source.once('value');
  let currentNotification = {};
  result.forEach((data) => {
    if (data.key == '19000101') {
      let defaultNotification = data.val();
      defaultNotification.id = data.key;
      currentNotification = defaultNotification;
    }
  });
  result.forEach((data) => {
    let notification = data.val();
    const { startdate, enddate } = notification;
    if (checkIsCurrent(startdate, enddate)) {
      notification.id = data.key;
      currentNotification = notification;
    }
  });
  return currentNotification;
};

export const checkShowWeeklyNotice = async () => {
  const lastDate = await getUserLastEnter();
  let showNotice = false;
  if (!lastDate) {
    showNotice = true;
  }
  const currentNotification = await getCurrentWeeklyNotification();
  if (currentNotification.id == '19000101') {
    return false;
  }
  const lastShowDate = moment(lastDate);
  const startDate = moment(currentNotification.startdate);
  if (lastShowDate < startDate) {
    showNotice = true;
  }
  console.log('Show:', showNotice);
  return showNotice;
};

export const getPreviousNotification = async () => {
  const database = firebase.database();
  const lang = i18n.locale.toUpperCase();
  const source = database.ref('/WeeklyPhrases/' + lang);
  const result = await source.once('value');
  let currentNotificationKey = 0;
  let notifications = [];
  result.forEach((data) => {
    let notification = data.val();
    notification.id = data.key;
    notifications.push(notification);
    const { startdate, enddate } = notification;
    if (checkIsCurrent(startdate, enddate)) {
      currentNotificationKey = notification.id;
    }
  });
  notifications.sort((a, b) => {
    if (a.id > b.id) {
      return 1;
    }
    if (a.id < b.id) {
      return -1;
    }
    return 0;
  });
  let currentNotificationIndex = notifications.findIndex((element) => element.id === currentNotificationKey);
  if (!currentNotificationKey) {
    currentNotificationIndex = notifications.length;
  }
  const prevNotification =
    currentNotificationIndex > 0
      ? notifications[currentNotificationIndex - 1]
      : notifications[currentNotificationIndex];
  return prevNotification;
};

const checkIsCurrent = (start, end) => {
  const today = moment(new Date());
  let currentNotification = false;
  if (moment(start) <= today) {
    if (moment(end) >= today) {
      currentNotification = true;
    }
  }
  return currentNotification;
};

export const validateworkshop = async (workcode) => {
  const database = firebase.database();
  const source = database.ref('/Workshop');
  const result = await source.once('value');

  const INACTIVE = 2;
  const WORKSHOP_OK = 1;
  const WORKSHOP_INVALID = 0;

  let foundit = WORKSHOP_INVALID;
  result.forEach((data) => {
    if (data.key == workcode) {
      let notification = data.val();
      const { start_date, end_date } = notification;
      if (!checkIsCurrent(start_date, end_date)) {
        foundit = INACTIVE;
      } else {
        foundit = WORKSHOP_OK;
      }
      if (!end_date) {
        foundit = WORKSHOP_OK;
      }
    }
  });
  console.log(foundit);
  return foundit;
};

export const restWorkshopCountUsers = async (workcode) => {
  const database = firebase.database();
  const source = database.ref('/Workshop');
  const result = await source.once('value');
  result.forEach((data) => {
    if (data.key == workcode) {
      let users = data.val();
      const { actualusers } = users;
      let newactualusers = actualusers - 1;
      updateWorkshopUser(workcode, newactualusers);
      return true;
    }
  });
};

export const validateWorkshopCountUsers = async (workcode) => {
  const database = firebase.database();
  const source = database.ref('/Workshop');
  const result = await source.once('value');

  const INVALID = 2;
  const OK = 1;
  const EXCEDED = 0;

  console.log('users en firebase API');

  let foundit = OK;
  result.forEach((data) => {
    if (data.key == workcode) {
      let users = data.val();
      console.log(users);
      const { actualusers, limit } = users;
      console.log('users');
      console.log(actualusers);
      console.log(limit);
      if (actualusers >= limit) {
        foundit = EXCEDED;
        console.log('exceded');
      } else {
        foundit = OK;
        let newactualusers = actualusers + 1;
        updateWorkshopUser(workcode, newactualusers);
        console.log('OK');
      }
    }
  });
  console.log('foundit');
  console.log(foundit);
  return foundit;
};

export const updateWorkshopUser = (workshopcode, users) => {
  const database = firebase.database();
  const update = {
    actualusers: users,
  };
  database
    .ref('/Workshop/' + workshopcode)
    .update(update)

    .catch(function (error) {
      alert(error.message);
    });
};

export const UpdateUser = (userId, name, email, password, workshopcode, language) => {
  const database = firebase.database();

  const update = {
    name: name,
    email: email,
    workshopcode: workshopcode,
    language: language,
  };
  database
    .ref('/Users/' + userId)
    .update(update)

    .catch(function (error) {
      alert(error.message);
    });
};

export const signInUser = async (email, password) => {
  await firebase
    .auth()
    .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(function () {
      return firebase.auth().signInWithEmailAndPassword(email, password);
    })
    .catch((error) => {
      Alert.alert('Login Error', 'Sign in error: ' + error);
      return false;
    });
};

export const Forgot = async (email) => {
  await firebase
    .auth()
    .sendPasswordResetEmail(email)
    .then(function () {
      Alert.alert('Please check your email, reset your password and login again.');
      return true;
    })
    .catch((error) => {
      Alert.alert('Email not found', 'Forgot password error: ' + error);
    });
};

export const logoutUser = () => {
  firebase.auth().signOut();
};

export const createChallenge = async (title, what, why, how, succesful, problems, startDate, icon, mountain) => {
  this.database = firebase.database();
  const userId = firebase.auth().currentUser.uid;
  const newChallenge = await this.database.ref('Users/' + userId + '/Challenge/').push({
    title: title,
    what: what,
    why: why,
    how: how,
    succesful: succesful,
    problems: problems,
    image: icon,
    daystart: startDate,
    completed: 0,
    abandoned: 0,
    current_day: 0,
    active: 'current',
    mountain: mountain,
    day: 0,
    day1: 0,
    day2: 0,
    day3: 0,
    day4: 0,
    day5: 0,
    day6: 0,
    day7: 0,
    day8: 0,
    day9: 0,
    day10: 0,
    day11: 0,
    day12: 0,
    day13: 0,
    day14: 0,
    day15: 0,
    day16: 0,
    day17: 0,
    day18: 0,
    day19: 0,
    day20: 0,
    day21: 0,
  });
};

export const updateChallenge = async (pkey, title, what, why, how, succesful, problems, icon, mountain) => {
  this.database = firebase.database();
  const userId = firebase.auth().currentUser.uid;
  this.database.ref('Users/' + userId + '/Challenge/' + pkey).update({
    title: title,
    what: what,
    why: why,
    how: how,
    succesful: succesful,
    problems: problems,
    image: icon,
    mountain: mountain,
  });
};

export const deleteChallenge = async (pkey) => {
  this.database = firebase.database();
  const userId = firebase.auth().currentUser.uid;
  //this.database.ref("Users/" + userId + "/Challenge/" + pkey).remove();
  var adaRef = firebase.database().ref('Users/' + userId + '/Challenge/' + pkey);
  adaRef
    .remove()
    .then(function () {
      return true;
    })
    .catch(function (error) {
      console.log('Remove failed: ' + error.message);
    });
};

export const getResources = async () => {
  const database = firebase.database();
  this.database = firebase.database();
  const userId = firebase.auth().currentUser.uid;
  const wcoderesource = database.ref('/Users/' + userId + '/workshopcode');
  const wcode = await wcoderesource.once('value');
  const source = database.ref('/Resources/' + wcode.val());
  return source.once('value');
};

export const getChallenge = async (challengeID) => {
  const database = firebase.database();
  const userId = firebase.auth().currentUser.uid;
  const source = database.ref('/Users/' + userId + '/Challenge/' + challengeID);
  const result = await source.once('value');
  return result.val();
};

export const getPhrases = async () => {
  const database = firebase.database();
  const lang = i18n.locale.toUpperCase();
  const source = database.ref('/phrases/' + lang);
  const result = await source.once('value');
  return result.val();
};

export const getMeditation = async (category, meditationID) => {
  const database = firebase.database();
  const lang = i18n.locale.toUpperCase();
  console.log('getmeditation');
  console.log(meditationID);

  const source = database.ref('/Assets/' + lang + '/' + category + '/' + meditationID);
  const result = await source.once('value');
  return result.val();
};

export const getContent = async (category, filtersky) => {
  const database = firebase.database();
  const lang = i18n.locale.toUpperCase();
  const source = database.ref('/Assets/' + lang + '/' + category);
  const result = await source.once('value');
  const resources = [];
  result.forEach((data) => {
    let resource = data.val();

    const { Sky } = resource;
    console.log('filter' + filtersky);
    console.log('Sky' + Sky);
    if (filtersky && Sky) {
      null;
    } else {
      resource.id = data.key;
      resources.push(resource);
    }
  });
  return resources;
};

export const getFavourites = async () => {
  const database = firebase.database();
  const userId = firebase.auth().currentUser.uid;
  const source = database.ref('/Users/' + userId + '/Fav');
  const result = await source.once('value');
  const favs = [];
  result.forEach((data) => {
    let fav = data.val();
    fav.id = data.key;
    favs.push(fav);
  });
  return favs;
};

export const getFavsContent = async () => {
  const database = firebase.database();
  let favs = await getFavouritesID();
  const source = database.ref('/Assets/' + i18n.locale.toUpperCase());
  const result = await source.once('value');
  const favsContent = [];
  result.forEach((data) => {
    if (data.key != 'List') {
      data.forEach((item) => {
        if (favs.includes(item.key)) {
          let favItem = item.val();
          favItem.id = item.key;
          favsContent.push(favItem);
        }
      });
    }
  });
  return favsContent;
};

export const getDownloadsContent = async () => {
  const database = firebase.database();
  let downloads = await getDownloadsID();
  const source = database.ref('/Assets/' + i18n.locale.toUpperCase());
  const result = await source.once('value');
  const downloadsContent = [];
  result.forEach((data) => {
    if (data.key != 'List') {
      data.forEach((item) => {
        if (downloads.includes(item.key)) {
          let downloadItem = item.val();
          downloadItem.id = item.key;
          downloadsContent.push(downloadItem);
        }
      });
    }
  });
  await storeJsonLocally('downloadsContent', downloadsContent);
  return downloadsContent;
};

export const getRecommendedContent = async (category) => {
  const database = firebase.database();
  const lang = i18n.locale.toUpperCase();
  const source = database.ref('/RecommendAssets/' + lang + '/' + category);
  const result = await source.once('value');
  const resources = [];
  result.forEach((data) => {
    let resource = data.val();
    resource.id = data.key;
    resources.push(resource);
  });
  return resources;
};

export const getFavouritesID = async () => {
  const database = firebase.database();
  const userId = firebase.auth().currentUser.uid;
  const source = database.ref('/Users/' + userId + '/Fav');
  const result = await source.once('value');
  const favs = [];
  result.forEach((data) => {
    favs.push(data.key);
  });
  return favs;
};

export const getDownloadsID = async () => {
  const database = firebase.database();
  const userId = firebase.auth().currentUser.uid;
  const source = database.ref('/Users/' + userId + '/Downloads');
  const result = await source.once('value');
  const downloads = [];
  result.forEach((data) => {
    downloads.push(data.key);
  });
  return downloads;
};

export const checkDownload = async (elemID) => {
  const database = firebase.database();
  const userId = firebase.auth().currentUser.uid;
  const source = database.ref('/Users/' + userId + '/Downloads/' + elemID);
  const result = await source.once('value');
  return result.exists();
};

export const checkFav = async (elemID) => {
  const database = firebase.database();
  const userId = firebase.auth().currentUser.uid;
  const source = database.ref('/Users/' + userId + '/Fav/' + elemID);
  const result = await source.once('value');
  return result.exists();
};

export const getChallenges = async () => {
  const database = firebase.database();
  const userId = firebase.auth().currentUser.uid;
  const source = database.ref('Users/' + userId + '/Challenge');
  const result = await source.once('value');
  const challenges = [];
  result.forEach((data) => {
    let challenges = data.val();
    challenges.id = data.key;
    challenges.push(challenges);
  });
  return challenges;
};

export const checkDay = async (challengeKey, dayChecked) => {
  const database = firebase.database();
  const userId = firebase.auth().currentUser.uid;
  const source = database.ref('Users/' + userId + '/Challenge/' + challengeKey);
  const dayUpdate = {};
  dayUpdate['day' + dayChecked] = '1';
  const updateStatus = await source.update(dayUpdate);
};

export const unCheckDay = async (challengeKey, dayChecked) => {
  const database = firebase.database();
  const userId = firebase.auth().currentUser.uid;
  const source = database.ref('Users/' + userId + '/Challenge/' + challengeKey);
  const dayUpdate = {};
  dayUpdate['day' + dayChecked] = '0';
  const updateStatus = await source.update(dayUpdate);
};

export const addFav = async (key, type, category) => {
  const database = firebase.database();
  const userId = firebase.auth().currentUser.uid;
  const source = database.ref('/Users/' + userId + '/Fav');
  const newFav = await source.child(key).set({
    cat: category,
    type: type,
  });
  return newFav;
};

export const removeFav = async (key) => {
  const database = firebase.database();
  const userId = firebase.auth().currentUser.uid;
  const source = database.ref('/Users/' + userId + '/Fav/' + key);
  const remove = await source.remove();
  return remove;
};

export const removeDownload = async (key) => {
  const database = firebase.database();
  const userId = firebase.auth().currentUser.uid;
  const source = database.ref('/Users/' + userId + '/Downloads/' + key);
  const remove = await source.remove();
  return remove;
};
