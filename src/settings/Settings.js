// @flow
import * as React from 'react';
import {
  View,
  Dimensions,
  Image,
  StyleSheet,
  InteractionManager,
  Picker,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import WindowDimensions from '../components/WindowDimensions';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, Icon, Button, Label } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { BaseContainer, Images, Field, SingleChoice } from '../components';
import type { ScreenProps } from '../components/Types';
import variables from '../../native-base-theme/variables/commonColor';
import firebase from 'firebase';
import * as FirebaseAPI from '../../modules/firebaseAPI.js';
import * as challengesAPI from '../../modules/challengesAPI.js';
import ButtonGD from '../components/ButtonGD';
import COLORS from '../assets/Colors';
import i18n from 'i18n-js';
import translate from '../../utils/language';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import * as Notifications from 'expo-notifications';
import * as Matomo from 'react-native-matomo';
import * as localVariables from '../../utils/localVariables.js';
import * as commonFunctions from '../../utils/common.js';
import RNRestart from 'react-native-restart';
import moment from 'moment';
import AsyncStorage from '@react-native-community/async-storage';
import { registerWeeklyInspirationNotif } from '../../modules/notificationsAPI';
const ger = require('../assets/flags/germany.png');
const eng = require('../assets/flags/england.png');

export default class Settings extends React.PureComponent<ScreenProps<>> {
  constructor(props) {
    super(props);
    this.state = {
      headermenu: [translate('Settings.profile'), translate('Settings.account'), translate('Settings.notifications')],
      selectedMenu: 0,
      loading: true,
      validpass: false,
      passchange: false,
      passchanged: false,
      passch_color: '',
      newemail: '',
      name: '',
      actualpassword: '',
      password: '',
      workshopcode: '',
      actualworkshopcode: '',
      language: 'en',
      validcode: 1,
      langChanged: false,
      sleep: { time: new Date(), days: '', allow: false },
      mindful: { time: new Date(), days: '', allow: false },
      challenge: { time: new Date(), days: '', allow: false },
      allowWeeklyInspirations: true,
    };
    this.database = firebase.database();
    this.state.userId = firebase.auth().currentUser.uid;
    this.state.email = firebase.auth().currentUser.email;
    this.state.data = [
      { id: 'en', image: eng, toggle: false },
      { id: 'ge', image: ger, toggle: false },
    ];

    this.state.allowNotifications = false;
    this.state.optoutAnalytics = false;
  }

  handleHeaderMenuChange = (menu, id) => {
    this.setState({ contentReady: false, selectedMenu: id, qch: 0 });
  };

  onPressed_ini = () => {
    const { data } = this.state;
    data.forEach((elem) => {
      elem.toggle = false;
      if (elem.id == i18n.locale) {
        elem.toggle = true;
      }
    });
    this.setState({ data: data });
    this.setState({ updateSelected: !this.state.updateSelected });
  };

  async getNotiftype(ntype) {
    const ncontent = await FirebaseAPI.getNotificationCustom(ntype);

    if (ncontent == -1) {
      const time = new Date(ncontent.time);
      const content = {
        allow: ncontent.allow,
        days: ncontent.days,
        time: time,
      };
      return content;
    } else {
      return ncontent;
    }
  }

  async getuser() {
    const dataObj = await FirebaseAPI.getUser();
    this.state.email = firebase.auth().currentUser.email;
    this.setState({ name: dataObj.name });
    this.setState({
      workshopcode: dataObj.workshopcode,
      actualworkshopcode: dataObj.workshopcode,
    });
    this.setState({
      passchange: false,
      actualpassword: '',
      password: '',
      newemail: '',
    });
    if (!dataObj.language) {
      this.setState({ language: dataObj.language });
    }
    if (dataObj.notifications) {
      if (dataObj.notifications == 1) {
        this.setState({ allowNotifications: true });
      }
    }
    let optOutValue = 'disabled';
    if (dataObj.optout) {
      if (dataObj.optout == true) {
        this.setState({ optoutAnalytics: true });
        optOutValue = 'enabled';
      }
    }
    localVariables.setOptOut(optOutValue);
    // if (dataObj.weeklyInspirationsEnabled == false) {
    //   this.setState({ allowWeeklyInspirations: false });
    // }
    this.setState({ loading: false });

    const sleep = await this.getNotiftype('Sleep');
    const mindful = await this.getNotiftype('Mindful');
    const challenge = await this.getNotiftype('Challenge');
    if (sleep != -1) {
      this.setState({ sleep: sleep });
    }
    if (mindful != -1) {
      this.setState({ mindful: mindful });
    }
    if (challenge != -1) {
      this.setState({ challenge: challenge });
    }
  }

  async componentDidMount() {
    // commonFunctions.matomoTrack('screen', 'Settings');
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      this.getuser();
      this.onPressed_ini();
    });
  }

  logout(navigation) {
    FirebaseAPI.logoutUser();
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate('Login');
    });
  }

  async fireupdatePass() {
    if (this.state.passchange) {
      if (this.state.password != '') {
        //await FirebaseAPI.logoutUser

        this.setState({
          passchanged: await FirebaseAPI.setPassword(this.state.actualpassword, this.state.password),
        });
        return this.state.passchanged;
      } else {
        Alert.alert('Please enter a new password');
        return false;
      }
    } else {
      return true;
    }
  }

  fireupdateUser() {
    let email = this.state.email;

    if (this.state.newemail != '') {
      let email = this.state.newemail;
    }
    FirebaseAPI.UpdateUser(
      this.state.userId,
      this.state.name,
      email,
      this.state.password,
      this.state.workshopcode,
      this.state.language
    );
    return true;
  }

  async UpdateUser(navigation) {
    const INACTIVE = 2;
    const WORKSHOP_OK = 1;
    const WORKSHOP_INVALID = 0;
    const WORKSHOP_EMPTY = 3;

    const INVALID = 2;
    const OK = 1;
    const EXCEDED = 0;

    this.setState({ loading: true, fupdpass: true, fupdemail: true, validcode: WORKSHOP_OK });

    if (this.state.workshopcode != '') {
      this.setState({
        validcode: await FirebaseAPI.validateworkshop(this.state.workshopcode),
      });
    }
    console.log(this.state.validcode);
    switch (this.state.validcode) {
      case INACTIVE:
        Alert.alert(
          'Workshop is Inactive',
          'The workshop is not active',
          [
            {
              text: 'Go to Premium',
              onPress: () => this.props.navigation.navigate('Purchase'),
            },

            { text: 'OK', onPress: () => console.log('Ok') },
          ],
          { cancelable: false }
        );
        break;

      case WORKSHOP_OK:
        this._storeData();

        const validateCount = await FirebaseAPI.validateWorkshopCountUsers(this.state.workshopcode);

        if (validateCount == EXCEDED && this.state.workshopcode != this.state.actualworkshopcode) {
          Alert.alert(translate('Signup.limit'));
          this.setState({ validcompany: false });
        } else {
          this.setState({ validcompany: true });

          /*   if (this.state.workshopcode != this.state.actualworkshopcode){
                      const Ok = await FirebaseAPI.restWorkshopCountUsers(this.state.actualworkshopcode);
                    } */

          if (this.state.passchange) {
            if (this.state.password != '') {
              this.setState({
                fupdpass: await FirebaseAPI.setPassword(this.state.actualpassword, this.state.password),
              });
            } else {
              this.setState({ fupdpass: true });
            }
          }
          if (this.state.newemail != '') {
            this.setState({
              fupdemail: await FirebaseAPI.setEmail(this.state.actualpassword, this.state.newemail),
            });
          } else {
            this.setState({ fupdemail: true });
          }
          if (this.state.fupdpass && this.state.fupdemail) {
            const userUpdated = await this.fireupdateUser();
            this.setState({ fupd: userUpdated });
            if (userUpdated) {
              this.setState({ loading: false });
              if (this.state.langChanged) {
                RNRestart.Restart();
              } else {
                this.props.navigation.navigate('Home');
              }
            }
          }
          if (this.state.langChanged || this.state.workshopcode != this.state.actualworkshopcode) {
            RNRestart.Restart();
          }
        }
        break;
      case WORKSHOP_INVALID:
        this.setState({ loading: false });
        Alert.alert(translate('Settings.workshopnotfound'));
        break;
    }
    this.setState({ loading: false });
  }

  deleteUser() {
    var user = firebase.auth().currentUser;

    const credential = firebase.auth.EmailAuthProvider.credential(user.email, this.state.actualpassword);

    // Now you can use that to reauthenticate
    return user
      .reauthenticateWithCredential(credential)
      .then(function () {
        return user
          .delete()
          .then(function () {})
          .catch(function (error) {
            Alert.alert(translate('Settings.delete_error'));
          });
      })
      .catch(function (error) {
        Alert.alert(translate('Settings.passwordincorrect') + error);
      });
  }

  promptDeleteUser = () => {
    const title = translate('Settings.delete_user');
    const message = translate('Settings.del_usr_msg');
    const buttons = [
      { text: translate('Settings.cancel'), type: 'cancel' },
      {
        text: translate('Settings.delete_user'),
        onPress: () => this.deleteUser(),
      },
    ];
    Alert.alert(title, message, buttons);
  };

  _storeData = async () => {
    try {
      await AsyncStorage.setItem('language', i18n.locale);
    } catch (error) {
      // Error saving data
    }
  };

  onPressed = (imageID) => {
    const { data } = this.state;
    data.forEach((elem) => {
      elem.toggle = false;
      if (elem.id == imageID) {
        elem.toggle = true;
      }
    });
    this.setState({ data: data });
    this.setState({
      updateSelected: !this.state.updateSelected,
      langChanged: true,
    });
    i18n.locale = imageID;
    this._storeData();
    this.state.language = imageID;
  };

  allowNotifications = async (value) => {
    if (value) {
      await challengesAPI.registerForLocalNotifications();
      FirebaseAPI.saveNotificationValue(1);
      this.setState({ allowNotifications: true });
    } else {
      this.setState({ allowNotifications: false });
      this.cancelLocalNotifications();
      FirebaseAPI.saveNotificationValue(0);
    }
  };

  optOutAnalytics = async (value) => {
    if (value) {
      this.setState({ optoutAnalytics: true });
      await FirebaseAPI.saveOptoutValue(true);
      localVariables.setOptOut('enabled');
    } else {
      this.setState({ optoutAnalytics: false });
      await FirebaseAPI.saveOptoutValue(false);
      localVariables.setOptOut('disabled');
    }
  };

  addOneDay(date) {
    date.setDate(date.getDate() + 1);
    let time = date.getTime();
    return time;
  }

  getNotificationTime(h, m, s) {
    let notificationTime = 0;
    let dateNotification = new Date(Date.now());
    dateNotification.setHours(h);
    dateNotification.setMinutes(m);
    dateNotification.setMilliseconds(s);

    if (dateNotification.getTime() < Date.now()) {
      notificationTime = this.addOneDay(dateNotification);
    } else {
      notificationTime = dateNotification.getTime();
    }
    return notificationTime;
  }

  cancelLocalNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  showImpressum = () => {
    this.props.navigation.navigate('Impressum');
  };

  ConfigureNotification = (type) => {
    this.props.navigation.navigate('Notification', { type: type });
  };

  renderItem = (data) => (
    <FlagImage id={data.id} onPressItem={this.onPressed} image={data.image} active={data.toggle} />
  );

  Passchange() {
    if (!this.state.passchange) {
      this.setState({ passch_color_color: COLORS.orange });
    } else {
      this.setState({
        passch_color_color: COLORS.lightgray,
        password: '',
        validpass: true,
      });
    }
    this.setState({ passchange: !this.state.passchange });
  }

  handleWeeklyNotificationSwitch = async (value) => {
    await FirebaseAPI.saveWeeklyNotificationStatus(value);
    this.setState({ allowWeeklyInspirations: value });
    if (value) {
      registerWeeklyInspirationNotif(this.props.navigation);
    }
  };

  render(): React.Node {
    const loadingCheck = this.state.loading;

    const coloriconCh = this.state.challenge['allow'] ? COLORS.blue : COLORS.orange;
    const coloriconSl = this.state.sleep['allow'] ? COLORS.blue : COLORS.orange;
    const coloriconMd = this.state.mindful['allow'] ? COLORS.blue : COLORS.orange;

    const timeCh = this.state.challenge['allow'] ? moment.utc(this.state.challenge.time).local().format('HH:mm') : '';
    const timeSl = this.state.sleep['allow'] ? moment.utc(this.state.sleep.time).local().format('HH:mm') : '';
    const timeMd = this.state.mindful['allow'] ? moment.utc(this.state.mindful.time).local().format('HH:mm') : '';

    return (
      <BaseContainer title="Settings" navigation={this.props.navigation} scrollable backBt>
        <StatusBar backgroundColor="white" barStyle="dark-content" />
        <View style={{ paddingTop: 0 }}>
          <FlatList
            refresh={this.state.selectedMenu}
            data={this.state.headermenu}
            horizontal
            renderItem={({ item, index }) => (
              <MenuButton
                menu={item}
                menuChange={this.handleHeaderMenuChange}
                id={index}
                active={this.state.selectedMenu == index}
              />
            )}
            keyExtractor={(item, index) => index.toString()}
            ListHeaderComponentStyle={{
              justifyContent: 'space-between',
            }}
          />

          {this.state.selectedMenu == 0 ? (
            <View style={{ paddingTop: 0 }}>
              <Field
                label={translate('Settings.name')}
                value={this.state.name}
                onChangeText={(text) => this.setState({ name: text })}
                onSubmitEditing={this.goToUsername}
                returnKeyType="next"
                displayIcon
                iconName="md-person"
                labelColor={COLORS.gray}
                iconColor={COLORS.orange}
              />

              <Field
                label={translate('Settings.email')}
                displayIcon
                disabled
                iconName="md-mail"
                iconColor={COLORS.orange}
                labelColor={COLORS.gray}
                value={this.state.email}
                onChangeText={(text) => this.setState({ email: text })}
              />

              <Field
                label={translate('Settings.workshopcode')}
                displayIcon
                iconName="md-business"
                iconColor={COLORS.orange}
                value={this.state.workshopcode}
                labelColor={COLORS.gray}
                onChangeText={(text) => this.setState({ workshopcode: text })}
              />
              <View style={[style.labelWrapper, { marginTop: 10 }]}>
                <Label style={[style.fieldLabel, { marginTop: 10, marginBottom: 10 }]}>
                  {translate('Settings.language')}
                </Label>
              </View>
              <FlatList
                refresh={this.state.updateSelected}
                horizontal
                keyExtractor={(item) => item.id.toString()}
                data={this.state.data}
                renderItem={({ item }) => this.renderItem(item)}
              />
              <View style={style.labelWrapper}>
                <Ionicons name={'ios-eye-off'} style={{ color: COLORS.orange }} size={30} />
                <Label style={[style.fieldLabel, { marginTop: 20, marginBottom: 20 }]}>
                  {translate('Settings.optout')}
                </Label>
              </View>
              <View
                style={{
                  height: 45,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Switch
                  value={this.state.optoutAnalytics}
                  onValueChange={(v) => {
                    this.optOutAnalytics(v);
                  }}
                  trackColor={{
                    false: COLORS.lightgray,
                    true: COLORS.orange,
                  }}
                />
                <Text style={style.fieldExplanation}>{translate('Settings.stopanalytics')}</Text>
              </View>
            </View>
          ) : null}

          {this.state.selectedMenu == 1 ? (
            <View style={{ paddingTop: 20 }}>
              <Field
                label={translate('Settings.currentpassword')}
                secureTextEntry
                displayIcon
                iconColor={COLORS.orange}
                value={this.state.actualpassword}
                onChangeText={(text) => this.setState({ actualpassword: text })}
                iconName="md-briefcase"
                labelColor={COLORS.gray}
              />
              <Field
                label={translate('Settings.enter_password')}
                secureTextEntry
                displayIcon
                iconColor={COLORS.orange}
                value={this.state.password}
                onChangeText={(text) => this.setState({ password: text })}
                iconName="md-lock"
                labelColor={COLORS.gray}
              />
              <Field
                label={translate('Settings.enter_newemail')}
                displayIcon
                iconColor={COLORS.orange}
                value={this.state.newemail}
                onChangeText={(text) => this.setState({ newemail: text })}
                iconName="md-mail"
                labelColor={COLORS.gray}
              />
              <Button
                transparent
                block
                onPress={() => {
                  this.promptDeleteUser();
                }}
              >
                <Text style={style.actionText}>{translate('Settings.click')}</Text>
              </Button>
            </View>
          ) : null}
          {this.state.selectedMenu == 2 ? (
            <View
              style={{
                alignItems: 'flex-start',
                paddingLeft: 10,
                paddingTop: 30,
                marginBottom: 25,
              }}
            >
              <NotificationItem
                text={translate('Notification.config_cha')}
                iconName="ios-rocket"
                time={timeCh}
                color={coloriconCh}
                onPress={() => this.ConfigureNotification('Challenge')}
              />
              <NotificationItem
                text={translate('Notification.config_sleep')}
                iconName="ios-moon"
                time={timeSl}
                color={coloriconSl}
                onPress={() => this.ConfigureNotification('Sleep')}
              />
              <NotificationItem
                text={translate('Notification.config_mind')}
                iconName="ios-leaf"
                time={timeMd}
                color={coloriconMd}
                onPress={() => this.ConfigureNotification('Mindful')}
              />
              <View style={{ marginTop: 25, height: 45, flexDirection: 'row', alignItems: 'center' }}>
                <Switch
                  value={this.state.allowWeeklyInspirations}
                  onValueChange={this.handleWeeklyNotificationSwitch}
                  trackColor={{ false: COLORS.lightgray, true: COLORS.orange }}
                />
                <Text style={[style.fieldExplanation, { marginLeft: 10 }]}>
                  {translate('Notification.enablePhrases')}
                </Text>
              </View>
            </View>
          ) : null}

          {loadingCheck ? (
            <View style={style.actIndicator}>
              <ActivityIndicator size="large" color={COLORS.orange} />
            </View>
          ) : null}
          {this.state.selectedMenu <= 1 ? (
            <View>
              <ButtonGD title={translate('Settings.update')} onpress={() => this.UpdateUser(this.props.navigation)} />

              <View style={style.logoutContainer}>
                <Button
                  transparent
                  block
                  onPress={() => {
                    this.logout(this.props.navigation);
                  }}
                >
                  <Text style={style.actionText}>{translate('Settings.logout')}</Text>
                </Button>

                <View
                  style={{
                    alignItems: 'center',
                    marginTop: 8,
                  }}
                >
                  <TouchableOpacity onPress={() => this.showImpressum()}>
                    <Text style={{ color: COLORS.gray }}>{translate('Settings.about')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : null}
        </View>
      </BaseContainer>
    );
  }
}

class MenuButton extends React.PureComponent {
  handlemenuChange = () => {
    this.setState({ selected: true });
    this.props.menuChange(this.props.menu, this.props.id);
  };

  render() {
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => {
          this.handlemenuChange();
        }}
      >
        <LinearGradient
          colors={[
            this.props.active ? COLORS.blue : COLORS.orange,
            this.props.active ? COLORS.lightblue : COLORS.lightorange,
          ]}
          start={[0.6, 0.5]}
          end={[1, 0]}
          style={style.menuTitle}
        >
          <Text style={style.thumbmenuText}>{this.props.menu}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }
}

const NotificationItem = (props) => (
  <View
    style={{
      flexDirection: 'row',
      flex: 1,
      alignItems: 'center',
      marginTop: 20,
    }}
  >
    <Ionicons name={props.iconName} style={{ color: props.color, marginRight: 15 }} size={30} />
    <Button style={{ flex: 1, justifyContent: 'flex-start' }} transparent block onPress={props.onPress}>
      <Text style={{ color: COLORS.gray }}>{props.text}</Text>
    </Button>
    <Text style={{ marginRight: 35, color: COLORS.gray }}>{props.time}</Text>
    <Ionicons name="ios-arrow-forward" style={{ color: COLORS.orange }} size={30} />
  </View>
);

class FlagImage extends React.PureComponent {
  _onPress = () => {
    this.props.onPressItem(this.props.id);
  };

  render() {
    const { active } = this.props;
    const colorsel = active ? 1 : 0;

    return (
      <View style={style.item}>
        <TouchableOpacity onPress={this._onPress}>
          <Image style={[style.image, { borderWidth: colorsel }]} resizeMode="cover" source={this.props.image}></Image>
          {/*  <Text>{active ? 'Activo' : 'Inactivo'}</Text> */}
        </TouchableOpacity>
      </View>
    );
  }
}

const { width } = Dimensions.get('window');
const style = StyleSheet.create({
  mainContainer: {
    paddingTop: 10,
    flex: 1,
  },
  img: {
    width,
    height: width * (500 / 750),
  },
  fieldLabel: {
    color: COLORS.gray,
    fontSize: 14,
    marginLeft: 15,
  },
  labelWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },
  fieldExplanation: {
    color: COLORS.gray,
    fontSize: 15,
    marginLeft: 10,
  },
  item: {
    margin: 1,
    width: 70,
    height: 55,
  },
  actIndicator: {
    // flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: 50,
    height: 50,
    borderColor: COLORS.orange,
  },
  add: {
    backgroundColor: 'white',
    height: 50,
    width: 50,
    borderRadius: 25,
    position: 'absolute',
    bottom: variables.contentPadding,
    left: variables.contentPadding,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    padding: variables.contentPadding * 2,
    borderBottomWidth: variables.borderWidth,
    borderColor: variables.listBorderColor,
  },
  thumbmenuText: {
    fontSize: 16,

    textAlign: 'center',
    color: COLORS.white,
  },
  menuTitle: {
    height: 30,
    padding: 23,
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: 25,
    marginRight: 15,
    backgroundColor: COLORS.orange,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    width: WindowDimensions.width,
    height: 43,
    resizeMode: 'contain',

    position: 'absolute',
    top: 0,
    zIndex: 1000,
  },
  logoutContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginTop: 10,
    marginBottom: 10,
  },
  actionText: {
    color: COLORS.orange,
    textAlign: 'left',
  },
});
